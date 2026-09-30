/*
 * Nén/resize ảnh địa điểm lễ hội trong src/app_thanh_cong (@data/image/anh,
 * @data/image/anhlehoi, @data/image/Lễ Hội) — các ảnh này đang là screenshot
 * PNG/JPG gốc (2-8MB/ảnh, ~300MB tổng) khiến trang lễ hội load rất chậm khi
 * mạng yếu. Script resize về tối đa 1920px cạnh dài + chuyển sang JPEG chất
 * lượng 82 cho ảnh không có transparency thực sự (đa số là ảnh chụp).
 *
 * - @data/image/anh/** và @data/image/anhlehoi/** được import tường minh
 *   theo đúng path+đuôi file trong thanhCongData.js -> nếu đổi đuôi file
 *   (.png -> .jpg) thì phải sửa lại các dòng import tương ứng. Script tự
 *   làm việc này bằng cách patch thanhCongData.js sau khi ghi file mới.
 * - @data/image/Lễ Hội/** được nạp qua require.context(...,/\.(png|jpe?g)$/i)
 *   nên đổi đuôi không cần sửa code (regex đã khớp cả 2 đuôi).
 *
 * Chạy: node scripts/optimize-festival-images.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const IMAGE_ROOT = path.join(ROOT, "src/app_thanh_cong/@data/image");
const DATA_FILE = path.join(ROOT, "src/app_thanh_cong/common/thanhCongData.js");

const TARGETS = [
  { dir: path.join(IMAGE_ROOT, "anh"), patchImports: true },
  { dir: path.join(IMAGE_ROOT, "anhlehoi"), patchImports: true },
  { dir: path.join(IMAGE_ROOT, "Lễ Hội"), patchImports: false },
];

const MAX_DIM = 1920;
const JPEG_QUALITY = 82;
const PNG_QUALITY = 80;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(png|jpe?g)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

async function hasRealAlpha(img) {
  const meta = await img.metadata();
  if (!meta.hasAlpha) return false;
  const stats = await img.clone().stats();
  const alphaChannel = stats.channels[stats.channels.length - 1];
  return alphaChannel.min < 255; // có pixel trong suốt thật sự
}

const SKIP_IF_SMALLER_THAN = 320 * 1024; // đã đủ nhẹ rồi thì bỏ qua — tránh nén lại (giảm chất lượng vô ích) khi script chạy lại/resume

async function processFile(filePath) {
  const before = fs.statSync(filePath).size;
  if (before < SKIP_IF_SMALLER_THAN) {
    const meta = await sharp(filePath, { failOn: "none" }).metadata();
    if (Math.max(meta.width || 0, meta.height || 0) <= MAX_DIM) {
      return { before, after: before, oldPath: filePath, newPath: filePath, renamed: false, skipped: true };
    }
  }
  const ext = path.extname(filePath);
  const isPng = /\.png$/i.test(ext);
  const isJpeg = /\.jpe?g$/i.test(ext);
  const img = sharp(filePath, { failOn: "none" });
  const meta = await img.metadata();
  const needsResize = Math.max(meta.width || 0, meta.height || 0) > MAX_DIM;
  const resized = needsResize
    ? img.clone().resize({ width: MAX_DIM, height: MAX_DIM, fit: "inside", withoutEnlargement: true })
    : img.clone();

  let keepPng = false;
  if (isPng) {
    keepPng = await hasRealAlpha(sharp(filePath));
  }

  let outPath = filePath;
  let buffer;
  if (isJpeg) {
    // Đã là JPEG: nén/resize lại, giữ nguyên path+đuôi (kể cả .JPG viết hoa)
    // để không phải đổi import và tránh đụng độ tên file trên Windows
    // (filesystem không phân biệt hoa/thường: "a.JPG" và "a.jpg" là 1 file).
    buffer = await resized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
  } else if (keepPng) {
    buffer = await resized.png({ quality: PNG_QUALITY, compressionLevel: 9, palette: true }).toBuffer();
  } else {
    buffer = await resized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
    outPath = filePath.slice(0, -ext.length) + ".jpg";
  }

  const renamed = outPath.toLowerCase() !== filePath.toLowerCase();
  fs.writeFileSync(outPath, buffer);
  if (renamed) fs.unlinkSync(filePath);

  const after = buffer.length;
  return { before, after, oldPath: filePath, newPath: outPath, renamed };
}

async function main() {
  const renameMap = new Map(); // absolute old path -> absolute new path
  let totalBefore = 0;
  let totalAfter = 0;
  let count = 0;

  for (const { dir } of TARGETS) {
    if (!fs.existsSync(dir)) continue;
    const files = walk(dir);
    for (const f of files) {
      try {
        const r = await processFile(f);
        totalBefore += r.before;
        totalAfter += r.after;
        count++;
        if (r.renamed) renameMap.set(r.oldPath, r.newPath);
        const pct = (100 * (1 - r.after / r.before)).toFixed(0);
        console.log(`${r.renamed ? "[renamed] " : ""}${path.relative(ROOT, r.oldPath)} : ${(r.before / 1024).toFixed(0)}KB -> ${(r.after / 1024).toFixed(0)}KB (-${pct}%)`);
      } catch (e) {
        console.error(`LỖI xử lý ${f}: ${e.message}`);
      }
    }
  }

  if (renameMap.size) {
    let content = fs.readFileSync(DATA_FILE, "utf8");
    let patched = 0;
    for (const [oldAbs, newAbs] of renameMap) {
      const oldRel = "../" + path.relative(path.dirname(DATA_FILE), oldAbs).split(path.sep).join("/");
      const newRel = "../" + path.relative(path.dirname(DATA_FILE), newAbs).split(path.sep).join("/");
      if (content.includes(`"${oldRel}"`)) {
        content = content.split(`"${oldRel}"`).join(`"${newRel}"`);
        patched++;
      }
    }
    fs.writeFileSync(DATA_FILE, content, "utf8");
    console.log(`\nĐã patch ${patched}/${renameMap.size} import path trong thanhCongData.js`);
  }

  console.log(`\nTổng: ${count} ảnh, ${(totalBefore / 1024 / 1024).toFixed(1)}MB -> ${(totalAfter / 1024 / 1024).toFixed(1)}MB (-${(100 * (1 - totalAfter / totalBefore)).toFixed(0)}%)`);
}

main();
