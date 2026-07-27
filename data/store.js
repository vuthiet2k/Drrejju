/**
 * data/store.js — Thông tin cửa hàng (giả lập Sapo `store` object) — DR.REJU
 * Dữ liệu demo cho môi trường preview. KHÔNG liên quan Pharma Cosmetics.
 */
module.exports = {
  store: {
    name:             'DR.REJU',
    description:      'Hệ thống chăm sóc & điều trị da chuẩn y khoa.',
    domain:           'drreju.mysapo.net',
    permanent_domain: 'drreju.bizwebvietnam.net',
    url:              'https://drreju.mysapo.net',
    email:            'info@drreju.vn',
    address:          'Tầng 4 - Tòa nhà Hanoi Group - 442 Đội Cấn - Ba Đình - Hà Nội',
    phone_number:     '1900 0000',

    currency:                    'VND',
    currency_symbol:             '₫',
    money_format:                '{{ amount }}đ',
    money_with_currency_format:  '{{ amount }} VND',
    locale:                      'vi',
    country:                     'Việt Nam',

    products_count:    15,
    collections_count: 20,

    password_message: '',
    metafields: {},

    // Thương hiệu / loại — demo generic (thay bằng dữ liệu DR.REJU khi có plan)
    vendors: ['DR.REJU', 'Demo Brand A', 'Demo Brand B', 'Demo Brand C'],
    types:   ['Dịch vụ', 'Sản phẩm', 'Liệu trình', 'Combo'],

    social: {
      facebook:  'https://facebook.com/',
      instagram: 'https://instagram.com/',
      youtube:   'https://youtube.com/',
      tiktok:    'https://tiktok.com/',
    },
  },
};
