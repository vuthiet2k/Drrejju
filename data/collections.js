/**
 * data/collections.js — Collections (giả lập Sapo `collections` object)
 * Đồng bộ với: DrREJU_Products_Services_Sapo_Export_Full.xlsx & Figma Node 41:12
 */

const { products } = require('./products');

function pick(...ids) {
  return products.filter(p => ids.includes(p.id));
}

function makeCollection(name, alias, id, description, selectedProducts, opts = {}) {
  const allVendors = [...new Set(selectedProducts.map(p => p.vendor).filter(Boolean))];
  const allTypes   = [...new Set(selectedProducts.map(p => p.type).filter(Boolean))];
  return {
    id,
    name,
    alias,
    url: `/${alias}`,
    description: description || '',
    products_count: opts.products_count ?? selectedProducts.length,
    products: selectedProducts,
    image: opts.image || null,
    all_vendors: allVendors,
    all_types: allTypes,
    current_vendor: null,
    current_type: null,
    default_sort_by: opts.sort || 'manual',
    template_layout: 'collection',
    tags: [...new Set(selectedProducts.flatMap(p => p.tags || []))],
  };
}

function makeShell(id, name, alias, products_count, opts = {}) {
  return {
    id,
    name,
    alias,
    url: `/${alias}`,
    description: opts.description || '',
    products_count,
    products: [],
    image: opts.image || null,
    all_vendors: [],
    all_types: [],
    current_vendor: null,
    current_type: null,
    default_sort_by: opts.sort || 'created-desc',
    template_layout: 'collection',
    tags: [],
  };
}

const collectionsData = {
  'all': makeCollection(
    'Tất cả sản phẩm & Dược mỹ phẩm', 'all', 0, '',
    products,
    { products_count: products.length, sort: 'created-desc' }
  ),

  'san-pham-ban-chay-noi-bat': makeCollection(
    'SẢN PHẨM BÁN CHẠY NỔI BẬT', 'san-pham-ban-chay-noi-bat', 4273403, '',
    pick(89260001, 89260002, 89260004, 89260007, 89260025, 89260034, 89260072, 89260013, 89260038, 89260020, 89260024),
    { products_count: 11 }
  ),

  'flash-sale-1': makeCollection(
    'FLASH SALE DƯỢC MỸ PHẨM CHÍNH HÃNG', 'flash-sale-1', 4257106, '',
    pick(89260001, 89260004, 89260025, 89260034, 89260072, 89260013, 89260020),
    { products_count: 7 }
  ),

  'da-mun-dau': makeCollection(
    'Đặc Trị Mụn & Kiềm Dầu Lâm Sàng', 'da-mun-dau', 4295298, '',
    pick(89260001, 89260006, 89260008, 89260020, 89260024),
    { products_count: 14, sort: 'created-desc' }
  ),

  'phuc-hoi-sau-xam-lan': makeCollection(
    'PHỤC HỒI MÀNG LIPID & SAU XÂM LẤN', 'phuc-hoi-sau-xam-lan', 4295239, '',
    pick(89260002, 89260004, 89260005, 89260025, 89260034),
    { products_count: 15, sort: 'created-desc' }
  ),

  'top-san-pham-serum-ban-chay': makeCollection(
    'TOP SERUM & TINH CHẤT PHỤC HỒI NỔI BẬT', 'top-san-pham-serum-ban-chay', 4245822, '',
    pick(89260008, 89260025, 89260072),
    { products_count: 21, sort: 'created-desc' }
  ),

  'top-kem-duong-noi-bat': makeCollection(
    'KEM DƯỠNG ẨM & TÁI TẠO MÀNG LIPID', 'top-kem-duong-noi-bat', 4245974, '',
    pick(89260002, 89260004, 89260005, 89260034),
    { products_count: 33 }
  ),

  'top-kem-chong-nang-noi-bat': makeCollection(
    'KEM CHỐNG NẮNG PHỔ RỘNG CHUẨN Y KHOA', 'top-kem-chong-nang-noi-bat', 4245996, '',
    pick(89260013),
    { products_count: 7 }
  ),

  'top-san-pham-toner-noi-bat': makeCollection(
    'TONER CÂN BẰNG PH & XỊT KHOÁNG SINH HỌC', 'top-san-pham-toner-noi-bat', 4245808, '',
    pick(89260007),
    { products_count: 8, sort: 'created-desc' }
  ),

  'top-san-pham-sua-rua-mat-noi-bat': makeCollection(
    'SỮA RỬA MẶT & LÀM SẠCH DỊU NHẸ', 'top-san-pham-sua-rua-mat-noi-bat', 4245797, '',
    pick(89260006, 89260020),
    { products_count: 15 }
  ),

  'top-san-pham-tay-trang-noi-bat': makeCollection(
    'NƯỚC & DẦU TẨY TRANG CHUYÊN SÂU', 'top-san-pham-tay-trang-noi-bat', 4245794, '',
    pick(89260024),
    { products_count: 10 }
  ),

  'top-san-pham-mat-na-ban-chay': makeCollection(
    'MẶT NẠ SINH HỌC & MIẾNG TẨY TẾ BÀO CHẾT', 'top-san-pham-mat-na-ban-chay', 4245818, '',
    pick(89260003),
    { products_count: 10 }
  ),

  'thuc-pham-chuc-nang': makeCollection(
    'THỰC PHẨM CHỨC NĂNG & BỔ SUNG SẮC ĐẸP', 'thuc-pham-chuc-nang', 4267448, '',
    pick(89260038),
    { products_count: 4 }
  ),

  'mua-sam-theo-thanh-phan': makeCollection(
    'MUA SẮM THEO THÀNH PHẦN HOẠT CHẤT', 'mua-sam-theo-thanh-phan', 4291064, '',
    products,
    { products_count: products.length }
  ),
};

function makeFallbackCollection(handle) {
  return {
    id: 0, name: handle, alias: handle, url: `/${handle}`,
    description: '', products_count: products.length,
    products: products.slice(0, 8),
    image: null, all_vendors: [], all_types: [],
    current_vendor: null, current_type: null,
    default_sort_by: 'created-desc', template_layout: 'collection', tags: [],
  };
}

Object.keys(collectionsData).forEach((handle) => {
  if (handle === 'all') return;
  const col = collectionsData[handle];
  (col.products || []).forEach((p) => {
    if (!p.collections) p.collections = [];
    if (!p.collections.some((c) => c.alias === col.alias)) {
      p.collections.push({
        id: col.id, name: col.name, alias: col.alias, url: col.url,
        products_count: col.products_count, size: col.products_count,
      });
    }
  });
});

module.exports = { collectionsData, makeFallbackCollection };
