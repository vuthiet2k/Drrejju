<script setup>
import { ref, computed, watch, shallowRef, onMounted, onBeforeUnmount } from "vue";
import { useThanhCongShared } from "../common/useThanhCongShared.js";
import { getThanhCongData } from "../common/thanhCongData.js";
import { loadTourForSite } from "../services/vr360Api.js";
import Image from "@/base/components/image/Image.vue";
import { Vr360ViewerYt } from "@/vr360-viewer-yt/index.js";
import overviewTourRaw from "../@data/xa_thanh_cong.json";

// Tour data + audio thuyết minh lấy từ VR360 Builder API
// (src/app_thanh_cong/services/vr360Api.js). Không bundle JSON/MP3 nữa —
// re-publish trên builder là app tự cập nhật, không cần chỉnh code.

const { t, lang, route } = useThanhCongShared();
const D = computed(() => getThanhCongData());
const L = (o) => o[lang.value];

// "Tour tổng" (bay tổng quan toàn xã, 9 POI ghim tới từng di tích) — xuất từ
// VR360 Builder, bundle local như file cấu hình (không qua API vì đây là tour
// cấp xã, không gắn với 1 site.id nào trong SITE_MAP).
const OVERVIEW_ID = "tong-quan";
const overviewFirstScene = overviewTourRaw?.data?.scenes?.[0];

// Điểm đang xem: ưu tiên ?diem=<id> (từ nút "Xem VR360" ở trang chi tiết,
// hoặc từ 1 POI trên chính tour tổng — xem onOverviewHotspotClick bên dưới);
// mặc định tour tổng nếu không có / id không hợp lệ.
const validId = (id) => id === OVERVIEW_ID || (!!id && D.value.sites.some((s) => s.id === id));
const vrId = ref(validId(route.query.diem) ? route.query.diem : OVERVIEW_ID);
watch(
  () => route.query.diem,
  (v) => { if (validId(v)) vrId.value = v; },
);

// Tour data theo site đang chọn. shallowRef vì payload lớn (nhiều scene/hotspot)
// — không cần reactive deep.
const tourData = shallowRef(null);
const tourLoading = ref(false);
const tourError = ref("");
const tourCacheBySite = new Map();

async function loadTour(siteId) {
  tourError.value = "";
  if (siteId === OVERVIEW_ID) {
    tourData.value = overviewTourRaw;
    tourLoading.value = false;
    return;
  }
  if (tourCacheBySite.has(siteId)) {
    tourData.value = tourCacheBySite.get(siteId);
    return;
  }
  tourLoading.value = true;
  tourData.value = null;
  const reqId = siteId;
  try {
    const result = await loadTourForSite(siteId);
    if (reqId !== vrId.value) return;
    const data = result?.data || null;
    tourCacheBySite.set(siteId, data);
    tourData.value = data;
  } catch (err) {
    if (reqId !== vrId.value) return;
    tourError.value = err?.message || "Không tải được VR360.";
    tourData.value = null;
  } finally {
    if (reqId === vrId.value) tourLoading.value = false;
  }
}

watch(vrId, (id) => { loadTour(id); }, { immediate: true });

// Audio thuyết minh: KHÔNG tự quản lý ở đây. Mỗi tour trong @data (và bản
// published trên builder) đã kèm `data.audio` (enabled + autoplay), core
// viewer tự nạp và phát sau intro, HUD cũng có sẵn nút bật/tắt — thêm một
// thẻ Audio riêng ở trang này sẽ phát chồng tiếng.

// Bấm 1 POI ghim địa danh (area_landmark) trên tour tổng → nhảy sang VR360
// của ĐÚNG di tích đó. Vr360ViewerLayout.vue emit("hotspot-click", hotspot,
// event) — 2 THAM SỐ RIÊNG, không gói trong { hotspot, event } — và
// Vr360ViewerYt.vue relay qua `@hotspot-click="$emit('hotspot-click',
// $event)"` (template shorthand chỉ chuyển tham số ĐẦU TIÊN) nên tới đây
// `hotspot` CHÍNH LÀ đối tượng hotspot, không phải payload bọc ngoài.
function onOverviewHotspotClick(hotspot) {
  // Field chuẩn hoá của VR360 Builder là `target_scene_id` (snake_case) —
  // kèm 2 fallback phòng hờ lỡ core đổi tên field trong tương lai.
  const targetId = hotspot?.target_scene_id || hotspot?.targetSceneId || hotspot?.target;
  if (targetId && D.value.sites.some((s) => s.id === targetId)) {
    vrId.value = targetId;
    return;
  }
  // Dữ liệu tour tổng (xa_thanh_cong.json) hiện CHƯA gán target cho cả 9
  // ghim di tích — field "target" là "" thật trong JSON (không phải lỗi
  // đọc field), cũng chính là lý do console log 9 dòng cảnh báo "Navigation
  // point ... targets a missing scene" mỗi lần mở tour. Tạm khớp theo TÊN
  // nhãn — đã kiểm tra label khớp CHÍNH XÁC tên tiếng Việt của cả 9 site
  // trong thanhCongData.js — cho tới khi builder xuất bản lại có target
  // thật (nhánh trên sẽ tự ưu tiên dùng ngay khi có).
  // LƯU Ý: qua pipeline chuẩn hoá của core (pointSchema.js normalizePoint
  // → labelConfig), `hotspot.label` KHÔNG phải chuỗi thô mà là object
  // { text: "..." } — phải đọc .text trước, String() trực tiếp object này
  // ra "[object Object]" chứ không phải tên thật.
  const label = String(hotspot?.label?.text || hotspot?.label || "").trim();
  if (!label) return;
  const bySite = D.value.sites.find((s) => s.vi.n === label || s.en.n === label);
  if (bySite) vrId.value = bySite.id;
}

const vrCurrent = computed(() => {
  if (vrId.value === OVERVIEW_ID) {
    return {
      id: OVERVIEW_ID,
      name: lang.value === "vi" ? "Tổng quan Xã Thành Công" : "Thanh Cong overview",
      type: lang.value === "vi" ? "Bay tổng quan" : "Aerial flyover",
      desc:
        lang.value === "vi"
          ? "Bay tổng quan toàn xã Thành Công — bấm vào từng điểm ghim để mở VR360 chi tiết của di tích đó."
          : "An aerial flyover of Thanh Cong commune — click a pinned landmark to open that site's detailed VR360 tour.",
      tour: tourData.value,
    };
  }
  const site = D.value.sites.find((s) => s.id === vrId.value) || D.value.sites[0];
  return {
    id: site.id,
    name: L(site).n,
    type: L(site).t,
    desc: L(site).d,
    tour: tourData.value,
  };
});

// Category dùng để lọc danh sách (chip hàng dưới, kiểu Youtube) — key lấy
// theo nhãn tiếng Việt cố định (s.vi.t) để không đổi khi chuyển ngôn ngữ,
// label hiển thị theo ngôn ngữ hiện tại.
const OVERVIEW_CATEGORY = "overview";
const activeCategory = ref("all");

const vrCategories = computed(() => {
  const seen = new Map();
  D.value.sites.forEach((s) => {
    if (!seen.has(s.vi.t)) seen.set(s.vi.t, L(s).t);
  });
  return [
    { key: "all", label: lang.value === "vi" ? "Tất cả" : "All" },
    { key: OVERVIEW_CATEGORY, label: lang.value === "vi" ? "Flycam toàn cảnh" : "Aerial flyover" },
    ...Array.from(seen, ([key, label]) => ({ key, label })),
  ];
});

function pickCategory(key) { activeCategory.value = key; }

const vrList = computed(() => [
  {
    id: OVERVIEW_ID,
    name: lang.value === "vi" ? "Tổng quan Xã Thành Công" : "Thanh Cong overview",
    type: lang.value === "vi" ? "Bay tổng quan" : "Aerial flyover",
    category: OVERVIEW_CATEGORY,
    image: overviewFirstScene?.thumb || overviewFirstScene?.image || "",
    onClick: () => { vrId.value = OVERVIEW_ID; },
    active: vrId.value === OVERVIEW_ID,
  },
  ...D.value.sites.map((s) => ({
    id: s.id,
    name: L(s).n,
    type: L(s).t,
    category: s.vi.t,
    image: s.image || "",
    onClick: () => { vrId.value = s.id; },
    active: vrId.value === s.id,
  })),
]);

const filteredVrList = computed(() =>
  activeCategory.value === "all"
    ? vrList.value
    : vrList.value.filter((v) => v.category === activeCategory.value),
);

// Khoá chiều cao cột phải (danh sách) đúng bằng chiều cao thực của cột
// trái (player + info) — CSS Grid stretch không đủ vì hàng auto-size lấy
// theo item TỰ NHIÊN cao nhất (danh sách 10 mục dễ cao hơn video), nên
// tự đo bằng ResizeObserver thay vì chỉ dựa vào align-items:stretch.
// Media query ≤1023px (layout xếp chồng) ghi đè height:auto !important.
const playerColEl = ref(null);
const listColHeight = ref(null);
let playerColObserver = null;
onMounted(() => {
  if (playerColEl.value && typeof ResizeObserver !== "undefined") {
    playerColObserver = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect?.height;
      if (h) listColHeight.value = Math.round(h);
    });
    playerColObserver.observe(playerColEl.value);
  }
});
onBeforeUnmount(() => { playerColObserver?.disconnect(); });
</script>

<template>
  <main class="scvr-main">
    <div class="scvr-grid">
      <!-- ── LEFT: player + info (như khung video Youtube) ── -->
      <section ref="playerColEl" class="scvr-player-col">
        <!-- Khung player 16:9 — .tour-viewer-page cần chiều cao xác định,
             aspect-ratio cấp cho nó qua chiều rộng cột trái. -->
        <div class="scvr-player">
          <template v-if="vrCurrent.tour">
            <Vr360ViewerYt
              :key="vrId"
              :tour="vrCurrent.tour"
              :options="{ autoRotate: true }"
              @hotspot-click="onOverviewHotspotClick"
            />
          </template>
          <template v-else>
            <div class="scvr-placeholder">
              <div class="scvr-placeholder-lines"></div>
              <div class="scvr-placeholder-inner">
                <span class="scvr-eyebrow">VR 360°</span>
                <h3>{{ vrCurrent.name }}</h3>
                <div v-if="tourLoading" class="scvr-status">Đang tải VR360…</div>
                <div v-else-if="tourError" class="scvr-status err">{{ tourError }}</div>
                <div v-else class="scvr-status muted">[panorama 360 — chưa xuất bản]</div>
                <div class="scvr-hint">
                  <span class="scvr-orb">↔</span>{{ t.vrDragHint }}
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Info block dưới player: tiêu đề + chip + mô tả (giống Youtube) -->
        <div class="scvr-info">
          <h1 class="scvr-title">{{ vrCurrent.name }}</h1>
          <div class="scvr-meta">
            <span class="scvr-chip live">
              <span class="scvr-dot">
                <span class="scvr-ping"></span><span class="scvr-core"></span>
              </span>
              {{ lang === 'vi' ? 'Đang xem' : 'Live' }}
            </span>
            <span class="scvr-chip">{{ vrCurrent.type }}</span>
            <span class="scvr-chip gold">360°</span>
          </div>
          <p class="scvr-desc">{{ vrCurrent.desc }}</p>
        </div>
      </section>

      <!-- ── RIGHT: danh sách địa điểm dạng list (giống "Up next" của Youtube) ── -->
      <aside
        class="scvr-list-col"
        :style="listColHeight ? { height: listColHeight + 'px' } : null"
      >
        <div class="scvr-list-head">
          {{ lang === 'vi' ? 'Các điểm VR360 khác' : 'More VR360 places' }}
        </div>
        <div class="scvr-list">
          <button
            v-for="v in filteredVrList"
            :key="v.id"
            :class="['scvr-item', { active: v.active }]"
            @click="v.onClick"
          >
            <div class="scvr-thumb">
              <Image :src="v.image" fallback="logo" class="scvr-thumb-img" />
              <span class="scvr-thumb-tag">360°</span>
              <span v-if="v.active" class="scvr-thumb-live">
                <span class="scvr-dot">
                  <span class="scvr-ping"></span><span class="scvr-core"></span>
                </span>
                {{ lang === 'vi' ? 'Đang xem' : 'Live' }}
              </span>
            </div>
            <div class="scvr-item-body">
              <h4>{{ v.name }}</h4>
              <p>{{ v.type }}</p>
            </div>
          </button>
        </div>

        <!-- Chip lọc theo loại hình — hàng dưới cùng, kiểu tag filter Youtube -->
        <div class="scvr-filter-row">
          <button
            v-for="c in vrCategories"
            :key="c.key"
            type="button"
            :class="['scvr-filter-chip', { active: activeCategory === c.key }]"
            @click="pickCategory(c.key)"
          >
            {{ c.label }}
          </button>
        </div>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.scvr-main {
  /* Cùng khung với header/footer (1180) — mép trong luôn thẳng hàng.
     1180 vừa đủ để player 16:9 (~740×416) + sidebar 340px kiểu Youtube. */
  max-width: 1180px;
  margin: 0 auto;
  padding: clamp(16px, 2vw, 24px) clamp(16px, 4vw, 40px);
  animation: scIn .4s ease both;
}
/* ── Grid 2 cột (Youtube layout) ── */
/* Không dùng align-items:stretch — CSS Grid auto-size hàng theo item TỰ
   NHIÊN cao nhất (danh sách 10 điểm dễ cao hơn video), nên stretch sẽ kéo
   cả 2 cột theo chiều cao danh sách thay vì theo video. Chiều cao cột
   phải được khoá bằng JS (ResizeObserver, xem script) đúng bằng cột trái,
   phần dư cuộn nội bộ qua .scvr-list. */
.scvr-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  align-items: start;
}
@media (max-width: 1279px) {
  .scvr-grid { grid-template-columns: minmax(0, 1fr) 300px; gap: 16px; }
}
@media (max-width: 1023px) {
  .scvr-grid { grid-template-columns: 1fr; gap: 16px; }
}

/* ── Cột trái: player ── */
.scvr-player-col { min-width: 0; }
.scvr-player {
  position: relative;
  width: 100%;
  /* 16:9 quá thấp so với chiều rộng cột — cột list bên phải bị khoá theo
     chiều cao này (xem ResizeObserver ở script) nên thừa khoảng trống bên
     dưới danh sách. Ưu tiên khung cao gần dọc (9:16); max-height chặn lại
     ở mức VỪA PHẢI (không dùng 78vh) — nếu để player cao gần hết viewport,
     con trỏ chuột luôn nằm trên video khi cuộn, mà panorama viewer dùng
     wheel để zoom (preventDefault) nên "nuốt" mất thao tác cuộn trang,
     tạo cảm giác cả trang không scroll được. 60vh vẫn chừa đủ chỗ (info
     bên dưới + lề trang) để con trỏ có vùng cuộn trang bình thường. */
  aspect-ratio: 9 / 16;
  max-height: min(60vh, 720px);
  border-radius: 12px;
  overflow: hidden;
  border: 3px solid #2C4A5E;
  background: #0B1620;
}
/* Vr360ViewerLayout cần height:100% — parent đã có chiều cao qua aspect-ratio */
.scvr-player :deep(.tour-viewer-page) { height: 100%; }
/* Mobile: bỏ aspect-ratio (16:9 quá thấp trên màn hẹp), đặt chiều cao cố
   định theo viewport. Canvas panorama có touch-action:none (bắt buộc, để
   kéo tay xoay 360°) — nghĩa là MỌI thao tác chạm bắt đầu trên video đều
   bị chặn cuộn trang mặc định. Từng để 53vh (2/3 × 80vh) vẫn còn quá lớn:
   video chiếm gần hết màn hình khiến hầu hết thao tác vuốt của người dùng
   rơi trúng video → cảm giác cả trang không cuộn được. Hạ xuống 40vh để
   luôn còn vùng đủ rộng (info bên dưới, lề trang) cho ngón tay vuốt cuộn
   ngoài video. */
@media (max-width: 640px) {
  .scvr-player {
    aspect-ratio: auto;
    height: 40vh;
  }
}

/* Placeholder khi chưa có tour / đang tải / lỗi */
.scvr-placeholder {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 50%, #3A5468 0%, #21323E 70%, #172530 100%);
}
.scvr-placeholder-lines {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(90deg, rgba(231, 197, 107, .06) 0 2px, transparent 2px 60px);
}
.scvr-placeholder-inner {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: rgba(246, 236, 215, .9); gap: 14px; text-align: center; padding: 20px;
}
.scvr-eyebrow {
  font-size: 13px; letter-spacing: 3px; text-transform: uppercase; color: #E7C56B;
}
.scvr-placeholder-inner h3 {
  font-family: 'Oswald', sans-serif;
  font-size: clamp(22px, 3vw, 32px); margin: 0;
}
.scvr-status { font-family: monospace; font-size: 12px; color: rgba(246, 236, 215, .7); }
.scvr-status.err { color: #F87171; }
.scvr-status.muted { font-size: 11px; color: rgba(246, 236, 215, .5); }
.scvr-hint {
  display: flex; align-items: center; gap: 10px;
  color: rgba(246, 236, 215, .7); font-size: 13px;
}
.scvr-orb { animation: orbHint 2.4s ease-in-out infinite; display: inline-block; }

/* Info dưới player */
.scvr-info { padding: 16px 4px 0; }
.scvr-title {
  font-family: 'Oswald', sans-serif; font-weight: 700;
  font-size: clamp(20px, 2.4vw, 26px);
  margin: 0 0 10px; color: #2A2018;
}
.scvr-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.scvr-chip {
  display: inline-flex; align-items: center; gap: 6px;
  background: #FBF5E8; border: 1px solid #D8C5A2; color: #5A4A39;
  font-size: 12px; padding: 4px 10px; border-radius: 999px;
  font-family: 'Roboto Condensed', sans-serif; letter-spacing: .5px;
}
.scvr-chip.gold { background: #2C4A5E; color: #E7C56B; border-color: #2C4A5E; font-weight: 700; }
.scvr-chip.live {
  background: rgba(23, 37, 48, .9); color: #4ADE80;
  border-color: rgba(74, 222, 128, .55); font-weight: 700;
  text-transform: uppercase; font-size: 11px; letter-spacing: 1px;
}
.scvr-dot {
  position: relative; display: inline-flex; align-items: center; justify-content: center;
  width: 8px; height: 8px; flex: none;
}
.scvr-ping {
  position: absolute; width: 8px; height: 8px; border-radius: 50%;
  background: #4ADE80; opacity: .55; animation: vrLivePing 1.8s ease-out infinite;
}
.scvr-core {
  position: relative; width: 6px; height: 6px; border-radius: 50%; background: #22C55E;
}
.scvr-desc {
  color: #5A4A39; font-size: 14px; line-height: 1.65; margin: 0;
  max-width: 68ch;
}

/* ── Cột phải: list "Up next" ── */
.scvr-list-col {
  background: #FBF5E8;
  border: 1px solid #E4D6B5;
  border-radius: 12px;
  padding: 6px;
  /* Header của LayoutThanhCong sticky ~71px — chừa cho khỏi bị che.
     Chiều cao (style inline, xem script — ResizeObserver đo cột trái)
     khoá đúng bằng cột trái; overflow:hidden để phần list bên trong tự
     cuộn đúng trong khoảng đó thay vì đẩy khung cao thêm. */
  position: sticky;
  top: 84px;
  display: flex; flex-direction: column;
  overflow: hidden;
  min-width: 0;
}
@media (max-width: 1023px) {
  /* Layout xếp chồng 1 cột — bỏ khoá chiều cao, để danh sách trôi tự
     nhiên theo nội dung (đè cả style inline nhờ !important). */
  .scvr-list-col { position: static; overflow: visible; height: auto !important; }
}
.scvr-list-head {
  padding: 12px 12px 10px;
  font-family: 'Oswald', sans-serif; font-weight: 700;
  font-size: 16px; color: #2A2018; letter-spacing: .3px;
  border-bottom: 1px solid rgba(216, 197, 162, .55);
  margin-bottom: 4px;
}
.scvr-list {
  display: flex; flex-direction: column; gap: 4px;
  padding: 4px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #D8C5A2 transparent;
}
.scvr-list::-webkit-scrollbar { width: 6px; }
.scvr-list::-webkit-scrollbar-thumb { background: #D8C5A2; border-radius: 3px; }

.scvr-item {
  display: grid;
  grid-template-columns: 168px 1fr;
  gap: 10px;
  align-items: stretch;
  padding: 6px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: background .15s ease, border-color .15s ease;
  font: inherit;
}
.scvr-item:hover { background: #F6ECD7; }
.scvr-item.active { background: #2C4A5E; border-color: #E7C56B; }
.scvr-item.active .scvr-item-body h4 { color: #F6ECD7; }
.scvr-item.active .scvr-item-body p { color: rgba(246, 236, 215, .72); }

.scvr-thumb {
  position: relative; width: 100%; aspect-ratio: 16 / 10;
  border-radius: 6px; overflow: hidden; background: #21323E;
}
.scvr-thumb-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover;
}
.scvr-thumb-tag {
  position: absolute; left: 6px; top: 5px;
  background: rgba(44, 74, 94, .9); color: #E7C56B;
  font-size: 9px; font-weight: 600; padding: 2px 6px; border-radius: 3px;
}
.scvr-thumb-live {
  position: absolute; right: 5px; top: 5px;
  display: flex; align-items: center; gap: 5px;
  background: rgba(23, 37, 48, .82); backdrop-filter: blur(4px);
  border: 1px solid rgba(74, 222, 128, .55); border-radius: 999px;
  padding: 3px 8px 3px 6px;
  font-family: 'Roboto Condensed', sans-serif; font-size: 9px; font-weight: 700;
  letter-spacing: 1px; text-transform: uppercase; color: #4ADE80;
}

.scvr-item-body {
  display: flex; flex-direction: column; justify-content: center;
  min-width: 0; padding: 2px 4px 2px 0;
}
.scvr-item-body h4 {
  font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 14px;
  margin: 0 0 4px; color: #2A2018; line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}
.scvr-item-body p {
  font-size: 12px; color: #8A7355; margin: 0;
  font-family: 'Roboto Condensed', sans-serif; letter-spacing: .3px;
}

/* ── Hàng chip lọc theo loại hình (Tất cả / Flycam / Đình / Đền / Chùa...) ── */
.scvr-filter-row {
  flex: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 6px 4px;
  border-top: 1px solid rgba(216, 197, 162, .55);
  overflow-x: auto;
  scrollbar-width: none;
}
.scvr-filter-row::-webkit-scrollbar { display: none; }
.scvr-filter-chip {
  flex: none;
  background: #F0E4C7;
  border: 1px solid #E0D0AE;
  color: #6A5A46;
  font-family: 'Roboto Condensed', sans-serif;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  border-radius: 999px;
  padding: 5px 12px;
  cursor: pointer;
  transition: background .15s ease, color .15s ease, border-color .15s ease;
}
.scvr-filter-chip:hover { background: #E7D6AE; }
.scvr-filter-chip.active { background: #9E3B2E; border-color: #9E3B2E; color: #F6ECD7; }

@keyframes vrLivePing {
  0%   { transform: scale(1);   opacity: .55; }
  70%  { transform: scale(2.6); opacity: 0; }
  100% { transform: scale(2.6); opacity: 0; }
}
</style>
