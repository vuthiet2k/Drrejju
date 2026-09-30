<script setup>
import { computed, ref, watch, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useThanhCongShared } from "../../common/useThanhCongShared.js";
import { getThanhCongData } from "../../common/thanhCongData.js";
import Image from "@/base/components/image/Image.vue";
import { buildPageQrUrl, generateQrDataUrl } from "../../common/qrCode.js";

const isFestival = true;
const route = useRoute();
const { t, lang } = useThanhCongShared();

// Nhãn hiển thị cho 3 nhóm lễ hội (khai-xuan / dai-le / nong-nghiep).
const GROUP_LABELS = {
  "khai-xuan": { vi: "Lễ hội Khai xuân", en: "Spring opening" },
  "dai-le": { vi: "Đại lễ hội làng", en: "Grand village festival" },
  "nong-nghiep": { vi: "Lễ tiết nông nghiệp", en: "Agricultural rites" },
};

// Nhiều tên lễ hội đã bắt đầu sẵn bằng đúng tên nhóm (badge phía trên hero
// cũng hiện tên nhóm đó) — ví dụ "Đại lễ Hội làng — Đình - Chùa Nguyễn Tân"
// lặp lại "Đại lễ hội làng" của badge. Cắt phần lặp khỏi tiêu đề hiển thị,
// giữ nguyên `name` gốc cho share/lightbox/meta.
function stripGroupPrefix(name, group) {
  const n = (name || "").trim();
  const g = (group || "").trim();
  if (!g || !n.toLowerCase().startsWith(g.toLowerCase())) return n;
  return n.slice(g.length).replace(/^[\s—-]+/, "") || n;
}

const fd = computed(() => {
  const D = getThanhCongData();
  const fRaw = D.festivals.find((f) => f.id === route.params.slug) || D.festivals[0];
  const fl = fRaw[lang.value];
  const relatedSites = (fRaw.siteIds || [])
    .map((id) => D.sites.find((s) => s.id === id))
    .filter(Boolean)
    .map((s) => ({ id: s.id, name: s[lang.value].n }));
  const group = GROUP_LABELS[fRaw.group]?.[lang.value] || "";
  // Thư viện ảnh giới hạn tối đa 6 ảnh (2 hàng x 3 cột đều nhau) — không hiện
  // "xem thêm" cho ảnh thứ 7 trở đi dù nguồn ảnh (festImgs) có nhiều hơn.
  const images = (fRaw.images?.length ? fRaw.images : (fRaw.img ? [fRaw.img] : [])).slice(0, 6);
  return {
    id: fRaw.id, name: fl.n, displayName: stripGroupPrefix(fl.n, group), nameEn: fRaw.en.n, season: fl.s, dateLabel: fl.dl, intro: Array.isArray(fl.intro) ? fl.intro : [fl.intro], acts: fl.acts, accent: fRaw.c,
    img: fRaw.img || "",
    images,
    relatedSites,
    group,
    calFull: fRaw.cal === "al" ? (lang.value === "vi" ? "Theo âm lịch" : "Lunar calendar") : (lang.value === "vi" ? "Theo dương lịch" : "Solar calendar"),
  };
});

// ─── Mã QR lễ hội: link tới chính trang chi tiết đang xem ─────────
const qrUrl = computed(() => buildPageQrUrl(route));
const qrDataUrl = ref("");
watch(
  qrUrl,
  async (url) => {
    qrDataUrl.value = url ? await generateQrDataUrl(url) : "";
  },
  { immediate: true },
);

// ─── Nút "Chia sẻ" — Web Share API, fallback copy link vào clipboard ─
const shareCopied = ref(false);
let shareCopiedTimer = null;
async function sharePage() {
  const url = qrUrl.value;
  if (!url) return;
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: fd.value.name, text: fd.value.intro.join(" "), url });
      return;
    } catch (e) {
      if (e?.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
  } catch (e) {
    window.prompt("Sao chép liên kết:", url);
    return;
  }
  shareCopied.value = true;
  clearTimeout(shareCopiedTimer);
  shareCopiedTimer = setTimeout(() => { shareCopied.value = false; }, 2000);
}

// ─── Lightbox thư viện ảnh (giống HeritageDetail.vue) ──────────────
const lightboxIdx = ref(-1);
const lightboxOn = computed(() => lightboxIdx.value >= 0 && !!fd.value.images?.[lightboxIdx.value]);
const lightboxItem = computed(() => (lightboxIdx.value >= 0 ? fd.value.images?.[lightboxIdx.value] : null));
const galleryLen = computed(() => fd.value.images?.length || 0);

function openLightbox(i) {
  if (!fd.value.images?.[i]) return;
  lightboxIdx.value = i;
}
function closeLightbox() {
  lightboxIdx.value = -1;
}
function stepLightbox(dir) {
  const gal = fd.value.images || [];
  const n = gal.length;
  if (!n) return;
  lightboxIdx.value = (lightboxIdx.value + dir + n) % n;
}
function onLightboxKey(e) {
  if (!lightboxOn.value) return;
  if (e.key === "Escape") closeLightbox();
  else if (e.key === "ArrowLeft") stepLightbox(-1);
  else if (e.key === "ArrowRight") stepLightbox(1);
}
watch(lightboxOn, (on) => {
  if (typeof document === "undefined") return;
  if (on) {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onLightboxKey);
  } else {
    document.body.style.overflow = "";
    window.removeEventListener("keydown", onLightboxKey);
  }
});
onUnmounted(() => {
  if (typeof document !== "undefined") {
    document.body.style.overflow = "";
    window.removeEventListener("keydown", onLightboxKey);
  }
  clearTimeout(shareCopiedTimer);
});
</script>

<template>
  <template v-if="isFestival">
  <main style="animation:scIn .4s ease both">
    <!-- HERO — cùng khung với HeritageDetail.vue (ảnh nền + gradient, badge,
         tiêu đề + tên phụ chữ thảo, dòng info, hàng nút), chỉ đổi sang đúng
         thông tin lễ hội đang có (group/season/dateLabel/calFull/nameEn). -->
    <section style="position:relative;min-height:clamp(340px,52vh,520px);display:flex;align-items:flex-end;overflow:hidden">
      <Image :src="fd.img" fallback="logo" loading="eager" fetchpriority="high" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(36,26,18,.15) 0%,rgba(36,26,18,.35) 45%,rgba(36,26,18,.88) 100%)"></div>
      <div style="position:relative;max-width:1180px;width:100%;margin:0 auto;padding:clamp(20px,4vw,52px) clamp(16px,4vw,40px)">
        <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(158,59,46,.92);color:#F6ECD7;font-size:11.5px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:999px;border:1px solid rgba(231,197,107,.5);margin-bottom:14px">★ {{ fd.group }}</div>
        <h1 style="font-family:'Oswald',sans-serif;font-weight:700;color:#F6ECD7;font-size:clamp(34px,6vw,64px);margin:0;line-height:1.18;text-transform:uppercase;letter-spacing:.03em">{{ fd.displayName }}</h1>
        <div style="font-family:'Carattere',cursive;color:#E7C56B;font-size:clamp(30px,4.5vw,46px);line-height:1;margin:10px 0 12px">{{ fd.nameEn }}</div>
        <div style="display:flex;align-items:center;gap:10px;color:rgba(246,236,215,.85);font-size:14.5px;flex-wrap:wrap"><span style="color:#E7C56B;line-height:1;display:inline-flex">◷</span>{{ fd.season }} · {{ fd.dateLabel }} · {{ fd.calFull }}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px">
          <button type="button" class="fest-share-btn fest-share-btn--hero" @click="sharePage" style="display:flex;align-items:center;gap:8px;background:rgba(246,236,215,.12);color:#F6ECD7;border:1px solid rgba(246,236,215,.4);border-radius:7px;padding:12px 22px;font-family:'Roboto Condensed',sans-serif;font-weight:600;font-size:14px;cursor:pointer">
            ↗ {{ shareCopied ? (lang === "vi" ? "Đã sao chép liên kết!" : "Link copied!") : (lang === "vi" ? "Chia sẻ" : "Share") }}
          </button>
        </div>
      </div>
    </section>

    <!-- LIÊN KẾT DI TÍCH + QR: chip "Di tích liên quan" bên trái (link sang
         trang di-tich/:slug), card QR + nút Chia sẻ (mobile) bên phải —
         cùng pattern với .sc-fact-strip trong HeritageDetail.vue. -->
    <section style="background:#2C4A5E">
      <div class="fest-fact-strip">
        <div class="fest-related">
          <span class="fest-related__label">{{ lang === "vi" ? "Di tích lịch sử - văn hóa cấp tỉnh" : "Provincial Historical - Cultural Heritage Site" }}</span>
          <div class="fest-related__list">
            <router-link
              v-for="rs in fd.relatedSites"
              :key="rs.id"
              :to="{ name: 'ThanhCongChiTietDiTich', params: { slug: rs.id } }"
              class="fest-related__item"
            >
              {{ rs.name }}
            </router-link>
          </div>
        </div>
        <!-- 1 card duy nhất: QR ở trên, nút Chia sẻ (mobile only) là hàng
             hành động bên dưới CÙNG card — y hệt .sc-fact-qr-card bên
             HeritageDetail.vue. -->
        <div class="fest-fact-qr-card">
          <a class="fest-qr-link" :href="qrUrl" target="_blank" rel="noopener" :title="qrUrl">
            <div class="fest-qr__icon">
              <img v-if="qrDataUrl" :src="qrDataUrl" :alt="`Mã QR — ${fd.name}`" style="width:100%;height:100%;object-fit:contain" />
            </div>
          </a>
          <button class="fest-share-btn fest-share-btn--qr" type="button" @click="sharePage">
            ↗ {{ shareCopied ? (lang === "vi" ? "Đã sao chép liên kết!" : "Link copied!") : (lang === "vi" ? "Chia sẻ" : "Share") }}
          </button>
        </div>
      </div>
    </section>

    <!-- INTRO -->
    <section style="max-width:1180px;margin:0 auto;padding:clamp(34px,5vw,56px) clamp(16px,4vw,40px) clamp(8px,2vw,18px)">
      <div style="display:flex;align-items:center;gap:12px;margin:0 0 16px"><span :style="`width:10px;height:10px;background:${fd.accent};transform:rotate(45deg);flex:none`"></span><h2 style="font-family:'Oswald',sans-serif;font-weight:700;font-size:clamp(22px,3vw,30px);color:#2A2018;margin:0;text-transform:uppercase;letter-spacing:.5px">{{ t.themeOverview }}</h2></div>
      <div class="fest-intro-grid">
        <div>
          <template v-for="(para, __p) in fd.intro" :key="__p">
            <p :style="`font-size:17px;line-height:1.7;color:#473A2C;text-align:justify;text-wrap:pretty;margin:0 0 ${__p === fd.intro.length - 1 ? '0' : '15px'}`">{{ para }}</p>
          </template>
        </div>
        <div class="fest-intro-media">
          <Image :src="fd.img" fallback="logo" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />
        </div>
      </div>
    </section>

    <!-- ACTIVITIES: card lưới 3 cột — tạm ẩn ảnh vì chưa có hình phù hợp. -->
    <section style="max-width:1180px;margin:0 auto;padding:clamp(8px,2vw,20px) clamp(16px,4vw,40px) clamp(20px,3vw,30px)">
      <div style="display:flex;align-items:center;gap:11px;margin:0 0 18px"><span style="width:9px;height:9px;background:#B98F37;transform:rotate(45deg);flex:none"></span><h3 style="font-family:'Oswald',sans-serif;font-weight:700;font-size:clamp(18px,2.4vw,24px);color:#2A2018;margin:0;text-transform:uppercase;letter-spacing:.5px">{{ t.festActs }}</h3></div>
      <div class="fest-acts-grid">
        <template v-for="(a, __i) in fd.acts" :key="__i">
          <div style="display:flex;flex-direction:column;gap:10px;background:#FBF5E8;border:1px solid #E0D0AE;border-radius:12px;padding:16px 18px;box-shadow:0 2px 12px rgba(90,70,40,.07)">
            <span style="flex:none;width:36px;height:36px;border-radius:50%;background:#9E3B2E;color:#E7C56B;display:flex;align-items:center;justify-content:center;font-family:'Oswald',sans-serif;font-weight:700;border:2px solid #E7C56B">{{ __i + 1 }}</span>
            <div style="display:flex;flex-direction:column;gap:6px;min-width:0">
              <h4 style="font-family:'Oswald',sans-serif;font-weight:600;font-size:17px;color:#2A2018;margin:0">{{ a.h }}</h4>
              <p style="font-size:14px;color:#6A5A46;margin:0;line-height:1.6;text-wrap:pretty">{{ a.d }}</p>
            </div>
          </div>
        </template>
      </div>
    </section>

    <!-- GALLERY: ảnh thật đóng gói theo lễ hội (ảnh hoạt động lễ hội + ảnh
         đình/đền liên quan) — click để mở lightbox xem full-size. -->
    <section style="max-width:1180px;margin:0 auto;padding:clamp(8px,2vw,16px) clamp(16px,4vw,40px) clamp(20px,3vw,30px)">
      <div style="display:flex;align-items:center;gap:11px;margin:0 0 18px"><span style="width:9px;height:9px;background:#9E3B2E;transform:rotate(45deg);flex:none"></span><h3 style="font-family:'Oswald',sans-serif;font-weight:700;font-size:clamp(18px,2.4vw,24px);color:#2A2018;margin:0;text-transform:uppercase;letter-spacing:.5px">{{ t.festGallery }}</h3></div>
      <div class="fest-gallery-grid">
        <template v-for="(im, __i) in fd.images" :key="__i">
          <div
            class="fest-gallery-item fest-gallery-item--clickable"
            role="button"
            tabindex="0"
            :aria-label="`Xem ảnh ${__i + 1}`"
            @click="openLightbox(__i)"
            @keydown.enter="openLightbox(__i)"
            @keydown.space.prevent="openLightbox(__i)"
          >
            <Image :src="im" fallback="logo" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />
            <span class="fest-gallery-item__zoom" aria-hidden="true">⤢</span>
          </div>
        </template>
      </div>
    </section>

    <!-- LIGHTBOX: xem ảnh lễ hội full-size — cùng cấu trúc/CSS với
         HeritageDetail.vue (Teleport ra <body> để thoát containing-block
         của <main> đang animation). -->
    <Teleport to="body">
    <Transition name="fest-lb">
      <div
        v-if="lightboxOn"
        class="fest-lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="fd.name"
        @click.self="closeLightbox"
      >
        <button class="fest-lightbox__close" type="button" aria-label="Đóng" @click="closeLightbox">×</button>
        <button v-if="galleryLen > 1" class="fest-lightbox__nav fest-lightbox__nav--prev" type="button" aria-label="Ảnh trước" @click.stop="stepLightbox(-1)">‹</button>
        <button v-if="galleryLen > 1" class="fest-lightbox__nav fest-lightbox__nav--next" type="button" aria-label="Ảnh sau" @click.stop="stepLightbox(1)">›</button>
        <figure class="fest-lightbox__stage" @click.stop>
          <div class="fest-lightbox__frame">
            <Image :src="lightboxItem" fallback="logo" loading="eager" fetchpriority="high" class="fest-lightbox__img" />
          </div>
          <figcaption class="fest-lightbox__cap">
            <span class="fest-lightbox__idx">{{ lightboxIdx + 1 }} / {{ galleryLen }}</span>
            <span>{{ fd.name }}</span>
          </figcaption>
        </figure>
      </div>
    </Transition>
    </Teleport>
  </main>
  </template>
</template>

<style scoped>
/* ─── Thanh "Di tích liên quan" + QR/Chia sẻ — cùng bố cục với
   .sc-fact-strip của HeritageDetail.vue, thu gọn cho trang lễ hội. ─── */
.fest-fact-strip {
  max-width: 1180px;
  margin: 0 auto;
  padding: 20px clamp(16px, 4vw, 40px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(14px, 2.2vw, 24px);
  flex-wrap: wrap;
}
.fest-related {
  flex: 1 1 320px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.fest-related__label {
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(231, 197, 107, 0.85);
  font-weight: 600;
}
.fest-related__list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
/* Item dạng "fact" — border-left + chữ Oswald, y hệt .sc-fact-list bên
   HeritageDetail.vue (không còn là chip/button, không ảnh). */
.fest-related__item {
  padding: 8px 18px;
  border-left: 2px solid rgba(231, 197, 107, 0.45);
  text-decoration: none;
  font-family: "Oswald", sans-serif;
  font-size: 18px;
  color: #f6ecd7;
  line-height: 1.2;
  transition: color 0.18s ease;
}
.fest-related__item:hover,
.fest-related__item:focus-visible {
  color: #e7c56b;
}
/* Card QR — y hệt .sc-fact-qr-card bên HeritageDetail.vue (nền tối bo góc,
   viền vàng mờ, đổ bóng + backdrop-blur). */
.fest-fact-qr-card {
  flex: 0 0 auto;
  align-self: center;
  max-width: 320px;
  background: rgba(20, 34, 44, 0.5);
  border: 1px solid rgba(231, 197, 107, 0.35);
  border-radius: 10px;
  padding: 10px 14px 10px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.fest-qr-link {
  display: flex;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.fest-qr-link:hover,
.fest-qr-link:focus-visible {
  transform: translateY(-1px);
}
.fest-qr__icon {
  width: 112px;
  height: 112px;
  flex: none;
  background: #fff;
  border: 1px solid rgba(231, 197, 107, 0.5);
  border-radius: 5px;
  position: relative;
  overflow: hidden;
  background-image: repeating-linear-gradient(45deg, #2a2018 0 2.5px, transparent 2.5px 5px),
    repeating-linear-gradient(135deg, #2a2018 0 2.5px, transparent 2.5px 5px);
  background-size: 7px 7px;
}
/* Nút "Chia sẻ": desktop nằm trong hero, mobile chuyển xuống làm hàng
   hành động bên dưới CÙNG card QR (.fest-fact-qr-card) — cùng pattern với
   .sc-share-btn bên HeritageDetail.vue. !important bắt buộc vì nút hero
   có style="display:flex" inline (specificity cao hơn class). */
.fest-share-btn--qr {
  display: none;
}
@media (max-width: 768px) {
  .fest-fact-strip {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  /* flex-basis 320px ở .fest-related là min-width cho layout HÀNG ngang;
     khi strip đổi sang flex-direction:column, basis đó lại áp vào CHIỀU
     CAO (min-height:320px) và tạo khoảng trống xanh rất lớn phía trên QR
     — ép về flex:none để item chỉ cao theo đúng nội dung của nó. */
  .fest-related {
    flex: none;
    width: 100%;
  }
  .fest-fact-qr-card {
    flex: 1 1 100%;
    max-width: none;
    align-self: center;
  }
  .fest-share-btn--hero {
    display: none !important;
  }
  .fest-share-btn--qr {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(246, 236, 215, 0.12);
    color: #f6ecd7;
    border: 1px solid rgba(246, 236, 215, 0.4);
    border-radius: 7px;
    padding: 9px 14px;
    font-family: "Roboto Condensed", sans-serif;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;
  }
}

/* ─── Giới thiệu: col-6/col-6 — văn bản bên trái, ảnh lễ hội bên phải
   (cùng bố cục với .sc-ov-grid của HeritageDetail.vue). Mobile xếp chồng. ─── */
.fest-intro-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(22px, 3vw, 40px);
  align-items: start;
}
.fest-intro-media {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e0d0ae;
  box-shadow: 0 2px 12px rgba(90, 70, 40, 0.07);
  background: repeating-linear-gradient(45deg, #e3d2b0 0 13px, #dcc9a4 13px 26px);
}
@media (max-width: 768px) {
  .fest-intro-grid {
    grid-template-columns: 1fr;
  }
}

/* ─── Activities: lưới thẻ 3 cột — tạm bỏ ảnh minh hoạ vì chưa có ảnh phù
   hợp; card đồng đều nhờ CSS grid (không phải flex + % width cố định). ─── */
.fest-acts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(16px, 2.4vw, 24px);
}
@media (max-width: 900px) {
  .fest-acts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 560px) {
  .fest-acts-grid {
    grid-template-columns: 1fr;
  }
}

/* ─── Gallery grid — 3 ảnh/hàng, click mở lightbox (copy từ
   HeritageDetail.vue, tiền tố fest- để tránh đụng độ). ─── */
.fest-gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.fest-gallery-item {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: 10px;
  overflow: hidden;
  background: repeating-linear-gradient(45deg, #e3d2b0 0 13px, #dcc9a4 13px 26px);
  border: 1px solid #e0d0ae;
}
.fest-gallery-item--clickable {
  cursor: zoom-in;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}
.fest-gallery-item--clickable:hover,
.fest-gallery-item--clickable:focus-visible {
  transform: translateY(-2px);
  border-color: #b98f37;
  box-shadow: 0 8px 22px rgba(90, 70, 40, 0.18);
  outline: none;
}
.fest-gallery-item--clickable:focus-visible {
  outline: 2px solid #e7c56b;
  outline-offset: 2px;
}
.fest-gallery-item__zoom {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(20, 14, 10, 0.55);
  color: #f6ecd7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  line-height: 1;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.85);
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: 2;
}
.fest-gallery-item--clickable:hover .fest-gallery-item__zoom,
.fest-gallery-item--clickable:focus-visible .fest-gallery-item__zoom {
  opacity: 1;
  transform: scale(1);
}
@media (max-width: 640px) {
  .fest-gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ─── Lightbox modal (copy từ HeritageDetail.vue) ─── */
.fest-lightbox {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(20, 14, 10, 0.88);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(20px, 4vw, 48px);
  overflow-y: auto;
}
.fest-lightbox__stage {
  width: 100%;
  max-width: min(1200px, 95vw);
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
  margin: auto 0;
}
.fest-lightbox__frame {
  width: min(1200px, 92vw);
  height: min(72vh, 760px);
  border-radius: 8px;
  overflow: hidden;
  background: #1a120c;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}
.fest-lightbox__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.fest-lightbox__cap {
  color: #f6ecd7;
  font-size: 14.5px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 700px;
  line-height: 1.5;
  margin: 0;
}
.fest-lightbox__idx {
  font-family: "Oswald", sans-serif;
  font-size: 12px;
  letter-spacing: 1.5px;
  color: #e7c56b;
  text-transform: uppercase;
}
.fest-lightbox__close,
.fest-lightbox__nav {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(231, 197, 107, 0.32);
  background: rgba(20, 14, 10, 0.62);
  color: #f6ecd7;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: background 0.18s ease, transform 0.2s ease, border-color 0.18s ease;
}
.fest-lightbox__close {
  top: clamp(12px, 2vw, 24px);
  right: clamp(12px, 2vw, 28px);
  width: 44px;
  height: 44px;
  font-size: 28px;
}
.fest-lightbox__close:hover,
.fest-lightbox__close:focus-visible {
  background: #9e3b2e;
  border-color: rgba(231, 197, 107, 0.6);
  transform: rotate(90deg);
  outline: none;
}
.fest-lightbox__nav {
  top: 50%;
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
  font-size: 34px;
  font-weight: 300;
}
.fest-lightbox__nav:hover,
.fest-lightbox__nav:focus-visible {
  background: rgba(158, 59, 46, 0.85);
  border-color: rgba(231, 197, 107, 0.6);
  outline: none;
}
.fest-lightbox__nav--prev {
  left: clamp(10px, 2vw, 28px);
}
.fest-lightbox__nav--next {
  right: clamp(10px, 2vw, 28px);
}
@media (max-width: 640px) {
  .fest-lightbox__frame {
    width: min(100%, 92vw);
    height: min(58vh, 520px);
  }
  .fest-lightbox__nav {
    width: 42px;
    height: 42px;
    font-size: 28px;
  }
  .fest-lightbox__close {
    width: 40px;
    height: 40px;
    font-size: 24px;
  }
  .fest-lightbox__cap {
    font-size: 13px;
  }
}
.fest-lb-enter-active,
.fest-lb-leave-active {
  transition: opacity 0.22s ease;
}
.fest-lb-enter-active .fest-lightbox__stage,
.fest-lb-leave-active .fest-lightbox__stage {
  transition: transform 0.28s cubic-bezier(0.2, 0.7, 0.2, 1), opacity 0.24s ease;
}
.fest-lb-enter-from,
.fest-lb-leave-to {
  opacity: 0;
}
.fest-lb-enter-from .fest-lightbox__stage,
.fest-lb-leave-to .fest-lightbox__stage {
  opacity: 0;
  transform: scale(0.94);
}
</style>
