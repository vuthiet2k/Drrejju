/**
 * build-vercel.js — DR.REJU
 * ──────────────────────────────────────────────────────────────
 * Sinh thư mục `dist/` phục vụ deploy Vercel.
 *
 * Cách chạy:
 *   npm run build            (script `build` trong package.json)
 *
 * Cơ chế:
 *   1. Xoá + tạo lại `dist/`.
 *   2. Spawn dev-server.js với STATIC_EXPORT=true (tắt dev toolbar/WS reload).
 *   3. Chờ server sẵn sàng, fetch từng template `?tpl=<name>` → lưu HTML.
 *   4. Đọc mọi file trong `assets/` (bao gồm `.scss.bwt` và `.js.bwt`) và
 *      fetch qua route `/assets/<name>` để lấy CSS/JS đã compile.
 *   5. Kill dev-server.
 *
 * Vì Sapo là platform động (giỏ hàng, sản phẩm, đơn hàng...), file export chỉ
 * phục vụ preview design — không phải bản chạy production.
 */

'use strict';

const { spawn } = require('child_process');
const fs   = require('fs');
const path = require('path');

const rootDir   = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'dist');
const assetsDir = path.join(rootDir, 'assets');
const port      = 4173;
const wsPort    = 4174;
const baseUrl   = `http://127.0.0.1:${port}`;

// Danh sách trang export. `output` là đường dẫn tương đối bên trong `dist/`.
// Với các trang phụ, đặt file thành `<slug>/index.html` để Vercel serve theo URL sạch.
const pageExports = [
  { template: 'index',        output: 'index.html' },
  { template: 'page.about',   output: 'gioi-thieu/index.html' },
  { template: 'page.contact', output: 'lien-he/index.html' },
  { template: 'page.dat-lich', output: 'dat-lich/index.html' },
  { template: 'page.faq',     output: 'faq/index.html' },
  { template: 'page.guide',   output: 'huong-dan/index.html' },
];

function outputAssetName(sourceName) {
  // main.scss.bwt → main.scss.css  (dev-server serve dưới tên này)
  if (sourceName.endsWith('.scss.bwt')) return sourceName.replace(/\.bwt$/, '.css');
  // jquery.js.bwt → jquery.js
  if (sourceName.endsWith('.js.bwt'))   return sourceName.replace(/\.bwt$/, '');
  // .css.bwt → .css
  if (sourceName.endsWith('.css.bwt'))  return sourceName.replace(/\.bwt$/, '');
  return sourceName;
}

function listFiles(directory, prefix = '') {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(prefix, entry.name);
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(absolutePath, relativePath) : [relativePath];
  });
}

function waitForServer(child) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('Preview server không khởi động trong 30s.')),
      30000,
    );
    const attempt = async () => {
      if (child.exitCode !== null) {
        clearTimeout(timeout);
        reject(new Error(`Preview server tắt bất ngờ (exit code ${child.exitCode}).`));
        return;
      }
      try {
        const response = await fetch(`${baseUrl}/?tpl=index`);
        if (response.ok) { clearTimeout(timeout); resolve(); return; }
      } catch (_) { /* server còn đang bootstrap */ }
      setTimeout(attempt, 250);
    };
    attempt();
  });
}

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Fetch thất bại ${url}: HTTP ${response.status}`);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, Buffer.from(await response.arrayBuffer()));
}

async function main() {
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  const preview = spawn(process.execPath, ['dev-server.js'], {
    cwd: rootDir,
    env: {
      ...process.env,
      PORT: String(port),
      WS_PORT: String(wsPort),
      STATIC_EXPORT: 'true',
    },
    stdio: ['ignore', 'inherit', 'inherit'],
  });

  try {
    await waitForServer(preview);

    // 1) Export HTML pages
    for (const page of pageExports) {
      try {
        await download(
          `${baseUrl}/?tpl=${encodeURIComponent(page.template)}`,
          path.join(outputDir, page.output),
        );
        console.log(`  ✓ ${page.template.padEnd(18)} → ${page.output}`);
      } catch (e) {
        console.warn(`  ✗ ${page.template}: ${e.message}`);
      }
    }

    // 2) 404 fallback (Vercel dùng file 404.html)
    try {
      await download(`${baseUrl}/?tpl=404`, path.join(outputDir, '404.html'));
      console.log(`  ✓ 404              → 404.html`);
    } catch (_) {
      // Nếu template 404.bwt lỗi, fallback = copy index
      fs.copyFileSync(path.join(outputDir, 'index.html'), path.join(outputDir, '404.html'));
      console.log(`  ✓ 404 (fallback)   → 404.html (copy index)`);
    }

    // 3) Export assets — chạy qua đúng route /assets/ để compile SCSS/JS.bwt
    const assets = listFiles(assetsDir);
    let assetOk = 0, assetErr = 0;
    for (const sourceName of assets) {
      const assetName = outputAssetName(sourceName);
      const url = `${baseUrl}/assets/${encodeURIComponent(assetName).replace(/%2F/g, '/')}`;
      try {
        await download(url, path.join(outputDir, 'assets', assetName));
        assetOk++;
      } catch (e) {
        assetErr++;
        console.warn(`  ✗ assets/${assetName}: ${e.message}`);
      }
    }
    console.log(`  ✓ assets           → ${assetOk} file (${assetErr} lỗi)`);

    console.log(`\n✅ Vercel dist tạo tại: ${path.relative(rootDir, outputDir)}`);
  } finally {
    if (preview.exitCode === null) preview.kill();
  }
}

main().catch((error) => {
  console.error(`\n❌ Build thất bại: ${error.message}`);
  process.exitCode = 1;
});
