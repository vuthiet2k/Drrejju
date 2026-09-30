// Dữ liệu tĩnh cụm di tích Xã Thành Công.
import { sitePhotos } from "./sitePhotos.js";
import { festivalPhotos } from "./festivalPhotos.js";

// Ảnh nghệ thuật hát Soọng cô (dân ca giao duyên Sán Dìu) — dùng cho chủ đề
// "Nghệ thuật hát Soọng cô" (thay cho "Ẩm thực trung du").
import hatSoongCo1 from "../@data/image/nghe_thuat_hat_soong_co/2aOboQtk0ISK0ta0zMqwvufH6wBEulL0t3vB93lA.jpg";
import hatSoongCo2 from "../@data/image/nghe_thuat_hat_soong_co/602b86ff-e32d-48f6-a900-65f8df02f936.jpg";
import hatSoongCo3 from "../@data/image/nghe_thuat_hat_soong_co/1WUpukm7nwTgrj63GQyiVJapiu6kkmFDv5Op1sFqzW3n5QmrO6TDsNsQGmkC8PZYTSf.jpg";

// Ảnh bản sắc Sán Dìu (áo chàm, lễ rước, nghề dệt trang phục) — dùng cho chủ đề
// "Bản sắc Sán Dìu".
import banSacSanDiu1 from "../@data/image/ban_sac_san_diu/le-ruoc-dau-o-xa-ninh-lai-son-duong-co-kem-theo-mot-cap-tr-0-1718706504.jpg";
import banSacSanDiu2 from "../@data/image/ban_sac_san_diu/san diu 2.png";
import banSacSanDiu3 from "../@data/image/ban_sac_san_diu/anh2-1-1742290658.jpg";

// Ảnh tín ngưỡng hòa quyện (chùa, đình mang mô hình Tiền Phật hậu Mẫu) —
// dùng cho chủ đề "Tín ngưỡng hòa quyện".
import tinNguong1 from "../@data/image/tin_nguong/Chùa Linh Phúc 1.png";
import tinNguong2 from "../@data/image/tin_nguong/Đình chùa Nguyễn tân.png";
import tinNguong3 from "../@data/image/tin_nguong/Đền Đan Hà.png";

// Ảnh lễ hội thực tế (anh_le_hoi) được ưu tiên hơn ảnh lễ hội đại diện
// trong sitePhotos khi có sẵn cho địa điểm đó.
const festCover = (id) => (festivalPhotos[id] && festivalPhotos[id][0]) || sitePhotos[id].festivalImage;

export function getThanhCongData() {
  const sites = [
    { id: 'dan-ha-den', ll: [105.807185, 21.401949], d3: true, image: sitePhotos['dan-ha-den'].image, images: sitePhotos['dan-ha-den'].images, yearRanked: 2004, deities: { vi: 'Tam vị Thượng đẳng thần (Cao Sơn · Quý Minh · Tam Tư Quá Giang)', en: 'Three Superior Deities (Cao Son · Quy Minh · Tam Tu Qua Giang)' }, vi: { n: 'Đền Đan Hà', t: 'Đền', d: 'Đền cổ phụng thờ Tam vị Thượng đẳng thần, sở hữu kiến trúc gỗ truyền thống với mái đao cong cùng hệ thống cổ vật quý giá thời Lê – Nguyễn.' }, en: { n: 'Dan Ha Temple', t: 'Temple', d: 'An ancient temple worshipping the Three Superior Deities, with traditional timber architecture, curved roof eaves and a rich collection of Le–Nguyen era antiquities.' } },
    { id: 'dan-ha-dinh', ll: [105.807406, 21.402464], d3: true, image: sitePhotos['dan-ha-dinh'].image, images: sitePhotos['dan-ha-dinh'].images, yearRanked: 2016, deities: { vi: 'Tam vị Thành hoàng thời Hùng Duệ Vương (Cao Sơn · Quý Minh · Tam Tư Quá Giang)', en: 'Three tutelary deities of the Hung Due Vuong era (Cao Son · Quy Minh · Tam Tu Qua Giang)' }, vi: { n: 'Đình Đan Hà', t: 'Đình', d: 'Ngôi đình cổ phụng thờ Thành hoàng làng, nổi bật với hệ vì kèo gỗ chạm khắc tinh xảo. Nơi diễn ra kỳ lễ hội Rằm tháng Giêng quy mô và rộn rã nhất trong năm.' }, en: { n: 'Dan Ha Communal House', t: 'Communal house', d: 'An ancient communal house worshipping the village tutelary deities, notable for its finely carved timber roof frame. Host to the largest and liveliest full-moon festival of the first lunar month.' } },
    { id: 'nguyen-tan', ll: [105.814937, 21.398987], d3: false, image: sitePhotos['nguyen-tan'].image, images: sitePhotos['nguyen-tan'].images, yearRanked: 2020, alias: { vi: 'Đình – Chùa Thượng Vụ', en: 'Thuong Vu Communal House & Pagoda' }, deities: { vi: 'Thành hoàng (Cao Sơn · Quý Minh · Tổng Bính) · Phật · Tam tòa Thánh Mẫu', en: 'Tutelary deities (Cao Son · Quy Minh · Tong Binh) · Buddha · Three Holy Mothers' }, vi: { n: 'Đình - Chùa Nguyễn Tân', t: 'Đình – Chùa', d: 'Quần thể di tích sóng đôi duy trì tín ngưỡng thờ Phật và Thành hoàng làng. Công trình gắn liền với lễ rước kiệu truyền thống náo nhiệt vào ngày 12 tháng 10 âm lịch.' }, en: { n: 'Nguyen Tan Communal House & Pagoda', t: 'Communal house & pagoda', d: 'A twin heritage complex upholding both Buddhist worship and the village tutelary cult, host to a lively traditional palanquin procession on the 12th of the tenth lunar month.' } },
    { id: 'van-kim', ll: [105.83957, 21.38088], d3: false, image: sitePhotos['van-kim'].image, images: sitePhotos['van-kim'].images, yearRanked: 2015, alias: { vi: 'Thanh Am Tự', en: 'Thanh Am Pagoda' }, deities: { vi: 'Phật giáo Đại thừa · Thờ Hậu · Thành hoàng (Đức Thánh Tam Giang) · Thánh Mẫu · Đức Thánh Trần', en: 'Mahayana Buddhism · Ancestral benefactors · Tutelary deity (Saint Tam Giang) · Holy Mothers · Saint Tran' }, vi: { n: 'Chùa Vạn Kim', t: 'Chùa', d: 'Ngôi chùa cổ với gác chuông, vườn tháp và hệ thống tượng Phật quý, nơi lưu giữ thần tích về hai vị danh tướng Trương Hống, Trương Hát.' }, en: { n: 'Van Kim Pagoda', t: 'Pagoda', d: 'An ancient pagoda with a bell tower, stupa garden and a precious collection of Buddha statues, preserving the legend of the two famed generals Truong Hong and Truong Hat.' } },
    { id: 'linh-phuc', ll: [105.789432, 21.39642], d3: false, image: sitePhotos['linh-phuc'].image, images: sitePhotos['linh-phuc'].images, yearRanked: 2020, deities: { vi: 'Phật giáo Đại thừa · Tam tòa Thánh Mẫu', en: 'Mahayana Buddhism · Three Holy Mothers' }, vi: { n: 'Chùa Linh Phúc', t: 'Chùa', d: 'Ngôi chùa làng thanh tịnh duy trì mô hình “Tiền Phật hậu Mẫu”, gắn liền với đời sống tâm linh cùng các lễ tiết nông nghiệp cầu mùa màng của nhân dân.' }, en: { n: 'Linh Phuc Pagoda', t: 'Pagoda', d: 'A serene village pagoda following the “Buddha-front, Mother-Goddess-rear” model, closely tied to spiritual life and the seasonal agricultural rites praying for a good harvest.' } },
    { id: 'ha-dat', ll: [105.77942, 21.375829], d3: false, image: sitePhotos['ha-dat'].image, images: sitePhotos['ha-dat'].images, yearRanked: 2022, deities: { vi: 'Năm vị nhân thần (Cao Sơn · Quý Minh · Trần Thị Ngọc Long · Lưu Gia Đức Trọng · Nguyễn Gia Phù Quốc) · Bà Chúa Mỹ Nương', en: 'Five human deities (Cao Son · Quy Minh · Tran Thi Ngoc Long · Luu Gia Duc Trong · Nguyen Gia Phu Quoc) · Lady Chua My Nuong' }, vi: { n: 'Đình Hạ Đạt', t: 'Đình', d: 'Ngôi đình mộc mạc lưu giữ các sắc phong cổ, độc đáo với tục ban “lá cờ thiêng” trừ sâu bệnh (15/7 âm lịch) và hội rước kiệu giao hảo với Miếu Ao Sen đầu xuân.' }, en: { n: 'Ha Dat Communal House', t: 'Communal house', d: 'A rustic communal house preserving ancient royal edicts, unique for its custom of handing out “sacred flags” to ward off pests (15th of the 7th lunar month) and its spring palanquin-fellowship festival with Ao Sen Shrine.' } },
    { id: 'dinh-bia', ll: [105.785462, 21.408424], d3: false, image: sitePhotos['dinh-bia'].image, images: sitePhotos['dinh-bia'].images, yearRanked: 2021, alias: { vi: 'Miếu Bìa', en: 'Bia Shrine' }, deities: { vi: 'Tam vị Vương ông (Cao Sơn · Tô Á · Tổng Bính) · Nhị vị Vua Bà · phối thờ Nguyễn Thị Bà', en: 'Three Lord Kings (Cao Son · To A · Tong Binh) · Two Queen Mothers · with Lady Nguyen Thi Ba' }, vi: { n: 'Đình Bìa', t: 'Đình', d: 'Ngôi đình ven làng phụng thờ Nhị vị Vua Bà, nơi diễn ra sinh hoạt lễ tiết Thành hoàng và giao lưu hát Soọng cô của đồng bào Sán Dìu.' }, en: { n: 'Bia Communal House', t: 'Communal house', d: 'A village-edge communal house worshipping the Two Queen Mothers, host to tutelary-deity rites and San Diu Soong Co folk-singing exchanges.' } },
    { id: 'xuan-duong', ll: [105.802602, 21.404621], d3: false, image: sitePhotos['xuan-duong'].image, images: sitePhotos['xuan-duong'].images, yearRanked: 2025, alias: { vi: 'Đình Làng Ruồng', en: 'Ruong Village Communal House' }, deities: { vi: 'Tam vị Vua Ông (Cao Sơn · Cao Các · Thành hoàng) · Nhị vị Vua Bà phò tá Lý Thường Kiệt và Trần Quang Khải', en: 'Three Lord Kings (Cao Son · Cao Cac · tutelary deity) · Two Queen Mothers who aided Ly Thuong Kiet and Tran Quang Khai' }, vi: { n: 'Đình Xuân Dương', t: 'Đình', d: 'Ngôi đình phụng thờ Nhị vị Vua Bà, gây ấn tượng với hệ khung gỗ truyền thống chạm khắc Tứ linh cùng các đề tài dân gian và đại lễ kỳ phúc ngày 20/10 âm lịch.' }, en: { n: 'Xuan Duong Communal House', t: 'Communal house', d: 'A communal house worshipping the Two Queen Mothers, impressive for its traditional timber frame carved with the Four Sacred Creatures and folk motifs, and its grand blessing rite on the 20th of the tenth lunar month.' } },
    { id: 'an-mien', ll: [105.809601, 21.392388], d3: false, image: sitePhotos['an-mien'].image, images: sitePhotos['an-mien'].images, deities: { vi: 'Tam vị Vương Ông (Cao Sơn · Quý Minh · Thành hoàng) · Nhị vị Vua Bà (Linh Quang · Đương Giang)', en: 'Three Lord Kings (Cao Son · Quy Minh · tutelary deity) · Two Queen Mothers (Linh Quang · Duong Giang)' }, vi: { n: 'Đình An Miên', t: 'Đình', d: 'Ngôi đình cổ phụng thờ Nhị vị Vua Bà, giữ vai trò là trung tâm sinh hoạt văn hóa, tín ngưỡng gắn kết cộng đồng dân cư làng An Miên.' }, en: { n: 'An Mien Communal House', t: 'Communal house', d: 'An ancient communal house worshipping the Two Queen Mothers, serving as the cultural and spiritual heart that binds the An Mien village community together.' } }
  ];
  const villages = [
    { ll: [105.7430, 21.4000], vi: { n: 'Làng gốm Bát Cổ', d: 'Gốm men cổ truyền, lò bầu hàng trăm năm tuổi.' }, en: { n: 'Bat Co Pottery', d: 'Traditional glazed ceramics, centuries-old kilns.' } },
    { ll: [105.7860, 21.3760], vi: { n: 'Làng chạm khắc gỗ', d: 'Chạm khắc đình chùa, tượng thờ thủ công.' }, en: { n: 'Woodcarving Village', d: 'Temple carvings and handmade worship statues.' } },
    { ll: [105.7520, 21.3640], vi: { n: 'Làng dệt lụa', d: 'Lụa tơ tằm nhuộm màu thảo mộc tự nhiên.' }, en: { n: 'Silk Weaving Village', d: 'Mulberry silk dyed with natural plant colors.' } }
  ];
  // Hệ thống lễ hội xã Thành Công — biên tập theo tư liệu địa phương, gắn với
  // chu kỳ nông nghiệp và 9 di tích cấp tỉnh, chia 3 nhóm: Khai xuân
  // (group:'khai-xuan'), Đại lễ hội làng ('dai-le') và lễ tiết nông nghiệp /
  // tôn giáo ('nong-nghiep'). Ảnh lấy từ bộ ảnh mới của địa điểm liên quan.
  // m/d dùng theo tháng/ngày âm lịch để sắp thứ tự trên timeline (cal:'al').
  // siteIds liên kết tới trang di tích; gallery ưu tiên ảnh lễ hội rồi ảnh địa điểm.
  const festImgs = (siteIds) => [
    ...siteIds.flatMap((id) => (festivalPhotos[id] && festivalPhotos[id].length ? festivalPhotos[id] : [sitePhotos[id].festivalImage])),
    ...siteIds.flatMap((id) => sitePhotos[id].images),
  ];
  const festivals = [
    // ── 1. LỄ HỘI KHAI XUÂN ─────────────────────────────────────────
    {
      id: 'khaixuan-ha-dat', group: 'khai-xuan', ll: [105.7888348, 21.3897227], img: festCover('ha-dat'), m: 1, d: 5, dur: 2, c: '#2C4A5E', cal: 'al',
      siteIds: ['ha-dat'], images: festImgs(['ha-dat']),
      vi: {
        n: 'Hội rước kiệu giao hảo — Đình Hạ Đạt', d: 'Rước kiệu Bà Chúa Mỹ Nương về đình ngự vui cùng các Thần Ông.', s: 'Xuân', dl: 'Mùng 5–6 tháng Giêng',
        intro: ['Lễ hội rước kiệu giao hảo truyền thống giữa Đình Hạ Đạt và Miếu Ao Sen là một sinh hoạt văn hóa tín ngưỡng đặc sắc mở màn cho mùa lễ hội đầu năm tại xã Thành Công. Diễn ra định kỳ vào ngày mùng 5 và mùng 6 tháng Giêng âm lịch, lễ hội thu hút đông đảo nhân dân địa phương cùng quý khách thập phương về tham dự, tạo nên bầu không khí rộn rã, tưng bừng khắp nẻo đường làng. Tâm điểm thiêng liêng của sự kiện là nghi lễ rước kiệu Bà Chúa Mỹ Nương (Thần Bà) từ Miếu Ao Sen về Đình Hạ Đạt để ngự vui, giao hảo cùng các vị Thần Ông trong những ngày đầu xuân năm mới.', 'Tục rước kiệu giao hảo không chỉ thể hiện niềm tôn kính sâu sắc đối với các bậc thần linh tiền bối bảo trợ bản làng, mà còn phản ánh triết lý âm dương hài hòa, sự gắn kết keo sơn giữa các cụm dân cư, xóm làng trong vùng đất Thành Công giàu truyền thống. Từ sáng sớm ngày mùng 5, đoàn rước được khởi hành trong tiếng trống, tiếng chiêng rền vang cùng cờ ngũ sắc rực rỡ, đội tế nam quan và nữ quan trang nghiêm trong trang phục truyền thống chỉnh tề nâng kiệu rước qua các thôn xóm thanh bình ven sườn trung du. Khi kiệu Thần Bà an vị tại đại đình Hạ Đạt, các bô lão và nhân dân tiến hành dâng hương, đăng trà quả thực tạ ơn đất trời và cầu chúc cho một năm mưa thuận gió hòa, mùa màng bội thu, nhà nhà ấm no hạnh phúc.', 'Suốt thời gian diễn ra hội xuân, bên cạnh phần lễ trang nghiêm là phần hội náo nhiệt với nhiều trò chơi dân gian mang đậm bản sắc văn hóa cổ truyền của vùng đất bán sơn địa. Sự giao thoa văn hóa tín ngưỡng này khẳng định sức sống bền bỉ của di sản, góp phần thắt chặt tình làng nghĩa xóm, giáo dục thế hệ trẻ lòng tri ân nguồn cội và ý thức giữ gìn thuần phong mỹ tục của quê hương qua từng thế hệ cư dân.'],
        acts: [{ h: 'Rước kiệu giao hảo', d: 'Rước kiệu Thần Bà (Bà Chúa Mỹ Nương) về đình ngự cùng Thần Ông.' }, { h: 'Tế nam quan · nữ quan', d: 'Nghi lễ tế nam quan, nữ quan dâng hương hoa trà quả tạ ơn trời đất.' }, { h: 'Trò chơi dân gian', d: 'Tổ chức các trò chơi dân gian truyền thống và sinh hoạt vui xuân.' }]
      },
      en: {
        n: 'Palanquin Fellowship Festival — Ha Dat', d: 'Carrying Lady Chua My Nuong to the communal house to join the male deities.', s: 'Spring', dl: '5th–6th, 1st lunar month',
        intro: ['The palanquin-fellowship festival between Ha Dat communal house and Ao Sen shrine opens the festival season of Thanh Cong, held on the 5th and 6th of the first lunar month. Its sacred centrepiece is the procession carrying Lady Chua My Nuong (the Goddess) from Ao Sen shrine to Ha Dat communal house to join the male deities for the new year — a custom expressing both reverence for the guardian deities and the bond between the hamlets.', 'Setting out at dawn to drums, gongs and five-coloured banners, male and female ritual teams in full traditional dress carry the palanquin through the villages along the midland slopes. Once the palanquin is installed, elders and villagers offer incense, tea and fruit in thanks to heaven and earth, praying for favourable weather, a bountiful harvest and prosperity for every household, while folk games of the semi-highland country fill the festival days.'],
        acts: [{ h: 'Fellowship palanquin parade', d: 'Carrying Lady Chua My Nuong to the communal house to join the male deities.' }, { h: 'Male and female ritual teams', d: 'Rites by male and female teams offering incense, tea and fruit in thanks to heaven and earth.' }, { h: 'Folk games', d: 'Traditional folk games and spring festivities in the communal-house grounds.' }]
      }
    },
    {
      id: 'khaixuan-dan-ha-dinh', group: 'khai-xuan', ll: [105.807378, 21.401935], img: festCover('dan-ha-dinh'), m: 1, d: 15, dur: 1, c: '#2C4A5E', cal: 'al',
      siteIds: ['dan-ha-dinh'], images: festImgs(['dan-ha-dinh']),
      vi: {
        n: 'Hội Rằm tháng Giêng — Đình Đan Hà', d: 'Kỳ lễ hội quy mô nhất của đình: hát quan họ, chầu văn, chọi gà, cờ người.', s: 'Xuân', dl: '15 tháng Giêng',
        intro: ['Hội Rằm tháng Giêng tại Đình Đan Hà là kỳ lễ hội đầu xuân có quy mô hoành tráng và quan trọng bậc nhất trong năm của cụm di tích lịch sử văn hóa cấp tỉnh trên địa bàn xã Thành Công. Được tổ chức chính hội đúng vào ngày 15 tháng Giêng âm lịch, lễ hội là không gian sinh hoạt văn hóa tinh thần thiêng liêng, nơi quy tụ toàn thể con em địa phương cùng đông đảo du khách gần xa về chiêm bái, dâng hương lễ tạ công đức tiền nhân. Đình Đan Hà vốn là nơi phụng thờ Tam vị Thượng đẳng thần thời Hùng Vương thứ XVIII gồm Cao Sơn Đại Vương, Quý Minh Đại Vương và Tam Tư Quá Giang, những vị thần linh đã hiển linh phò trợ tướng quân Lý Thường Kiệt đại phá quân Tống trên phòng tuyến sông Cầu thời phong kiến.', 'Trong không khí hân hoan của ngày Tết Nguyên tiêu, lễ hội mở đầu bằng nghi thức tế lễ cổ truyền uy nghiêm do ban khánh tiết và các bậc cao niên làng Đan Hà thực hiện theo đúng điển lễ xưa, dâng biểu cầu chúc quốc thái dân an, phong điều vũ thuận, cuộc sống an lành và thịnh vượng cho muôn dân. Điểm nhấn hấp dẫn tạo nên bản sắc độc đáo của hội Rằm Đình Đan Hà chính là sự hòa quyện tuyệt vời giữa không gian tâm linh và các hoạt động hội làng phong phú. Tiếng hát quan họ ngọt ngào, tha thiết của các liền anh liền chị hòa cùng âm điệu huyền ảo, rộn rã của nghệ thuật hát chầu văn truyền thống ngân vang suốt ngày đêm bên mái đình cổ kính.', 'Đồng thời, khuôn viên đình còn diễn ra nhiều trò chơi dân gian đặc sắc thu hút sự tham gia nhiệt tình của mọi lứa tuổi như đấu cờ người trí tuệ, chọi gà dân gian và các màn giao lưu văn hóa sôi nổi. Lễ hội không chỉ là dịp vui xuân đón Tết mà còn là sợi dây tâm linh bền chặt gắn kết lòng người, tôn vinh tinh thần yêu nước và bồi đắp niềm tự hào về truyền thống ngàn đời của quê hương.'],
        acts: [{ h: 'Tế lễ cổ truyền', d: 'Tế lễ cổ truyền dâng biểu cầu quốc thái dân an, mưa thuận gió hòa.' }, { h: 'Hát quan họ · chầu văn', d: 'Biểu diễn nghệ thuật hát quan họ và hát chầu văn truyền thống.' }, { h: 'Chọi gà · cờ người', d: 'Thi đấu các trò chơi dân gian đặc sắc: chọi gà, cờ người.' }]
      },
      en: {
        n: 'Full-Moon Festival — Dan Ha Communal House', d: 'The largest festival here: quan ho and chau van singing, cockfighting, human chess.', s: 'Spring', dl: '15th, 1st lunar month',
        intro: ['The full-moon festival of the first lunar month at Dan Ha communal house is the largest and most important spring festival of the provincial-level heritage cluster in Thanh Cong, with the main day falling on the 15th. The communal house venerates the Three Superior Deities of the eighteenth Hung king’s era — Cao Son, Quy Minh and Tam Tu Qua Giang — credited with aiding general Ly Thuong Kiet against the Song army on the Cau river line.', 'The festival opens with solemn traditional rites led by the ritual board and the elders of Dan Ha, presenting petitions for national peace and favourable weather. Its distinctive character comes from the blend of sacred space and rich village festivities: quan ho and chau van singing resound day and night beside the ancient roof, while human chess, cockfighting and cultural exchanges draw participants of every age.'],
        acts: [{ h: 'Traditional rites', d: 'Traditional rites presenting petitions for national peace and favourable weather.' }, { h: 'Quan ho · chau van', d: 'Performances of traditional quan ho and chau van singing.' }, { h: 'Cockfighting · human chess', d: 'Distinctive folk contests: cockfighting and human chess.' }]
      }
    },
    {
      id: 'khaixuan-an-mien', group: 'khai-xuan', ll: [105.809734, 21.392453], img: festCover('an-mien'), m: 1, d: 16, dur: 1, c: '#2C4A5E', cal: 'al',
      siteIds: ['an-mien'], images: festImgs(['an-mien']),
      vi: {
        n: 'Lễ Khai xuân — Đình An Miên', d: 'Lễ khai xuân cầu an đầu năm của làng An Miên.', s: 'Xuân', dl: '16 tháng Giêng',
        intro: ['Lễ Khai xuân tại Đình An Miên diễn ra vào ngày 16 tháng Giêng âm lịch hàng năm, là ngày hội truyền thống thiêng liêng mở đầu cho chuỗi hoạt động văn hóa tâm linh trong năm mới của nhân dân bản thôn và xã Thành Công. Ngôi đình cổ kính An Miên là di tích lịch sử văn hóa cấp tỉnh phụng thờ Nhị vị Vua Bà là Linh Quang Hoàng Thái Hậu và Đương Giang Hiển Ứng Hoàng Thái Hậu, những bậc nữ lưu quý tộc vương triều Lý, phu nhân của danh tướng Phò mã Dương Tự Minh lừng lẫy vùng trung du Thái Nguyên xưa. Vào sáng ngày 16 tháng Giêng, nhân dân tề tựu đông đủ trước sân đình trong bộ lễ phục truyền thống trang trọng để cử hành nghi thức khai xuân mở cửa đình đầu năm.', 'Nghi lễ dâng hương tế bái được tiến hành theo phong tục cổ truyền tôn nghiêm nhằm tưởng niệm công đức to lớn của các vị tiền nhân đã có công hộ quốc an dân, khai khẩn xóm làng và che chở cho bình yên xứ sở. Qua chén rượu nồng dâng lên trước án tiền, các bậc bô lão đại diện cho dân làng dâng lời khấn nguyện cầu xin thần linh ban phước lành cho muôn họ được vạn sự hanh thông, công việc làm ăn thuận buồm xuôi gió, mùa màng cây trái tốt tươi và bách gia trăm họ luôn bình an, đoàn kết.', 'Sau phần lễ dâng hương tạ ơn thần tổ, dân làng cùng quây quần bên nhau thưởng lộc đầu năm, chúc phúc cho các gia đình một mùa xuân mới tràn đầy hy vọng và may mắn. Lễ Khai xuân Đình An Miên chính là nét đẹp đạo lý uống nước nhớ nguồn, vừa giữ gìn phong tục tập quán cổ truyền của cư dân nông nghiệp, vừa củng cố tinh thần cố kết cộng đồng bền chặt của cư dân địa phương qua bao thăng trầm lịch sử.'],
        acts: [{ h: 'Khai xuân mở cửa đình', d: 'Nghi thức khai xuân mở cửa đình cầu an đầu năm.' }, { h: 'Tế bái Nhị vị Vua Bà', d: 'Dâng hương tế bái tưởng niệm Nhị vị Vua Bà hộ quốc an dân.' }, { h: 'Thụ lộc đầu xuân', d: 'Dân làng thụ lộc đầu xuân và chúc phúc thắt chặt tình làng nghĩa xóm.' }]
      },
      en: {
        n: 'Spring Opening — An Mien Communal House', d: 'A new-year peace-praying rite of An Mien village.', s: 'Spring', dl: '16th, 1st lunar month',
        intro: ['The spring-opening rite at An Mien communal house falls on the 16th of the first lunar month, opening the year’s cycle of spiritual and cultural life for the hamlet and the commune. This provincial-level relic venerates the Two Queen Mothers — Linh Quang and Duong Giang Hien Ung — noblewomen of the Ly dynasty and wives of the renowned marshal Duong Tu Minh of the Thai Nguyen midlands.', 'On the morning of the 16th villagers gather in full ceremonial dress for the rite that opens the communal house for the year, offering incense in the traditional manner in memory of the ancestors who defended the country, cleared the land and sheltered the village. Elders present wine and prayers for prosperity, good crops and unity, after which the community shares the first blessings of the year.'],
        acts: [{ h: 'Opening the communal house', d: 'The spring-opening rite unlocking the communal house and praying for peace.' }, { h: 'Rites to the Two Queen Mothers', d: 'Incense offerings in memory of the Two Queen Mothers who guarded the country and its people.' }, { h: 'Sharing new-year blessings', d: 'Villagers share the blessed offerings and exchange good wishes, binding the hamlet together.' }]
      }
    },
    {
      id: 'khaixuan-xuan-duong', group: 'khai-xuan', ll: [105.802525, 21.404449], img: festCover('xuan-duong'), m: 1, d: 21, dur: 2, c: '#2C4A5E', cal: 'al',
      siteIds: ['xuan-duong'], images: festImgs(['xuan-duong']),
      vi: {
        n: 'Lễ Khai xuân — Đình Xuân Dương', d: 'Hội làng và mừng thọ người cao tuổi.', s: 'Xuân', dl: '21–22 tháng Giêng',
        intro: ['Hội làng Khai xuân truyền thống tại Đình Xuân Dương là sự kiện lễ hội đầu năm đặc sắc và giàu ý nghĩa nhân văn sâu sắc của nhân dân địa phương xã Thành Công, được tổ chức trong hai ngày từ 21 đến 22 tháng Giêng âm lịch hàng năm. Đình Xuân Dương là điểm di tích lịch sử cấp tỉnh phụng thờ Nhị vị Vua Bà cùng các vị Thành hoàng bản thổ tiền bối có công khai thiên lập địa, giữ yên xóm làng. Nét văn hóa độc đáo và nổi bật nhất làm nên giá trị thiêng liêng của lễ hội Đình Xuân Dương chính là sự kết hợp hài hòa, trọn vẹn giữa nghi thức tế lễ tạ ơn thần linh đầu xuân với lễ mừng thọ trang trọng cho các bậc cao niên trong thôn xóm.', 'Vào sáng ngày khai hội, toàn thể con cháu và bà con lối xóm cùng tề tựu đông đủ bên ngôi đình cổ kính để dâng hương kính cáo tiên tổ, cầu xin chư vị thần thánh che chở cho làng quê luôn được thái bình, mùa màng tươi tốt, gia đạo thuận hòa. Ngay tại chính điện tôn nghiêm, ban tổ chức cùng chính quyền địa phương long trọng tổ chức lễ chúc thọ, trao bằng mừng thọ và dâng lễ vật kính chúc các cụ ông, cụ bà sống lâu trăm tuổi, nêu cao tấm gương đức độ cho con cháu noi theo.', 'Hoạt động này thể hiện sâu sắc đạo lý kính lão đắc thọ và truyền thống tôn kính tổ tiên của dân tộc Việt Nam. Bên cạnh phần lễ tế trang nghiêm, phần hội diễn ra vô cùng náo nhiệt với nhiều hoạt động giao lưu văn nghệ, thể dục thể thao, trò chơi dân gian cổ truyền như bịt mắt bắt vịt, kéo co, cờ tướng tạo nên bầu không khí tươi vui, hứng khởi cho toàn dân khi bước vào một năm lao động sản xuất mới tràn đầy niềm tin và hy vọng.'],
        acts: [{ h: 'Tế lễ tạ ơn', d: 'Tế lễ dâng hương tạ ơn Nhị vị Vua Bà và Thành hoàng bản thổ.' }, { h: 'Lễ mừng thọ', d: 'Lễ mừng thọ trang trọng, chúc thọ các bậc cao niên trong thôn xóm.' }, { h: 'Văn nghệ · trò chơi dân gian', d: 'Giao lưu văn nghệ quần chúng và trò chơi dân gian: kéo co, cờ tướng, bắt vịt.' }]
      },
      en: {
        n: 'Spring Opening — Xuan Duong Communal House', d: 'Village festival and longevity celebration for elders.', s: 'Spring', dl: '21st–22nd, 1st lunar month',
        intro: ['The spring-opening village festival at Xuan Duong communal house runs over two days, the 21st and 22nd of the first lunar month. This provincial-level relic venerates the Two Queen Mothers together with the local tutelary deities who opened the land and kept the hamlet safe.', 'What makes it distinctive is the pairing of the spring thanksgiving rite with a formal longevity celebration for the village elders: after incense is offered to the ancestors, the organising board and the local authorities present longevity certificates and gifts to the oldest men and women of the hamlet, holding them up as an example for their descendants. Alongside the rites, the festival side is lively with performances, sports and folk games such as tug-of-war, Chinese chess and blindfold duck-catching.'],
        acts: [{ h: 'Thanksgiving rites', d: 'Incense and rites of thanks to the Two Queen Mothers and the local tutelary deities.' }, { h: 'Longevity celebration', d: 'A formal longevity celebration honouring the elders of the hamlet.' }, { h: 'Performances · folk games', d: 'Community performances and folk games: tug-of-war, Chinese chess, blindfold duck-catching.' }]
      }
    },
    {
      id: 'khaixuan-linh-phuc', group: 'khai-xuan', ll: [105.789399, 21.396361], img: festCover('linh-phuc'), m: 2, d: 6, dur: 1, c: '#2C4A5E', cal: 'al',
      siteIds: ['linh-phuc'], images: festImgs(['linh-phuc']),
      vi: {
        n: 'Lễ Khai xuân — Chùa Linh Phúc', d: 'Lễ khai xuân cầu an tại chùa làng.', s: 'Xuân', dl: 'Mùng 6 tháng 2',
        intro: ['Lễ hội Khai xuân đầu năm tại Chùa Linh Phúc được cử hành trọng thể vào ngày mùng 6 tháng 2 âm lịch hàng năm, là ngày hội văn hóa Phật giáo kết hợp tín ngưỡng dân gian quan trọng thu hút đông đảo phật tử, tăng ni và bà con nhân dân trong xã Thành Công cùng du khách thập phương tụ hội. Chùa Linh Phúc là ngôi cổ tự linh thiêng được công nhận là di tích lịch sử cấp tỉnh, nơi duy trì đậm nét kiến trúc và tín ngưỡng “Tiền Phật hậu Mẫu” đặc trưng của văn hóa vùng đồng bằng và trung du Bắc Bộ. Trong tiết trời xuân ấm áp của tháng hai, ngôi chùa rực rỡ cờ Phật giáo, khói trầm lan tỏa nghi ngút hòa cùng tiếng chuông chùa thanh thoát ngân vang xua tan những ưu phiền của năm cũ, đem lại sự thanh tịnh trong tâm hồn mỗi người dân đi lễ.', 'Nghi lễ tâm linh mở đầu bằng khóa lễ cầu an trang nghiêm do chư tôn đức chủ trì, toàn thể nhân dân đồng lòng nhất tâm tụng kinh niệm Phật, dâng hương hoa lễ vật cầu nguyện cho quốc thái dân an, phong điều vũ thuận, dịch bệnh tiêu trừ, nhân khang vật thịnh và mùa màng bội thu cho khắp các xóm làng. Triết lý từ bi cứu khổ của đạo Phật hòa quyện sâu sắc với tâm thức tín ngưỡng thờ Mẫu bản địa, hướng con người tới lẽ sống thiện lương, từ bi, hòa ái và hiếu thảo với cha mẹ tổ tiên.', 'Sau khóa lễ nguyện cầu an lành, bà con cùng tham gia nghi thức phóng sinh tích đức, thụ lộc chay và vãng cảnh thanh tịnh của chốn thiền môn. Lễ hội Khai xuân Chùa Linh Phúc không chỉ đáp ứng nguyện vọng tâm linh chính đáng của quần chúng nhân dân mà còn lan tỏa giá trị nhân văn cao đẹp, khơi dậy tình yêu thương, sự sẻ chia và tinh thần đoàn kết trong toàn thể cộng đồng địa phương.'],
        acts: [{ h: 'Khóa lễ cầu an', d: 'Khóa lễ tụng kinh cầu an, cầu quốc thái dân an, nhân khang vật thịnh.' }, { h: 'Lễ Phật · phối thờ Mẫu', d: 'Dâng hương lễ Phật và phối thờ Mẫu theo lối “Tiền Phật hậu Mẫu”.' }, { h: 'Phóng sinh · thụ lộc chay', d: 'Thực hiện nghi thức phóng sinh tích đức, thụ lộc chay và vãng cảnh chùa.' }]
      },
      en: {
        n: 'Spring Opening — Linh Phuc Pagoda', d: 'A new-year peace-praying rite at the village pagoda.', s: 'Spring', dl: '6th, 2nd lunar month',
        intro: ['The spring-opening festival at Linh Phuc pagoda is held on the 6th of the second lunar month, a Buddhist occasion interwoven with folk belief that draws monastics, Buddhists and villagers from across Thanh Cong and beyond. This provincial-level relic preserves the “Buddha-front, Mother-Goddess-rear” layout characteristic of the northern delta and midlands. Under the warm second-month sun the pagoda is bright with Buddhist flags and incense, the clear sound of the bell dispelling the cares of the old year.', 'The rite opens with a solemn peace-praying service led by the venerable monks, the congregation chanting and offering incense and flowers for national peace, favourable weather, freedom from epidemics and abundant harvests. Afterwards people join the merit-making release of living creatures, share a vegetarian meal and walk the quiet grounds.'],
        acts: [{ h: 'Peace-praying service', d: 'A chanting service praying for national peace, health and prosperity.' }, { h: 'Buddha and Mother-Goddess rites', d: 'Incense offered to the Buddha and the Mother Goddesses in the “Buddha-front, Mother-Goddess-rear” manner.' }, { h: 'Release of life · vegetarian blessings', d: 'Merit-making release of living creatures, a shared vegetarian meal and a walk through the grounds.' }]
      }
    },
    {
      id: 'khaixuan-dan-ha-den', group: 'khai-xuan', ll: [105.80754, 21.402534], img: festCover('dan-ha-den'), m: 2, d: 18, dur: 1, c: '#2C4A5E', cal: 'al',
      siteIds: ['dan-ha-den'], images: festImgs(['dan-ha-den']),
      vi: {
        n: 'Hội Khai xuân — Đền Đan Hà', d: 'Hội khai xuân tưởng nhớ thần linh bản địa.', s: 'Xuân', dl: '18 tháng 2',
        intro: ['Hội Khai xuân Đền Đan Hà được tổ chức định kỳ vào ngày 18 tháng 2 âm lịch hàng năm, là một trong những kỳ sinh hoạt văn hóa tín ngưỡng truyền thống tiêu biểu đầu năm mới của nhân dân xã Thành Công. Đền Đan Hà là ngôi đền cổ linh từ nằm trong quần thể các di tích lịch sử văn hóa cấp tỉnh quý báu của vùng đất ven dòng sông Công, nơi phụng thờ tôn nghiêm các vị thần linh có công bảo hộ làng xã và lưu giữ nhiều ký ức lịch sử hào hùng qua nhiều thế hệ cư dân bản địa. Vào ngày 18 tháng 2, nhân dân tề tựu đông đủ về đền cử hành nghi lễ dâng hoa, dâng lễ vật mọn lòng thành kính và tiến hành tế lễ trang nghiêm theo nghi thức cổ truyền của tiền nhân để lại.', 'Ban khánh tiết thực hiện các tuần tế chu đáo, dâng sớ tạ ơn các vị thần linh đã phù trì, gia hộ cho bản thôn có một mùa đông an lành, đồng thời cầu mong bước sang xuân mới toàn thể nhân dân gặp nhiều may mắn, sức khỏe dồi dào, mưa thuận gió hòa để cây cối đâm chồi nảy lộc, đồng ruộng tốt tươi và cuộc sống gia đình ấm no viên mãn. Không khí lễ hội đầu xuân tại Đền Đan Hà mang đậm sắc thái tôn nghiêm nhưng vô cùng ấm cúng, đậm nghĩa tình làng xóm.', 'Sau phần tế lễ chính thức, bà con nhân dân và du khách thập phương cùng nhau giao lưu văn nghệ quần chúng, chuyện trò rôm rả về việc đồng áng và gửi gắm những ước vọng tốt đẹp nhất cho sự phát triển của quê hương xứ sở. Kỳ hội khai xuân này đóng vai trò quan trọng trong việc gìn giữ ngọn lửa tâm linh truyền thống, thắt chặt sự kết nối giữa các thế hệ cư dân và bảo tồn không gian di sản văn hóa phi vật thể vô giá của địa phương.'],
        acts: [{ h: 'Dâng hoa · tế lễ cổ truyền', d: 'Dâng hoa, lễ vật và tế lễ cổ truyền tưởng nhớ các vị thần linh hộ quốc.' }, { h: 'Dâng sớ cầu mùa', d: 'Dâng sớ cầu mưa thuận gió hòa, mùa màng tốt tươi, gia đạo an lành.' }, { h: 'Giao lưu đầu xuân', d: 'Giao lưu văn nghệ quần chúng và gặp gỡ đầu xuân thắt chặt tình làng xóm.' }]
      },
      en: {
        n: 'Spring Opening — Dan Ha Temple', d: 'A spring festival honouring the local deities.', s: 'Spring', dl: '18th, 2nd lunar month',
        intro: ['The spring-opening fete of Dan Ha Temple is held each year on the 18th of the second lunar month, one of the commune’s signature early-year observances. The temple is an ancient shrine within the provincial-level heritage cluster along the Cong river, venerating the deities who protected the village and holding the historical memory of generations. On the day, villagers gather to offer flowers and modest gifts and to perform the rites handed down by their forebears.', 'The ritual board conducts the rounds of offering and presents a petition of thanks for a peaceful winter, asking in turn for luck, health and favourable weather so that the fields turn green and households prosper. After the formal rites, villagers and visitors share performances, talk over the coming farming season and exchange good wishes for the homeland.'],
        acts: [{ h: 'Flower offerings · traditional rites', d: 'Flowers, offerings and traditional rites in memory of the deities who guarded the land.' }, { h: 'Petition for good seasons', d: 'A petition presented for favourable weather, good crops and peaceful households.' }, { h: 'Spring gathering', d: 'Community performances and early-spring gatherings that strengthen neighbourly ties.' }]
      }
    },
    // ── 2. ĐẠI LỄ HỘI LÀNG ──────────────────────────────────────────
    {
      id: 'daile-nguyen-tan', group: 'dai-le', ll: [105.815025, 21.39896], img: festCover('nguyen-tan'), m: 10, d: 12, dur: 1, c: '#9E3B2E', cal: 'al',
      siteIds: ['nguyen-tan'], images: festImgs(['nguyen-tan']),
      vi: {
        n: 'Đại lễ Hội làng — Đình - Chùa Nguyễn Tân', d: 'Hội làng long trọng nhất, rước kiệu từ nền đình cổ vào đền.', s: 'Đông', dl: '12 tháng 10',
        intro: ['Đại lễ Hội làng tại cụm di tích Đình - Chùa Nguyễn Tân là ngày hội truyền thống có quy mô lớn nhất trong năm của cộng đồng cư dân địa phương xã Thành Công, diễn ra vào đúng ngày 12 tháng 10 âm lịch hàng năm. Cụm di tích lịch sử văn hóa cấp tỉnh Đình - Chùa Nguyễn Tân mang trong mình bề dày lịch sử hàng trăm năm, lưu giữ hệ thống kiến trúc cổ kính hòa quyện giữa không gian tín ngưỡng phụng thờ Thành hoàng làng và cảnh sắc thanh tịnh của ngôi chùa Phật giáo theo truyền thống “Tiền Phật hậu Mẫu”. Tâm điểm rực rỡ và trang nghiêm nhất của kỳ đại lễ là nghi thức rước kiệu truyền thống khởi hành từ nền đình cổ kính di chuyển vào khuôn viên ngôi đền và chùa Nguyễn Tân.', 'Đoàn rước quy tụ hàng trăm người trong trang phục nghi lễ rực rỡ, dẫn đầu là đội múa lân sư rồng dẹp đường, theo sau là cờ thần bát bửu, kiệu bát cống uy nghi, đoàn tế nam quan, nữ quan cùng đông đảo nhân dân và du khách thập phương nối dài qua các đường dong ngõ xóm trong tiếng trống hội rền vang. Khi linh kiệu an vị, ban khánh tiết long trọng cử hành đại lễ tế thần sau vụ gặt mùa thu, dâng lên chư vị thần linh và chư Phật những sản vật nông nghiệp tinh túy nhất do bàn tay người nông dân dày công chăm bón như xôi nếp cái hoa vàng, gà thiến đồi, hoa quả ngọt ngào để tạ ơn trời đất đã che chở cho mưa thuận gió hòa, mùa màng tốt tươi và cầu mong cho dân bản luôn mạnh khỏe, bình an.', 'Sau phần nghi lễ cung kính, nhân dân và quý khách thập phương cùng quây quần thụ lộc đoàn kết, tham gia các hoạt động giao lưu văn nghệ dân gian, thể thao quần chúng sôi nổi. Đại lễ ngày 12 tháng 10 không chỉ là dịp tri ân nguồn cội sâu sắc mà còn là ngày hội ngộ đầm ấm của những người con xa quê trở về với cội nguồn quê cha đất tổ.'],
        acts: [{ h: 'Rước kiệu truyền thống', d: 'Nghi thức rước kiệu từ nền đình cổ vào khuôn viên đền và chùa Nguyễn Tân.' }, { h: 'Đại lễ tế thần sau vụ gặt', d: 'Tế thần sau vụ gặt mùa thu, dâng sản vật nông nghiệp (xôi, gà đồi) tạ ơn trời đất.' }, { h: 'Thụ lộc · giao lưu', d: 'Thụ lộc cộng đồng, giao lưu biểu diễn văn nghệ dân gian và thể thao quần chúng.' }]
      },
      en: {
        n: 'Grand Village Festival — Nguyen Tan', d: 'The most solemn village festival, a palanquin parade from the old site into the temple.', s: 'Winter', dl: '12th, 10th lunar month',
        intro: ['The grand village festival at the Nguyen Tan communal house and pagoda complex is the largest traditional gathering of the year for the local community, held on the 12th of the tenth lunar month. This provincial-level relic carries centuries of history, its old architecture uniting the cult of the village tutelary deity with the quiet of a Buddhist pagoda in the “Buddha-front, Mother-Goddess-rear” tradition. The most striking moment is the palanquin procession from the old communal-house site into the grounds of the temple and pagoda: hundreds of people in ceremonial dress, a lion-dance troupe clearing the way, ritual banners, the eight-bearer palanquin and the male and female ritual teams winding through the lanes to the beat of the festival drums.', 'Once the palanquin is installed, the ritual board holds the great post-harvest rite, offering the finest produce of the autumn crop — sticky rice, hill-raised chicken and fruit — in thanks for favourable weather and good fields. The community then shares the blessed food and joins folk performances and sports.'],
        acts: [{ h: 'Traditional palanquin parade', d: 'The palanquin procession from the old communal-house site into the temple and pagoda grounds.' }, { h: 'Great post-harvest rite', d: 'A thanksgiving rite after the autumn harvest, offering farm produce (sticky rice, hill chicken) to heaven and earth.' }, { h: 'Shared blessings · exchanges', d: 'Sharing the blessed food, with folk performances and community sports.' }]
      }
    },
    {
      id: 'daile-dan-ha-dinh', group: 'dai-le', ll: [105.807378, 21.401935], img: festCover('dan-ha-dinh'), m: 10, d: 17, dur: 2, c: '#9E3B2E', cal: 'al',
      siteIds: ['dan-ha-dinh'], images: festImgs(['dan-ha-dinh']),
      vi: {
        n: 'Đại lễ tế làng — Đình Đan Hà', d: 'Đại lễ hai ngày, dâng cúng “Ông Ỉ” tế Tam vị Thành hoàng làng theo cổ lệ.', s: 'Đông', dl: '17–18 tháng 10',
        intro: ['Đại lễ tế làng truyền thống tại Đình Đan Hà được tổ chức định kỳ vào hai ngày 17 và 18 tháng 10 âm lịch hàng năm, là kỳ đại lễ sau vụ gặt lúa mùa có ý nghĩa đặc biệt quan trọng trong đời sống tinh thần của nhân dân xã Thành Công. Đình Đan Hà là di tích lịch sử văn hóa cấp tỉnh linh thiêng, nơi phụng thờ Tam vị Thượng đẳng thần thời đại Hùng Vương thứ XVIII gồm các đức thánh Cao Sơn, Quý Minh và Tam Tư Quá Giang, những bậc tiền nhân có công đánh giặc cứu nước và hiển linh phù trợ nhân dân giữ gìn nền độc lập. Nét văn hóa tâm linh độc đáo và tiêu biểu nhất làm nên danh tiếng của đại lễ tế làng Đình Đan Hà chính là tục dâng hiến “Ông Ỉ” tế Tam vị Thành hoàng làng.', 'Để chuẩn bị cho nghi thức này, từ nhiều tháng trước vụ tế, làng đã cẩn trọng tuyển chọn gia đình song toàn, hiếu nghĩa để nuôi dưỡng một chú lợn đực khỏe mạnh, sạch sẽ gọi là “Ông Ỉ” bằng nguồn thức ăn tinh khiết nhất. Đến ngày chính hội, “Ông Ỉ” được trang điểm lộng lẫy và rước về sân đình trong sự chứng kiến tôn kính của toàn thể dân làng để làm lễ vật hiến tế cao nhất dâng lên Tam vị Thành hoàng, bày tỏ lòng biết ơn vô hạn đối với các vị thần đã ban cho một vụ mùa bội thu, thóc lúa đầy bồ, gia súc sinh sôi và xóm thôn yên ổn.', 'Sau nghi thức dâng tế trang trọng và bài văn tế trầm hùng của các vị chủ tế, “Ông Ỉ” được chia lộc công bằng cho các giáp, các gia đình trong làng cùng nhau thụ lộc, gắn kết thêm tình làng nghĩa xóm bền chặt. Bên cạnh đó, lễ hội còn tổ chức các hoạt động tế lễ nam quan, nữ quan cùng các trò chơi dân gian rộn rã, phản ánh sinh động nét đẹp văn hóa nông nghiệp lúa nước ngàn đời của vùng đất trung du trù phú.'],
        acts: [{ h: 'Tục dâng hiến tế “Ông Ỉ”', d: 'Dâng hiến tế “Ông Ỉ” lên Tam vị Thượng đẳng thần tạ ơn mùa màng bội thu.' }, { h: 'Tế nam quan · nữ quan', d: 'Nghi thức tế lễ nam quan, nữ quan và đọc văn tế trầm hùng của các vị bô lão.' }, { h: 'Thụ lộc chia giáp', d: 'Thụ lộc “Ông Ỉ” chia đều cho các giáp trong làng và tổ chức trò chơi dân gian.' }]
      },
      en: {
        n: 'Grand Village Rite — Dan Ha Communal House', d: 'Two-day grand rite offering the sacred pig (“Ong I”) to the three tutelary deities.', s: 'Winter', dl: '17th–18th, 10th lunar month',
        intro: ['The grand village rite at Dan Ha communal house is held on the 17th and 18th of the tenth lunar month, the great post-harvest ceremony of the commune’s spiritual calendar. The provincial-level relic venerates the Three Superior Deities of the eighteenth Hung king’s era — Cao Son, Quy Minh and Tam Tu Qua Giang — who fought for the country and were held to aid the people in defending its independence. Its most famous custom is the offering of “Ong I” to the three tutelary deities.', 'Months in advance the village chooses an upright, whole family to raise a healthy boar, fed only the purest food. On the main day “Ong I” is finely adorned and carried to the communal-house yard before the whole village as the highest offering, in thanks for a bountiful harvest, full granaries, thriving livestock and a peaceful hamlet.', 'After the solemn offering and the reading of the invocation, the meat is shared out fairly among the hamlet’s quarters and families. Male and female ritual teams and lively folk games complete the two days.'],
        acts: [{ h: 'The “Ong I” offering', d: 'Offering “Ong I” to the Three Superior Deities in thanks for a bountiful harvest.' }, { h: 'Male and female ritual teams', d: 'Rites by male and female ritual teams, with the elders reading the solemn invocation.' }, { h: 'Sharing among the quarters', d: 'The “Ong I” offering shared equally among the village quarters, followed by folk games.' }]
      }
    },
    {
      id: 'daile-dan-ha-den', group: 'dai-le', ll: [105.80754, 21.402534], img: festCover('dan-ha-den'), m: 10, d: 18, dur: 1, c: '#9E3B2E', cal: 'al',
      siteIds: ['dan-ha-den'], images: festImgs(['dan-ha-den']),
      vi: {
        n: 'Hội lệ làng — Đền Đan Hà', d: 'Rước kiệu, tế lễ và vui chơi văn nghệ theo lệ làng.', s: 'Đông', dl: '18 tháng 10',
        intro: ['Hội lệ làng tại Đền Đan Hà được cử hành trọng thể vào ngày 18 tháng 10 âm lịch hàng năm, đồng thời gắn liền với chuỗi hoạt động chuẩn bị tưởng niệm ngày hóa Thành hoàng từ ngày 10 đến 12 tháng 11 âm lịch, tạo nên một giai đoạn sinh hoạt tín ngưỡng thiêng liêng và sâu lắng bậc nhất của nhân dân xã Thành Công. Đền Đan Hà là di tích lịch sử văn hóa cấp tỉnh cổ kính tọa lạc tại vị trí phong thủy đắc địa bên dòng sông Công, gắn liền với các truyền tích hào hùng về những danh tướng và thần linh hộ quốc an dân. Kỳ hội lệ làng vào trung tuần tháng 10 âm lịch diễn ra ngay sau khi bà con nông dân vừa hoàn tất mùa gặt hái, là dịp để toàn dân tề tựu đông đủ dâng hương đăng trà quả kính tạ công đức thần linh đã phù hộ độ trì cho mưa thuận gió hòa, xóm thôn bình yên suốt một năm lao động vất vả.', 'Trong ngày lễ hội, phần lễ được cử hành theo đúng nghi thức điển lễ cổ truyền trang nghiêm với các tuần dâng hương, dâng rượu và đọc văn tế ca ngợi công đức cao dày của tiền nhân, nhắc nhở thế hệ hôm nay ghi nhớ công lao mở mang bờ cõi của các bậc tiền bối. Song song cùng phần nghi lễ uy nghiêm, phần hội diễn ra vô cùng sôi động với các màn rước kiệu tôn nghiêm quanh làng, giao lưu biểu diễn văn nghệ quần chúng, hát dân ca và các trò chơi dân gian truyền thống thu hút đông đảo bà con tham gia cổ vũ.', 'Đây cũng là dịp quan trọng để ban khánh tiết và các bô lão họp bàn, phân công công việc chu đáo nhằm chuẩn bị cho đại lễ tưởng niệm ngày hóa Thành hoàng vào trung tuần tháng 11 âm lịch tiếp theo. Hội lệ làng Đền Đan Hà không chỉ bồi đắp đời sống tâm linh phong phú mà còn phát huy tinh thần tương thân tương ái, củng cố tình đoàn kết gắn bó keo sơn của cộng đồng làng xã.'],
        acts: [{ h: 'Rước kiệu quanh làng', d: 'Nghi thức rước kiệu tôn nghiêm quanh làng và dâng lễ tạ công đức thần linh sau mùa vụ.' }, { h: 'Tế lễ theo điển lễ cổ', d: 'Tế lễ lệ làng theo điển lễ cổ truyền ca ngợi tiền nhân hộ quốc an dân.' }, { h: 'Chuẩn bị ngày hóa · văn nghệ', d: 'Họp chuẩn bị tưởng niệm ngày hóa Thành hoàng (10–12 tháng 11) và giao lưu văn nghệ, hát dân ca.' }]
      },
      en: {
        n: 'Customary Village Fete — Dan Ha Temple', d: 'Palanquin parade, rites and festivities by village custom.', s: 'Winter', dl: '18th, 10th lunar month',
        intro: ['The customary village fete of Dan Ha Temple is held on the 18th of the tenth lunar month and leads into the preparations for the tutelary deities’ transcendence days on the 10th–12th of the eleventh month, forming the commune’s most sustained period of devotion. The provincial-level relic stands on an auspicious site by the Cong river, bound to the legends of the generals and deities who defended the country.', 'Falling just after the harvest, the fete brings the whole village together to offer incense, tea and fruit in thanks for a year of favourable weather and peace. The rites follow the old canon — rounds of incense and wine and the reading of an invocation praising the merit of the ancestors.', 'Alongside them come palanquin processions around the village, community performances, folk singing and traditional games. It is also when the ritual board and elders meet to assign the work for the transcendence-day ceremony in the following month.'],
        acts: [{ h: 'Palanquin parade around the village', d: 'A solemn palanquin procession and post-harvest offerings of thanks to the deities.' }, { h: 'Rites by the old canon', d: 'Customary village rites following the old canon, praising the ancestors who guarded the land.' }, { h: 'Transcendence-day preparations · performances', d: 'Planning the transcendence-day ceremony (10th–12th of the 11th month), with performances and folk singing.' }]
      }
    },
    {
      id: 'daile-20-thang-10', group: 'dai-le', ll: [105.802525, 21.404449], img: festCover('xuan-duong'), m: 10, d: 20, dur: 1, c: '#9E3B2E', cal: 'al',
      siteIds: ['linh-phuc', 'xuan-duong', 'an-mien'], images: festImgs(['linh-phuc', 'xuan-duong', 'an-mien']),
      vi: {
        n: 'Ngày Đại lệ 20/10 — Linh Phúc · Xuân Dương · An Miên', d: 'Ngày vui nhất của làng: góp lễ vật tế thần và cùng thụ lộc.', s: 'Đông', dl: '20 tháng 10',
        intro: ['Ngày Đại lệ 20 tháng 10 âm lịch là sự kiện hội làng có quy mô liên kết cộng đồng lớn nhất và độc đáo bậc nhất tại xã Thành Công, khi có sự phối hợp đồng bộ và trang trọng của cả ba di tích lịch sử văn hóa cấp tỉnh: Chùa Linh Phúc, Đình Xuân Dương và Đình An Miên. Cả ba di tích này tạo thành một tam giác văn hóa tâm linh bền chặt, cùng chia sẻ ký ức lịch sử hào hùng về Tam vị Thượng đẳng thần, Nhị vị Vua Bà cùng các vị tiền hiền khai sáng đất đai. Diễn ra vào thời điểm tiết trời thu đông mát mẻ sau vụ gặt lúa mùa thắng lợi, ngày 20 tháng 10 âm lịch trở thành ngày hội vui chung rộn rã khắp các xóm làng.', 'Nhân dân các thôn xóm nô nức sắm sửa lễ vật tươm tất gồm mâm xôi gà đồi, lợn quay, bánh chưng bánh giầy và các sản vật đồng quê thơm thảo để cùng nhau dâng lên tế tạ ơn thần linh, tiên tổ đã chở che cho mùa màng tươi tốt, xóm làng thịnh vượng, nhân khang vật thịnh. Tại mỗi di tích, các tuần tế cổ truyền được các cụ bô lão cử hành uy nghiêm, kính cẩn, sau đó ban khánh tiết ba làng tiến hành các nghi thức giao hảo, gặp gỡ chúc phúc lẫn nhau, thắt chặt mối quan hệ liên kết láng giềng thâm tình qua nhiều thế hệ. Điểm đặc trưng giàu tính nhân văn nhất của ngày Đại lệ chính là tục thụ lộc chung; toàn thể nhân dân và quý khách gần xa cùng nhau quây quần bên mâm cỗ thụ lộc đầm ấm, sẻ chia niềm vui vụ mùa no ấm và bàn tính chuyện tương lai xây dựng làng quê giàu đẹp.', 'Không khí ngày đại lệ tưng bừng với các hoạt động giao lưu bóng chuyền, văn nghệ dân gian và thi đấu cờ tướng kéo dài suốt ngày đêm. Sự gắn kết đa điểm giữa ba di tích khẳng định tinh thần đoàn kết keo sơn, biểu dương sức mạnh cộng đồng và bảo tồn vẹn nguyên bản sắc văn hóa ngàn đời của quê hương.'],
        acts: [{ h: 'Đồng loạt tế Thành hoàng', d: 'Đồng loạt tế Thành hoàng và tạ ơn thần linh sau mùa vụ tại 3 di tích.' }, { h: 'Dâng lễ vật · thụ lộc chung', d: 'Dâng cúng lễ vật nông nghiệp (lợn, gà, xôi) và tổ chức thụ lộc chung thắt chặt đoàn kết.' }, { h: 'Giao lưu ba làng', d: 'Giao lưu gặp gỡ giữa các thôn làng, thi đấu bóng chuyền, cờ tướng và văn nghệ.' }]
      },
      en: {
        n: 'Grand Rite of the 20th/10th — Linh Phuc · Xuan Duong · An Mien', d: 'The village’s happiest day: offerings to the deities and shared blessings.', s: 'Winter', dl: '20th, 10th lunar month',
        intro: ['The grand rite of the 20th of the tenth lunar month is the largest and most distinctive multi-site village occasion in Thanh Cong, held jointly and formally by all three provincial-level relics: Linh Phuc pagoda, Xuan Duong communal house and An Mien communal house. Together they form a close spiritual triangle, sharing the memory of the Three Superior Deities, the Two Queen Mothers and the forebears who opened the land.', 'Falling in the cool autumn-to-winter weather after a successful harvest, the day becomes a shared celebration across the hamlets. Villagers prepare full offerings — trays of sticky rice and hill chicken, roast pork, chung and giay cakes and the produce of the fields — in thanks for good crops and a prospering village.', 'At each relic the elders conduct the traditional rounds of offering, after which the three ritual boards exchange greetings and blessings, renewing ties held over generations. The most humane feature is the shared blessing meal, followed by volleyball, folk performances and Chinese chess through the day and night.'],
        acts: [{ h: 'Simultaneous tutelary rites', d: 'Tutelary-deity rites and post-harvest thanksgiving held at all three relics at once.' }, { h: 'Offerings · shared blessings', d: 'Offerings of farm produce (pork, chicken, sticky rice) and a shared blessing meal that binds the community.' }, { h: 'Exchanges between the three villages', d: 'Meetings between the hamlets, with volleyball, Chinese chess and performances.' }]
      }
    },
    {
      id: 'daile-ha-dat', group: 'dai-le', ll: [105.7888348, 21.3897227], img: festCover('ha-dat'), m: 11, d: 15, dur: 1, c: '#9E3B2E', cal: 'al',
      siteIds: ['ha-dat'], images: festImgs(['ha-dat']),
      vi: {
        n: 'Lễ Tạ thần (Đại tiệc kỳ phúc) — Đình Hạ Đạt', d: 'Tạ ơn thần linh đã phù hộ một năm an khang.', s: 'Đông', dl: 'Rằm tháng 11',
        intro: ['Lễ Tạ thần hay còn được nhân dân bản địa trân trọng gọi là “Đại tiệc kỳ phúc” là một trong những kỳ lễ hội truyền thống cuối năm quan trọng nhất tại Đình Hạ Đạt, xã Thành Công, được tổ chức đúng vào ngày Rằm tháng 11 (15/11 âm lịch) hàng năm. Đình Hạ Đạt là di tích lịch sử văn hóa cấp tỉnh thiêng liêng, nơi thờ phụng các vị Thành hoàng bảo trợ cho mảnh đất giàu truyền thống yêu nước bên sườn núi trung du phía Nam tỉnh Thái Nguyên. Lễ Tạ thần diễn ra khi chu kỳ canh tác nông nghiệp cả năm đã hoàn tất thắng lợi, thóc lúa đã phơi khô cất kín trong bồ và người dân chuẩn bị đón một năm mới an khang.', 'Đây là dịp để toàn thể cộng đồng dân cư bày tỏ lòng tri ân sâu sắc lên chư vị thần linh đã che chở, phù hộ cho mưa thuận gió hòa, bảo vệ làng mạc khỏi thiên tai, dịch bệnh, giúp mùa màng bội thu và nhân dân khỏe mạnh suốt mười hai tháng qua. Buổi sớm ngày Rằm tháng 11 mở đầu bằng nghi thức tế tạ long trọng do ban tế tự cao niên chủ trì, dâng sớ tạ ơn thần linh và cầu xin sự bình an, phúc lộc cho năm sau. Ngay sau phần lễ trang nghiêm, toàn thôn Hạ Đạt cùng bước vào phần “Đại tiệc kỳ phúc” — một bữa tiệc liên hoan cộng đồng hoành tráng và ấm áp nhất trong năm.', 'Các gia đình trong xóm cùng đóng góp sản vật cây nhà lá vườn, chung tay làm cỗ đại tiệc ngay tại sân đình, từ các cụ cao niên đến thanh thiếu niên đều quây quần thụ lộc vui tươi, chúc tụng nhau sức khỏe và bàn chuyện làng xóm. Không khí đầm ấm của bữa tiệc kỳ phúc kết hợp với các tiết mục văn nghệ tự biên tự diễn rộn vang khắp không gian đình làng. Kỳ lễ không chỉ bảo lưu nghi thức tạ ơn truyền thống của cư dân nông nghiệp mà còn thắt chặt khối đại đoàn kết toàn dân, giáo dục con cháu lòng hiếu nghĩa và tinh thần tương trợ lẫn nhau.'],
        acts: [{ h: 'Tế tạ thần linh cuối năm', d: 'Nghi lễ tế tạ thần linh cuối năm tạ ơn trời đất đã phù hộ cho một năm an khang.' }, { h: '“Đại tiệc kỳ phúc”', d: 'Tổ chức “Đại tiệc kỳ phúc” liên hoan cộng đồng tại sân đình cho toàn thể nhân dân.' }, { h: 'Văn nghệ · chúc thọ', d: 'Giao lưu văn nghệ quần chúng và chúc thọ, bàn việc xóm làng cho năm mới.' }]
      },
      en: {
        n: 'Thanksgiving Rite (Grand Blessing Feast) — Ha Dat', d: 'Thanking the deities for a year of wellbeing.', s: 'Winter', dl: '15th, 11th lunar month',
        intro: ['The thanksgiving rite — known locally as the “Grand Blessing Feast” — is one of the most important year-end observances at Ha Dat communal house, held on the full moon of the eleventh lunar month. This provincial-level relic venerates the tutelary deities of a patriotic stretch of country on the midland slopes of southern Thai Nguyen.', 'The rite comes once the farming year is complete, the grain dried and stored and the village turning towards the new year. It is the community’s way of thanking the deities for favourable weather, for sparing the village from disaster and epidemic, and for a full harvest and good health through the twelve months past.', 'The morning opens with a formal rite led by the senior ritual board, presenting a petition of thanks and asking for peace and fortune in the year ahead. The whole hamlet then moves to the Grand Blessing Feast — the warmest communal meal of the year, cooked in the communal-house yard from produce every household contributes, with performances put on by the villagers themselves.'],
        acts: [{ h: 'Year-end thanksgiving rite', d: 'The year-end rite thanking heaven and earth for a year of wellbeing.' }, { h: 'The “Grand Blessing Feast”', d: 'The communal blessing feast held in the communal-house yard for the whole village.' }, { h: 'Performances · longevity wishes', d: 'Community performances, longevity wishes and planning the village’s year ahead.' }]
      }
    },
    {
      id: 'daile-dinh-bia', group: 'dai-le', ll: [105.785451, 21.408318], img: festCover('dinh-bia'), m: 12, d: 12, dur: 1, c: '#9E3B2E', cal: 'al',
      siteIds: ['dinh-bia'], images: festImgs(['dinh-bia']),
      vi: {
        n: 'Ngày Đại lễ Hội làng — Đình Bìa', d: 'Hội làng của đồng bào Sán Dìu, giao lưu hát Soọng cô.', s: 'Đông', dl: '12 tháng Chạp',
        intro: ['Ngày Đại lễ Hội làng tại Đình Bìa được tổ chức cố định vào ngày 12 tháng Chạp (tháng 12 âm lịch) hàng năm, là ngày hội truyền thống đặc sắc mang đậm dấu ấn giao thoa văn hóa giữa cộng đồng người Kinh và đồng bào dân tộc thiểu số Sán Dìu tại xã Thành Công. Ngôi Đình Bìa cổ kính được xếp hạng di tích lịch sử cấp tỉnh, phụng thờ Nhị vị Vua Bà (Linh Quang Hoàng Thái Hậu và Đương Giang Hiển Ứng Hoàng Thái Hậu) cùng các vị Thành hoàng khai sáng đất đai, bảo vệ bản làng qua nhiều thăng trầm của lịch sử giữ nước. Vào ngày 12 tháng Chạp, trong không khí se lạnh của những ngày giáp Tết Nguyên đán, người dân khắp các thôn bản vùng cao xóm Bìa, Na Lang, Thượng Vụ trong trang phục chàm truyền thống tinh xảo cùng tề tựu đông đủ về sân đình tham dự ngày hội lớn nhất của bản làng.', 'Điểm nhấn độc đáo và hấp dẫn nhất của ngày hội Đình Bìa chính là không gian sinh hoạt văn hóa dân gian phong phú với làn điệu dân ca Soọng cô mượt mà, sâu lắng của đồng bào người Sán Dìu. Những câu hát đối đáp Soọng cô vang vọng giữa núi rừng ca ngợi tình yêu lứa đôi trong sáng, ngợi ca công lao cha mẹ tổ tiên, tình yêu lao động và niềm khát khao cuộc sống ấm no hạnh phúc. Song song với lời ca tiếng hát, ngày hội làng Đình Bìa còn kết hợp tổ chức lễ mừng thọ trang trọng cho các bậc cao niên trong thôn bản, thể hiện trọn vẹn đạo lý kính già yêu trẻ và lòng tri ân sâu nặng với thế hệ đi trước.', 'Nhân dân cùng nhau dâng lên án tiền mâm xôi ngũ sắc rực rỡ, thịt gà đồi thơm ngọt và bánh chưng bánh giầy truyền thống tạ ơn thần linh đã che chở cho bản làng một năm an lành. Hội làng Đình Bìa là viên ngọc quý trong kho tàng di sản phi vật thể của địa phương, khẳng định sức mạnh đoàn kết bền chặt giữa các dân tộc anh em.'],
        acts: [{ h: 'Hát Soọng cô đối đáp', d: 'Giao lưu hát Soọng cô đối đáp đặc sắc mang đậm bản sắc người dân tộc Sán Dìu.' }, { h: 'Lễ mừng thọ', d: 'Tổ chức lễ mừng thọ trang trọng cho các bậc cao niên trong thôn bản.' }, { h: 'Dâng xôi ngũ sắc tế thần', d: 'Dâng mâm cúng xôi ngũ sắc, gà đồi tế tạ Thành hoàng và Nhị vị Vua Bà.' }]
      },
      en: {
        n: 'Grand Village Festival — Bia Communal House', d: 'The San Diu community’s festival with Soong co singing.', s: 'Winter', dl: '12th, 12th lunar month',
        intro: ['The grand village festival at Bia communal house falls each year on the 12th of the twelfth lunar month, a distinctive occasion marked by the meeting of Kinh and San Diu culture in Thanh Cong. The old communal house, a provincial-level relic, venerates the Two Queen Mothers — Linh Quang and Duong Giang Hien Ung — along with the tutelary deities who opened the land and shielded the hamlet through the country’s turns of history. On the day, in the chill just before the lunar new year, people from the upland hamlets of Bia, Na Lang and Thuong Vu gather in finely made indigo dress for the largest festival of the year.', 'Its most captivating feature is the folk-culture space filled with the flowing Soong co songs of the San Diu people, sung in answering couplets about love, gratitude to parents and ancestors, and the longing for a settled life. Alongside the singing, the village holds a formal longevity celebration for its elders, and offers trays of five-coloured sticky rice, hill chicken and traditional cakes in thanks for a peaceful year.'],
        acts: [{ h: 'Soong co answering songs', d: 'Exchanges of Soong co answering songs, the signature art of the San Diu people.' }, { h: 'Longevity celebration', d: 'A formal longevity celebration for the elders of the hamlet.' }, { h: 'Five-coloured sticky-rice offerings', d: 'Trays of five-coloured sticky rice and hill chicken offered to the tutelary deities and the Two Queen Mothers.' }]
      }
    },
    // ── 3. LỄ TIẾT NÔNG NGHIỆP & TÔN GIÁO ───────────────────────────
    {
      id: 'vao-he', group: 'nong-nghiep', ll: [105.815025, 21.39896], img: festCover('nguyen-tan'), m: 4, d: 1, dur: 1, c: '#6E7B52', cal: 'al',
      siteIds: ['nguyen-tan', 'linh-phuc', 'ha-dat'], images: festImgs(['nguyen-tan', 'linh-phuc', 'ha-dat']),
      vi: {
        n: 'Lễ Vào hè', d: 'Cầu mưa thuận gió hòa, xua tan bệnh tật đầu mùa hè.', s: 'Hạ', dl: '30/3 · 1/4 · 15/4',
        intro: ['Lễ Vào hè là một nghi lễ nông nghiệp cổ truyền đặc biệt quan trọng trong chu kỳ canh tác lúa nước của nhân dân xã Thành Công, được tổ chức tuần tự theo lộ trình truyền thống tại ba điểm di tích lịch sử cấp tỉnh gồm Đình Nguyễn Tân vào ngày 30 tháng 3, Chùa Linh Phúc vào ngày mùng 1 tháng 4 và Đình Hạ Đạt vào ngày 15 tháng 4 âm lịch. Lễ tiết này đánh dấu thời khắc giao mùa then chốt khi tiết trời chuyển từ mùa xuân mát mẻ sang mùa hè oi bức, giai đoạn cây lúa non đang thì con gái chuẩn bị làm đòng và rất cần nguồn nước dồi dào cùng sự bảo bọc trước các đợt nắng hạn gay gắt hoặc dịch sâu bệnh hại.', 'Xuất phát từ tín ngưỡng nông nghiệp lâu đời của cư dân vùng trung du Bắc Bộ, nghi lễ Vào hè là dịp để toàn thể cộng đồng tề tựu tại các cơ sở tín ngưỡng, dâng hương hoa, xôi gà, trà quả tinh khiết tế cáo chư vị Thành hoàng bản thổ, chư Phật và thần linh hộ trì nông nghiệp. Dưới sự chủ trì của các vị bô lão và tăng ni, nghi thức tế lễ diễn ra tôn nghiêm với tâm nguyện cầu xin trời đất phong điều vũ thuận, mưa hòa gió thuận, nguồn nước sông Công cùng hệ thống hồ đập như Hồ Suối Lạnh luôn tràn trề tưới mát đồng ruộng, xua tan ôn dịch sâu bọ phá hoại hoa màu.', 'Tại mỗi điểm di tích, sau tuần tế lễ là cuộc họp bàn của các xóm để thống nhất lịch lấy nước, chăm sóc đồng ruộng tập thể, phát huy tinh thần tương trợ “tắt lửa tối đèn có nhau” trong sản xuất nông nghiệp. Nghi thức Vào hè không chỉ bảo tồn tri thức bản địa và phong tục tập quán canh tác ngàn đời của nhà nông, mà còn thắt chặt mối quan hệ liên kết láng giềng giữa các xóm thôn lân cận, lan tỏa niềm tin tâm linh vững chắc và sự gắn kết cộng đồng keo sơn trên mảnh đất quê hương.'],
        acts: [{ h: 'Tế thần cầu nước', d: 'Dâng hương hoa trà quả tế thần cầu thời tiết mưa thuận gió hòa, nguồn nước dồi dào.' }, { h: 'Tụng kinh · tế Thành hoàng', d: 'Tụng kinh niệm Phật và tế bái Thành hoàng bảo trợ đồng ruộng, xua tan ôn dịch hại lúa.' }, { h: 'Họp bàn thủy lợi', d: 'Các xóm họp bàn thống nhất lịch lấy nước thủy lợi và tương trợ sản xuất vụ hè thu.' }]
      },
      en: {
        n: 'Summer-Entering Rite', d: 'Praying for good rains and driving away sickness at the start of summer.', s: 'Summer', dl: '30/3 · 1/4 · 15/4',
        intro: ['The summer-entering rite is a key agricultural observance in the wet-rice calendar of Thanh Cong, held in turn at three provincial-level relics: Nguyen Tan communal house on the 30th of the third lunar month, Linh Phuc pagoda on the 1st of the fourth and Ha Dat communal house on the 15th of the fourth. It marks the turn from the cool spring into the summer heat, when the young rice is about to head and most needs water and protection from drought and pests. Rooted in the long farming faith of the northern midlands, the rite gathers the community at each site to offer incense, flowers, sticky rice, chicken and fruit to the local tutelary deities, the Buddha and the guardians of the fields.', 'Led by the elders and monastics, the rites ask for steady rains and for the Cong river and reservoirs such as Suoi Lanh to keep the fields watered. At each site the rite is followed by a meeting of the hamlets to agree the irrigation schedule and share the work of the summer-autumn crop.'],
        acts: [{ h: 'Rites for water', d: 'Incense, flowers and fruit offered for favourable weather and an ample water supply.' }, { h: 'Chanting · tutelary rites', d: 'Buddhist chanting and rites to the tutelary deities who guard the fields against pests and blight.' }, { h: 'Irrigation planning', d: 'The hamlets meet to agree the irrigation schedule and support each other through the summer-autumn crop.' }]
      }
    },
    {
      id: 'ra-he', group: 'nong-nghiep', ll: [105.7888348, 21.3897227], img: festCover('ha-dat'), m: 7, d: 15, dur: 1, c: '#6E7B52', cal: 'al',
      siteIds: ['linh-phuc', 'ha-dat'], images: festImgs(['linh-phuc', 'ha-dat']),
      vi: {
        n: 'Lễ Ra hè & Tục ban lá cờ thiêng', d: 'Kết mùa hè, ban lá cờ ngũ sắc trừ sâu bệnh cho đồng ruộng.', s: 'Thu', dl: '25/6 · 15/7',
        intro: ['Lễ Ra hè kết hợp tục ban lá cờ thiêng là một trong những nét sinh hoạt văn hóa tín ngưỡng nông nghiệp độc đáo và hiếm có bậc nhất của cư dân xã Thành Công, được tổ chức lần lượt tại di tích Chùa Linh Phúc vào ngày 25 tháng 6 và đạt đỉnh cao trang trọng tại di tích Đình Hạ Đạt vào ngày Rằm tháng 7 (15/7 âm lịch) hàng năm. Lễ hội đánh dấu thời điểm kết thúc giai đoạn hè nắng nôi khắc nghiệt, chuẩn bị đón gió thu mát mẻ và bước vào vụ thu hoạch mùa màng sau bao tháng ngày dãi nắng dầm sương. Tại Chùa Linh Phúc, khóa lễ Ra hè kết hợp tụng kinh cầu an, hồi hướng công đức và cầu nguyện cho mùa màng sắp gặt hái được bội thu, nhân khang vật thịnh.', 'Đặc biệt, tại Đình Hạ Đạt vào ngày Rằm tháng 7, lễ Ra hè diễn ra vô cùng sôi nổi với nghi thức cổ truyền giàu ý nghĩa tâm linh: tục ban phát lá cờ thiêng ngũ sắc. Sau các tuần tế tạ thần linh chu đáo, ban khánh tiết đình làng cử hành nghi lễ thụ mệnh thần hoàng, làm phép và ban phát cho mỗi hộ gia đình trong bản thôn một lá cờ lệnh bằng giấy ngũ sắc nhỏ mang biểu tượng uy quyền trấn giữ của thần linh. Người nông dân đón nhận lá cờ thiêng với lòng thành kính sâu sắc, sau đó mang cắm trang trọng tại thửa ruộng đầu bờ của gia đình mình.', 'Theo quan niệm dân gian truyền đời, lá cờ thiêng mang năng lượng chở che nhiệm màu của các vị thần linh, giúp xua đuổi tà khí, tiêu trừ dịch bệnh sâu bọ phá hoại lúa non, bảo vệ hạt thóc chắc mẩy và đón chờ mùa gặt ấm no trọn vẹn. Hoạt động văn hóa dân gian này phản ánh sinh động tâm thức cầu mùa của cư dân nông nghiệp lúa nước, lưu giữ di sản phi vật thể giàu bản sắc và thắt chặt tình cảm cộng đồng làng xã qua nhiều thế hệ.'],
        acts: [{ h: 'Khóa lễ Ra hè', d: 'Khóa lễ Ra hè tụng kinh cầu an, hồi hướng công đức chuẩn bị bước vào vụ gặt.' }, { h: 'Ban lá cờ thiêng', d: 'Tục ban phát lá cờ lệnh giấy ngũ sắc thiêng liêng cho từng hộ gia đình tại Đình Hạ Đạt.' }, { h: 'Cắm cờ đầu bờ ruộng', d: 'Cắm lá cờ thiêng đầu bờ ruộng cầu thần linh trừ sạch sâu bệnh, ban mùa màng bội thu.' }]
      },
      en: {
        n: 'Summer-Ending Rite & Sacred Flag Custom', d: 'Closing summer; handing out five-coloured flags to clear pests from the fields.', s: 'Autumn', dl: '25/6 · 15/7',
        intro: ['The summer-ending rite together with the sacred-flag custom is among the rarest agricultural observances kept in Thanh Cong, held first at Linh Phuc pagoda on the 25th of the sixth lunar month and then, at its most formal, at Ha Dat communal house on the full moon of the seventh. It marks the close of the harsh summer and the turn towards the autumn harvest. At Linh Phuc the service combines chanting for peace and the dedication of merit for a full crop.', 'At Ha Dat the rite culminates in the handing out of sacred five-coloured flags: after the rounds of thanksgiving, the ritual board consecrates and distributes to every household a small five-coloured paper flag bearing the authority of the deities. Farmers receive it with reverence and plant it at the head of their own field, where — by long-held belief — it wards off blight and pests and protects the ripening grain until harvest.'],
        acts: [{ h: 'Summer-ending service', d: 'The summer-ending service of chanting and merit-dedication before the harvest begins.' }, { h: 'Handing out the sacred flags', d: 'Consecrated five-coloured paper flags handed to every household at Ha Dat communal house.' }, { h: 'Planting the flag in the field', d: 'The sacred flag planted at the head of the field to clear pests and secure a full harvest.' }]
      }
    },
    {
      id: 'phat-giao-van-kim', group: 'nong-nghiep', ll: [105.839506, 21.38053], img: festCover('van-kim'), m: 4, d: 15, dur: 1, c: '#B5532A', cal: 'al',
      siteIds: ['van-kim'], images: festImgs(['van-kim']),
      vi: {
        n: 'Lễ tiết Phật giáo — Chùa Vạn Kim', d: 'Thượng nguyên, Phật đản và Vu lan tổ chức trang nghiêm.', s: 'Hạ', dl: 'Rằm tháng Giêng · Tư · Bảy',
        intro: ['Hệ thống Lễ tiết Phật giáo tại Chùa Vạn Kim là chuỗi sinh hoạt tôn giáo và văn hóa tâm linh trọng đại bậc nhất trong năm của đông đảo tăng ni, phật tử cùng nhân dân địa phương xã Thành Công, bao gồm ba đại lễ thiêng liêng: Tết Thượng nguyên (Rằm tháng Giêng), Đại lễ Phật đản (Rằm tháng 4) và Đại lễ Vu lan báo hiếu (Rằm tháng 7 âm lịch). Chùa Vạn Kim là ngôi cổ tự linh thiêng được xếp hạng di tích lịch sử cấp tỉnh, tọa lạc uy nghiêm trên vùng đất cổ, nơi không chỉ gìn giữ đạo pháp Phật giáo từ bi mà còn lưu giữ thần tích quý giá về hai vị tướng Trương Hống và Trương Hát — những danh thần anh dũng có công phò vua Lý Nam Đế và Triệu Việt Vương, sau này hiển linh giúp vua Lê Hoàn và danh tướng Lý Thường Kiệt phá tan giặc ngoại xâm phương Bắc.', 'Khởi đầu năm mới, lễ Thượng nguyên (Rằm tháng Giêng) mở ra không gian cầu nguyện an lành, dâng hoa đăng cầu quốc thái dân an, mùa màng tươi tốt và gia đạo bình yên. Đến Rằm tháng 4, Đại lễ Phật đản diễn ra tưng bừng kỷ niệm ngày Đức Phật Thích Ca đản sinh với nghi thức tắm Phật trang nghiêm, nhắc nhở con người gột rửa thân tâm, hướng thiện và lan tỏa tình yêu thương muôn loài.', 'Đến Rằm tháng 7, Đại lễ Vu lan báo hiếu thu hút hàng ngàn người dân về chùa cử hành nghi thức bông hồng cài áo, tụng kinh Vu Lan tưởng nhớ và đền đáp công ơn sinh thành dưỡng dục trời biển của cha mẹ tổ tiên, kết hợp nghi lễ phóng sinh và cầu siêu độ cho các anh hùng liệt sĩ. Ba kỳ đại lễ này đáp ứng trọn vẹn nhu cầu tín ngưỡng, giáo dục đạo đức hiếu nghĩa và bồi đắp lối sống hướng thiện, đoàn kết trong cộng đồng.'],
        acts: [{ h: 'Rằm tháng Giêng — Thượng nguyên', d: 'Lễ Thượng nguyên: dâng hoa đăng cầu an, cầu mùa màng tươi tốt.' }, { h: 'Rằm tháng 4 — Phật đản', d: 'Đại lễ Phật đản: cử hành nghi thức tắm Phật trang nghiêm, hướng thiện.' }, { h: 'Rằm tháng 7 — Vu lan', d: 'Đại lễ Vu lan: cài hoa hồng, tụng kinh báo hiếu tổ tiên và phóng sinh tích đức.' }]
      },
      en: {
        n: 'Buddhist Rites — Van Kim Pagoda', d: 'Thuong Nguyen, Vesak and Vu Lan held with solemnity.', s: 'Summer', dl: 'Full moon of 1st · 4th · 7th month',
        intro: ['The Buddhist observances at Van Kim pagoda form the year’s most significant religious cycle for the monastics, Buddhists and villagers of Thanh Cong: Thuong Nguyen (full moon of the first lunar month), Vesak (full moon of the fourth) and Vu Lan (full moon of the seventh). This provincial-level relic keeps not only the Buddhist teaching but also the legend of the generals Truong Hong and Truong Hat, who served King Ly Nam De and Trieu Viet Vuong and were later held to have aided King Le Hoan and general Ly Thuong Kiet against invasion from the north. Thuong Nguyen opens the year with flower-and-lamp offerings for national peace, good crops and peaceful households.', 'At Vesak the pagoda marks the Buddha’s birth with the solemn Buddha-bathing rite, a reminder to cleanse body and mind. At Vu Lan, thousands come for the rose-pinning ceremony and the Vu Lan sutra in gratitude to parents and ancestors, together with the release of living creatures and requiem prayers for the fallen.'],
        acts: [{ h: '1st-month full moon — Thuong Nguyen', d: 'Thuong Nguyen: flower-and-lamp offerings for peace and good crops.' }, { h: '4th-month full moon — Vesak', d: 'Vesak: the solemn Buddha-bathing rite and a call to the good.' }, { h: '7th-month full moon — Vu Lan', d: 'Vu Lan: the rose-pinning ceremony, the filial-piety sutra and the merit-making release of life.' }]
      }
    }
  ];
  const tienich = [
    { ll: [105.7650, 21.3880], vi: { n: 'Khu ẩm thực trung tâm', d: 'Đặc sản địa phương, quán cổ.' }, en: { n: 'Central food court', d: 'Local specialties, old eateries.' } },
    { ll: [105.7700, 21.3820], vi: { n: 'Nhà nghỉ & homestay', d: 'Lưu trú gần cụm di tích.' }, en: { n: 'Stays & homestays', d: 'Lodging near the heritage cluster.' } },
    { ll: [105.77313, 21.41321], vi: { n: 'Bãi đỗ xe trung tâm', d: 'Đón khách, xe điện tham quan.' }, en: { n: 'Central parking', d: 'Visitor drop-off, e-shuttle.' } }
  ];
  const dulich = [
    { ll: [105.7850, 21.3950], vi: { n: 'Bến thuyền du lịch', d: 'Du thuyền ngắm cảnh ven sông.' }, en: { n: 'Tour boat pier', d: 'Riverside sightseeing cruises.' } },
    { ll: [105.83119, 21.39729], vi: { n: 'Công viên sinh thái', d: 'Không gian xanh, dã ngoại.' }, en: { n: 'Eco park', d: 'Green space, picnics.' } },
    { ll: [105.773886, 21.406388], vi: { n: 'Hồ Suối Lạnh', d: 'Danh thắng hồ nước hoang sơ, điểm nhấn sinh thái của xã Thành Công.' }, en: { n: 'Suoi Lanh Lake', d: 'A pristine lake landmark, the ecological centerpiece of Thanh Cong commune.' } },
    { ll: [105.7770, 21.4040], vi: { n: 'Sân golf Glory', d: 'Sân golf 18 hố nằm cạnh Hồ Suối Lạnh, quy mô 54 ha.' }, en: { n: 'Glory Golf Course', d: 'An 18-hole, 54-hectare golf course beside Suoi Lanh Lake.' } }
  ];
  const ubnd = { ll: [105.80651697841895, 21.402158681548443], vi: { n: 'UBND Xã Thành Công', t: 'Trụ sở hành chính', d: 'Trung tâm hành chính của xã — điểm xuất phát của các tuyến tham quan di tích.' }, en: { n: 'Thanh Cong Commune Hall', t: 'Civic center', d: 'The commune administrative center — the starting point of all heritage tour routes.' } };
  const tours = [
    { id: 'center', color: '#C0392B', vi: { n: 'Tuyến Trung tâm Đan Hà' }, en: { n: 'Central Dan Ha route' }, sites: ['dan-ha-den', 'dan-ha-dinh', 'xuan-duong', 'dinh-bia'] },
    { id: 'east', color: '#2C6E9E', vi: { n: 'Tuyến phía Đông' }, en: { n: 'Eastern route' }, sites: ['nguyen-tan', 'an-mien', 'van-kim'] },
    { id: 'west', color: '#1F8A5B', vi: { n: 'Tuyến phía Tây' }, en: { n: 'Western route' }, sites: ['linh-phuc', 'ha-dat'] }
  ];
  const proads = [
    { id: 'dt301', color: '#1A73E8', vi: { n: 'ĐT.301 (Đường 301)' }, en: { n: 'Provincial road 301' }, wp: [[105.770, 21.418], [105.788, 21.408], [105.806, 21.402], [105.828, 21.398], [105.858, 21.393]] },
    { id: 'vd5', color: '#E8902E', vi: { n: 'Vành đai 5 (Thái Nguyên – Vĩnh Phúc)' }, en: { n: 'Ring road 5 (Thai Nguyen – Vinh Phuc)' }, wp: [[105.695, 21.392], [105.735, 21.386], [105.775, 21.376], [105.808, 21.368], [105.850, 21.357]] }
  ];
  return { sites, villages, festivals, tienich, dulich, ubnd, tours, proads };
}

export function getThanhCongDict(lang) {
  const vi = {
    brand: 'BẢN ĐỒ DI TÍCH LỊCH SỬ', brandSub: 'Xã Thành Công',
    navOverview: 'Trang chủ', navSites: 'Địa điểm', navFest: 'Lễ hội', navMap: 'Bản đồ số', navVr: 'VR360', navD3: '3D',
    heroKicker: 'Cụm di tích — 09 điểm',
    heroTitle: 'Hành trình số gắn kết bản sắc',
    heroTitleAlt: 'A digital journey connecting our heritage',
    heroIntro: 'Khám phá 09 điểm Di tích lịch sử - văn hoá cấp tỉnh thuộc xã Thành Công, tỉnh Thái Nguyên qua bản đồ số, không gian VR360 và mô hình 3D; kết nối di sản với lễ hội văn hóa và du lịch hồ Suối Lạnh.',
    heroCta: 'Mở bản đồ số', heroCta2: 'Tham quan VR360',
    secSites: '09 Điểm di tích', secSitesAlt: 'Nine Heritage Sites',
    secSitesDesc: 'Mỗi điểm đều có không gian VR360; hai di tích trọng điểm được dựng mô hình 3D chi tiết. Chọn một điểm để xem chi tiết.',
    heroScript: 'Living Heritage of Thanh Cong', secSitesScript: 'Nine Heritage Sites',
    videoTitle: 'Video giới thiệu', videoScript: 'Introductory Film',
    videoDesc: 'Phim ngắn giới thiệu tổng quan về xã Thành Công và hành trình qua <br/>09 điểm di tích lịch sử.',
    // videoNote:'[ drop video giới thiệu — MP4 / nhúng YouTube · ~2–3 phút ]',
    communeTitle: 'Giới thiệu về Xã Thành Công', communeScript: 'An ancient heritage land',
    communeIntro: 'Xã Thành Công (mới) thuộc tỉnh Thái Nguyên, nơi kết tinh trầm tích lịch sử ngàn năm từ hai vùng đất cổ Tổng Thượng Vụ và Tổng Vạn Phái xưa. Tọa lạc tại cửa ngõ chiến lược, địa phương khẳng định vị thế bứt phá khi song hành giữa phát triển kinh tế liên vùng và nâng tầm bảo tồn các giá trị văn hoá lâu đời.',
    communeHighlights: [
      { t: 'Nấc thang phát triển', d: 'Hợp nhất từ hai xã Vạn Phái và Thành Công (ngày 01/07/2025); vận hành bộ máy quản lý tinh gọn với 16 xóm từ ngày 01/07/2026.' },
      { t: 'Đầu mối giao thương bứt phá', d: '"Trung tâm trung chuyển giao thương" kết nối Thái Nguyên với Thủ đô Hà Nội, tỉnh Phú Thọ và các tỉnh trung du miền núi phía Bắc qua Tỉnh lộ 274 và Đường liên kết vùng (Thái Nguyên – Bắc Giang – Vĩnh Phúc); giữ vai trò đô thị vệ tinh cung ứng nguồn nhân lực, dịch vụ logistics và mặt bằng phát triển cho các khu công nghiệp lân cận.' },
      { t: 'Bề dày di sản & Bản sắc', d: 'Nơi bảo tồn 09 di tích lịch sử - văn hóa cấp tỉnh, nơi giao thoa văn hoá độc đáo giữa người Kinh và đồng bào Sán Dìu với làn điệu hát Soọng Cô truyền thống.' },
      { t: 'Điểm hẹn du lịch & Sinh thái', d: 'Nơi vẻ đẹp hoang sơ của danh thắng Hồ Suối Lạnh giao hòa cùng đẳng cấp nghỉ dưỡng hiện đại từ Sân golf Glory 18 hố; mở ra "mắt xích" sinh thái đắt giá kết nối tuyến Tam Đảo – Hồ Đại Lải – Hồ Núi Cốc.' }
    ],
    secLink: 'Lễ hội văn hóa',
    secLinkDesc: 'Hệ thống lễ hội xã Thành Công gắn với chu kỳ nông nghiệp và 9 di tích cấp tỉnh, chia ba nhóm: Lễ hội Khai xuân, Đại lễ hội làng và các lễ tiết nông nghiệp.',
    histTitle: 'Hình thành & phát triển', histScript: 'Formation & growth',
    mapTitle: 'Bản đồ số liên kết di tích', mapSub: '',
    searchPh: 'Tìm điểm di tích, lễ hội…', layersTitle: 'Lớp điểm',
    mapLegendNote: 'Bật lớp “Tuyến tham quan” để xem lộ trình nối 09 điểm di tích theo đường giao thông thực tế.',
    mapCanvasLabel: 'Bản đồ thực địa',
    baseSat: 'Vệ tinh', baseRoad: 'Giao thông', baseHybrid: 'Hỗn hợp', terrain3d: 'Địa hình 3D', boundaryLabel: 'Ranh giới xã Thành Công',
    mapEmptyTitle: 'Chọn một điểm trên bản đồ', mapEmptyDesc: 'Nhấn vào ghim để xem thông tin, mở VR360, mô hình 3D hoặc trang chi tiết.',
    mapLayersBtn: 'Lớp điểm', mapInfoBtn: 'Thông tin', mapFullscreen: 'Toàn màn hình', mapClose: 'Đóng',
    btnDetail: 'Xem trang chi tiết', btnMaps: 'Chỉ đường Google Maps',
    mapBtnDetail: 'Chi tiết', mapBtnGoogleMap: 'Google Map', mapBtnAudio: 'Audio', mapBtnAudioPause: 'Tạm dừng', mapBtnVr: 'VR360', mapBtn3d: '3D',
    sdpPhone: 'Điện thoại', sdpWebsite: 'Website', sdpFacebook: 'Facebook', sdpAddress: 'Địa chỉ',
    vrTitle: 'Không gian VR360 — 09 điểm', vrSub: 'Tham quan toàn cảnh 360° từng điểm di tích.',
    vrDragHint: 'Kéo để xoay toàn cảnh',
    d3Title: 'Bản đồ 3D chi tiết', d3Sub: '', d3ClickHint: '',
    backMap: 'Về bản đồ', backHome: 'Về trang chủ', themeOverview: 'Giới thiệu', themeCta: 'Xem chi tiết', festActs: 'Hoạt động đặc trưng', festGallery: 'Hình ảnh lễ hội', festWhen: 'Thời gian', festSeasonLbl: 'Mùa lễ hội', historyTitle: 'Lịch sử & kiến trúc', infoTitle: 'Thông tin tham quan',
    qrTitle: 'Mã QR di tích', qrDesc: 'Quét để xem thông tin & VR360 ngay tại điểm.',
    nearbyTitle: 'Lân cận', openVr: 'Mở VR360', open3d: 'Xem mô hình 3D',
    footerNote: 'Bản đồ số di sản', footerCredit: '© 2025 UBND Xã Thành Công, tỉnh Thái Nguyên. Bản đồ số di sản 09 điểm di tích lịch sử — văn hóa cấp tỉnh. Thực hiện bởi Metatwin.',
    layerDitich: '09 điểm di tích', layerDulich: 'Khu/điểm du lịch', layerLangnghe: 'Điểm làng nghề', layerLehoi: 'Điểm lễ hội', layerTuyen: 'Tuyến tham quan', layerProads: 'Tỉnh lộ chính', layerTienich: 'Tiện ích',
    toursTitle: 'Tuyến tham quan', toursAllLabel: 'Hiện tất cả tuyến', ubndStartLabel: 'Xuất phát từ UBND xã',
    lMatbang: 'Mặt bằng', lPhoicanh: 'Phối cảnh', lCautruc: 'Cấu trúc',
    fEra: 'Niên đại', fArea: 'Diện tích', fStatus: 'Xếp hạng',
    iHours: 'Giờ mở cửa', iTicket: 'Vé tham quan', iAddress: 'Địa chỉ', iGetting: 'Di chuyển'
  };
  const en = {
    brand: 'BẢN ĐỒ DI TÍCH LỊCH SỬ', brandSub: 'Xã Thành Công',
    navOverview: 'Home', navSites: 'Sites', navFest: 'Festivals', navMap: 'Map', navVr: 'VR360', navD3: '3D',
    heroKicker: 'Heritage cluster — 09 sites',
    heroTitle: 'A digital journey connecting our heritage',
    heroTitleAlt: 'Hành trình số gắn kết bản sắc',
    heroIntro: 'Explore the 09 provincial historical–cultural heritage sites of Thanh Cong commune, Thai Nguyen province, through a digital map, VR360 spaces and 3D models — linking heritage with cultural festivals and Suoi Lanh Lake tourism.',
    heroCta: 'Open the map', heroCta2: 'Tour in VR360',
    secSites: 'Nine Heritage Sites', secSitesAlt: '09 Điểm di tích',
    secSitesDesc: 'Every site has a VR360 space; two key sites feature detailed 3D models. Select a site to view details.',
    heroScript: 'Living Heritage of Thanh Cong', secSitesScript: 'Nine Heritage Sites',
    videoTitle: 'Introductory Video', videoScript: 'Introductory Film',
    videoDesc: 'A short film introducing Thanh Cong commune and a journey through its 09 historical heritage sites.',
    videoNote: '[ drop intro video — MP4 / YouTube embed · ~2–3 min ]',
    communeTitle: 'About Thanh Cong Commune', communeScript: 'An ancient heritage land',
    communeIntro: 'The new Thanh Cong commune lies within Thai Nguyen province, where a thousand years of history crystallize from two ancient lands — the former Thuong Vu and Van Phai cantons. Sitting at a strategic gateway, the commune is charting a breakthrough course, advancing inter-regional economic growth hand in hand with elevating the preservation of its long-standing cultural values.',
    communeHighlights: [
      { t: 'A new stage of development', d: 'Formed by merging Van Phai and Thanh Cong communes (1 July 2025); operating a streamlined administration of 16 hamlets from 1 July 2026.' },
      { t: 'A breakout trade hub', d: 'A "trade transshipment hub" linking Thai Nguyen with Hanoi, Phu Tho province and the northern midland and mountainous provinces via Provincial Road 274 and the Inter-Regional Link Road (Thai Nguyen – Bac Giang – Vinh Phuc); a satellite township supplying labor, logistics services and development land for the surrounding industrial parks.' },
      { t: 'A rich heritage & identity', d: 'Home to 09 provincial-level historical–cultural relics, where the Kinh people and the San Diu ethnic community share a distinctive cultural exchange through the traditional Soong Co folk-singing tradition.' },
      { t: 'A tourism & ecological destination', d: 'Where the pristine beauty of Suoi Lanh Lake meets the modern luxury of the 18-hole Glory Golf Course, opening a valuable ecological link in the Tam Dao – Dai Lai Lake – Nui Coc Lake tourism route.' }
    ],
    secLink: 'Cultural festivals',
    secLinkDesc: 'Thanh Cong’s festivals follow the farming calendar and the nine provincial relics, in three groups: spring-opening festivals, grand village festivals and agricultural rites.',
    histTitle: 'Formation & growth', histScript: 'Formation & growth',
    mapTitle: 'Heritage link map', mapSub: '',
    searchPh: 'Search sites, festivals…', layersTitle: 'Point layers',
    mapLegendNote: 'Enable the “Suggested route” layer to see the path linking all 09 sites along real roads.',
    mapCanvasLabel: 'Field map',
    baseSat: 'Satellite', baseRoad: 'Roads', baseHybrid: 'Hybrid', terrain3d: '3D terrain', boundaryLabel: 'Thanh Cong commune boundary',
    mapEmptyTitle: 'Select a point on the map', mapEmptyDesc: 'Tap a pin to see info, open VR360, the 3D model or the detail page.',
    mapLayersBtn: 'Layers', mapInfoBtn: 'Info', mapFullscreen: 'Fullscreen', mapClose: 'Close',
    btnDetail: 'View detail page', btnMaps: 'Directions on Google Maps',
    mapBtnDetail: 'Details', mapBtnGoogleMap: 'Google Map', mapBtnAudio: 'Audio', mapBtnAudioPause: 'Pause', mapBtnVr: 'VR360', mapBtn3d: '3D',
    sdpPhone: 'Phone', sdpWebsite: 'Website', sdpFacebook: 'Facebook', sdpAddress: 'Address',
    vrTitle: 'VR360 spaces — 09 sites', vrSub: 'Take a 360° panoramic tour of each site.',
    vrDragHint: 'Drag to look around',
    d3Title: 'Detailed 3D maps — 02 major sites', d3Sub: '3D models built from field photography for two key sites: Dan Ha communal house and temple.', d3ClickHint: 'Click a 3D model to view its information',
    backMap: 'Back to map', backHome: 'Back home', themeOverview: 'Overview', themeCta: 'View details', festActs: 'Signature activities', festGallery: 'Festival gallery', festWhen: 'When', festSeasonLbl: 'Season', historyTitle: 'History & architecture', infoTitle: 'Visitor information',
    qrTitle: 'Site QR code', qrDesc: 'Scan to view info & VR360 on site.',
    nearbyTitle: 'Nearby', openVr: 'Open VR360', open3d: 'View 3D model',
    footerNote: 'Heritage digital map', footerCredit: "© 2025 Thanh Cong Commune People's Committee, Thai Nguyen Province. Digital heritage map of 09 provincial historical–cultural sites. Produced by Metatwin.",
    layerDitich: '09 heritage sites', layerDulich: 'Tourist spots', layerLangnghe: 'Craft villages', layerLehoi: 'Festivals', layerTuyen: 'Suggested route', layerProads: 'Provincial roads', layerTienich: 'Amenities',
    toursTitle: 'Tour routes', toursAllLabel: 'Show all routes', ubndStartLabel: 'Start from Commune Hall',
    lMatbang: 'Floor plan', lPhoicanh: 'Perspective', lCautruc: 'Structure',
    fEra: 'Era', fArea: 'Area', fStatus: 'Ranking',
    iHours: 'Opening hours', iTicket: 'Ticket', iAddress: 'Address', iGetting: 'Getting there'
  };
  return lang === 'vi' ? vi : en;
}

export function getThanhCongLandData() {
  return {
    'dan-ha-den': {
      sheet: '—', parcel: '—', total: '3.750', kv1: '370', kv2: '3.380',
      borders: [{ d: 'Đông', t: 'Đường vào xóm Xuân Hà 3' }, { d: 'Tây', t: 'Chợ Long Thành, đất canh tác' }, { d: 'Nam', t: 'Khu vực bảo vệ I và thổ cư ông Quỳnh' }, { d: 'Bắc', t: 'Đất khu văn hoá xóm Đan Hà' }]
    },
    'dan-ha-dinh': {
      sheet: '61', parcel: '558', total: '752', kv1: '210', kv2: '542',
      borders: [{ d: 'Đông', t: 'Đường giao thông' }, { d: 'Tây', t: 'Đất trồng cây lâu năm' }, { d: 'Nam', t: 'Đất canh tác' }, { d: 'Bắc', t: 'Đất nông thôn' }]
    },
    'nguyen-tan': {
      sheet: '62', parcel: '417', total: '372', kv1: '222', kv2: '150',
      borders: [{ d: 'Đông', t: 'Đất thổ cư' }, { d: 'Tây', t: 'Đất thổ cư' }, { d: 'Nam', t: 'Đường vào đình – chùa & đường dân sinh' }, { d: 'Bắc', t: 'Đất thổ cư' }]
    },
    'van-kim': {
      sheet: '—', parcel: '—', total: '—', kv1: '—', kv2: '—',
      borders: [{ d: 'Bắc – Tây', t: 'Giáp đồng ruộng' }, { d: 'Đông', t: 'Khu dân cư' }]
    },
    'linh-phuc': {
      sheet: '68', parcel: '500', total: '384,8', kv1: '250', kv2: '134,8',
      borders: [{ d: 'Đông', t: 'Đất thổ cư' }, { d: 'Tây', t: 'Đất thổ cư' }, { d: 'Nam', t: 'Đất thổ cư' }, { d: 'Bắc', t: 'Khu vực bảo vệ I' }]
    },
    'ha-dat': {
      sheet: '111', parcel: '18', total: '832', kv1: '225', kv2: '607',
      borders: [{ d: 'Đông', t: 'Thửa 19, 23 (đất canh tác)' }, { d: 'Tây', t: 'Thửa 78 (nhà ông Đặng Văn Hai)' }, { d: 'Nam', t: 'Thửa 76, 77 (NVH xóm Hạ Đạt)' }, { d: 'Bắc', t: 'Thửa 15 (nhà ông Lưu Văn Tư)' }]
    },
    'dinh-bia': {
      sheet: '33', parcel: '184', total: '1.248,9', kv1: '500', kv2: '748,9',
      borders: [{ d: 'Đông', t: 'Thửa 181' }, { d: 'Tây', t: 'Thửa 192' }, { d: 'Nam', t: 'Thửa 187' }, { d: 'Bắc', t: 'Thửa 180' }]
    },
    'xuan-duong': {
      sheet: '49', parcel: '240, 266, 267, 270, 305', total: '1.572', kv1: '101,7', kv2: '1.470,7',
      borders: [{ d: 'Đông', t: 'Trường Tiểu học (cơ sở II) xã Thành Công' }, { d: 'Tây', t: 'Nhà văn hoá xóm Xuân Dương' }, { d: 'Nam', t: 'Đất nhà ông Nguyễn Hữu Thức' }, { d: 'Bắc', t: 'Đất nhà ông Nguyễn Văn Sang' }]
    },
    'an-mien': {
      sheet: '82', parcel: '158, 159, 160, 161, 162, 174, 119', total: '577', kv1: '100', kv2: '477',
      borders: [{ d: 'Đông', t: 'Đường liên xóm' }, { d: 'Tây', t: 'Đất nhà ông Nguyễn Văn Hải' }, { d: 'Nam', t: 'Đất nhà ông Nguyễn Văn Ngọ' }, { d: 'Bắc', t: 'Đất nhà ông Nguyễn Văn Tiến' }]
    }
  };
}

export function getThanhCongDetailsData() {
  return {
    'dan-ha-den': {
      name: 'Đền Đan Hà', nameEn: 'Dan Ha Temple',
      rank: 'Di tích lịch sử – văn hóa cấp tỉnh',
      rankMeta: 'QĐ 2773/QĐ-UBND, 12/11/2004',
      worship: 'Cao Sơn · Quý Minh · Tam Tư Quá Giang',
      era: 'Chuyển tiếp Lê – Nguyễn',
      location: 'Xóm Xuân Hà, xã Thành Công, tỉnh Thái Nguyên',
      distance: '~35 km từ TP. Thái Nguyên',
      access: 'Từ TP. Thái Nguyên đi Quốc lộ III đến thị trấn Ba Hàng, rẽ phải 2 km rồi tiếp tục theo hướng Tây khoảng 6 km là tới đền.',
      overview: 'Đền Đan Hà nằm trên sườn đồi tại trung tâm chợ xã Thành Công, là không gian phụng thờ Tam vị Thượng đẳng thần (Cao Sơn, Quý Minh, Tam Tư Quá Giang) và Thành hoàng làng. Ngôi đền mang kiến trúc kiểu “chuôi vồ” truyền thống, lưu giữ hệ thống di vật phong phú như 3 đạo sắc phong thời Khải Định, Thần tích Ngọc phả chữ Hán Nôm, 4 bộ long ngai và các bia đá cổ. Đền là trung tâm sinh hoạt văn hóa tinh thần với Hội khai xuân (18/2 âm lịch) và Hội theo lệ làng (18/10 âm lịch). Năm 2004, đền được xếp hạng Di tích lịch sử - văn hóa cấp tỉnh.',
      facts: [
        { k: 'Xếp hạng', v: 'Cấp tỉnh · 2004' },
        { k: 'Niên đại', v: 'Lê → Nguyễn' },
        { k: 'Thờ phụng', v: 'Tam vị thượng đẳng thần' },
        { k: 'Kiến trúc', v: 'Kiểu “chữ Đinh”' }
      ],
      timeline: [
        { no: '1', year: 'Trước 1945', text: 'Nằm giữa làng Đan Hà, xã Đan Hà, tổng Thượng Vụ, huyện Phổ Yên, phủ Phú Bình, xứ Thái Nguyên.' },
        { no: '2', year: 'Sau 8/1945', text: 'Địa danh được đổi tên thành xã Long Thành sau Cách mạng tháng Tám.' },
        { no: '3', year: '1955 – nay', text: 'Ngôi đền thuộc quyền quản lý hành chính của xã Thành Công.' }
      ],
      deitiesTitle: 'Tam vị thượng đẳng thần',
      altarImg: sitePhotos['dan-ha-den'].altarImage,
      deitiesIntro: 'Ba vị đại tướng quân thời Hùng Vương thứ XVIII có công đánh bại quân Thục (An Dương Vương), được các triều đại tri ân và trở thành biểu tượng tâm linh bảo hộ dân làng Đan Hà.',
      deities: [
        { no: '1', name: 'Cao Sơn Đại Vương', huy: 'huý Hiển', role: 'Tả Quốc Chính nhạc phủ Tào Liêu đại tướng quân', story: 'Anh cả trong gia đình họ Cao ở vùng Ái Châu. Được Tản Viên Sơn Thánh phong Cao Sơn Đại Vương, thống lĩnh các thần núi đánh bại quân Thục.', hoa: 'Hóa thân ngày 10/11 tại chân núi Nộn' },
        { no: '2', name: 'Quý Minh Đại Vương', huy: 'huý Dụ', role: 'Hữu Quốc Chính đại tướng quân', story: 'Em ruột Cao Sơn, nhiều đức hạnh cứu giúp người nghèo khó. Thống lĩnh 50 vạn thần núi tiến công đồn binh nước Thục.', hoa: 'Hóa sinh ngày 11/11 tại chân núi Lạng' },
        { no: '3', name: 'Tam Tư Quá Giang', huy: 'Uyên Công', role: 'Thủy Tào Tam Tư Nguyên soái Đại Vương', story: 'Thủy thần vùng Phú Bình, con bà Ái Liên thiền sư, thân hình kỳ vĩ và tài năng phi thường. Thống lĩnh 50 thần nước đánh đại bại quân Thục.', hoa: 'Hóa sinh ngày 12/11 tại đầm huyện Bình Tuyền' }
      ],
      architecturePlan: 'Đền dựng theo mặt bằng kiểu “chữ Đinh” (chữ Đinh), quay hướng Đông chếch Nam — hướng đón sinh khí và ánh sáng theo quan niệm dân gian. Công trình gồm Tiền tế phía trước và Hậu cung phía sau nối liền thành một thể thống nhất, mang dấu ấn nghệ thuật chuyển tiếp Lê – Nguyễn; đại trùng tu năm 2011 trên cơ sở nguyên gốc.',
      exterior: [
        { t: 'Cột trụ biểu hình vuông, đắp nổi ô lồng đèn và ghi đôi câu đối.' },
        { t: 'Tường lửng đắp nổi “Long mã mang ấn kiếm” và cặp Nghê trong tư thế chầu.' },
        { t: 'Mái lợp ngói đỏ, trên viên ngói in dòng chữ Pháp “MARSEILLAISE ACIER”.' }
      ],
      interior: [
        { t: 'Tiền tế nhà dọc ba gian, khung gỗ lim đường kính 30 cm đặt trên tảng đá xanh.' },
        { t: 'Liên kết “thượng rường cụt giá chiêng” và “thượng kèo đầu – hạ kẻ truyền”.' },
        { t: 'Cốn mê tam giác chạm “Tứ linh” theo lối chạm nổi giả bong kênh tinh xảo.' },
        { t: 'Thượng cung gác lửng cách nền 1,2 m làm cung cấm — nơi đặt long ngai, bài vị.' }
      ],
      relicsIntro: 'Đền bảo lưu hệ thống di vật, cổ vật phong phú — nguồn sử liệu và nghệ thuật quý giá phản ánh bề dày lịch sử qua các triều Lê, Nguyễn.',
      relics: [
        { no: '01', n: 'Sắc phong', d: '1 hòm 03 đạo sắc phong năm Khải Định thứ 9 (1924) ban cho Cao Sơn, Quý Minh và Thành hoàng làng.' },
        { no: '02', n: 'Thần tích', d: 'Ngọc phả chữ Hán Nôm chép năm Vĩnh Hựu thứ 2 (1736), theo bản gốc Nguyễn Bính soạn năm 1572.' },
        { no: '03', n: 'Long ngai – bài vị', d: '04 bộ long ngai thờ “Tam vị thượng đẳng thần”, sơn son thếp vàng lộng lẫy.' },
        { no: '04', n: 'Bia đá', d: '05 bia đá; các bia còn chữ có niên đại Tự Đức (1855) và Thành Thái (1896).' },
        { no: '05', n: 'Đồ thờ tự', d: 'Hương án gỗ chạm rồng chầu mặt nguyệt, cửa võng lưỡng long, lục bình TK XIX, chuông đồng, bát cổ, trúc bản.' },
        { no: '06', n: 'Bản thần sắc', d: 'Ghi chép các sắc phong ban cho xã Đan Hà (niên đại Tự Đức, Duy Tân).' },
        { no: '07', n: 'Di vật đình cũ', d: '2 đầu đao đình, 5 bia đá, 3 tảng đá xanh kê chân cột và một số mảng chạm khắc.' }
      ],
      festivalDays: [
        { t: 'Hội khai xuân', d: '18/2 ÂL' },
        { t: 'Hội theo lệ làng', d: '18/10 ÂL' },
        { t: 'Ngày hóa Tam vị', d: '10–12/11 ÂL' }
      ],
      festivalRite: 'Kiệu sơn son thếp vàng đặt long ngai, bát hương, mâm xôi, đĩa quả được 4 thanh niên trai tráng khiêng rước trang nghiêm từ nền đình cũ vào đền, theo sau là đoàn người cầm cờ, phướn, lọng rực rỡ. Lễ hội diễn ra hai ngày với tế lễ, hát chèo, hát tuồng và các trò chơi dân gian.',
      festivalImg: festCover('dan-ha-den'),
      conservation: 'Bảo tồn: đại trùng tu năm 2011 (hậu cung, nhà ban quản lý, sân, tường rào, cổng) trên cơ sở nguyên gốc. Đã kiểm kê (1998) và xếp hạng cấp tỉnh (2004). Ban quản lý di tích và Hội người cao tuổi xóm Xuân Hà trông coi.',
      gallery: sitePhotos['dan-ha-den'].gallery
    },

    'dan-ha-dinh': {
      name: 'Đình Đan Hà', nameEn: 'Dan Ha Communal House',
      rank: 'Di tích lịch sử cấp tỉnh',
      rankMeta: 'QĐ 3741/QĐ-UBND, 31/12/2016',
      worship: 'Tam vị Đại vương thời Hùng Duệ Vương',
      era: 'Phục dựng 2014 trên nền cũ',
      location: 'Xóm Xuân Hà, xã Thành Công, tỉnh Thái Nguyên',
      distance: 'Cạnh chợ Long Thành',
      access: 'Phía Đông giáp đường liên xã; phía Tây giáp chợ Long Thành và rừng cây; phía Nam giáp ruộng; phía Bắc giáp nhà dân.',
      overview: 'Đình Đan Hà (xóm Xuân Hà, xã Thành Công) là di tích lịch sử văn hóa quan trọng thờ Tam vị Thượng đẳng thần (Cao Sơn, Quý Minh, Tam Tư Quá Giang) và Thành hoàng làng. Đình từng bị phá hủy trong kháng chiến năm 1947 và được nhân dân phục dựng khang trang vào năm 2014 trên nền đất cũ với kiến trúc hình chữ “Đinh”. Đình lưu giữ nhiều hiện vật quý như ngai thờ cổ, bản dập bia đá và Thần tích Ngọc phả. Đây là trung tâm sinh hoạt tín ngưỡng, nơi diễn ra Đại lễ tế làng vào tháng 10 âm lịch và Hội Khai xuân rằm tháng Giêng. Đình được xếp hạng Di tích lịch sử cấp tỉnh năm 2016.',
      facts: [
        { k: 'Xếp hạng', v: 'Cấp tỉnh · 2016' },
        { k: 'Tái thiết', v: 'Giáp Ngọ 2014' },
        { k: 'Thờ phụng', v: 'Tam vị Thành hoàng' },
        { k: 'Kiến trúc', v: 'Chữ “Đinh” – chữ Đinh' }
      ],
      timeline: [
        { no: '1', year: 'Thời phong kiến', text: 'Đình dựng làm nơi tế tự, quần tụ cư dân và sinh hoạt văn hóa làng xã, cột gỗ lim trên thế đất cao ráo.' },
        { no: '2', year: 'Năm 1947', text: 'Bị phá hủy hoàn toàn theo chủ trương “tiêu thổ kháng chiến”, chỉ còn lại nền đất cũ.' },
        { no: '3', year: 'Năm 2014', text: 'Tái thiết bằng nguồn xã hội hóa: khởi công 10/8 ÂL, khánh thành 10/11 ÂL năm Giáp Ngọ.' }
      ],
      deitiesTitle: 'Tam vị Thành hoàng làng',
      altarImg: sitePhotos['dan-ha-dinh'].altarImage,
      deitiesIntro: 'Ba vị tướng lĩnh dưới thời Hùng Duệ Vương (Hùng Vương thứ XVIII), theo bản Thần tích do Hàn lâm viện Đông các đại học sĩ Nguyễn Bính soạn năm 1572.',
      deities: [
        { no: '1', name: 'Cao Sơn Đại Vương', huy: 'huý Hiển', role: 'Tả Quốc Chính nhạc phủ Tảo Liêu đại tướng quân', story: 'Anh ruột, sinh cùng một bọc với Quý Minh ngày 10/5 năm Đinh Tỵ, thân hình khôi ngô, thần phong lẫm liệt. Thống lĩnh bộ binh thần núi cùng Tản Viên Sơn Thánh đánh tan quân Thục.', hoa: 'Hóa ngày 10–11/11 ÂL' },
        { no: '2', name: 'Quý Minh Đại Vương', huy: 'huý Dụ', role: 'Hữu Quốc Chính nhạc phủ Tảo Liêu đại tướng quân', story: 'Em ruột Cao Sơn, văn võ song toàn. Cùng anh thống lĩnh 15 vạn bộ binh thần núi nghênh chiến, giữ vững biên cương.', hoa: 'Hóa ngày 11/11 ÂL' },
        { no: '3', name: 'Tam Tư Quá Giang Đại Vương', huy: 'huý Uyên', role: 'Thủy Tào Tam Kỳ Nguyên soái', story: 'Thủy thần do bà Ái Nương (chùa Long Phúc) cảm ứng giao long mà sinh, tinh thông thủy chiến. Giữ chức Thủy Tào Nguyên soái, thống lĩnh 15 vạn thủy binh thần nước.', hoa: 'Hóa ngày 12/11 ÂL' }
      ],
      architecturePlan: 'Đình phục dựng năm 2014 theo bố cục mặt bằng hình chữ “Đinh” (chữ Đinh), phong cách kiến trúc truyền thống vùng trung du Bắc Bộ, gồm Nhà Tiền tế ba gian và Hậu cung liền kề. Vật liệu gạch – vữa kết hợp hệ cột, xà bê tông cốt thép giả gỗ sơn phủ tinh xảo, giữ trọn tỷ lệ và kiểu dáng cổ truyền.',
      exterior: [
        { t: 'Mái lợp ngói mũi hài; bờ nóc đắp cao gắn gạch hộp rỗng hình hoa chanh.' },
        { t: 'Chính giữa bờ nóc gắn “Lưỡng long chầu nguyệt”, hai đầu kìm đắp hình con nghê chầu.' },
        { t: 'Bốn góc đao cong vút thanh thoát theo dáng “tàu đao lá mái”.' }
      ],
      interior: [
        { t: 'Gian giữa Tiền tế: ban thờ công đồng Thành hoàng làng.' },
        { t: 'Gian bên phải: ban thờ Chủ tịch Hồ Chí Minh.' },
        { t: 'Gian bên trái: ban thờ các anh hùng liệt sỹ làng Đan Hà.' },
        { t: 'Hậu cung: long ngai gỗ sơn son thếp vàng cùng đồ thờ tự linh thiêng.' }
      ],
      relicsIntro: 'Đình mới lưu giữ hệ thống đồ thờ tự được chạm khắc công phu; nhiều cấu kiện quý của đình cổ (đầu đao, bia đá) đã được di tản, gửi lưu giữ an toàn tại Đền Đan Hà từ trước năm 1947.',
      relics: [
        { no: '01', n: 'Ban thờ chạm khắc', d: 'Các tòa ban thờ sơn son thếp vàng lộng lẫy, chạm khắc tinh xảo.' },
        { no: '02', n: 'Hoành phi – câu đối', d: 'Hệ thống hoành phi, câu đối chữ Hán ca ngợi công đức ba vị Thành hoàng.' },
        { no: '03', n: 'Long ngai', d: 'Ngai thờ bằng gỗ sơn son thếp vàng đỏ rực đặt trong Hậu cung.' },
        { no: '04', n: 'Đồ tế tự', d: 'Bát hương, đài nến, chân nến, lọ lộc bình, mâm bồng, kỷ chén do nhân dân tiến cúng.' },
        { no: '05', n: 'Cấu kiện đình cổ', d: 'Đầu đao và bia đá cổ gửi lưu giữ tại Đền Đan Hà — chứng tích ngôi đình xưa.' }
      ],
      festivalDays: [
        { t: 'Đại lễ hội Khai xuân', d: '15 tháng Giêng' },
        { t: 'Lễ tuần tiết', d: 'Mùng 1 & Rằm' },
        { t: 'Tết Thanh Minh / Đoan Dương', d: '3/3 · 5/5 ÂL' }
      ],
      festivalRite: 'Hội khai xuân Rằm tháng Giêng là kỳ lễ lớn nhất, hài hòa lễ và hội. Đội tế nam quan, nữ quan dưới sự điều hành của Ban tế khí (Chủ tế, bồi tế, đồng xướng, nội tán, chấp sự) thực hiện lễ cáo yết, tế thần, dâng hương, đọc chúc văn. Phần hội rộn ràng hát chầu văn, quan họ cùng các trò chơi dân gian (chọi gà, bịt mắt bắt dê, cờ người) và thể thao phong trào. Di tích do Tổ quản lý 18 thành viên do nhân dân bầu ra điều hành.',
      festivalImg: festCover('dan-ha-dinh'),
      conservation: 'Toàn bộ diện tích đất di tích đã được khoanh vùng bảo vệ. Phương hướng: tiếp tục nghiên cứu sưu tầm tư liệu – hiện vật, đẩy mạnh tuyên truyền giá trị, vận động nguồn kinh phí xã hội hóa để tu bổ tôn tạo lâu dài.',
      gallery: sitePhotos['dan-ha-dinh'].gallery
    },

    'nguyen-tan': {
      name: 'Đình – Chùa Nguyễn Tân', nameEn: 'Nguyen Tan House & Pagoda',
      rank: 'Di tích lịch sử cấp tỉnh',
      rankMeta: 'QĐ 2498/QĐ-UBND, 12/8/2020',
      worship: 'Thành hoàng · Phật · Tam tòa Thánh Mẫu',
      era: 'Phục dựng 1953, trùng tu 2013',
      location: 'Xóm Thượng Vụ, xã Thành Công, tỉnh Thái Nguyên',
      distance: '~1 km phía Tây UBND xã',
      access: 'Từ TP Thái Nguyên theo QL3 ~30 km đến ngã tư Phổ Yên, rẽ phải vào TL261 đi 7 km đến UBND xã Thành Công, đi tiếp ~1 km về phía Tây.',
      overview: 'Cụm di tích Đình, Chùa Nguyễn Tân (xóm Thượng Vụ 2, xã Thành Công) là không gian tâm linh độc đáo kết hợp thờ thần, thờ Phật và thờ Mẫu. Đình thờ các vị tướng thời Hùng Vương (Cao Sơn Quý Minh, Tổng Bính), trong khi Chùa thờ Phật và nhà thờ Mẫu thờ Tam tòa Thánh mẫu. Bị tàn phá trong thời kỳ tiêu thổ kháng chiến (1947-1948), di tích được phục dựng từ năm 1953 và đại trùng tu năm 2013. Nơi đây lưu giữ 5 bia đá cổ và 3 sắc phong triều Nguyễn. Lễ hội lớn nhất diễn ra vào ngày 12 tháng 10 âm lịch. Cụm di tích được xếp hạng cấp tỉnh năm 2020.',
      facts: [
        { k: 'Xếp hạng', v: 'Cấp tỉnh · 2020' },
        { k: 'Diện tích', v: '~372 m²' },
        { k: 'Tín ngưỡng', v: 'Thần – Phật – Mẫu' },
        { k: 'Trùng tu', v: 'Phục dựng 1953' }
      ],
      timeline: [
        { no: '1', year: 'Thế kỷ XIX', text: 'Thuộc thôn Nguyễn, làng Thượng Vụ, tổng Thượng Vụ, huyện Phổ Yên, phủ Phú Bình, xứ Thái Nguyên.' },
        { no: '2', year: '1947 – 1948', text: 'Bị tiêu thổ kháng chiến, phá hủy hoàn toàn để không cho quân địch lập đồn bốt.' },
        { no: '3', year: 'Năm 1953', text: 'Sau khi tách lập xã Thành Công, nhân dân Thượng Vụ phục dựng lại cả đình và chùa.' }
      ],
      deitiesTitle: 'Hệ thống thờ tự',
      altarImg: sitePhotos['nguyen-tan'].altarImage,
      deitiesIntro: 'Sự đan xen hài hòa giữa thờ thần, thờ Phật và thờ Mẫu — phản ánh đời sống tinh thần phong phú của cư dân Thượng Vụ.',
      deities: [
        { no: '1', name: 'Tại Đình', huy: 'Cao Sơn · Quý Minh · Tổng Bính', role: 'Thờ Thành hoàng', story: 'Thờ Cao Sơn Quý Minh Thượng đẳng thần — các bộ tướng văn võ song toàn thời Hùng Duệ Vương, cùng tướng Tổng Bính hiển linh phò vua giúp nước.', hoa: 'Gắn truyền thuyết Lý Thường Kiệt' },
        { no: '2', name: 'Tại Chùa', huy: 'Phật giáo Đại thừa', role: 'Thờ Phật', story: 'Không gian thờ chư vị Phật Tổ theo giáo lý từ bi của Phật giáo Đại thừa; kiến trúc 3 gian mộc mạc quay hướng Đông, cách vị trí cũ ~30 m.', hoa: 'Thanh tịnh, gần gũi' },
        { no: '3', name: 'Nhà thờ Mẫu', huy: 'Tam tòa Thánh Mẫu', role: 'Tín ngưỡng Tam phủ', story: 'Thờ Thánh Mẫu Đệ nhất, Đệ nhị, Đệ tam Thượng thiên cùng Tứ vị Chầu bà — biểu trưng cho tín ngưỡng thờ Mẫu tam phủ mang đậm bản sắc bản địa.', hoa: 'Bản sắc văn hóa Việt' }
      ],
      architecturePlan: 'Cụm di tích kiến thiết theo phong cách cổ truyền vùng trung du Bắc Bộ, đại trùng tu gần nhất năm 2013. Đình Nguyễn Tân bố cục chữ “Đinh”, gồm Tiền tế ~80 m² (3 gian 2 chái) và Hậu cung ~12 m²; Chùa dịch cách vị trí cũ ~30 m, kiến trúc 3 gian đơn giản quay hướng Đông.',
      exterior: [
        { t: 'Mái đình lợp ngói mũi đỏ cổ kính, bốn đầu đao cong vút thanh thoát.' },
        { t: 'Hệ chịu lực: cột bê tông cốt thép giả gỗ kết hợp vì kèo gỗ bền chắc.' },
        { t: 'Khuôn viên có cây cổ thụ tỏa bóng và giếng đá hộc cổ loe miệng độc đáo.' }
      ],
      interior: [
        { t: 'Tiền tế đình rộng ~80 m² quy mô 3 gian 2 chái, kết cấu vững chãi.' },
        { t: 'Hậu cung thâm nghiêm ~12 m² đặt long ngai, bài vị.' },
        { t: 'Chùa chính 3 gian mộc mạc kiểu nhà cấp 4, không gian thanh tịnh.' },
        { t: 'Ban thờ chạm khắc tinh xảo cùng hoành phi, câu đối, chân nến.' }
      ],
      relicsIntro: 'Hệ thống 05 bia đá cổ và 03 sắc phong triều Nguyễn là nguồn sử liệu văn bản vô giá, khẳng định địa vị thờ tự và niên đại của di tích.',
      relics: [
        { no: '01', n: 'Bia thứ 3 (1897)', d: 'Niên hiệu Thành Thái thứ 9 — ghi chép về công đức.' },
        { no: '02', n: 'Bia thứ 4 (1922)', d: 'Niên hiệu Khải Định thứ 7 — ghi việc tu sửa đình Thượng Vụ năm 1922.' },
        { no: '03', n: 'Các bia thời Nguyễn', d: 'Ghi công đức bầu Hậu thần và các quy định cúng tế.' },
        { no: '04', n: 'Sắc phong 1909', d: 'Ngày 11/8 Duy Tân thứ 3 — chuẩn y thờ phụng thần Cao Sơn Quý Minh.' },
        { no: '05', n: 'Sắc phong thần Quý Minh', d: 'Ngày 25/7 Khải Định thứ 9 (1924) — ban cho xã Thượng Vụ.' },
        { no: '06', n: 'Sắc phong thần Cao Sơn', d: 'Ngày 25/7 Khải Định thứ 9 (1924) — ban cho xã Thượng Vụ.' },
        { no: '07', n: 'Đồ thờ tự', d: 'Ban thờ chạm khắc, hoành phi, câu đối, chân nến — mỹ thuật dân gian Phổ Yên xưa.' }
      ],
      festivalDays: [
        { t: 'Đại lễ hội làng', d: '12 tháng 10 ÂL' },
        { t: 'Lễ cúng tế', d: '10 tháng 12 ÂL' },
        { t: 'Lễ Vào hè', d: '30 tháng 3 ÂL' }
      ],
      festivalRite: 'Đại lễ hội làng ngày 12 tháng 10 âm lịch là kỳ lễ lớn nhất. Lễ rước kiệu do thanh niên trai tráng khiêng, trên đặt long ngai, bát hương, mâm xôi quả, khởi hành từ nền đình cổ vào đền trong tiếng trống hội, theo sau là cờ phướn, tàn lọng rực rỡ. Phần hội có chèo cổ, hát tuồng và trò chơi dân gian. Ngoài ra có Lễ Vào hè (30/3 ÂL) cầu mát mẻ hanh thông; các ngày Rằm, mùng Một Phật tử về chùa dâng hương, lễ Phật, kính Mẫu.',
      festivalImg: festCover('nguyen-tan'),
      conservation: 'Toàn bộ hoạt động tế lễ, bảo vệ cảnh quan và đón tiếp du khách do Ban quản lý di tích phối hợp Hội người cao tuổi điều hành văn minh, đúng quy định.',
      gallery: sitePhotos['nguyen-tan'].gallery
    },

    'linh-phuc': {
      name: 'Chùa Linh Phúc', nameEn: 'Linh Phuc Pagoda',
      rank: 'Di tích lịch sử cấp tỉnh',
      rankMeta: 'QĐ 2499/QĐ-UBND, 12/8/2020',
      worship: 'Phật giáo Đại thừa · Tam tòa Thánh Mẫu',
      era: 'Từ trước 1801 (cuối Tây Sơn)',
      location: 'Xóm Thống Nhất 2, xã Thành Công, tỉnh Thái Nguyên',
      distance: '~1,5 km phía Tây UBND xã',
      access: 'Từ TP Thái Nguyên theo QL3 ~30 km đến ngã tư Phổ Yên, rẽ phải vào TL261 ~7 km đến UBND xã Thành Công, di tích cách ~1,5 km về phía Tây.',
      overview: 'Chùa Linh Phúc (xóm Chùa, xã Thành Công) được khởi dựng từ cuối thời Tây Sơn (trước năm 1801). Dù từng bị phá hủy trong kháng chiến năm 1947, chùa đã được nhân dân phục dựng và tu bổ nhiều lần. Chùa mang kiến trúc chữ “Đinh”, gồm Tiền đường, Thượng điện và Nhà Mẫu. Thượng điện bài trí hệ thống tượng Phật theo 4 tầng bậc, cùng tượng Đạo giáo, thể hiện sự dung hòa tín ngưỡng. Chùa là trung tâm sinh hoạt văn hóa tín ngưỡng với các dịp lễ lớn như Lễ Khai xuân, Lễ Vào hè, Lễ Ra hè và Lễ Lệ làng. Năm 2020, chùa được xếp hạng Di tích lịch sử cấp tỉnh.',
      facts: [
        { k: 'Xếp hạng', v: 'Cấp tỉnh · 2020' },
        { k: 'Niên đại', v: '≥ 1801' },
        { k: 'Diện tích', v: '384,8 m²' },
        { k: 'Mô hình', v: 'Tiền Phật hậu Mẫu' }
      ],
      timeline: [
        { no: '1', year: '≤ 1801', text: 'Văn bia “Hậu Phật bi ký” niên hiệu Cảnh Thịnh thứ 9 (1801) xác nhận chùa đã tồn tại từ cuối thời Tây Sơn trở về trước.' },
        { no: '2', year: 'Năm 1947', text: 'Bị phá hủy theo chủ trương “tiêu thổ kháng chiến”, chỉ còn một số bia và linh vật bằng đá xanh.' },
        { no: '3', year: '1948 – 2006', text: 'Hai cụ Dương Văn Tần, Dương Văn Đông khôi phục bằng tre nứa (1948); nhân dân tu bổ các năm 1960, 1985, 2006.' }
      ],
      deitiesTitle: 'Hệ thống tượng thờ Thượng điện',
      altarImg: sitePhotos['linh-phuc'].altarImage,
      deitiesIntro: 'Tượng Phật bài trí khoa học theo bốn tầng bậc giáo lý Phật giáo Đại thừa, sơn son thếp vàng tôn nghiêm — phản ánh tư tưởng “tam giáo đồng nguyên”.',
      deities: [
        { no: '4', name: 'Tam Thế Phật', huy: 'Tầng cao nhất', role: 'Chư Phật ba đời', story: 'Phật Nhiên Đăng, Thích Ca Mâu Ni và Di Lặc — đại diện chư Phật Quá khứ, Hiện tại, Tương lai. Tầng tôn nghiêm nhất của Thượng điện.', hoa: 'Quá khứ – Hiện tại – Tương lai' },
        { no: '3', name: 'Tây Phương Tam Thánh', huy: 'A Di Đà · Quan Âm · Đại Thế Chí', role: 'Từ bi & trí tuệ', story: 'Đức Phật A Di Đà ngự trung tâm, hai bên Quan Thế Âm Bồ tát và Đại Thế Chí Bồ tát phò trợ, biểu trưng cho lòng từ bi và trí tuệ viên mãn.', hoa: 'Bộ ba viên mãn' },
        { no: '2', name: 'Ngọc Hoàng – Nam Tào – Bắc Đẩu', huy: 'Bộ tượng Đạo giáo', role: 'Tam giáo đồng nguyên', story: 'Ngọc Hoàng Đại Đế ở giữa, hai bên Nam Tào, Bắc Đẩu — thể hiện sự hòa hợp tư tưởng tam giáo trong văn hóa Việt.', hoa: 'Đặt sát sau tượng Cửu Long' },
        { no: '1', name: 'Tòa Cửu Long', huy: 'Tầng dưới cùng', role: 'Phật đản sinh', story: 'Tòa Cửu Long bằng đồng chạm khắc tinh xảo, mô tả Đức Phật Thích Ca đản sinh với 9 con rồng phun nước tắm mát.', hoa: 'Tượng đồng cổ' }
      ],
      architecturePlan: 'Chùa xây trên khu đất 384,8 m² ẩn dưới bóng cây cổ thụ, gồm Tam quan, sân chùa, chùa chính (Tiền đường – Thượng điện) và Nhà Mẫu. Chùa chính quay hướng Nam, bố cục chữ “Đinh”; Tiền đường ~30 m² đầu đao bít đốc, Thượng điện ~22 m² chia 3 gian, mái thấp tạo không gian linh thiêng.',
      exterior: [
        { t: 'Cổng Tam quan và sân chùa rộng rãi dưới bóng cây cổ thụ.' },
        { t: 'Tiền đường đầu đao bít đốc, mái lợp ngói đỏ cổ kính.' },
        { t: 'Bộ khung gỗ “bào trơn đóng bén” khít khao, tường gạch chịu lực.' }
      ],
      interior: [
        { t: 'Thượng điện 3 gian bài trí 4 tầng tượng Phật sơn son thếp vàng.' },
        { t: 'Phối thờ Phật bà, Thánh hiền, Đức chúa, Đức Địa Tạng, Quan âm Bạch y.' },
        { t: 'Nhà Mẫu nhà cấp 4 ba gian — ban Tam tòa Thánh Mẫu (Thiên · Thượng Ngàn · Thoải).' },
        { t: 'Phối thờ Chầu bà, Đức Thánh Trần theo tín ngưỡng Tam phủ.' }
      ],
      relicsIntro: 'Hệ thống tượng pháp phong phú cùng các tấm bia đá cổ là nguồn tư liệu quý cho nghiên cứu lịch sử – văn hóa và Phật giáo địa phương.',
      relics: [
        { no: '01', n: 'Hậu Phật bi ký (1801)', d: 'Niên hiệu Cảnh Thịnh thứ 9 — minh chứng niên đại sớm nhất của chùa.' },
        { no: '02', n: 'Hậu Phật bi ký (TK XIX)', d: 'Niên hiệu Tự Đức — ghi việc cúng Hậu Phật.' },
        { no: '03', n: 'Tập Phúc bi ký (1928)', d: 'Niên hiệu Khải Định thứ 3 — ghi công đức hưng công.' },
        { no: '04', n: 'Tòa Cửu Long', d: 'Tượng đồng chạm khắc tinh xảo, mô tả Phật đản sinh.' },
        { no: '05', n: 'Hệ tượng Tam Thế', d: 'Bộ tượng Tam Thế Phật và Tây Phương Tam Thánh sơn son thếp vàng.' },
        { no: '06', n: 'Linh vật đá xanh', d: 'Bia và linh vật đá xanh còn lại sau khi chùa bị phá hủy năm 1947.' }
      ],
      festivalDays: [
        { t: 'Lễ Khai xuân', d: '6 tháng 2 ÂL' },
        { t: 'Lễ Vào hè', d: '1 tháng 4 ÂL' },
        { t: 'Lễ Ra hè', d: '25 tháng 6 ÂL' },
        { t: 'Lễ Lệ làng', d: '20 tháng 10 ÂL' }
      ],
      festivalRite: 'Bốn kỳ lễ tiết lớn gắn với chu kỳ nông nghiệp: Khai xuân (6/2) cầu hanh thông, Vào hè (1/4) cầu mát mẻ xua bệnh tật, Ra hè (25/6) tạ ơn trời Phật, và Lệ làng (20/10) — kỳ đại lễ lớn nhất. Trước lễ, nhân dân tổng vệ sinh, trang hoàng cờ hoa; lễ vật “cây nhà lá vườn” do dân tự nguyện dâng cúng. Phần lễ trang nghiêm theo nghi thức cổ truyền do Ban hộ tự phối hợp chính quyền điều hành.',
      festivalImg: festCover('linh-phuc'),
      conservation: 'Chùa là trung tâm sinh hoạt văn hóa tín ngưỡng của xóm Chùa và vùng phụ cận; hoạt động tế lễ, bảo vệ cảnh quan và đón tiếp du khách được Ban hộ tự phối hợp chính quyền điều hành văn minh, đúng pháp luật.',
      gallery: sitePhotos['linh-phuc'].gallery
    },

    'ha-dat': {
      name: 'Đình Hạ Đạt', nameEn: 'Ha Dat Communal House',
      rank: 'Di tích lịch sử cấp tỉnh',
      rankMeta: 'QĐ 2504/QĐ-UBND, 18/10/2022',
      worship: '5 vị nhân thần · Bà Chúa Mỹ Nương',
      era: 'Hậu Lê (TK XVIII), phục dựng 2013',
      location: 'Xóm Phú Đạt, xã Thành Công, tỉnh Thái Nguyên',
      distance: '~4 km vào xóm Hạ Đạt',
      access: 'Từ TP Thái Nguyên theo QL3 ~30 km đến ngã tư Ba Hàng, rẽ phải TL261 ~7 km đến UBND xã Thành Công, đi tiếp 4 km vào xóm Hạ Đạt.',
      overview: 'Đình Hạ Đạt, khởi dựng từ thế kỷ XVIII, là trung tâm sinh hoạt văn hóa tín ngưỡng của cộng đồng cư dân với 95% là người Sán Dìu. Đình thờ 5 vị nhân thần, tiêu biểu là Cao Sơn và Quý Minh. Dù từng bị xuống cấp, đình được phục dựng lại năm 2013 trên nền đất cũ. Di tích lưu giữ 4 chân tảng kê cột đá xanh, 2 quả chuông gang thời Nguyễn, cuốn Thần tích chữ Hán Nôm và 3 cây đại cổ thụ gần 300 năm tuổi. Đình duy trì nếp sinh hoạt “Tứ quý sự thần” độc đáo, nổi bật là lễ rước kiệu Bà Chúa Mỹ Nương và tục ban lá cờ thiêng. Đình được xếp hạng cấp tỉnh năm 2022.',
      facts: [
        { k: 'Xếp hạng', v: 'Cấp tỉnh · 2022' },
        { k: 'Niên đại', v: 'Hậu Lê – TK XVIII' },
        { k: 'Cộng đồng', v: '95% người Sán Dìu' },
        { k: 'Bảo vệ', v: '832 m² (lõi + đệm)' }
      ],
      timeline: [
        { no: '1', year: 'TK XVIII – XIX', text: 'Dựng từ thời Hậu Lê với cột gỗ lim, mái lợp gianh; tu bổ thời Nguyễn. Thuộc tổng Thượng Vụ, huyện Phổ Yên.' },
        { no: '2', year: '1966 – 1967', text: 'Là nơi đóng quân, làm việc và tổ chức hậu cần của bộ đội Trung Quốc sang giúp Việt Nam chống Mỹ.' },
        { no: '3', year: 'Năm 2013', text: 'Nhân dân đóng góp kinh phí, công sức khôi phục đình trên nền đất cũ; khung gỗ bạch đàn, tường gạch.' }
      ],
      deitiesTitle: 'Năm vị nhân thần',
      altarImg: sitePhotos['ha-dat'].altarImage,
      deitiesIntro: 'Theo Thần tích – thần sắc làng Hạ Đạt (kê khai 1938, 22 trang chữ Quốc ngữ và Hán Nôm), đình thờ 5 vị nhân thần có công đức lớn với dân tộc và địa phương.',
      deities: [
        { no: '1', name: 'Cao Sơn Linh ứng Đại vương', huy: 'huý Hiển', role: 'Bản cảnh Thành hoàng', story: 'Anh ruột Quý Minh, bộ tướng Hùng Duệ Vương, có công đánh giặc Thục; hiển thánh đời Hậu Lý âm phù Lý Thường Kiệt đánh giặc Tống.', hoa: 'Hóa ngày 10/11 tại núi Nộn' },
        { no: '2', name: 'Cao Các Quý Minh Linh ứng Đại vương', huy: 'huý Dụ', role: 'Thành hoàng', story: 'Em ruột Cao Sơn, sinh ngày mồng 10 tháng 5, văn võ song toàn; cùng anh hiển thánh phù trợ danh tướng Lý Thường Kiệt.', hoa: 'Hóa ngày 11/11 tại núi Lạng' },
        { no: '3', name: 'Trần Thị Ngọc Long Công chúa', huy: 'Đương cảnh Thành hoàng', role: 'Nữ thần bản cảnh', story: 'Đương cảnh Thành hoàng của làng Hạ Đạt, được nhân dân tôn kính phụng thờ qua nhiều thế hệ.', hoa: 'Thành hoàng đương cảnh' },
        { no: '4', name: 'Lưu Gia Đức Trọng Tôn thần', huy: 'Dòng họ khai cơ', role: 'Phúc thần', story: 'Tôn thần dòng họ Lưu — một trong các dòng họ khai cơ lập làng (Đặng, Diệp, Mạch, Lưu).', hoa: 'Sắc phong Khải Định 1918/1924' },
        { no: '5', name: 'Nguyễn Gia Phù quốc Tôn thần', huy: 'Phù quốc', role: 'Phúc thần', story: 'Tôn thần họ Nguyễn có công phù quốc, được các triều ban sắc phong tri ân (nay sắc không còn lưu).', hoa: 'Phù quốc an dân' }
      ],
      architecturePlan: 'Đình tôn tạo năm 2013 giữ bố cục chữ “Đinh”, gồm 3 gian Tiền tế và Hậu cung, tổng diện tích trên 40 m² (dài 7,8 m, rộng 5,3 m), quay hướng Đông — hướng mặt trời mọc, sinh khí và may mắn. Sân trước 10 × 8 m lát gạch đỏ, kết nối đền Trình, nhà sắp lễ và giếng Đình cổ.',
      exterior: [
        { t: 'Chính diện quay hướng Đông; sân gạch đỏ 10 × 8 m.' },
        { t: 'Ba cây đại cổ thụ gần 300 năm tuổi tỏa bóng trước sân.' },
        { t: 'Giếng Đình cổ (một trong hai giếng cổ) vẫn được dân lấy nước lễ hội.' }
      ],
      interior: [
        { t: 'Gian giữa Tiền tế: ban thờ cao 1,2 m, gỗ quý sơn son thếp vàng chạm “Tứ linh” – “Tứ quý”.' },
        { t: 'Bài trí 3 bát hương sứ, 3 ngai rồng và bài vị các Thành hoàng.' },
        { t: 'Hoành phi 6 chữ Hán “Cao Sơn quốc chủ đại vương”; câu đối ngợi ca công đức.' },
        { t: 'Hai bên tả hữu phối thờ ban Thổ công và Thổ kỳ.' }
      ],
      relicsIntro: 'Dù kiến trúc tôn tạo năm 2013, đình lưu giữ kho cổ vật gốc vô giá — chứng tích ngôi đình cổ và sử liệu Hán Nôm quý hiếm.',
      relics: [
        { no: '01', n: 'Chân tảng kê cột', d: '04 chân đá xanh hình tròn, chu vi 60 cm, nguyên bản từ đình cổ.' },
        { no: '02', n: 'Chuông & chiêng', d: '02 quả chuông gang thời Nguyễn (TK XIX) và 01 chiêng đồng.' },
        { no: '03', n: 'Cuốn Thần tích', d: 'Chữ Hán Nôm trên giấy đỏ, 17 trang, hơn 2.700 chữ.' },
        { no: '04', n: 'Bản hoành phi', d: '6 chữ Hán sơn son thếp vàng “Cao Sơn quốc chủ đại vương”.' },
        { no: '05', n: 'Cây đại cổ thụ', d: '3 cây trước sân đình tuổi đời gần 300 năm.' },
        { no: '06', n: 'Giếng cổ', d: '02 giếng (giếng Đỉnh và giếng đồng làng dưới) vẫn được sử dụng.' }
      ],
      festivalDays: [
        { t: 'Lễ Khai hạ / Khai xuân', d: '6 tháng Giêng' },
        { t: 'Lễ Hạ điền (Vào hè)', d: '15 tháng 4 ÂL' },
        { t: 'Lễ Thượng điền (Ra hè)', d: '15 tháng 7 ÂL' },
        { t: 'Lễ Tạ thần', d: '15 tháng 11 ÂL' }
      ],
      festivalRite: 'Đình duy trì nếp “Tứ quý sự thần” (bốn mùa thờ thần). Độc đáo nhất là tục rước kiệu giao hảo: mùng 5 Tết rước Bà Chúa Mỹ Nương từ miếu Ao Sen về đình ngự vui khai xuân cùng các Thần Ông, sáng mùng 6 rước Bà trở về miếu. Lễ Thượng điền (15/7) mỗi hộ nhận một lá cờ ngũ sắc cán bằng cành cây Vạn Tuế của đình, mang về cắm ruộng để trừ sâu bệnh. Nghi lễ dùng hai đồng xu cổ xin đài âm dương.',
      festivalImg: festCover('ha-dat'),
      conservation: 'Khu vực bảo vệ I (vùng lõi) 225 m², khu vực bảo vệ II (vùng đệm) 607 m² — tổng 832 m². Di tích lưu giữ bản sắc văn hóa độc đáo của người Sán Dìu và ghi dấu hai cuộc kháng chiến của dân tộc.',
      gallery: sitePhotos['ha-dat'].gallery
    },

    'van-kim': {
      name: 'Chùa Vạn Kim', nameEn: 'Van Kim Pagoda (Thanh Am Tu)',
      rank: 'Di tích lịch sử cấp tỉnh',
      rankMeta: 'QĐ 1839/QĐ-UBND, 27/7/2015',
      worship: 'Phật giáo Đại thừa · Thờ Hậu · Thánh Mẫu',
      era: 'Thế kỷ XVIII (Hậu Lê)',
      location: 'Xóm Vạn Kim, xã Thành Công, tỉnh Thái Nguyên',
      distance: 'Phía Bắc & Tây giáp đồng ruộng',
      access: 'Chùa tọa lạc trên khu đất bằng phẳng, phía Bắc và Tây giáp đồng ruộng, phía Đông giáp khu dân cư — không gian thanh tĩnh, linh thiêng.',
      overview: 'Chùa Vạn Kim, khởi dựng từ thế kỷ XVIII, là trung tâm sinh hoạt Phật giáo và tín ngưỡng truyền thống của vùng đất Vạn Phái xưa. Chùa là nơi dung hòa 4 hệ thống tín ngưỡng: thờ Phật, thờ Hậu, thờ Thành hoàng (Đức Thánh Tam Giang) và thờ Mẫu. Nổi bật tại chùa là hệ thống 22 pho tượng Phật Bắc tông bài trí chuẩn mực tại Thượng điện và khối di sản Hán Nôm quý giá gồm 6 bia đá cổ, 4 sắc phong triều Nguyễn và Ngọc phả Đức Thánh Tam Giang (di chuyển từ Đình Vạn Kim sang). Chùa được xếp hạng Di tích lịch sử cấp tỉnh năm 2015.',
      facts: [
        { k: 'Xếp hạng', v: 'Cấp tỉnh · 2015' },
        { k: 'Niên đại', v: 'TK XVIII' },
        { k: 'Tượng Phật', v: '22 pho cổ' },
        { k: 'Tên chữ', v: 'Thanh Am Tự' }
      ],
      timeline: [
        { no: '1', year: 'Thế kỷ XVIII', text: 'Khởi dựng thời Hậu Lê — trung tâm thiết chế làng xã và sinh hoạt văn hóa tinh thần của cư dân Vạn Phái.' },
        { no: '2', year: 'Năm 1976', text: 'Nhân dân đóng góp kinh phí, ngày công trùng tu tôn tạo lớn lần thứ nhất.' },
        { no: '3', year: 'Năm 2010', text: 'Đại trùng tu gần nhất, tạo diện mạo khang trang như hiện nay.' }
      ],
      deitiesTitle: 'Thờ Phật & Thần tích họ Trương',
      altarImg: sitePhotos['van-kim'].altarImage,
      deitiesIntro: 'Chùa thờ Phật theo Đại thừa Bắc tông; đồng thời lưu giữ thần tích hai vị tướng họ Trương — Trương Hống và Trương Hát — thành hoàng của làng.',
      deities: [
        { no: '1', name: 'Hệ thống tượng Phật', huy: '22 pho cổ truyền', role: 'Phật giáo Đại thừa', story: 'Thờ Tam Thế Phật, Di Đà Tam Tôn, Thích Ca Mâu Ni, Tòa Cửu Long, Quan Thế Âm… theo thần điện Phật giáo Bắc tông truyền thống của người Việt.', hoa: 'Sắp xếp thành các lớp tại Thượng điện' },
        { no: '2', name: 'Trương Hống · Trương Hát', huy: 'Tuyển bá đại vương · Thượng đẳng thần', role: 'Thành hoàng làng', story: 'Con ông Trương Tự Như (Chu Mẫu, Quế Dương). TK VI giúp Lý Nam Đế và Triệu Việt Vương đánh quân Lương, lập nước Vạn Xuân. Giữ trọn trung nghĩa “bầy tôi trung không thờ hai vua”, hai ông tuẫn tiết nơi sông thác.', hoa: 'Âm phù bài thơ thần “Nam quốc sơn hà”' },
        { no: '3', name: 'Tín ngưỡng thờ Hậu', huy: 'Bầu Hậu · gửi giỗ', role: 'Tri ân tiền nhân', story: 'Chùa đặt bài vị thờ cúng các bậc tiền nhân có công đức đóng góp đất đai, tiền của xây dựng và trùng tu chùa qua các thời kỳ.', hoa: '9 trang ngọc phả Hán Nôm' }
      ],
      architecturePlan: 'Cấu trúc hiện nay là kết quả các đợt trùng tu 1976 và 2010, quay hướng Nam truyền thống. Quần thể gồm Tam quan, sân chùa lát gạch đỏ (~160 m²), chùa chính (Tiền đường dài 18 m rộng 5 m, Thượng điện 5×8 m) cùng Nhà bếp (90 m²) và Nhà thờ Mẫu (40 m²).',
      exterior: [
        { t: 'Tam quan xây gạch 3 cửa, có câu đối ca ngợi cảnh đẹp và công đức nhà Phật.' },
        { t: 'Sân chùa ~160 m² lát gạch đỏ, không gian thanh tĩnh.' },
        { t: 'Chùa chính quay hướng Nam theo quy chuẩn kiến trúc tâm linh.' }
      ],
      interior: [
        { t: 'Lớp cao nhất: bộ tượng Tam Thế (Quá khứ – Hiện tại – Vị lai).' },
        { t: 'Hàng thứ hai: Di Đà Tam Tôn (A Di Đà, Quán Thế Âm, Đại Thế Chí).' },
        { t: 'Lớp thứ ba & tư: Ngọc Hoàng – Nam Tào – Bắc Đẩu; Cửu Long – Đế Thích – Phạm Thiên.' },
        { t: 'Góc Thượng điện: Quan Âm Tống Tử và Quan Âm thiên thủ thiên nhãn.' }
      ],
      relicsIntro: 'Hệ thống 22 pho tượng cổ cùng khối tài liệu Hán Nôm (9 trang ngọc phả) và thư tịch đặt hậu là di sản vô giá, khẳng định niên đại lâu đời và cung cấp sử liệu khoa học về làng xã Vạn Phái.',
      relics: [
        { no: '01', n: '22 pho tượng Phật', d: 'Tạo tác theo lối truyền thống Bắc tông, sắp xếp thành các lớp tại Thượng điện.' },
        { no: '02', n: 'Tòa Cửu Long', d: 'Tượng Phật Thích Ca sơ sinh, hai bên Đế Thích và Phạm Thiên.' },
        { no: '03', n: 'Bộ Tam Thế', d: 'Tượng trưng cho sự trường tồn của Phật pháp ba đời.' },
        { no: '04', n: 'Ngọc phả Hán Nôm', d: '9 trang ngọc phả cùng thư tịch cổ ghi chép lịch sử làng xã qua các thời kỳ.' },
        { no: '05', n: 'Bia đá cổ', d: 'Các tấm bia ghi danh công đức, đặt hậu — chứng tích niên đại TK XVIII.' },
        { no: '06', n: 'Thần tích họ Trương', d: 'Văn bản thần tích Trương Hống – Trương Hát chuyển từ đình Vạn Kim về lưu giữ tại chùa.' }
      ],
      festivalDays: [
        { t: 'Lễ Thượng nguyên', d: 'Rằm tháng Giêng' },
        { t: 'Đại lễ Phật đản', d: 'Rằm tháng Tư' },
        { t: 'Lễ Vu Lan báo hiếu', d: 'Rằm tháng Bảy' }
      ],
      festivalRite: 'Hằng tháng vào ngày Sóc – Vọng (mùng Một, ngày Rằm), Ban Hộ tự và phật tử sắm hương hoa lễ chay đến chùa dâng hương, tụng kinh niệm Phật, cầu quốc thái dân an. Các đại lễ Thượng nguyên, Phật đản, Vu Lan được tổ chức trang nghiêm theo Phật lịch; dịp đầu xuân lồng ghép văn nghệ quần chúng và trò chơi dân gian trong khuôn viên chùa.',
      festivalImg: festCover('van-kim'),
      conservation: 'Khối di sản văn vật phong phú (22 pho tượng, tài liệu Hán Nôm) là chứng tích vật chất khẳng định lịch sử lâu đời; chùa là điểm đến quan trọng trong bản đồ du lịch tâm linh của tỉnh, hướng cộng đồng tới giá trị Chân – Thiện – Mỹ.',
      gallery: sitePhotos['van-kim'].gallery
    },

    'dinh-bia': {
      name: 'Đình Bìa', nameEn: 'Bia Communal House',
      rank: 'Di tích lịch sử cấp tỉnh',
      rankMeta: 'QĐ 3346/QĐ-UBND, 27/10/2021',
      worship: 'Tam vị Vương ông · Nhị vị Vua Bà',
      era: 'Thế kỷ XVIII (Hậu Lê)',
      location: 'Xóm Bìa, xã Thành Công, tỉnh Thái Nguyên',
      distance: 'Trên đỉnh đồi thoáng đãng',
      access: 'Đình tọa lạc trên đỉnh một ngọn đồi thoáng đãng tại xóm Bìa — địa bàn có tới 95% cư dân là đồng bào dân tộc Sán Dìu.',
      overview: 'Đình Bìa (Miếu Bìa) được xây dựng từ thế kỷ XVIII, là nơi thờ phụng Tam vị Vương ông (Cao Sơn, Tô Á, Tổng Bính) và Nhị vị Vua Bà có công giúp các danh tướng đánh giặc ngoại xâm. Đình từng bị máy bay Pháp ném bom phá hủy và được nhân dân phục dựng khang trang năm 2009. Di tích còn lưu giữ bát hương sứ cổ và chân kê cột bằng đá ráp. Nằm ở địa bàn có 95% là người Sán Dìu, đình là trung tâm sinh hoạt văn hóa độc đáo với Lễ hội chính vào ngày 12 tháng Chạp, nổi bật với giao lưu hát ví, hát Soọng cô. Đình được xếp hạng cấp tỉnh năm 2021.',
      facts: [
        { k: 'Xếp hạng', v: 'Cấp tỉnh · 2021' },
        { k: 'Niên đại', v: 'TK XVIII' },
        { k: 'Cộng đồng', v: '95% người Sán Dìu' },
        { k: 'Bảo vệ', v: '1.248,9 m²' }
      ],
      timeline: [
        { no: '1', year: 'TK XVIII – XIX', text: 'Khởi dựng thời Hậu Lê quy mô lớn: cột gỗ lim, 4 mái 4 đầu đao; tu sửa thời Nguyễn.' },
        { no: '2', year: '1947 – 1952', text: 'Xuống cấp do “tiêu thổ kháng chiến”; năm 1952 là nơi đóng quân của Xưởng công binh, sau bị máy bay Pháp ném bom phá hủy hoàn toàn.' },
        { no: '3', year: 'Năm 2009', text: 'Nhân dân xóm Bìa tự nguyện đóng góp phục dựng đình kiến trúc chữ “Nhất” (3 gian tiền tế), lợp ngói móc.' }
      ],
      deitiesTitle: 'Tam vị Vương ông & Nhị vị Vua Bà',
      altarImg: sitePhotos['dinh-bia'].altarImage,
      deitiesIntro: 'Các vị thần và nhân vật lịch sử có công bảo vệ giang sơn, “âm phù” giúp các danh tướng qua các triều Lý, Trần, Lê.',
      deities: [
        { no: '1', name: 'Cao Sơn Linh ứng Đại vương', huy: 'Cao Sơn Quý Minh tôn thần', role: 'Thượng đẳng thần', story: 'Âm phù giúp danh tướng Lý Thường Kiệt đánh tan quân Tống và Chiêm Thành (TK XI) khi ông đóng quân tại trang Thượng Vụ.', hoa: 'Sắc phong Khải Định thứ 9 (1924)' },
        { no: '2', name: 'Tô Á Đại vương (Cao Các)', huy: 'Bản cảnh Thành hoàng', role: 'Thần bản thổ', story: 'Cùng Tổng Bính là các Bản cảnh Thành hoàng có công khai hoang, che chở và lập nên vùng đất địa phương từ thuở sơ khai.', hoa: 'Phối thờ Nguyễn Thị Bà (Miếu Bà riêng)' },
        { no: '3', name: 'Nhị vị Vua Bà', huy: 'Công chúa Diên Bình & Thiều Dung', role: 'Vương phi Dương Tự Minh', role2: '', story: 'Hai công chúa nhà Lý (TK XII), vợ Phò mã lang Dương Tự Minh, hiển linh âm phù giúp Thượng tướng Trần Quang Khải đánh thắng giặc Nguyên Mông (TK XIII).', hoa: 'Linh Quang & Đương Giang Hiển ứng Hoàng Thái hậu' }
      ],
      architecturePlan: 'Ngôi đình hiện nay (phục dựng 2009) tọa lạc trên đỉnh đồi thoáng đãng, diện tích ~30 m², kiến trúc kiểu chữ “Nhất” gồm 3 gian tiền tế, không có hậu cung. Bộ vì kèo gỗ, mái lợp ngói móc, chính diện nhìn hướng Đông — hướng mặt trời, biểu trưng cho sự sinh sôi nảy nở.',
      exterior: [
        { t: 'Vị trí trên đỉnh đồi thoáng đãng, chính diện hướng Đông.' },
        { t: 'Kiến trúc chữ “Nhất”, mái lợp ngói móc hình chữ nhật.' },
        { t: 'Khu vực bảo vệ I rộng 500 m², bảo vệ II rộng 748,9 m².' }
      ],
      interior: [
        { t: 'Ba gian tiền tế, bộ vì kèo bằng gỗ, không có hậu cung.' },
        { t: 'Ban thờ Tam vị Vương ông và Nhị vị Vua Bà.' },
        { t: 'Đồ thờ tự giản dị mang nếp sống thuần hậu của đồng bào Sán Dìu.' }
      ],
      relicsIntro: 'Dù trải qua chiến tranh, đình vẫn giữ được một số hiện vật quý — bằng chứng vật chất xác định niên đại khởi dựng từ TK XVIII–XIX.',
      relics: [
        { no: '01', n: 'Bát hương sứ men lam', d: 'Hoa văn hình hoa chanh, lò gốm Chu Đậu/Bát Tràng phong cách nghệ thuật thời Lê (TK XVIII).' },
        { no: '02', n: 'Chân kê đá ráp', d: '02 chân hình tròn, chu vi 60 cm — dấu tích ngôi đình cổ quy mô lớn.' },
        { no: '03', n: 'Chuông gang & mõ', d: 'Khí tự cổ còn lưu giữ phục vụ nghi lễ.' },
        { no: '04', n: 'Ngói nam vảy cá', d: 'Cấu kiện mái cổ còn sót lại, phản ánh kỹ thuật lợp truyền thống.' }
      ],
      festivalDays: [
        { t: 'Đại lễ Hội làng', d: '12 tháng Chạp' },
        { t: 'Lễ Sóc – Vọng', d: 'Mùng 1 & Rằm' },
        { t: 'Lễ Hạ điền / Thượng điền', d: '1/4 · 1/7 ÂL' }
      ],
      festivalRite: 'Đại lễ hội làng ngày 12 tháng Chạp là kỳ hội lớn nhất: chuẩn bị oản, chuối, rượu, trầu cau, xôi gà; tế lễ trang nghiêm song song với hát ví — hát Soọng cô của người Sán Dìu và lễ mừng thọ các cụ cao tuổi. Theo Hương ước cổ 1942, đình xưa có lịch tiết dày đặc (Minh niên, Khai xuân, Thượng nguyên, Hội vật, Hạ điền, Thượng điền), nay được rút gọn ổn định vào 12 tháng Chạp.',
      festivalImg: festCover('dinh-bia'),
      conservation: 'Tổng diện tích khoanh vùng bảo vệ 1.248,9 m². Lễ hội là dịp ôn lại lịch sử hào hùng, giáo dục lòng yêu nước, gìn giữ thuần phong mỹ tục và thắt chặt đoàn kết đồng bào các dân tộc địa phương.',
      gallery: sitePhotos['dinh-bia'].gallery
    },

    'xuan-duong': {
      name: 'Đình Xuân Dương', nameEn: 'Xuan Duong Communal House',
      rank: 'Di tích lịch sử cấp tỉnh',
      rankMeta: 'QĐ 2745/QĐ-UBND, 31/12/2025',
      worship: 'Tam vị Vua Ông · Nhị vị Vua Bà',
      era: 'Thế kỷ XVIII (Hậu Lê)',
      location: 'Xóm Xuân Hòa, xã Thành Công, tỉnh Thái Nguyên',
      distance: 'Vùng đất Thượng Vụ xưa',
      access: 'Sự tồn tại của đình gắn liền với lịch sử hình thành cộng đồng dân cư vùng đất Thượng Vụ xưa.',
      overview: 'Đình Xuân Dương (Đình Làng Ruồng) được khởi dựng từ thời Hậu Lê (thế kỷ XVIII). Nơi đây thờ phụng Tam vị Vua Ông (Cao Sơn, Cao Các, Thành hoàng) và Nhị vị Vua Bà có công giúp Thái úy Lý Thường Kiệt và Thượng tướng quân Trần Quang Khải đánh giặc. Đình từng bị phá hủy năm 1953 và được phục dựng kiên cố vào năm 2025. Di tích lưu giữ nhiều bát hương cổ, 3 bản sao sắc phong triều Nguyễn và hồ sơ Thần tích chữ Hán Nôm. Ngày Đại lệ hội làng lớn nhất diễn ra vào ngày 20 tháng 10 âm lịch. Đình được xếp hạng cấp tỉnh năm 2025.',
      facts: [
        { k: 'Xếp hạng', v: 'Cấp tỉnh · 2025' },
        { k: 'Niên đại', v: 'TK XVIII' },
        { k: 'Tên cổ', v: 'Đình Làng Ruồng' },
        { k: 'Diện tích', v: '100 m²' }
      ],
      timeline: [
        { no: '1', year: 'TK XVIII – XIX', text: 'Dựng thời Hậu Lê ngay sau khi lập làng: cột gỗ lim, 4 mái 4 đầu đao cong; tu sửa đầu thời Nguyễn.' },
        { no: '2', year: 'Năm 1953', text: 'Máy bay Pháp thả bom thiêu rụi hoàn toàn ngôi đình cổ, chỉ còn sót một số đồ thờ sành sứ.' },
        { no: '3', year: 'Năm 2025', text: 'Phục dựng kiên cố kiến trúc chữ “Đinh” (3 gian 2 chái nối hậu cung), mái ngói vảy rồng, vì kèo bê tông giả gỗ kẻ truyền – con chồng.' }
      ],
      deitiesTitle: 'Tam vị Vua Ông & Nhị vị Vua Bà',
      altarImg: sitePhotos['xuan-duong'].altarImage,
      deitiesIntro: 'Đình thờ 5 vị thần được ghi trong các đạo sắc phong và thần tích lưu tại Viện Thông tin Khoa học xã hội.',
      deities: [
        { no: '1', name: 'Cao Sơn Quý Minh Đại vương', huy: 'Thời Hùng Vương XVIII', role: 'Thượng đẳng thần', story: 'Tướng lĩnh thời Hùng Vương thứ XVIII, hiển linh âm phù cho Thái úy Lý Thường Kiệt đánh tan quân Tống, Chiêm Thành (TK XI) tại trang Thượng Vụ.', hoa: 'Sắc phong Duy Tân 1909, Khải Định 1924' },
        { no: '2', name: 'Cao Các Quý Minh Đại vương', huy: 'Thời Hùng Vương XVIII', role: 'Thượng đẳng thần', story: 'Cùng Cao Sơn Quý Minh hiển linh trợ giúp danh tướng nhà Lý, được các triều ban nhiều sắc phong Thượng đẳng thần.', hoa: 'Còn lưu bản sao sắc phong' },
        { no: '3', name: 'Bản cảnh Thành hoàng', huy: 'Thần bản thổ', role: 'Khai hoang lập làng', story: 'Vị thần bản thổ có công khai hoang, lập làng và bảo hộ cư dân xóm làng từ thuở sơ khai.', hoa: 'Tam vị Vua Ông' },
        { no: '4', name: 'Nhị vị Vua Bà', huy: 'Linh Quang & Đương Giang Hiển ứng Hoàng Thái hậu', role: 'Công chúa nhà Lý', story: 'Hai công chúa nhà Lý, con cháu vua Lý Nhân Tông, hiển linh giúp Thượng tướng Trần Quang Khải đánh thắng giặc Nguyên (TK XIII); được ban sắc phong thờ làm Thành hoàng.', hoa: 'Thờ làm Thành hoàng làng' }
      ],
      architecturePlan: 'Ngôi đình phục dựng năm 2025 trên diện tích 100 m², bố cục chữ “Đinh” quay hướng Nam, gồm 3 gian 2 chái tiền tế nối liền hậu cung. Bộ vì kèo bê tông cốt thép sơn giả gỗ kiểu “kẻ truyền – con chồng”, mái 4 đao cong lợp ngói vảy rồng.',
      exterior: [
        { t: 'Kiến trúc 4 mái với 4 đao cong vút, lợp ngói vảy rồng.' },
        { t: 'Chính diện quay hướng Nam theo quy chuẩn truyền thống.' },
        { t: 'Vì kèo bê tông giả gỗ kiểu “kẻ truyền – con chồng”.' }
      ],
      interior: [
        { t: 'Gian giữa đặt ban thờ cao 1,5 m.' },
        { t: 'Treo hoành phi “Thánh cung vạn tuế” và các câu đối ca ngợi công đức.' },
        { t: '3 gian 2 chái tiền tế nối liền hậu cung.' }
      ],
      relicsIntro: 'Đình lưu giữ hiện vật có giá trị lịch sử lâu đời cùng khối tài liệu Hán Nôm quý — minh chứng cho sự tồn tại liên tục của di tích.',
      relics: [
        { no: '01', n: 'Bát hương sành (TK XVIII)', d: 'Cuối thời Lê, trang trí đôi rồng chầu mặt trời — nghệ thuật gốm hơn 200 năm.' },
        { no: '02', n: 'Bát hương sứ (TK XIX)', d: '02 bát thời Nguyễn: một men da lươn và một sứ trắng.' },
        { no: '03', n: 'Hồ sơ Thần tích 1938', d: '4 trang tiếng Việt + 35 trang Hán Nôm, chép lại 2 bản thần tích sao từ 1739 (bản gốc Lê Hồng Đức 1472).' },
        { no: '04', n: '03 bản sao sắc phong', d: 'Duy Tân thứ 3 (1909) và Khải Định thứ 9 (1924) — danh hiệu Thượng đẳng thần Cao Sơn, Quý Minh.' },
        { no: '05', n: 'Hương ước 1942', d: 'Hương ước làng Thượng Vụ quy định lệ làng và nếp sống xưa.' }
      ],
      festivalDays: [
        { t: 'Ngày Đại lệ (Hội làng)', d: '20 tháng 10 ÂL' },
        { t: 'Lễ Khai xuân', d: '21–22 tháng Giêng' },
        { t: 'Lễ Sóc – Vọng', d: 'Mùng 1 & Rằm' }
      ],
      festivalRite: 'Ngày Đại lệ 20 tháng 10 âm lịch là hội lớn nhất, vui nhất năm: nhân dân tự nguyện góp tiền mua lợn, gà, đồ xôi dâng thánh rồi cùng thụ lộc, thắt chặt tình làng xóm. Lễ Khai xuân (21–22 tháng Giêng) cúng xôi gà, tổ chức hội làng, văn nghệ, trò chơi dân gian và mừng thọ người cao tuổi. Hằng tháng cử người luân phiên sửa lễ Sóc – Vọng dâng hương cầu bình an.',
      festivalImg: festCover('xuan-duong'),
      conservation: 'Di tích phục dựng theo Luật Di sản văn hóa số 45/2024/QH15 và kết quả khảo sát thực tế; lễ hội được duy trì nhằm giáo dục truyền thống yêu nước và gắn kết cộng đồng.',
      gallery: sitePhotos['xuan-duong'].gallery
    },

    'an-mien': {
      name: 'Đình An Miên', nameEn: 'An Mien Communal House',
      rank: 'Di tích lịch sử (đang hoàn thiện hồ sơ xếp hạng)',
      rankMeta: 'Hồ sơ xếp hạng đang hoàn thiện',
      worship: 'Tam vị Vương Ông · Nhị vị Vua Bà',
      era: 'Thế kỷ XVIII (Hậu Lê)',
      location: 'Xóm Tam An, xã Thành Công, tỉnh Thái Nguyên',
      distance: '~2 km vào xóm An Miên',
      access: 'Từ TP Thái Nguyên theo QL3 ~30 km đến ngã tư Phổ Yên, rẽ phải TL261 ~7 km đến UBND xã Thành Công, đi tiếp ~2 km vào xóm An Miên.',
      overview: 'Đình An Miên được khởi dựng từ thời Hậu Lê (thế kỷ XVIII), là nơi thờ phụng Tam vị Vương Ông (Cao Sơn, Quý Minh, Thành hoàng) và Nhị vị Vua Bà (Linh Quang, Đương Giang) có công bảo vệ đất nước. Bị phá hủy hoàn toàn trong kháng chiến chống Pháp, đình được nhân dân phục dựng lại khang trang vào năm 1998 theo kiến trúc chữ “Đinh”. Đình lưu giữ các bản thần tích cổ từ thế kỷ XV (sao lại thế kỷ XVIII), 3 bản sao sắc phong triều Nguyễn và các hiện vật như bia đá, chuông gang, ngai rồng. Lễ hội chính của đình diễn ra vào ngày 20 tháng 10 âm lịch.',
      facts: [
        { k: 'Phân loại', v: 'Di tích lịch sử' },
        { k: 'Niên đại', v: 'TK XVIII' },
        { k: 'Diện tích', v: '~577 m² thửa đất' },
        { k: 'Phục dựng', v: 'Năm 1998' }
      ],
      timeline: [
        { no: '1', year: 'TK XVIII – XIX', text: 'Khởi dựng thời Hậu Lê: đình gỗ lim 4 mái cong, biểu tượng làng cổ vùng thượng lưu sông Cầu; trùng tu lớn thời Nguyễn.' },
        { no: '2', year: '1945 – 1954', text: 'Bị “tiêu thổ kháng chiến” và bom đạn Pháp san phẳng; sau 1954 dựng tạm gian đình tranh tre nứa lá.' },
        { no: '3', year: 'Năm 1998 – nay', text: 'Nhân dân An Miên góp công đức và hàng ngàn ngày công phục dựng đình kiên cố, tường gạch mái ngói theo kiến trúc truyền thống.' }
      ],
      deitiesTitle: 'Tam vị Vương Ông & Nhị vị Vua Bà',
      altarImg: sitePhotos['an-mien'].altarImage,
      deitiesIntro: 'Theo Thần tích làng Thượng Vụ (kê khai 1938), đình thờ 5 vị tôn thần “âm phù” cho các tướng lĩnh đánh giặc cứu nước.',
      deities: [
        { no: '1', name: 'Cao Sơn & Cao Các Quý Minh', huy: 'Thượng đẳng thần', role: 'Âm phù Lý Thường Kiệt', story: 'Giúp Thái úy Lý Thường Kiệt đánh tan giặc Tống và Chiêm Thành (TK XI). Được ban sắc phong Thượng đẳng thần các năm Duy Tân 1909, Khải Định 1924.', hoa: '3 bản sao sắc phong triều Nguyễn' },
        { no: '2', name: 'Dương Tự Minh', huy: 'Phò mã lang', role: 'Danh tướng người Thái Nguyên', story: 'Danh tướng thời Lý có công dẹp giặc Đàm Hữu Lượng ở biên giới phía Bắc, được vua Lý gả hai công chúa Diên Bình (1127) và Thiều Dung (1144).', hoa: 'Niềm tự hào xứ Thái' },
        { no: '3', name: 'Nhị vị Hoàng Thái hậu', huy: 'Linh Quang & Đương Giang Hiển ứng', role: 'Vua Bà', story: 'Con cháu nhà Lý, hiển linh âm phù giúp tướng Trần Quang Khải đánh thắng giặc Nguyên (TK XIII).', hoa: 'Thờ làm Thành hoàng' }
      ],
      architecturePlan: 'Đình nguyên bản dựng đầu thời Nguyễn (TK XIX), phục dựng năm 1998. Kiến trúc kiểu chữ “Đinh”, quay hướng Nam, diện tích gần 30 m², gồm 1 gian 2 chái tiền tế nối hậu cung; mái ngói vảy rồng 4 đao cong, vì kèo gỗ kiểu “kẻ truyền – con chồng”. Quần thể còn có Miếu thờ Thành hoàng (1943) và giếng cổ chu vi ~3,5 m kè đáy bằng gỗ lim.',
      exterior: [
        { t: 'Kiến trúc 4 mái với 4 đao cong vút, lợp ngói vảy rồng, hướng Nam.' },
        { t: 'Miếu thờ Thành hoàng (dựng năm 1943) trong quần thể.' },
        { t: 'Giếng cổ chu vi ~3,5 m, tương truyền đáy kè bằng gỗ lim.' }
      ],
      interior: [
        { t: 'Một gian hai chái tiền tế nối liền hậu cung, vì kèo gỗ “kẻ truyền – con chồng”.' },
        { t: 'Ngai rồng cao 1 m sơn son thếp vàng, ghi tên 4 vị thần.' },
        { t: 'Hoành phi “Thánh cung vạn tuế”, đôi hạc đồng cao 2,5 m đứng trên lưng rùa.' }
      ],
      relicsIntro: 'Dù kiến trúc gỗ nguyên bản bị chiến tranh xóa sổ, đình bảo tồn cổ vật và tài liệu Hán Nôm có giá trị khoa học lịch sử đặc biệt — văn bản cung đình từ TK XV.',
      relics: [
        { no: '01', n: 'Bia Hậu bi ký', d: 'Cao 65 cm, rộng 40 cm; phong cách nghệ thuật thời Khải Định (1924), rồng chầu mặt nguyệt và cánh sen.' },
        { no: '02', n: 'Ngai rồng', d: 'Cao 1 m, ngang 80 cm, chạm trổ sơn son thếp vàng, ghi tên 4 vị thần.' },
        { no: '03', n: 'Đôi hạc đồng', d: 'Cao 2,5 m đứng trên lưng rùa cùng 4 bát hương sứ và mõ.' },
        { no: '04', n: 'Bản thần tích I', d: '“Lý Nhân Tông triều âm phù Tam vị Đại vương phả lục” — Nguyễn An phụng soạn 1472, sao lại 1739.' },
        { no: '05', n: 'Bản thần tích II', d: '“Trần Nhân Tông triều âm phù Nhị vị Hoàng Thái Hậu phả lục” — Nguyễn Bảo phụng soạn 1472, sao lại 1739.' },
        { no: '06', n: 'Hương ước 1942', d: 'Hương ước làng Thượng Vụ ghi chép phong tục, luật lệ và quy định tế tự.' }
      ],
      festivalDays: [
        { t: 'Đại lễ hội làng', d: '20 tháng 10 ÂL' },
        { t: 'Lễ Khai xuân', d: '16 tháng Giêng' },
        { t: 'Lễ Sóc – Vọng', d: 'Mùng 1 & Rằm' }
      ],
      festivalRite: 'Đại lễ hội làng ngày 20 tháng 10 âm lịch là ngày vui nhất: nhân dân đóng góp lợn, gà, xôi tế thần rồi thụ lộc. Phần lễ trang nghiêm đọc chúc văn ôn lại công đức Tam vị Vương Ông và Nhị vị Vua Bà; phần hội có trò chơi dân gian, giao lưu văn hóa Kinh – Sán Dìu và lễ mừng thọ các cụ cao niên. Lễ Khai xuân (16 tháng Giêng) cầu mưa thuận gió hòa; hằng tháng dâng hương lễ Sóc – Vọng.',
      festivalImg: festCover('an-mien'),
      conservation: 'Di tích là minh chứng cho các sự kiện chống ngoại xâm (Tống, Nguyên, Chiêm Thành) và hai cuộc kháng chiến chống Pháp, chống Mỹ; lưu giữ tư liệu Hán Nôm, thần tích, sắc phong — bồi đắp lòng tự hào dân tộc và truyền thống “Uống nước nhớ nguồn”. Hồ sơ xếp hạng đang được hoàn thiện.',
      gallery: sitePhotos['an-mien'].gallery
    }
  };
}

export function getThanhCongThemes() {
  // gallery[]: bộ ảnh cho Swiper slider trong card chủ đề.
  // Hiện tạm dùng ảnh đình/chùa/ban thờ có sẵn trên CDN; bạn có ảnh thật
  // (ẩm thực trung du, trang phục Sán Dìu, nghi lễ tín ngưỡng) thì thay URL.
  return [
    {
      id: 'hat-soong-co', color: '#9E3B2E', img: hatSoongCo1,
      gallery: [hatSoongCo3, hatSoongCo1, hatSoongCo2, ],
      vi: {
        tag: 'Nghệ thuật', title: 'Nghệ thuật hát Soọng cô', script: 'Soọng Cô Singing',
        desc: 'Làn điệu dân ca giao duyên đối đáp của người Sán Dìu, ca ngợi tình yêu, lao động và tổ tiên — vang lên rộn ràng nhất trong các kỳ hội làng tại Đình Bìa và Đình Hạ Đạt.',
        intro: 'Hát Soọng cô là di sản văn hóa phi vật thể của đồng bào Sán Dìu vùng đồi Na Lang, Thượng Vụ, Hạ Đạt — lối hát đối đáp nam nữ bằng tiếng Sán Dìu, được truyền giữ qua nhiều thế hệ và trình diễn trong các dịp lễ hội, cưới hỏi.',
        points: [
          { h: 'Lối hát đối đáp giao duyên', d: 'Nam nữ hát đối nhau theo lối ứng tác, ca từ mộc mạc bằng tiếng Sán Dìu, thường diễn ra trong các buổi gặp gỡ, hội hè.' },
          { h: 'Chủ đề tình yêu, lao động, tổ tiên', d: 'Lời ca ca ngợi tình yêu đôi lứa, công việc đồng áng nương rẫy và công đức tổ tiên, ông bà.' },
          { h: 'Vang trong lễ hội làng', d: 'Rộn ràng nhất tại các kỳ hội làng ở Đình Bìa và Đình Hạ Đạt — nơi cộng đồng Sán Dìu chiếm tới 95% dân cư.' },
          { h: 'Di sản được gìn giữ', d: 'Được các nghệ nhân cao tuổi truyền dạy lại cho thế hệ trẻ nhằm bảo tồn bản sắc văn hóa Sán Dìu.' }
        ]
      },
      en: {
        tag: 'Art', title: 'Soọng Cô singing', script: 'Soọng Cô Singing',
        desc: 'A San Diu call-and-response folk song praising love, labour and ancestors — resounding most vividly at the village festivals of Bia and Ha Dat communal houses.',
        intro: 'Soọng cô singing is an intangible cultural heritage of the San Diu people of the Na Lang, Thuong Vu and Ha Dat hills — a male-female call-and-response tradition sung in the San Diu language, passed down through generations and performed at festivals and weddings.',
        points: [
          { h: 'Call-and-response courtship singing', d: 'Men and women improvise verses back and forth in plain San Diu language, typically at gatherings and festivals.' },
          { h: 'Themes of love, labour and ancestors', d: 'Lyrics praise romantic love, farm and field labour, and the merits of ancestors and forebears.' },
          { h: 'Ringing through village festivals', d: 'Most vivid at the village festivals of Bia and Ha Dat communal houses, where San Diu residents make up up to 95% of the population.' },
          { h: 'A heritage kept alive', d: 'Passed on by senior artisans to younger generations to preserve San Diu cultural identity.' }
        ]
      }
    },
    {
      id: 'van-hoa', color: '#2C4A5E', img: banSacSanDiu1,
      gallery: [banSacSanDiu1, banSacSanDiu2, banSacSanDiu3],
      vi: {
        tag: 'Văn hóa', title: 'Bản sắc Sán Dìu', script: 'San Diu Culture',
        desc: 'Đồng bào Sán Dìu vùng đồi Na Lang, Thượng Vụ gìn giữ nếp nhà, áo chàm và hát Soọng cô — di sản văn hóa phi vật thể giao duyên đối đáp.',
        intro: 'Đồng bào Sán Dìu chiếm tỉ lệ lớn ở Thành Công — riêng xóm Hạ Đạt và xóm Bìa tới 95% — cư trú lâu đời trên các đồi gò Na Lang, Thượng Vụ, Hạ Đạt và lưu giữ kho tàng văn hóa đặc thù từ nếp nhà, trang phục đến dân ca, phong tục.',
        points: [
          { h: 'Địa bàn cư trú', d: 'Tập trung tại các xóm đồi Na Lang, Thượng Vụ, Hạ Đạt; xóm Hạ Đạt và xóm Bìa có tới 95% là người Sán Dìu.' },
          { h: 'Nếp nhà & áo chàm', d: 'Gìn giữ nếp nhà truyền thống, trang phục áo chàm mộc mạc và các nghi lễ vòng đời.' },
          { h: 'Hát Soọng cô', d: 'Di sản văn hóa phi vật thể — lối hát đối đáp giao duyên ca ngợi tình yêu, lao động và tổ tiên.' },
          { h: 'Ngân vang trong lễ hội', d: 'Làn điệu Soọng cô rộn ràng nhất trong các kỳ hội làng tại Đình Bìa và Đình Hạ Đạt.' }
        ]
      },
      en: {
        tag: 'Culture', title: 'San Diu identity', script: 'San Diu Culture',
        desc: 'San Diu people of Na Lang and Thuong Vu hills preserve their stilt houses, indigo dress and Soong co — an intangible call-and-response folk song.',
        intro: 'The San Diu make up a large share of Thanh Cong — up to 95% in Ha Dat and Bia hamlets — long settled on the Na Lang, Thuong Vu and Ha Dat hills, keeping a distinctive cultural treasure from dwellings and dress to folk song and customs.',
        points: [
          { h: 'Where they live', d: 'Concentrated in the hill hamlets of Na Lang, Thuong Vu and Ha Dat; Ha Dat and Bia hamlets are up to 95% San Diu.' },
          { h: 'Dwellings & indigo dress', d: 'Traditional homes, plain indigo robes and head-wraps, and life-cycle rites still kept.' },
          { h: 'Soong co folk song', d: 'An intangible cultural heritage — call-and-response courtship singing praising love, labour and ancestors.' },
          { h: 'Ringing through festivals', d: 'Soong co resounds most vividly at the village festivals of Bia and Ha Dat communal houses.' }
        ]
      }
    },
    {
      id: 'tin-nguong', color: '#B5532A', img: tinNguong1,
      gallery: [tinNguong2, tinNguong1, tinNguong3],
      vi: {
        tag: 'Tín ngưỡng', title: 'Tín ngưỡng hòa quyện', script: 'Blended Faiths',
        desc: 'Hội tụ thờ nhân thần, thờ Phật và thờ Mẫu; nhiều chùa theo mô hình “Tiền Phật hậu Mẫu”, gắn truyền thuyết âm phù Lý Thường Kiệt, Trần Quang Khải.',
        intro: 'Thành Công là nơi hội tụ, giao thoa nhiều lớp tín ngưỡng — thờ nhân thần, thờ Phật và thờ Mẫu — tạo nên đời sống tâm linh phong phú của vùng đất cổ tổng Thượng Vụ.',
        points: [
          { h: 'Mô hình “Tiền Phật hậu Mẫu”', d: 'Thể hiện rõ tại Chùa Linh Phúc và Chùa Nguyễn Tân — triết lý Phật giáo hòa quyện tín ngưỡng thờ Mẫu tam phủ của người Việt.' },
          { h: 'Thờ nhân thần', d: 'Thờ Tam vị Thượng đẳng thần (Cao Sơn, Quý Minh, Tam Tư Quá Giang) cùng các vị Thành hoàng bản thổ.' },
          { h: 'Truyền thuyết “âm phù” danh tướng', d: 'Các thần được tin đã hiển linh giúp Lý Thường Kiệt phá Tống trên sông Cầu; Nhị vị Vua Bà âm phù Trần Quang Khải đánh Nguyên Mông.' },
          { h: 'Dương Tự Minh · Trương Hống, Trương Hát', d: 'Dương Tự Minh thờ cùng Nhị vị Vua Bà ở Đình Bìa, Xuân Dương, An Miên; Trương Hống – Trương Hát thờ ở Chùa Vạn Kim.' }
        ]
      },
      en: {
        tag: 'Beliefs', title: 'Blended faiths', script: 'Blended Faiths',
        desc: 'A meeting of hero, Buddhist and Mother-Goddess worship; many pagodas follow the “Buddha-front, Mother-rear” model tied to legends of divine aid.',
        intro: 'Thanh Cong is where several layers of belief meet and blend — hero worship, Buddhism and Mother-Goddess worship — forming the rich spiritual life of the ancient Thuong Vu canton.',
        points: [
          { h: '“Buddha-front, Mother-rear” model', d: 'Clearest at Linh Phuc and Nguyen Tan pagodas — Buddhist philosophy blended with the Vietnamese three-palace Mother-Goddess worship.' },
          { h: 'Hero worship', d: 'Veneration of the Three Superior Deities (Cao Son, Quy Minh, Tam Tu Qua Giang) and the local tutelary deities.' },
          { h: 'Legends of divine aid', d: 'The deities are believed to have aided Ly Thuong Kiet in defeating the Song on the Cau River; the Two Royal Ladies aided Tran Quang Khai against the Yuan-Mongols.' },
          { h: 'Duong Tu Minh · Truong Hong, Truong Hat', d: 'Duong Tu Minh is worshipped with the Two Royal Ladies at Bia, Xuan Duong and An Mien communal houses; Truong Hong – Truong Hat at Van Kim pagoda.' }
        ]
      }
    }
  ];
}
