/**
 * data/articles.js — Bài viết blog & blog objects (giả lập Sapo `blogs[handle]`, `articles`)
 *
 * Dùng cho: section_blog.bwt, section_blog_2.bwt, article.bwt
 */

function img(color, text, size = '675x380') {
  return `https://placehold.co/${size}/${color}?text=${encodeURIComponent(text)}`;
}

// ── 5 bài viết ──────────────────────────────────────────────────────────────

const articles = [

  {
    id:            201,
    title:         'Retinol: Thành phần vàng trong chống lão hoá — Cách dùng đúng để không kích ứng',
    alias:         'retinol-thanh-phan-vang-chong-lao-hoa',
    handle:        'retinol-thanh-phan-vang-chong-lao-hoa',
    url:           '/blogs/tin-tuc/retinol-thanh-phan-vang-chong-lao-hoa',
    excerpt:       'Retinol là dẫn xuất Vitamin A được khoa học chứng minh hiệu quả nhất trong việc làm mờ nếp nhăn, tăng collagen và đều màu da — nhưng cần dùng đúng cách.',
    content:       '<p>Retinol đã được nghiên cứu hơn 40 năm và là một trong số ít thành phần skincare được FDA công nhận có hiệu quả điều trị lão hoá da...</p>',
    image:         { src: img('d4a373/ffffff', 'Retinol Guide'), alt: 'Hướng dẫn dùng Retinol' },
    featured_image:{ src: img('d4a373/ffffff', 'Retinol Guide'), alt: 'Hướng dẫn dùng Retinol' },
    author:        'DS. Nguyễn Minh Anh',
    published_at:  '2026-04-10T08:00:00',
    created_at:    '2026-04-08T14:30:00',
    tags:          ['retinol', 'chong-lao-hoa', 'skincare-101'],
    comments_count: 14,
    blog: { handle: 'tin-tuc', title: 'Tin tức & Kiến thức' },
  },

  {
    id:            202,
    title:         'Vitamin C trong skincare: Phân biệt các dạng & chọn nồng độ phù hợp',
    alias:         'vitamin-c-skincare-phan-biet-cac-dang',
    handle:        'vitamin-c-skincare-phan-biet-cac-dang',
    url:           '/blogs/tin-tuc/vitamin-c-skincare-phan-biet-cac-dang',
    excerpt:       'L-Ascorbic Acid, Ascorbyl Glucoside, Sodium Ascorbyl Phosphate... Mỗi dạng có ưu điểm và cách dùng khác nhau. Bài viết giúp bạn chọn đúng.',
    content:       '<p>Vitamin C là antioxidant mạnh, làm sáng da, kích thích collagen và bảo vệ da khỏi tổn thương UV...</p>',
    image:         { src: img('f4a261/ffffff', 'Vitamin C Guide'), alt: 'Vitamin C trong skincare' },
    featured_image:{ src: img('f4a261/ffffff', 'Vitamin C Guide'), alt: 'Vitamin C trong skincare' },
    author:        'BS.CKI Trần Thu Hương',
    published_at:  '2026-04-05T09:00:00',
    created_at:    '2026-04-03T11:00:00',
    tags:          ['vitamin-c', 'lam-sang', 'skincare-101'],
    comments_count: 9,
    blog: { handle: 'tin-tuc', title: 'Tin tức & Kiến thức' },
  },

  {
    id:            203,
    title:         '5 bước xây dựng routine skincare buổi sáng chuẩn chuyên gia',
    alias:         '5-buoc-routine-skincare-buoi-sang',
    handle:        '5-buoc-routine-skincare-buoi-sang',
    url:           '/blogs/tin-tuc/5-buoc-routine-skincare-buoi-sang',
    excerpt:       'Rửa mặt → Toner → Serum → Dưỡng ẩm → Chống nắng. Đơn giản nhưng mỗi bước đều có lý do khoa học. Cùng xem thứ tự đúng và sản phẩm nên dùng.',
    content:       '<p>Một routine skincare buổi sáng tốt không cần nhiều bước, nhưng cần đúng thứ tự và sản phẩm phù hợp với loại da của bạn...</p>',
    image:         { src: img('95d5b2/333333', 'AM Routine'), alt: '5 bước skincare buổi sáng' },
    featured_image:{ src: img('95d5b2/333333', 'AM Routine'), alt: '5 bước skincare buổi sáng' },
    author:        'DS. Nguyễn Minh Anh',
    published_at:  '2026-03-28T08:30:00',
    created_at:    '2026-03-26T10:00:00',
    tags:          ['routine', 'skincare-101', 'ban-chay'],
    comments_count: 22,
    blog: { handle: 'tin-tuc', title: 'Tin tức & Kiến thức' },
  },

  {
    id:            204,
    title:         'Nám da: Nguyên nhân, phân loại và phác đồ điều trị hiệu quả nhất 2026',
    alias:         'nam-da-nguyen-nhan-phac-do-dieu-tri',
    handle:        'nam-da-nguyen-nhan-phac-do-dieu-tri',
    url:           '/blogs/tin-tuc/nam-da-nguyen-nhan-phac-do-dieu-tri',
    excerpt:       'Nám là nỗi lo của hàng triệu phụ nữ Việt. Hiểu rõ nám nông, nám sâu và nám hỗn hợp giúp bạn chọn đúng phác đồ — tránh tiêu tiền vô ích.',
    content:       '<p>Nám da (melasma) là tình trạng tăng sắc tố mãn tính do nhiều yếu tố kết hợp: UV, hormon, viêm nhiễm...</p>',
    image:         { src: img('fff3e0/6d4c41', 'Nam Da Guide'), alt: 'Điều trị nám da' },
    featured_image:{ src: img('fff3e0/6d4c41', 'Nam Da Guide'), alt: 'Điều trị nám da' },
    author:        'BS.CKII Lê Thị Lan',
    published_at:  '2026-03-15T09:00:00',
    created_at:    '2026-03-12T14:00:00',
    tags:          ['tri-nam', 'chuyen-nghiep', 'bac-si-tu-van'],
    comments_count: 31,
    blog: { handle: 'tin-tuc', title: 'Tin tức & Kiến thức' },
  },

  {
    id:            205,
    title:         'SPF, PA, UVA/UVB — Giải mã ký hiệu kem chống nắng để chọn đúng sản phẩm',
    alias:         'giai-ma-ky-hieu-kem-chong-nang-spf-pa',
    handle:        'giai-ma-ky-hieu-kem-chong-nang-spf-pa',
    url:           '/blogs/tin-tuc/giai-ma-ky-hieu-kem-chong-nang-spf-pa',
    excerpt:       'SPF50+ PA++++ nghĩa là gì? Tại sao cần bôi lại sau 2 tiếng? Bài viết giải thích đầy đủ để bạn không mua nhầm kem chống nắng nữa.',
    content:       '<p>Kem chống nắng là bước không thể bỏ qua trong bất kỳ routine skincare nào. SPF đo khả năng chống UVB, còn PA+++ đo UVA...</p>',
    image:         { src: img('90e0ef/333333', 'SPF Guide'), alt: 'Hướng dẫn kem chống nắng' },
    featured_image:{ src: img('90e0ef/333333', 'SPF Guide'), alt: 'Hướng dẫn kem chống nắng' },
    author:        'DS. Nguyễn Minh Anh',
    published_at:  '2026-03-05T08:00:00',
    created_at:    '2026-03-03T10:30:00',
    tags:          ['chong-nang', 'spf', 'skincare-101'],
    comments_count: 18,
    blog: { handle: 'tin-tuc', title: 'Tin tức & Kiến thức' },
  },

];

// ── Blog objects ─────────────────────────────────────────────────────────────

const blogs = {
  'tin-tuc': {
    id:      301,
    title:   'Tin tức & Kiến thức',
    handle:  'tin-tuc',
    url:     '/blogs/tin-tuc',
    articles: articles.filter(a => a.blog.handle === 'tin-tuc'),
  },
  'truoc-va-sau': {
    id:      302,
    title:   'Trước & Sau Điều Trị',
    handle:  'truoc-va-sau',
    url:     '/blogs/truoc-va-sau',
    articles: [],
  },
};

// Article đơn lẻ (dùng cho template article.bwt)
const currentArticle = articles[0];

module.exports = { articles, blogs, currentArticle };
