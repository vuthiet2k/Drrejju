/**
 * data/store.js — Thông tin cửa hàng (giả lập Sapo `store` object) — DR.REJU
 * Dữ liệu demo cho môi trường preview.
 */
module.exports = {
  store: {
    name:             'Dr.REJU',
    business_name:    'DR REJU BEAUTY CLINIC',
    description:      'Hệ thống chăm sóc & điều trị da chuẩn y khoa.',
    domain:           'drreju.mysapo.net',
    permanent_domain: 'drreju.bizwebvietnam.net',
    url:              'https://drreju.mysapo.net',
    email:            'nguyenhueydp@gmail.com',
    address:          'TDP Hùng Thắng, Xã Tiền Hải, Tỉnh Hưng Yên, Việt Nam',
    phone_number:     '0962081295',

    currency:                    'VND',
    currency_symbol:             '₫',
    money_format:                '{{ amount }}₫',
    money_with_currency_format:  '{{ amount }} VND',
    locale:                      'vi',
    country:                     'Việt Nam',
    country_code:                'VN',
    province:                    'Hưng Yên',
    province_code:               '31',

    products_count:    15,
    collections_count: 20,

    password_message: '',
    metafields: {},

    vendors: ['DR.REJU', 'DR REJU BEAUTY CLINIC'],
    types:   ['Dịch vụ', 'Sản phẩm', 'Liệu trình', 'Combo'],

    appstore_link:    'https://apps.apple.com/vn/app/reju/id6749924889?l=vi',
    playstore_link:   'https://play.google.com/store/apps/details?id=drreju.ezs&hl=vi',

    social: {
      facebook:  'https://facebook.com/',
      instagram: 'https://instagram.com/',
      youtube:   'https://youtube.com/',
      tiktok:    'https://tiktok.com/',
    },
  },
};