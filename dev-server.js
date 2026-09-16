/**
 * Dev Preview Server — DR.REJU
 * ─────────────────────────────
 * Chạy: npm run preview   (hoặc node dev-server.js)
 * Mở:   http://localhost:3000
 *
 * - Parse .bwt (Liquid) bằng LiquidJS + mock data từ preview-mock.js
 * - Watch toàn bộ .bwt, settings_data.json → tự reload browser qua WebSocket (local only)
 * - Phục vụ file tĩnh trong assets/ (CSS compile từ SCSS, JS, ảnh)
 * - Trên Vercel: require() trực tiếp bởi api/index.js, tắt watch/toolbar/listen.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { Liquid, Tag, evalToken, Tokenizer } = require('liquidjs');
const sass = require('sass');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const WS_PORT = Number(process.env.WS_PORT) || 3001;
const IS_PROD_SERVER = !!process.env.VERCEL;

// ── Sapo Liquid syntax preprocessor ───────────────────────────────────────
function preprocessBwt(content) {
  content = content.replace(/\{%-?\s*layout\s+['"][^'"]*['"]\s*-?%\}/g, '');
  content = content.replace(/\{%-?\s*elseif\b/g, '{%- elsif');
  return content.replace(/(\{%-?[\s\S]*?-?%\}|\{\{-?[\s\S]*?-?\}\})/g, (match) => {
    return match
      .replace(/\|\|/g, ' or ')
      .replace(/&&/g, ' and ')
      .replace(/==\s*'false'/g, '== false')
      .replace(/==\s*"false"/g, '== false')
      .replace(/!=\s*'false'/g, '!= false')
      .replace(/!=\s*"false"/g, '!= false')
      .replace(/==\s*'true'/g, '== true')
      .replace(/==\s*"true"/g, '== true')
      .replace(/!=\s*'true'/g, '!= true')
      .replace(/!=\s*"true"/g, '!= true');
  });
}

const TEMPLATE_DIRS = [
  path.join(ROOT, 'snippets'),
  path.join(ROOT, 'templates'),
  path.join(ROOT, 'layouts'),
  path.join(ROOT, 'assets'),
];

const liquidFs = {
  sep: path.sep,
  exists(file) { return fs.existsSync(file); },
  resolve(root, file, ext) {
    const withExt = file.endsWith(ext) ? file : file + ext;
    if (path.isAbsolute(withExt)) return withExt;
    return path.resolve(root, withExt);
  },
  readFile(file) { return Promise.resolve(preprocessBwt(fs.readFileSync(file, 'utf8'))); },
};

const engine = new Liquid({
  root: TEMPLATE_DIRS, extname: '.bwt',
  strictFilters: false, strictVariables: false, relativeReference: false,
  fs: liquidFs,
});

// ── Custom Liquid block tags (Sapo-specific) ──────────────────────────────
class PaginateTag extends Tag {
  constructor(token, remainTokens, liquid, parser) {
    super(token, remainTokens, liquid);
    this.byExpr = null;
    try {
      const byMatch = /\bby\s+(\S+(?:\.\S+)*)/.exec(token.args);
      if (byMatch) {
        const tok = new Tokenizer(byMatch[1], liquid.options);
        this.byExpr = tok.readValue();
      }
    } catch (_) { /* default pageSize */ }
    this.templates = [];
    const stream = parser.parseStream(remainTokens)
      .on('tag:endpaginate', () => stream.stop())
      .on('template', (tpl) => this.templates.push(tpl))
      .on('end', () => { throw new Error(`tag ${token.getText()} not closed`); });
    stream.start();
  }
  *render(ctx, emitter) {
    let pageSize = 12;
    if (this.byExpr) {
      try {
        const val = yield evalToken(this.byExpr, ctx);
        pageSize = parseInt(String(val)) || 12;
      } catch (_) { /* keep default */ }
    }
    ctx.push({ paginate: { pages: 1, current_page: 1, page_size: pageSize, items: 0, previous: false, next: false, parts: [] } });
    yield this.liquid.renderer.renderTemplates(this.templates, ctx, emitter);
    ctx.pop();
  }
}
engine.registerTag('paginate', PaginateTag);

class FormTag extends Tag {
  constructor(token, remainTokens, liquid, parser) {
    super(token, remainTokens, liquid);
    this.objExpr = null;
    try {
      const parts = token.args.split(',');
      if (parts.length > 1) {
        const tok = new Tokenizer(parts.slice(1).join(',').trim(), liquid.options);
        this.objExpr = tok.readValue();
      }
    } catch (_) { /* no 2nd arg */ }
    this.templates = [];
    const stream = parser.parseStream(remainTokens)
      .on('tag:endform', () => stream.stop())
      .on('template', (tpl) => this.templates.push(tpl))
      .on('end', () => { throw new Error(`tag ${token.getText()} not closed`); });
    stream.start();
  }
  *render(ctx, emitter) {
    let formObj = {};
    if (this.objExpr) {
      try { formObj = (yield evalToken(this.objExpr, ctx)) || {}; } catch (_) { formObj = {}; }
    }
    emitter.write('<form accept-charset="UTF-8" class="preview-form" method="post">');
    ctx.push({ form: formObj });
    yield this.liquid.renderer.renderTemplates(this.templates, ctx, emitter);
    ctx.pop();
    emitter.write('</form>');
  }
}
engine.registerTag('form', FormTag);

// ── Custom Liquid filters (Sapo-specific) ─────────────────────────────────
engine.registerFilter('img_tag', (url, alt) => (!url ? '' : `<img src="${url}" alt="${alt || ''}">`));
engine.registerFilter('asset_url', (src) => (!src ? '' : `/assets/${src}`));
engine.registerFilter('img_url', (src, size) => {
  const url = src && typeof src === 'object' ? (src.src || '') : (src || '');
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const dim = typeof size === 'string' && size.includes('x') ? size : '400x400';
  return `https://placehold.co/${dim}/e8f5e9/0A2E24?text=img`;
});
engine.registerFilter('money', (price) => (price == null ? '' : new Intl.NumberFormat('vi-VN').format(Number(price)) + ' ₫'));
engine.registerFilter('stylesheet_tag', (url) => (!url ? '' : `<link rel="stylesheet" href="${url}">`));
engine.registerFilter('script_tag', (url) => (!url ? '' : `<script src="${url}"></script>`));
engine.registerFilter('url_encode', (v) => encodeURIComponent(String(v || '')));
engine.registerFilter('url_decode', (v) => decodeURIComponent(String(v || '')));
engine.registerFilter('strip_html', (v) => String(v || '').replace(/<[^>]+>/g, ''));
engine.registerFilter('escape', (v) => String(v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));
engine.registerFilter('link_to', (v, url) => `<a href="${url}">${v}</a>`);
engine.registerFilter('date', (v) => { try { return new Date(v).toLocaleDateString('vi-VN'); } catch (_) { return String(v || ''); } });
engine.registerFilter('json', (v) => JSON.stringify(v));

// ── Mock context ───────────────────────────────────────────────────────────
let mockModule = require('./preview-mock');

// ── Asset compiler (SCSS .bwt → CSS, JS .bwt → JS) ────────────────────────
const assetCache = new Map();

function guessMime(name) {
  const ext = path.extname(name).toLowerCase();
  return {
    '.css': 'text/css', '.js': 'application/javascript',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.eot': 'application/vnd.ms-fontobject',
    '.json': 'application/json',
  }[ext] || 'text/plain';
}

async function compileAsset(requestedName) {
  if (assetCache.has(requestedName)) return assetCache.get(requestedName);

  const assetsDir = path.join(ROOT, 'assets');
  const settings = mockModule.settings;

  let srcPath = null;
  let mime = 'text/plain';
  let isScss = false;

  if (requestedName.endsWith('.scss.css')) {
    const bwtName = requestedName.replace(/\.css$/, '.bwt');
    const candidate = path.join(assetsDir, bwtName);
    if (fs.existsSync(candidate)) { srcPath = candidate; mime = 'text/css'; isScss = true; }
  } else if (requestedName.endsWith('.css')) {
    const direct = path.join(assetsDir, requestedName);
    if (fs.existsSync(direct)) { srcPath = direct; mime = 'text/css'; }
    else {
      const bwt = path.join(assetsDir, requestedName + '.bwt');
      if (fs.existsSync(bwt)) { srcPath = bwt; mime = 'text/css'; }
    }
  } else if (requestedName.endsWith('.js')) {
    const bwt = path.join(assetsDir, requestedName + '.bwt');
    if (fs.existsSync(bwt)) { srcPath = bwt; mime = 'application/javascript'; }
    else {
      const direct = path.join(assetsDir, requestedName);
      if (fs.existsSync(direct)) { srcPath = direct; mime = 'application/javascript'; }
    }
  } else {
    const direct = path.join(assetsDir, requestedName);
    if (fs.existsSync(direct)) { srcPath = direct; mime = guessMime(requestedName); }
  }

  if (!srcPath) return null;

  const raw = fs.readFileSync(srcPath, 'utf8');
  let content = raw;
  const ext = path.extname(requestedName).toLowerCase();
  const isBinary = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.woff', '.woff2', '.ttf', '.eot'].includes(ext);

  if (!isBinary) {
    try {
      const ctx = mockModule.getContext('index');
      content = await engine.parseAndRender(raw, { ...ctx, settings });
    } catch (liqErr) {
      console.warn(`[liquid] ${requestedName}: ${liqErr.message}`);
    }
    if (isScss) {
      try {
        const result = sass.compileString(content, { style: 'compressed', sourceMap: false, loadPaths: [assetsDir], logger: sass.Logger.silent });
        content = result.css;
      } catch (sassErr) {
        console.error(`[sass] Lỗi compile ${requestedName}:`, sassErr.message);
        content = `/* SASS COMPILE ERROR in ${requestedName}: ${sassErr.message} */`;
      }
    }
  }

  const result = { content: isBinary ? null : content, srcPath, mime, isBinary };
  assetCache.set(requestedName, result);
  console.log(`[asset] compile OK: ${requestedName} (${isScss ? 'SCSS→CSS' : mime})`);
  return result;
}

// ── Dev toolbar (local only) ───────────────────────────────────────────────
function devToolbarStyle() {
  return `<style>
  #dev-toolbar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 99999; background: #1e1e2e; color: #cdd6f4; font-family: monospace; font-size: 13px; padding: 6px 16px; display: flex; align-items: center; justify-content: space-between; border-top: 2px solid #89b4fa; }
  #dev-toolbar .status { display: flex; align-items: center; gap: 8px; }
  #dev-toolbar .dot { width: 8px; height: 8px; border-radius: 50%; background: #a6e3a1; }
  #dev-toolbar select { background: #313244; color: #cdd6f4; border: 1px solid #45475a; border-radius: 4px; padding: 2px 6px; font-size: 12px; cursor: pointer; }
  #dev-toolbar .tpl-badge { background: #313244; padding: 2px 8px; border-radius: 4px; color: #89b4fa; font-size: 12px; }
  body { padding-bottom: 42px !important; }
</style>`;
}

function devToolbarHtml(tpl) {
  const items = [
    ['index', 'index (Trang chủ)'], ['product', 'product (Sản phẩm)'], ['collection', 'collection (Danh mục)'],
    ['cart', 'cart (Giỏ hàng)'], ['blog', 'blog (Blog)'], ['article', 'article (Bài viết)'],
    ['page.about-us', 'page.about-us'], ['page.about', 'page.about'], ['page.bac-si-hue', 'page.bac-si-hue'],
    ['page.contact', 'page.contact'], ['page.dat-lich', 'page.dat-lich'], ['page.faq', 'page.faq'],
    ['page.guide', 'page.guide'], ['page.quiz', 'page.quiz'],
    ['search', 'search (Tìm kiếm)'], ['404', '404 (Không tìm thấy)'],
    ['login', 'login'], ['register', 'register'], ['account', 'account'], ['orders', 'orders'], ['addresses', 'addresses'],
  ];
  const options = items.map(([v, l]) => `<option value="${v}"${tpl === v ? ' selected' : ''}>${l}</option>`).join('');
  return `<div id="dev-toolbar">
  <div class="status"><div class="dot"></div><span>DR.REJU Preview</span></div>
  <div style="display:flex;align-items:center;gap:12px;">
    <span>Template:</span>
    <select onchange="location.href='/?tpl='+this.value">${options}</select>
    <span class="tpl-badge">localhost:${PORT}</span>
  </div>
</div>`;
}

// ── Customer templates resolve to templates/customers/<name>.bwt ─────────
const CUSTOMER_TEMPLATES = new Set(['account', 'addresses', 'login', 'register', 'orders', 'order', 'change_password', 'reset_password']);
function resolveTemplatePath(tpl) {
  if (tpl.includes('/')) return tpl;
  if (CUSTOMER_TEMPLATES.has(tpl)) return `customers/${tpl}`;
  return tpl;
}

// ── Pretty-URL router ──────────────────────────────────────────────────────
const PAGE_HANDLE_MAP = {
  'about-us': 'page.about-us', 'gioi-thieu': 'page.about-us', 'about': 'page.about',
  'bac-si-hue': 'page.bac-si-hue', 'contact': 'page.contact', 'lien-he': 'page.contact',
  'dat-lich': 'page.dat-lich', 'faq': 'page.faq', 'guide': 'page.guide',
  'hethong': 'page.hethong', 'quiz': 'page.quiz',
};

function resolvePrettyPath(pathname, searchParams) {
  const parts = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (parts.length === 0) return null;

  if (parts.length === 1 && parts[0] === 'cart') return { tpl: 'cart', routeParams: {} };

  if (parts.length === 1 && parts[0] === 'search') {
    return { tpl: 'search', routeParams: { searchQuery: searchParams.get('query') || searchParams.get('q') || '', searchType: searchParams.get('type') || 'product' } };
  }

  if (parts[0] === 'account') {
    if (parts.length === 1) return { tpl: 'account', routeParams: {} };
    if (parts[1] === 'logout') return { redirect: '/' };
    if (parts.length === 2 && ['login', 'register', 'addresses', 'orders'].includes(parts[1])) return { tpl: parts[1], routeParams: {} };
    if (parts.length === 3 && parts[1] === 'orders') return { tpl: 'order', routeParams: {} };
  }

  if (parts.length === 2 && parts[0] === 'pages' && PAGE_HANDLE_MAP[parts[1]]) return { tpl: PAGE_HANDLE_MAP[parts[1]], routeParams: {} };

  if (parts[0] === 'blogs') {
    if (parts.length === 1) return { tpl: 'blog', routeParams: {} };
    if (parts.length === 2) return { tpl: 'blog', routeParams: { blogHandle: parts[1] } };
    if (parts.length === 3) return { tpl: 'article', routeParams: { blogHandle: parts[1], articleHandle: parts[2] } };
  }

  if (parts.length === 2 && parts[0] === 'collections') return { tpl: 'collection', routeParams: { collectionHandle: parts[1] } };

  if (parts.length === 1) {
    const slug = parts[0];
    if (PAGE_HANDLE_MAP[slug]) return { tpl: PAGE_HANDLE_MAP[slug], routeParams: {} };
    if (mockModule.byAlias[slug]) return { tpl: 'product', routeParams: { productAlias: slug } };
    if (mockModule.collectionsData[slug]) return { tpl: 'collection', routeParams: { collectionHandle: slug } };
  }

  return null;
}

// ── Giỏ hàng thật (cookie-based) ───────────────────────────────────────────
const CART_COOKIE = 'dr_cart_items';
function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(header.split(';').map((p) => p.trim()).filter(Boolean).map((p) => {
    const idx = p.indexOf('=');
    return [decodeURIComponent(p.slice(0, idx)), decodeURIComponent(p.slice(idx + 1))];
  }));
}
function readCartLines(req) {
  try {
    const cookies = parseCookies(req);
    if (!cookies[CART_COOKIE]) return [];
    const raw = Buffer.from(cookies[CART_COOKIE], 'base64').toString('utf8');
    const lines = JSON.parse(raw);
    return Array.isArray(lines) ? lines : [];
  } catch (_) { return []; }
}
function writeCartCookie(res, lines) {
  const raw = Buffer.from(JSON.stringify(lines)).toString('base64');
  res.setHeader('Set-Cookie', `${CART_COOKIE}=${raw}; Path=/; Max-Age=2592000; SameSite=Lax`);
}
function findVariant(variantId) {
  for (const product of Object.values(mockModule.byAlias)) {
    const variant = (product.variants || []).find((v) => String(v.id) === String(variantId));
    if (variant) return { product, variant };
  }
  return null;
}
function buildCartFromLines(lines) {
  const items = lines.map((line) => {
    const found = findVariant(line.variantId);
    if (!found) return null;
    const { product, variant } = found;
    return {
      id: variant.id, product_id: product.id, variant_id: variant.id, title: product.name,
      variant_title: variant.title, url: product.url, image: product.featured_image, sku: variant.sku,
      quantity: line.quantity, price: variant.price, compare_at_price: variant.compare_at_price,
      line_price: variant.price * line.quantity, product, variant, vendor: product.vendor, properties: {},
    };
  }).filter(Boolean);
  return { item_count: items.reduce((s, i) => s + i.quantity, 0), total_price: items.reduce((s, i) => s + i.line_price, 0), items, note: '', attributes: {} };
}
function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}
function parseBody(req, raw) {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('application/json')) { try { return JSON.parse(raw || '{}'); } catch (_) { return {}; } }
  const params = new URLSearchParams(raw || '');
  return Object.fromEntries(params.entries());
}

// ── Detect layout ───────────────────────────────────────────────────────
function detectLayout(tpl) {
  const resolvedTpl = resolveTemplatePath(tpl);
  for (const dir of TEMPLATE_DIRS) {
    const filepath = path.join(dir, resolvedTpl + '.bwt');
    if (fs.existsSync(filepath)) {
      const source = fs.readFileSync(filepath, { encoding: 'utf8' });
      const m = source.match(/\{%-?\s*layout\s+['"](\w[\w-]*)['"]\s*-?%\}/);
      return m ? m[1] : 'theme';
    }
  }
  return 'theme';
}

// ── Render full page via layouts/theme.bwt ────────────────────────────────
async function renderFullPage(tpl = 'index', queryParams = null, routeParams = {}) {
  const finalRouteParams = { ...routeParams };
  if (tpl === 'search' && queryParams && !Object.prototype.hasOwnProperty.call(finalRouteParams, 'searchQuery')) {
    finalRouteParams.searchQuery = queryParams.get('query') || queryParams.get('q') || '';
    finalRouteParams.searchType = queryParams.get('type') || 'product';
  }
  const ctx = mockModule.getContext(tpl, finalRouteParams);
  const resolvedTpl = resolveTemplatePath(tpl);

  let contentForLayout = '';
  try {
    contentForLayout = await engine.renderFile(resolvedTpl, ctx);
  } catch (e) {
    console.warn(`[render] template ${resolvedTpl}.bwt:`, e.message);
    contentForLayout = `<div class="container" style="padding:40px 0;"><div style="background:#fff0f0;border:1px solid #f00;padding:20px;border-radius:8px;"><strong>Lỗi render template <code>${resolvedTpl}.bwt</code>:</strong><br><pre style="font-size:12px;">${e.message}</pre></div></div>`;
  }

  const layoutName = detectLayout(tpl);
  const fullCtx = { ...ctx, content_for_layout: contentForLayout, content_for_header: '' };
  let html;
  try {
    html = await engine.renderFile(layoutName, fullCtx);
  } catch (e) {
    console.error(`[render] ${layoutName}.bwt:`, e.message);
    throw e;
  }

  if (!IS_PROD_SERVER) {
    html = html.replace('</head>', devToolbarStyle() + '\n</head>');
    html = html.replace('</body>', devToolbarHtml(tpl) + '\n</body>');
  }

  return html;
}

// ── HTTP server ─────────────────────────────────────────────────────────
async function handleRequest(req, res) {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    let pathname = decodeURIComponent(url.pathname);

    // Assets
    if (pathname.startsWith('/assets/')) {
      const requestedName = pathname.replace('/assets/', '');
      const asset = await compileAsset(requestedName);
      if (!asset) { res.writeHead(404); res.end('Asset not found: ' + requestedName); return; }
      res.writeHead(200, { 'Content-Type': asset.mime });
      if (asset.isBinary) res.end(fs.readFileSync(asset.srcPath));
      else res.end(asset.content);
      return;
    }

    // Cart add (AJAX/urlencoded/JSON) — /cart/add or /cart/add.js
    if (pathname === '/cart/add' || pathname === '/cart/add.js') {
      const raw = await readRequestBody(req);
      const body = parseBody(req, raw);
      const lines = readCartLines(req);
      const variantId = body.variantId || body.variant_id || body.id;
      const quantity = parseInt(body.quantity, 10) || 1;
      if (variantId) {
        const existing = lines.find((l) => String(l.variantId) === String(variantId));
        if (existing) existing.quantity += quantity;
        else lines.push({ variantId, quantity });
      }
      writeCartCookie(res, lines);
      const cart = buildCartFromLines(lines);
      if (pathname.endsWith('.js')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(cart));
      } else {
        res.writeHead(302, { Location: '/cart' });
        res.end();
      }
      return;
    }

    // Toolbar-driven render: /?tpl=xxx
    const tplParam = url.searchParams.get('tpl');
    if (pathname === '/' && tplParam) {
      const lines = readCartLines(req);
      const html = await renderFullPage(tplParam, url.searchParams, { cartOverride: tplParam === 'cart' ? buildCartFromLines(lines) : undefined });
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    if (pathname === '/') {
      const html = await renderFullPage('index');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    // Pretty URL router
    const resolved = resolvePrettyPath(pathname, url.searchParams);
    if (resolved) {
      if (resolved.redirect) { res.writeHead(302, { Location: resolved.redirect }); res.end(); return; }
      const routeParams = { ...resolved.routeParams };
      if (resolved.tpl === 'cart') routeParams.cartOverride = buildCartFromLines(readCartLines(req));
      const html = await renderFullPage(resolved.tpl, url.searchParams, routeParams);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    // 404
    const html = await renderFullPage('404');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } catch (e) {
    console.error('[server error]', e);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Server error: ' + e.message);
  }
}

// ── Chỉ chạy http.listen + chokidar/WebSocket khi `node dev-server.js` chạy
// trực tiếp (local dev preview). Khi file này bị require() bởi api/index.js
// (Vercel serverless) — module.exports = handleRequest bên dưới — các side
// effect này KHÔNG chạy: serverless không listen port, không watch fs.
if (require.main === module) {
  const server = http.createServer(handleRequest);
  server.listen(PORT, () => {
    console.log(`\n  DR.REJU preview → http://localhost:${PORT}\n`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') console.error(`❌ Port ${PORT} đang bận.`);
    else console.error('Server error:', err);
    process.exit(1);
  });

  try {
    const chokidar = require('chokidar');
    const { WebSocketServer } = require('ws');
    const wss = new WebSocketServer({ port: WS_PORT });
    function broadcast(msg) { wss.clients.forEach((c) => { try { c.send(msg); } catch (_) {} }); }
    const watcher = chokidar.watch(['snippets', 'templates', 'layouts', 'assets', 'configs/settings_data.json'], {
      cwd: ROOT, ignoreInitial: true,
    });
    watcher.on('all', () => {
      assetCache.clear();
      delete require.cache[require.resolve('./preview-mock')];
      mockModule = require('./preview-mock');
      broadcast('reload');
    });
    console.log(`  Live reload WS → ws://localhost:${WS_PORT}\n`);
  } catch (e) {
    console.warn('[dev] live-reload không khởi tạo được:', e.message);
  }
}

module.exports = handleRequest;
