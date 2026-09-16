/**
 * preview-mock.js — Giả lập Sapo Liquid context cho dev-server.js (DR.REJU)
 *
 * Đọc settings thật từ configs/settings_data.json (1023 keys có sẵn), rồi tự
 * sinh fallback cho MỌI object (collections[handle], linklists[handle],
 * pages[handle], blogs[handle]) mà settings trỏ tới nhưng không có data thật —
 * để mọi section render được mà không cần khai báo tay từng handle.
 */

const fs = require('fs');
const path = require('path');

// ── 1. Settings thật từ configs/settings_data.json ────────────────────────
let realSettings = {};
try {
  const raw = fs.readFileSync(path.join(__dirname, 'configs/settings_data.json'), 'utf8');
  const data = JSON.parse(raw.replace(/^﻿/, ''));
  realSettings = data.current || {};
} catch (e) {
  console.warn('[mock] Không đọc được settings_data.json:', e.message);
}

const settings = { ...realSettings };

// ── 2. Store ───────────────────────────────────────────────────────────────
const store = {
  name: 'DR.REJU',
  domain: 'drreju.vn',
  url: 'https://drreju.vn',
  address: settings.diachi || 'Hà Nội, Việt Nam',
  phone_number: settings.phone || '1900 6116',
  email: settings.email || 'contact@drreju.vn',
  description: 'Da liễu dựa trên bằng chứng · Phác đồ cá nhân hóa 1:1',
};

// ── 3. Products (demo) ─────────────────────────────────────────────────────
function img(color, label) {
  return `https://placehold.co/500x500/${color}?text=${encodeURIComponent(label)}`;
}
function variant(id, title, price, comparePrice, sku, available = true, qty = 20) {
  return {
    id, title, option1: title, option2: null, option3: null, options: [title],
    price, compare_at_price: comparePrice || 0, available, sku,
    inventory_quantity: available ? qty : 0, inventory_policy: 'deny',
  };
}
function makeProduct({ id, name, alias, type, tags, variants, images, vendor }) {
  const firstAvailable = variants.find((v) => v.available) || variants[0];
  return {
    id, name, alias, url: `/${alias}`,
    description: `<p>Sản phẩm <strong>${name}</strong> — dược mỹ phẩm DR.REJU, phác đồ dựa trên bằng chứng.</p>`,
    summary_or_content: `Sản phẩm ${name} — dược mỹ phẩm DR.REJU.`,
    vendor: vendor || 'DR.REJU', type: type || 'Chăm sóc da', style: type || 'Chăm sóc da',
    available: variants.some((v) => v.available),
    price: firstAvailable.price, compare_at_price: firstAvailable.compare_at_price,
    inventory_quantity: firstAvailable.inventory_quantity, inventory_policy: 'deny',
    options: ['Dung tích'],
    featured_image: { src: images[0], alt: name },
    images: images.map((src, i) => ({ src, alt: `${name} — ảnh ${i + 1}` })),
    tags: tags || [], collections: [],
    variants, selected_or_first_available_variant: firstAvailable,
    metafields: { custom: {}, bpr: { votes: 50 + (id % 50), rating: 4.5 } },
  };
}

const products = [
  makeProduct({
    id: 1001, name: 'Serum Retinol 0.3% Phục Hồi', alias: 'serum-retinol-0-3-phuc-hoi', type: 'Serum',
    tags: ['retinol', 'chong-lao-hoa', 'ban-chay'],
    variants: [variant(10011, '30ml', 890000, 1290000, 'DRJ-RET-30', true, 20)],
    images: [img('0A2E24/DFBA73', 'Retinol Serum')],
  }),
  makeProduct({
    id: 1002, name: 'Kem Trị Nám Chuyên Sâu', alias: 'kem-tri-nam-chuyen-sau', type: 'Kem trị liệu',
    tags: ['tri-nam', 'ban-chay'],
    variants: [variant(10021, '30g', 650000, 890000, 'DRJ-NAM-30', true, 15)],
    images: [img('0A2E24/DFBA73', 'Kem Trị Nám')],
  }),
  makeProduct({
    id: 1003, name: 'Gel Trị Mụn Azelaic Acid 15%', alias: 'gel-tri-mun-azelaic-15', type: 'Gel trị mụn',
    tags: ['tri-mun'],
    variants: [variant(10031, '20g', 450000, 590000, 'DRJ-MUN-20', true, 25)],
    images: [img('0A2E24/DFBA73', 'Azelaic Gel')],
  }),
  makeProduct({
    id: 1004, name: 'Serum Cấp Ẩm Hyaluronic Acid', alias: 'serum-cap-am-hyaluronic', type: 'Serum',
    tags: ['duong-am'],
    variants: [variant(10041, '30ml', 520000, 690000, 'DRJ-HA-30', true, 18)],
    images: [img('0A2E24/DFBA73', 'HA Serum')],
  }),
  makeProduct({
    id: 1005, name: 'Kem Chống Nắng Phổ Rộng SPF50+', alias: 'kem-chong-nang-spf50', type: 'Chống nắng',
    tags: ['chong-nang', 'ban-chay'],
    variants: [variant(10051, '50ml', 480000, 620000, 'DRJ-SPF-50', true, 30)],
    images: [img('0A2E24/DFBA73', 'Sunscreen SPF50')],
  }),
  makeProduct({
    id: 1006, name: 'Viên Uống Collagen Peptide', alias: 'vien-uong-collagen-peptide', type: 'Thực phẩm bổ trợ',
    tags: ['tpcn', 'collagen'],
    variants: [variant(10061, 'Hộp 30 viên', 750000, 950000, 'DRJ-COL-30', true, 40)],
    images: [img('DFBA73/0A2E24', 'Collagen Peptide')],
  }),
];
const byId = Object.fromEntries(products.map((p) => [p.id, p]));
const byAlias = Object.fromEntries(products.map((p) => [p.alias, p]));

// ── 4. Collections ───────────────────────────────────────────────────────
function makeFallbackCollection(handle) {
  const shuffled = products.slice(0, 6);
  return {
    id: Math.abs(hashCode(handle)) % 90000 + 1000,
    name: handleToTitle(handle),
    alias: handle,
    url: `/${handle}`,
    description: '',
    products_count: shuffled.length,
    products: shuffled,
    image: null,
    all_vendors: ['DR.REJU'],
    all_types: [],
    current_vendor: null,
    current_type: null,
    default_sort_by: 'manual',
    template_layout: 'collection',
    tags: [],
  };
}
function handleToTitle(handle) {
  return String(handle).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
  return h;
}

const collectionsData = {
  all: (() => {
    const c = makeFallbackCollection('all');
    c.name = 'Tất cả sản phẩm';
    c.products = products;
    c.products_count = products.length;
    return c;
  })(),
};

function buildCollectionsObj() {
  const obj = { ...collectionsData };
  Object.values(settings).forEach((v) => {
    if (typeof v === 'string' && v && v !== 'none' && !obj[v] && !v.includes(' ') && !v.startsWith('#') && !v.startsWith('http')) {
      obj[v] = makeFallbackCollection(v);
    }
  });
  return obj;
}

// ── 5. Navigation (linklists) ───────────────────────────────────────────
function link(title, url, alias, subLinks) {
  return { title, url, alias: alias || '', active: false, links: subLinks || [] };
}

const linklists = {
  'main-menu': {
    title: 'Main Menu', handle: 'main-menu',
    links: [
      link('Trang chủ', '/', ''),
      link('Các vấn đề da', '/cac-van-de-da', 'cac-van-de-da', [
        link('Mụn & bít tắc', '/tri-mun', 'tri-mun'),
        link('Nám & sắc tố', '/tri-nam', 'tri-nam'),
        link('Da nhạy cảm & đỏ - Nám & Tàn nhang', '/sensilis', 'sensilis'),
        link('Lão hoá', '/chong-lao-hoa', 'chong-lao-hoa'),
        link('Da khô & thiếu ẩm', '/duong-am', 'duong-am'),
      ]),
      link('Sản phẩm', '/san-pham', 'san-pham', [
        link('Retinol', '/retinol', 'retinol'),
        link('Chống nắng', '/chong-nang', 'chong-nang'),
        link('Thực phẩm bổ trợ', '/tpcn', 'tpcn'),
      ]),
      link('Bác sĩ Nguyễn Huệ', '/bac-si-hue', 'bac-si-hue'),
      link('Đặt lịch tư vấn', '/dat-lich', 'dat-lich'),
      link('Blog', '/blogs/tin-tuc', ''),
    ],
  },
  'mega-footer': {
    title: 'Footer Categories', handle: 'mega-footer',
    links: [
      link('Điều trị da', '/dieu-tri-da', 'dieu-tri-da', [
        link('Trị mụn', '/tri-mun', 'tri-mun'),
        link('Trị nám', '/tri-nam', 'tri-nam'),
        link('Chống lão hoá', '/chong-lao-hoa', 'chong-lao-hoa'),
      ]),
      link('Chăm sóc da', '/cham-soc-da', 'cham-soc-da', [
        link('Dưỡng ẩm', '/duong-am', 'duong-am'),
        link('Chống nắng', '/chong-nang', 'chong-nang'),
      ]),
      link('Sản phẩm', '/san-pham', 'san-pham', [
        link('Retinol', '/retinol', 'retinol'),
        link('Thực phẩm bổ trợ', '/tpcn', 'tpcn'),
      ]),
      link('Về DR.REJU', '/gioi-thieu', 'gioi-thieu', [
        link('Bác sĩ Nguyễn Huệ', '/bac-si-hue', 'bac-si-hue'),
        link('Đặt lịch tư vấn', '/dat-lich', 'dat-lich'),
      ]),
    ],
  },
};

function buildLinklistsObj() {
  const obj = { ...linklists };
  Object.values(settings).forEach((v) => {
    if (typeof v === 'string' && v && !obj[v] && !v.includes(' ') && !v.startsWith('#') && !v.startsWith('http')) {
      obj[v] = { title: handleToTitle(v), handle: v, links: [] };
    }
  });
  return obj;
}

// ── 6. Pages ────────────────────────────────────────────────────────────
const PAGE_NAMES = {
  'page.about-us': 'Về chúng tôi',
  'page.about': 'Giới thiệu',
  'page.bac-si-hue': 'Bác sĩ Nguyễn Huệ',
  'page.contact': 'Liên hệ',
  'page.dat-lich': 'Đặt lịch tư vấn',
  'page.faq': 'Câu hỏi thường gặp',
  'page.guide': 'Hướng dẫn',
  'page.hethong': 'Hệ thống',
  'page.image': 'Thư viện ảnh',
  'page.quiz': 'Khảo sát hồ sơ da',
};
function buildPagesObj() {
  const obj = {};
  Object.entries(PAGE_NAMES).forEach(([tpl, name]) => {
    const handle = tpl.replace(/^page\.?/, '');
    obj[handle] = { title: name, url: `/${handle}`, alias: handle, content: '', published: true };
  });
  Object.values(settings).forEach((v) => {
    if (typeof v === 'string' && v && !obj[v] && !v.includes(' ') && !v.startsWith('#') && !v.startsWith('http')) {
      obj[v] = { title: handleToTitle(v), url: `/${v}`, alias: v, content: '', published: true };
    }
  });
  return obj;
}

// ── 7. Blogs / Articles ──────────────────────────────────────────────────
function makeArticle(id, title, handle, excerpt) {
  return {
    id, title, handle, url: `/blogs/tin-tuc/${handle}`,
    excerpt, content: `<p>${excerpt}</p>`,
    image: { src: img('0A2E24/DFBA73', 'Blog'), alt: title },
    published_on: new Date(Date.now() - id * 86400000).toISOString(),
    author: 'DR.REJU', tags: [], comments_count: 0,
  };
}
const articleList = [
  makeArticle(1, '5 dấu hiệu da bạn đang lão hoá sớm', 'dau-hieu-lao-hoa-som', 'Nhận biết sớm các dấu hiệu lão hoá để có phác đồ điều trị kịp thời.'),
  makeArticle(2, 'Retinol dùng sao cho đúng?', 'retinol-dung-sao-cho-dung', 'Hướng dẫn sử dụng Retinol an toàn, hiệu quả, tránh kích ứng.'),
  makeArticle(3, 'Chống nắng — lá chắn quan trọng nhất', 'chong-nang-la-chan-quan-trong', 'Vì sao chống nắng là bước không thể thiếu trong mọi phác đồ da liễu.'),
];
const blogs = {
  'tin-tuc': { title: 'Tin tức', handle: 'tin-tuc', url: '/blogs/tin-tuc', articles: articleList },
};
function buildBlogsObj() {
  const obj = { ...blogs };
  Object.values(settings).forEach((v) => {
    if (typeof v === 'string' && v && !obj[v] && !v.includes(' ') && !v.startsWith('#') && !v.startsWith('http')) {
      obj[v] = { title: handleToTitle(v), handle: v, url: `/blogs/${v}`, articles: [] };
    }
  });
  return obj;
}

// ── 8. Cart (rỗng mặc định — dev-server.js override bằng cookie thật) ───
const cart = { item_count: 0, total_price: 0, items: [], note: '', attributes: {} };

const linklistsObj = buildLinklistsObj();
const pagesObj = buildPagesObj();
const blogsObj = buildBlogsObj();
const collectionsObj = buildCollectionsObj();

// ── 9. getContext(templateName, routeParams) ─────────────────────────────
const CUSTOMER_TEMPLATES = new Set(['account', 'addresses', 'orders', 'order', 'change_password', 'reset_password']);
const CUSTOMER_ACCOUNT_TEMPLATES = new Set([...CUSTOMER_TEMPLATES, 'login', 'register']);

function getContext(templateName = 'index', routeParams = {}) {
  const currentProduct = routeParams.productAlias
    ? (byAlias[routeParams.productAlias] || products[0])
    : (byAlias[templateName] || products[0]);

  const currentCollection = routeParams.collectionHandle
    ? (collectionsObj[routeParams.collectionHandle] || makeFallbackCollection(routeParams.collectionHandle))
    : (templateName === 'collection' || templateName === 'collection.ajaxload4' ? collectionsObj.all : null);

  const sapoTemplate = CUSTOMER_ACCOUNT_TEMPLATES.has(templateName) ? ('customers/' + templateName) : templateName;

  const currentPage = (templateName === 'page' || templateName.startsWith('page.'))
    ? {
        name: PAGE_NAMES[templateName] || templateName,
        content: '<p>Nội dung trang demo.</p>',
        alias: templateName.replace(/^page\.?/, '') || 'page',
        url: '/' + (templateName.replace(/^page\.?/, '') || ''),
      }
    : null;

  const currentBlog = routeParams.blogHandle ? (blogsObj[routeParams.blogHandle] || blogsObj['tin-tuc']) : blogsObj['tin-tuc'];
  let resolvedArticle = articleList[0];
  if (routeParams.articleHandle) {
    const all = Object.values(blogsObj).flatMap((b) => b.articles || []);
    resolvedArticle = all.find((a) => a.handle === routeParams.articleHandle) || articleList[0];
  }

  let search;
  if (Object.prototype.hasOwnProperty.call(routeParams, 'searchQuery')) {
    const raw = routeParams.searchQuery || '';
    const q = raw.toLowerCase().trim();
    const results = !q ? [] : products.filter((p) => p.name.toLowerCase().includes(q));
    search = { performed: true, terms: raw, types: ['product'], results, results_count: results.length };
  } else {
    search = { results: products.slice(0, 6), results_count: products.length, terms: '', performed: false, types: ['product'] };
  }

  return {
    settings, store,
    template: sapoTemplate,
    page_title: store.name,
    page_description: store.description,
    canonical_url: `https://${store.domain}/`,
    current_page: 1, current_tags: [],
    content_for_header: '', content_for_layout: '',
    country_option_tags: '<option value="Việt Nam" selected>Việt Nam</option>',
    customer: null,
    order: null,
    cart: routeParams.cartOverride || cart,
    linklists: linklistsObj,
    page: currentPage, pages: pagesObj,
    blogs: blogsObj, blog: currentBlog, article: resolvedArticle, articles: articleList,
    product: currentProduct, collection: currentCollection, collections: collectionsObj,
    search,
    paginate: {
      current_page: 1, pages: Math.ceil(products.length / 12),
      items: products.length, page_size: 12,
      next: null, previous: null,
    },
    errors: null,
  };
}

module.exports = { getContext, settings, store, byAlias, collectionsData: collectionsObj, blogsObj, linklistsObj };
