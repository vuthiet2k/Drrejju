<script setup>
// Panel chi tiết 1 điểm di tích — dùng chung cho MapThanhCong.vue (marker
// panel) và Model3DThanhCong.vue (side panel), để 2 màn hình có ĐÚNG CÙNG
// 1 cấu trúc: gallery ảnh + đếm trang, tên, hàng nút hành động (grid),
// QR, các dòng liên hệ (địa chỉ/điện thoại/website/facebook), rồi "Giới
// thiệu" + mô tả dài. Tự chủ hoàn toàn theo `siteId` — chỉ cần 1 prop.
//
// Toàn bộ dữ liệu lấy từ nguồn thật đã có sẵn trong app (không bịa):
//   - getThanhCongDetailsData()[siteId] → location/rank/overview/gallery
//   - site.images / site.image (thanhCongData.sites) → fallback gallery
//   - Điện thoại/Website/Facebook: bộ dữ liệu hiện KHÔNG có các trường này
//     cho di tích Xã Thành Công → hiển thị "---" (đúng quy ước của chính
//     tham chiếu khi trường trống), không suy diễn số liệu giả.
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { useThanhCongShared } from "../common/useThanhCongShared.js";
import { getThanhCongData, getThanhCongDetailsData } from "../common/thanhCongData.js";
import { buildPageQrUrl, generateQrDataUrl } from "../common/qrCode.js";
import { loadNarrationUrlForSite, VR360_SITE_MAP } from "../services/vr360Api.js";
import Image from "@/base/components/image/Image.vue";

const props = defineProps({
  siteId: { type: String, default: "" },
  // Model3DThanhCong.vue nhúng panel cố định (không có khái niệm "đóng");
  // MapThanhCong.vue thì có nút ✕ ở khung ảnh để đóng panel bên phải.
  closable: { type: Boolean, default: false },
  // Nút "3D" điều hướng sang /mo-hinh-3d — vô nghĩa khi panel đang được
  // nhúng NGAY TRONG trang đó (Model3DThanhCong.vue truyền false).
  showModel3dButton: { type: Boolean, default: true },
});
const emit = defineEmits(["close"]);

const { t, lang, openDetail, openVr, open3d } = useThanhCongShared();
const L = (o) => o[lang.value];

const site = computed(() => getThanhCongData().sites.find((s) => s.id === props.siteId) || null);
const dd = computed(() => getThanhCongDetailsData()[props.siteId] || null);

const name = computed(() => dd.value?.name || (site.value ? L(site.value).n : ""));
const altName = computed(() => dd.value?.nameEn || site.value?.en?.n || "");
const typeLabel = computed(() => (site.value ? L(site.value).t : ""));
const location = computed(() => dd.value?.location || "");
const rank = computed(() => dd.value?.rank || "");
const overview = computed(() => dd.value?.overview || (site.value ? L(site.value).d : ""));
const qrCaption = computed(() => (rank.value ? `${rank.value} “${name.value}”` : name.value));

// ---- Gallery: dd.gallery (nhiều ảnh thật, có chú thích) ưu tiên hơn vì
// phong phú hơn; fallback site.images; fallback cuối site.image đơn. ----
const galleryImages = computed(() => {
  const fromGallery = (dd.value?.gallery || []).map((g) => g.image).filter(Boolean);
  if (fromGallery.length) return fromGallery;
  if (site.value?.images?.length) return site.value.images;
  return site.value?.image ? [site.value.image] : [];
});
const galleryIndex = ref(0);
watch(() => props.siteId, () => { galleryIndex.value = 0; });
function prevImage() {
  const n = galleryImages.value.length;
  if (n) galleryIndex.value = (galleryIndex.value - 1 + n) % n;
}
function nextImage() {
  const n = galleryImages.value.length;
  if (n) galleryIndex.value = (galleryIndex.value + 1) % n;
}

// ---- Lightbox — bấm vào ảnh gallery để xem full màn hình, dùng chung
// galleryIndex/prevImage/nextImage với khung ảnh nhỏ ở trên. ----
const lightboxOpen = ref(false);
function openLightbox() {
  if (galleryImages.value.length) lightboxOpen.value = true;
}
function closeLightbox() {
  lightboxOpen.value = false;
}
function onLightboxKey(e) {
  if (!lightboxOpen.value) return;
  if (e.key === "Escape") closeLightbox();
  else if (e.key === "ArrowLeft") prevImage();
  else if (e.key === "ArrowRight") nextImage();
}
watch(lightboxOpen, (on) => {
  if (typeof document === "undefined") return;
  if (on) {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onLightboxKey);
  } else {
    document.body.style.overflow = "";
    window.removeEventListener("keydown", onLightboxKey);
  }
});
watch(() => props.siteId, () => { lightboxOpen.value = false; });

// ---- Toạ độ → link Google Map (mở xem vị trí) — site.ll lưu [lng, lat]. ----
const googleMapsUrl = computed(() => {
  const ll = site.value?.ll;
  if (!ll || ll.length < 2) return "";
  return `https://www.google.com/maps/search/?api=1&query=${ll[1]},${ll[0]}`;
});

// ---- QR — luôn trỏ tới trang chi tiết chính thức của di tích (đúng nội
// dung dù đang mở từ Bản đồ hay Mô hình 3D). ----
const qrDataUrl = ref("");
watch(
  () => props.siteId,
  async (id) => {
    qrDataUrl.value = id ? await generateQrDataUrl(buildPageQrUrl({ fullPath: "/di-tich/" + id })) : "";
  },
  { immediate: true },
);

// ---- Audio thuyết minh — cùng nguồn với HeritageDetail.vue (trường `audio`
// trong dữ liệu tour VR360 của site), chỉ nút play/pause (không thanh tiến
// trình) để gọn trong panel. ----
const audioEl = typeof Audio !== "undefined" ? new Audio() : null;
if (audioEl) audioEl.preload = "none";
const audioSrc = ref("");
const audioPlaying = ref(false);
const hasAudio = computed(() => !!VR360_SITE_MAP[props.siteId]);
if (audioEl) {
  audioEl.addEventListener("play", () => { audioPlaying.value = true; });
  audioEl.addEventListener("pause", () => { audioPlaying.value = false; });
  audioEl.addEventListener("ended", () => { audioPlaying.value = false; });
}
function resetAudio() {
  audioSrc.value = "";
  if (audioEl) { audioEl.pause(); audioEl.removeAttribute("src"); }
  audioPlaying.value = false;
}
async function toggleAudio() {
  if (!audioEl) return;
  if (audioSrc.value) {
    if (audioEl.paused) audioEl.play().catch(() => {});
    else audioEl.pause();
    return;
  }
  const id = props.siteId;
  if (!VR360_SITE_MAP[id]) return;
  try {
    const url = await loadNarrationUrlForSite(id);
    if (id !== props.siteId) return; // đã đổi điểm chọn khác trong lúc tải
    if (!url) return;
    audioSrc.value = url;
    audioEl.src = url;
    audioEl.play().catch(() => {});
  } catch (e) { /* không có audio cho điểm này */ }
}
watch(() => props.siteId, () => resetAudio());
onBeforeUnmount(() => {
  if (audioEl) { audioEl.pause(); audioEl.removeAttribute("src"); }
  if (typeof document !== "undefined") {
    document.body.style.overflow = "";
    window.removeEventListener("keydown", onLightboxKey);
  }
});

// ---- Handler điều hướng — factory nhận id, phải tính lại theo siteId hiện tại. ----
const goDetail = computed(() => openDetail(props.siteId));
const goVr = computed(() => openVr(props.siteId));
const go3d = computed(() => open3d(props.siteId));
</script>

<template>
  <div v-if="site" class="sdp">
    <!-- Gallery ảnh + đếm trang -->
    <div class="sdp-gallery">
      <Image
        v-if="galleryImages[galleryIndex]"
        :src="galleryImages[galleryIndex]"
        fallback="logo"
        loading="eager"
        fetchpriority="high"
        class="sdp-gallery__img"
        role="button"
        tabindex="0"
        aria-label="Xem ảnh lớn"
        @click="openLightbox"
        @keydown.enter="openLightbox"
        @keydown.space.prevent="openLightbox"
      />
      <button
        v-if="closable"
        type="button"
        class="sdp-gallery__close"
        :title="t.mapClose"
        @click="emit('close')"
      >✕</button>
      <template v-if="galleryImages.length > 1">
        <button type="button" class="sdp-gallery__nav sdp-gallery__nav--prev" aria-label="Ảnh trước" @click="prevImage">‹</button>
        <button type="button" class="sdp-gallery__nav sdp-gallery__nav--next" aria-label="Ảnh sau" @click="nextImage">›</button>
        <span class="sdp-gallery__count">{{ galleryIndex + 1 }} / {{ galleryImages.length }}</span>
      </template>
      <span class="sdp-gallery__type">{{ typeLabel }}</span>
    </div>

    <div class="sdp-body">
      <h3 class="sdp-name">{{ name }}</h3>
      <div v-if="altName" class="sdp-alt-name">{{ altName }}</div>

      <!-- Hàng nút hành động — grid, không phụ thuộc hover -->
      <div class="sdp-actions">
        <a v-if="googleMapsUrl" :href="googleMapsUrl" target="_blank" rel="noopener" class="sdp-action">
          <span class="sdp-action__ico" style="background:rgba(44,74,94,.12)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#2C4A5E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></svg>
          </span>
          <span class="sdp-action__label">{{ t.mapBtnGoogleMap }}</span>
        </a>
        <button v-if="hasAudio" type="button" class="sdp-action" @click="toggleAudio">
          <span class="sdp-action__ico" style="background:rgba(184,143,55,.15)">
            <svg v-if="!audioPlaying" viewBox="0 0 24 24" width="18" height="18" fill="#B98F37"><path d="M8 5v14l11-7z" /></svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="#B98F37"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
          </span>
          <span class="sdp-action__label">{{ audioPlaying ? t.mapBtnAudioPause : t.mapBtnAudio }}</span>
        </button>
        <button type="button" class="sdp-action" @click="goVr">
          <span class="sdp-action__ico" style="background:#2C4A5E">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#E7C56B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="9" ry="4" /><path d="M3 12h18" /></svg>
          </span>
          <span class="sdp-action__label">{{ t.mapBtnVr }}</span>
        </button>
        <button v-if="site.d3 && showModel3dButton" type="button" class="sdp-action" @click="go3d">
          <span class="sdp-action__ico" style="background:rgba(158,59,46,.1)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#9E3B2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 8-9-5-9 5 9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>
          </span>
          <span class="sdp-action__label">{{ t.mapBtn3d }}</span>
        </button>
        <button type="button" class="sdp-action" @click="goDetail">
          <span class="sdp-action__ico" style="background:#9E3B2E">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F6ECD7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" /><circle cx="12" cy="12" r="3" /></svg>
          </span>
          <span class="sdp-action__label">{{ t.mapBtnDetail }}</span>
        </button>
      </div>

      <!-- QR trang chi tiết -->
      <div v-if="qrDataUrl" class="sdp-qr">
        <img :src="qrDataUrl" class="sdp-qr__img" alt="QR" />
        <p class="sdp-qr__cap">{{ qrCaption }}</p>
      </div>

      <!-- Địa chỉ — chỉ hiện khi có dữ liệu thật (bỏ điện thoại/website/
           facebook vì bộ dữ liệu hiện chưa có các trường này). -->
      <div v-if="location" class="sdp-rows">
        <div class="sdp-row">
          <span class="sdp-row__ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></svg>
          </span>
          <span>{{ location }}</span>
        </div>
      </div>

      <!-- Giới thiệu -->
      <h4 class="sdp-sub-h">{{ t.themeOverview }}:</h4>
      <p v-if="overview" class="sdp-desc">{{ overview }}</p>
    </div>

    <!-- LIGHTBOX: bấm vào ảnh gallery để xem full màn hình. Teleport ra
         <body> để thoát mọi containing-block/stacking context của panel
         cha (aside nhúng trong Model3DThanhCong.vue, marker panel trong
         MapThanhCong.vue...). -->
    <Teleport to="body">
      <Transition name="sdp-lb">
        <div
          v-if="lightboxOpen"
          class="sdp-lightbox"
          role="dialog"
          aria-modal="true"
          :aria-label="name || 'Xem ảnh'"
          @click.self="closeLightbox"
        >
          <button class="sdp-lightbox__close" type="button" aria-label="Đóng" @click="closeLightbox">×</button>
          <button
            v-if="galleryImages.length > 1"
            class="sdp-lightbox__nav sdp-lightbox__nav--prev"
            type="button"
            aria-label="Ảnh trước"
            @click.stop="prevImage"
          >‹</button>
          <button
            v-if="galleryImages.length > 1"
            class="sdp-lightbox__nav sdp-lightbox__nav--next"
            type="button"
            aria-label="Ảnh sau"
            @click.stop="nextImage"
          >›</button>
          <figure class="sdp-lightbox__stage" @click.stop>
            <div class="sdp-lightbox__frame">
              <Image :src="galleryImages[galleryIndex]" fallback="logo" loading="eager" fetchpriority="high" class="sdp-lightbox__img" />
            </div>
            <figcaption v-if="galleryImages.length > 1" class="sdp-lightbox__cap">
              {{ galleryIndex + 1 }} / {{ galleryImages.length }}
            </figcaption>
          </figure>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Nền sáng cố định — panel tự đóng gói giao diện riêng, không phụ thuộc
   nền của trang cha (Model3DThanhCong.vue nhúng vào 1 aside nền tối, chữ
   tối sẽ mất chữ nếu không có nền sáng riêng ở đây). */
.sdp { display: flex; flex-direction: column; background: #FBF5E8; }

.sdp-gallery {
  position: relative;
  height: 190px;
  flex: none;
  overflow: hidden;
  background: repeating-linear-gradient(45deg, #E3D2B0 0 12px, #DCC9A4 12px 24px);
}
.sdp-gallery__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; cursor: pointer; }
.sdp-gallery__close {
  position: absolute; top: 10px; right: 10px; z-index: 2;
  width: 30px; height: 30px; border-radius: 8px; border: none;
  background: rgba(23, 37, 48, .78); color: #E7C56B; font-size: 15px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.sdp-gallery__nav {
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 2;
  width: 28px; height: 28px; border-radius: 50%; border: none;
  background: rgba(23, 37, 48, .55); color: #F6ECD7; font-size: 18px; line-height: 1;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.sdp-gallery__nav--prev { left: 8px; }
.sdp-gallery__nav--next { right: 8px; }
.sdp-gallery__count {
  position: absolute; left: 50%; bottom: 8px; transform: translateX(-50%); z-index: 2;
  background: rgba(23, 37, 48, .68); color: #F6ECD7; font-size: 11px; font-weight: 600;
  padding: 2px 9px; border-radius: 999px; letter-spacing: .3px;
}
.sdp-gallery__type {
  position: absolute; left: 12px; bottom: 10px; z-index: 1;
  background: #9E3B2E; color: #F6ECD7; font-size: 11px; font-weight: 600;
  letter-spacing: 1px; text-transform: uppercase; padding: 4px 11px; border-radius: 4px;
}

.sdp-body { padding: 18px 20px 22px; }
.sdp-name {
  font-family: 'Playfair Display', serif; font-weight: 700; font-size: 21px;
  margin: 0 0 2px; color: #2A2018; line-height: 1.2;
}
.sdp-alt-name {
  font-family: 'Carattere', cursive; font-size: 20px; line-height: 1;
  color: #B07A2E; margin: 2px 0 14px;
}

/* Hàng nút hành động — CSS grid 4 cột, tự xuống hàng khi nhiều nút */
.sdp-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px 2px;
  margin-bottom: 16px;
}
.sdp-action {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  min-width: 0; background: none; border: none; padding: 2px; cursor: pointer;
  text-decoration: none; font-family: 'Roboto Condensed', sans-serif;
}
.sdp-action__ico {
  width: 42px; height: 42px; border-radius: 50%; flex: none;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 10px rgba(90, 70, 40, .18); transition: transform .15s ease;
}
.sdp-action:hover .sdp-action__ico { transform: scale(1.07); }
.sdp-action__label { font-size: 10.5px; font-weight: 600; color: #5A4A39; text-align: center; line-height: 1.2; }

/* QR */
.sdp-qr {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; margin-bottom: 16px;
  background: #FBF5E8; border: 1px solid #E0D0AE; border-radius: 10px;
}
.sdp-qr__img { width: 66px; height: 66px; flex: none; border-radius: 4px; background: #fff; }
.sdp-qr__cap { margin: 0; font-size: 12.5px; color: #6A5A46; line-height: 1.5; }

/* Địa chỉ / liên hệ */
.sdp-rows {
  display: flex; flex-direction: column; gap: 10px;
  padding: 14px 0; margin-bottom: 16px;
  border-top: 1px solid #EDE0C4; border-bottom: 1px solid #EDE0C4;
}
.sdp-row { display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; color: #2A2018; }
.sdp-row__ico { flex: none; color: #9E3B2E; margin-top: 1px; }

.sdp-sub-h {
  font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 15px;
  text-transform: uppercase; letter-spacing: .5px; color: #2A2018; margin: 0 0 8px;
}
.sdp-desc { font-size: 14px; color: #5A4A46; line-height: 1.7; margin: 0; text-wrap: pretty; }

/* ─── Lightbox modal (xem ảnh full màn hình) ───
   Cùng cấu trúc/hành vi với lightbox thư viện ảnh ở HeritageDetail.vue:
   overlay tối, ảnh contain vừa khung cố định, nav trái/phải, ESC/←/→ +
   click nền để đóng. */
.sdp-lightbox {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(20, 14, 10, .88);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(20px, 4vw, 48px);
  overflow-y: auto;
}
.sdp-lightbox__stage {
  width: 100%;
  max-width: min(1200px, 95vw);
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
  margin: auto 0;
}
.sdp-lightbox__frame {
  width: min(1200px, 92vw);
  height: min(72vh, 760px);
  border-radius: 8px;
  overflow: hidden;
  background: #1a120c;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .55);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}
.sdp-lightbox__img { width: 100%; height: 100%; object-fit: contain; display: block; }
.sdp-lightbox__cap {
  font-family: 'Oswald', sans-serif;
  font-size: 12px;
  letter-spacing: 1.5px;
  color: #e7c56b;
  text-transform: uppercase;
  margin: 0;
}
.sdp-lightbox__close,
.sdp-lightbox__nav {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(231, 197, 107, .32);
  background: rgba(20, 14, 10, .62);
  color: #f6ecd7;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: background .18s ease, transform .2s ease, border-color .18s ease;
}
.sdp-lightbox__close {
  top: clamp(12px, 2vw, 24px);
  right: clamp(12px, 2vw, 28px);
  width: 44px; height: 44px; font-size: 28px;
}
.sdp-lightbox__close:hover,
.sdp-lightbox__close:focus-visible {
  background: #9e3b2e;
  border-color: rgba(231, 197, 107, .6);
  transform: rotate(90deg);
  outline: none;
}
.sdp-lightbox__nav {
  top: 50%;
  transform: translateY(-50%);
  width: 52px; height: 52px; font-size: 34px; font-weight: 300;
}
.sdp-lightbox__nav:hover,
.sdp-lightbox__nav:focus-visible {
  background: rgba(158, 59, 46, .85);
  border-color: rgba(231, 197, 107, .6);
  outline: none;
}
.sdp-lightbox__nav--prev { left: clamp(10px, 2vw, 28px); }
.sdp-lightbox__nav--next { right: clamp(10px, 2vw, 28px); }
@media (max-width: 640px) {
  .sdp-lightbox__frame { width: min(100%, 92vw); height: min(58vh, 520px); }
  .sdp-lightbox__nav { width: 42px; height: 42px; font-size: 28px; }
  .sdp-lightbox__close { width: 40px; height: 40px; font-size: 24px; }
}

/* Transition đóng/mở lightbox */
.sdp-lb-enter-active,
.sdp-lb-leave-active { transition: opacity .22s ease; }
.sdp-lb-enter-active .sdp-lightbox__stage,
.sdp-lb-leave-active .sdp-lightbox__stage {
  transition: transform .28s cubic-bezier(.2,.7,.2,1), opacity .24s ease;
}
.sdp-lb-enter-from,
.sdp-lb-leave-to { opacity: 0; }
.sdp-lb-enter-from .sdp-lightbox__stage,
.sdp-lb-leave-to .sdp-lightbox__stage { opacity: 0; transform: scale(.94); }
</style>
