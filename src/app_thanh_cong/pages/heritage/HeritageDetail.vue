<script setup>
import { computed, ref, watch, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useThanhCongShared } from "../../common/useThanhCongShared.js";
import {
  getThanhCongData,
  getThanhCongDetailsData,
  getThanhCongLandData,
} from "../../common/thanhCongData.js";
import Image from "@/base/components/image/Image.vue";
import { buildPageQrUrl, generateQrDataUrl } from "../../common/qrCode.js";
import { loadNarrationUrlForSite } from "../../services/vr360Api.js";

const isDetail = true;
const route = useRoute();
const { t, lang, openVr, open3d } = useThanhCongShared();
const L = (o) => o[lang.value];

const dd = computed(() => {
  const D = getThanhCongData();
  const dSite = D.sites.find((s) => s.id === route.params.slug) || D.sites[0];
  const DD = getThanhCongDetailsData();
  const rich = DD[dSite.id];
  const land = getThanhCongLandData()[dSite.id] || null;

  if (rich) {
    return {
      rich: true, basic: false, d3: dSite.d3, id: dSite.id,
      openVr: openVr(dSite.id), open3d: open3d(dSite.id), land, image: dSite.image || "",
      ...rich,
    };
  }
  return {
    rich: false, basic: true, d3: dSite.d3, id: dSite.id,
    openVr: openVr(dSite.id), open3d: open3d(dSite.id),
    name: L(dSite).n, nameEn: dSite.en.n, rank: "Điểm di tích trong cụm di sản",
    location: "Xã Thành Công, Thái Nguyên", worship: "—", era: "—", distance: "—",
    rankMeta: "Đang cập nhật hồ sơ", overview: L(dSite).d, image: dSite.image || "",
    facts: [
      { k: "Loại hình", v: L(dSite).t },
      { k: "VR360", v: "Có" },
      { k: "Mô hình 3D", v: dSite.d3 ? "Có" : "—" },
      { k: "Khu vực", v: "Xã Thành Công" },
    ],
    basicTitle: "Nội dung đang được cập nhật",
    basicNote:
      "Trang thông tin chi tiết cho điểm di tích này đang được biên soạn từ hồ sơ tư liệu. Trong thời gian chờ, bạn có thể tham quan không gian VR360 hoặc xem mô hình 3D (nếu có).",
  };
});

// ─── Audio thuyết minh — nghe ngay trên phần Tổng quan ────────────
// URL file thuyết minh lấy từ chính dữ liệu tour VR360 của site (trường
// `audio` trong @data/vr360-tour-*.json, hoặc bản published trên builder) —
// không bundle .mp3 vào app nữa. Phát qua đối tượng `Audio()` thuần (không
// dùng thẻ <audio>) — UI phát/tạm dừng + thanh tiến trình tự dựng bên dưới.
const audioSrc = ref("");
const audioEl = typeof Audio !== "undefined" ? new Audio() : null;
if (audioEl) audioEl.preload = "none";
const audioPlaying = ref(false);
const audioCurrentTime = ref(0);
const audioDuration = ref(0);
const audioProgress = computed(() =>
  audioDuration.value ? Math.min(100, (audioCurrentTime.value / audioDuration.value) * 100) : 0,
);

if (audioEl) {
  audioEl.addEventListener("timeupdate", () => { audioCurrentTime.value = audioEl.currentTime; });
  audioEl.addEventListener("loadedmetadata", () => { audioDuration.value = audioEl.duration || 0; });
  audioEl.addEventListener("play", () => { audioPlaying.value = true; });
  audioEl.addEventListener("pause", () => { audioPlaying.value = false; });
  audioEl.addEventListener("ended", () => { audioPlaying.value = false; audioCurrentTime.value = 0; });
}

watch(
  () => dd.value.id,
  async (id) => {
    audioSrc.value = "";
    if (audioEl) {
      audioEl.pause();
      audioEl.removeAttribute("src");
    }
    audioPlaying.value = false;
    audioCurrentTime.value = 0;
    audioDuration.value = 0;
    try {
      const url = await loadNarrationUrlForSite(id);
      if (id !== dd.value.id || !url) return;
      audioSrc.value = url;
      if (audioEl) audioEl.src = url;
    } catch (e) {
      /* không có audio cho site này — ẩn thanh audio */
    }
  },
  { immediate: true },
);

function toggleAudioPlay() {
  if (!audioEl || !audioSrc.value) return;
  if (audioEl.paused) audioEl.play().catch(() => {});
  else audioEl.pause();
}
function seekAudio(e) {
  if (!audioEl || !audioDuration.value) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
  audioEl.currentTime = ratio * audioDuration.value;
}
function formatAudioTime(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
onUnmounted(() => {
  if (audioEl) {
    audioEl.pause();
    audioEl.removeAttribute("src");
  }
});

// ─── Mã QR di tích: link tới chính trang chi tiết đang xem ────────
// Dùng route.fullPath (reactive) + window.location.origin → tự cập nhật
// khi chuyển sang di tích khác trong SPA, không cần load lại trang.
const qrUrl = computed(() => buildPageQrUrl(route));
const qrDataUrl = ref("");
watch(
  qrUrl,
  async (url) => {
    qrDataUrl.value = url ? await generateQrDataUrl(url) : "";
  },
  { immediate: true },
);

// ─── Nút "Chia sẻ" — ưu tiên Web Share API (mở hộp thoại chia sẻ native
// trên mobile/trình duyệt hỗ trợ); không có thì fallback copy link vào
// clipboard + hiện chữ xác nhận tạm thời trên chính nút. Dùng lại đúng
// qrUrl (link tuyệt đối tới trang hiện tại, đã build sẵn cho mã QR). ────
const shareCopied = ref(false);
let shareCopiedTimer = null;
async function sharePage() {
  const url = qrUrl.value;
  if (!url) return;
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: dd.value.name, text: dd.value.overview || dd.value.rank, url });
      return;
    } catch (e) {
      if (e?.name === "AbortError") return; // người dùng tự bấm Huỷ — không phải lỗi
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

// ─── Lightbox thư viện ảnh ────────────────────────────────────────
// idx = -1 → đóng; idx ≥ 0 → mở, trỏ vào dd.gallery[idx]. Nav vòng,
// tự bỏ qua item không có `image` (một số caption chưa gắn ảnh thật).
const lightboxIdx = ref(-1);
const lightboxOn = computed(
  () => lightboxIdx.value >= 0 && !!dd.value.gallery?.[lightboxIdx.value]?.image,
);
const lightboxItem = computed(() =>
  dd.value.gallery && lightboxIdx.value >= 0
    ? dd.value.gallery[lightboxIdx.value]
    : null,
);
const galleryLen = computed(() => dd.value.gallery?.length || 0);

function openLightbox(i) {
  if (!dd.value.gallery?.[i]?.image) return;
  lightboxIdx.value = i;
}
function closeLightbox() {
  lightboxIdx.value = -1;
}
function stepLightbox(dir) {
  const gal = dd.value.gallery || [];
  const n = gal.length;
  if (!n) return;
  let i = lightboxIdx.value;
  for (let k = 0; k < n; k++) {
    i = (i + dir + n) % n;
    if (gal[i]?.image) {
      lightboxIdx.value = i;
      return;
    }
  }
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
  <template v-if="isDetail">
  <main style="animation:scIn .4s ease both">
    <!-- HERO -->
    <section style="position:relative;min-height:clamp(340px,52vh,520px);display:flex;align-items:flex-end;overflow:hidden">
      <Image :src="dd.image" fallback="logo" loading="eager" fetchpriority="high" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(36,26,18,.15) 0%,rgba(36,26,18,.35) 45%,rgba(36,26,18,.88) 100%)"></div>
      <div style="position:relative;max-width:1180px;width:100%;margin:0 auto;padding:clamp(20px,4vw,52px) clamp(16px,4vw,40px)">
        <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(158,59,46,.92);color:#F6ECD7;font-size:11.5px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:999px;border:1px solid rgba(231,197,107,.5);margin-bottom:14px">★ {{ dd.rank }}</div>
        <h1 style="font-family:'Oswald',sans-serif;font-weight:700;color:#F6ECD7;font-size:clamp(34px,6vw,64px);margin:0;line-height:1.18;text-transform:uppercase;letter-spacing:.03em">{{ dd.name }}</h1>
        <div style="font-family:'Carattere',cursive;color:#E7C56B;font-size:clamp(30px,4.5vw,46px);line-height:1;margin:10px 0 12px">{{ dd.nameEn }}</div>
        <div style="display:flex;align-items:center;gap:10px;color:rgba(246,236,215,.92);font-size:15.5px;font-weight:500;flex-wrap:wrap"><span style="color:#E7C56B;line-height:1;display:inline-flex">⌖</span>{{ dd.location }}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px">
          <button @click="dd.openVr" style="display:flex;align-items:center;gap:8px;background:#2C4A5E;color:#E7C56B;border:1px solid rgba(231,197,107,.4);border-radius:7px;padding:12px 22px;font-family:'Roboto Condensed',sans-serif;font-weight:600;font-size:14px;cursor:pointer">◉ {{ t.openVr }}</button>
          <template v-if="dd.d3"><button @click="dd.open3d" style="display:flex;align-items:center;gap:8px;background:rgba(246,236,215,.95);color:#9E3B2E;border:none;border-radius:7px;padding:12px 22px;font-family:'Roboto Condensed',sans-serif;font-weight:600;font-size:14px;cursor:pointer">◈ {{ t.open3d }}</button></template>
          <button class="sc-share-btn sc-share-btn--hero" @click="sharePage" style="display:flex;align-items:center;gap:8px;background:rgba(246,236,215,.12);color:#F6ECD7;border:1px solid rgba(246,236,215,.4);border-radius:7px;padding:12px 22px;font-family:'Roboto Condensed',sans-serif;font-weight:600;font-size:14px;cursor:pointer">↗ {{ shareCopied ? 'Đã sao chép liên kết!' : 'Chia sẻ' }}</button>
        </div>
      </div>
    </section>

    <!-- FACT STRIP: facts trải ở phần lớn bên trái, QR đứng riêng bên phải
         (card sáng nổi trên nền xanh, cùng chiều cao facts). Mobile:
         QR xuống hàng dưới. -->
    <section style="background:#2C4A5E">
      <div class="sc-fact-strip">
        <div class="sc-fact-list">
          <template v-for="(f, __i) in dd.facts" :key="__i">
            <div style="padding:8px 18px;border-left:2px solid rgba(231,197,107,.45)">
              <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(231,197,107,.85);font-weight:600;margin-bottom:4px">{{ f.k }}</div>
              <div style="font-family:'Oswald',sans-serif;font-size:18px;color:#F6ECD7;line-height:1.2">{{ f.v }}</div>
            </div>
          </template>
        </div>
        <!-- 1 card duy nhất: QR ở trên, nút Chia sẻ (mobile only) là hàng
             hành động bên dưới CÙNG card, ngăn bằng đường kẻ mảnh — không
             tách thành 2 khối rời như trước. -->
        <div class="sc-fact-qr-card">
          <a
            class="sc-fact-qr-link"
            :href="qrUrl"
            target="_blank"
            rel="noopener"
            :title="qrUrl"
          >
            <div class="sc-fact-qr__icon">
              <img
                v-if="qrDataUrl"
                :src="qrDataUrl"
                :alt="`Mã QR — ${dd.name}`"
                style="width:100%;height:100%;object-fit:contain"
              />
            </div>
          </a>
          <!-- Mobile only: ẩn khỏi hero (xem .sc-share-btn--hero /
               .sc-share-btn--qr, @media 768px). -->
          <button class="sc-share-btn sc-share-btn--qr" type="button" @click="sharePage">
            ↗ {{ shareCopied ? 'Đã sao chép liên kết!' : 'Chia sẻ' }}
          </button>
        </div>
      </div>
    </section>

    <!-- OVERVIEW: 2 cột col-6/col-6 đều nhau. QR tách khỏi card thông tin,
         nằm dưới đoạn mô tả bên trái để lấp mảng trắng đồng thời giữ vẫn
         "cạnh khung thông tin" bên phải. -->
    <section style="max-width:1180px;margin:0 auto;padding:clamp(34px,5vw,60px) clamp(16px,4vw,40px)">
      <div class="sc-ov-grid">
        <div class="sc-ov-col">
          <div style="display:flex;align-items:center;gap:12px;margin:0 0 16px"><span style="width:10px;height:10px;background:#9E3B2E;transform:rotate(45deg);flex:none"></span><h2 style="font-family:'Playfair Display',serif;font-weight:800;font-size:clamp(23px,3vw,32px);color:#2A2018;margin:0;letter-spacing:-.3px">Tổng quan</h2><span style="font-family:'Carattere',cursive;color:#B07A2E;font-size:26px">Overview</span></div>
          <div v-if="audioSrc" class="sc-audio-bar">
            <button
              type="button"
              class="sc-audio-bar__play"
              :aria-label="audioPlaying ? (lang === 'vi' ? 'Tạm dừng' : 'Pause') : (lang === 'vi' ? 'Phát' : 'Play')"
              @click="toggleAudioPlay"
            >
              <svg v-if="!audioPlaying" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
            </button>
            <div class="sc-audio-bar__track" @click="seekAudio">
              <div class="sc-audio-bar__track-fill" :style="{ width: audioProgress + '%' }"></div>
            </div>
            <span class="sc-audio-bar__time">{{ formatAudioTime(audioCurrentTime) }} / {{ formatAudioTime(audioDuration) }}</span>
          </div>
          <p style="font-size:17px;line-height:1.7;color:#473A2C;margin:0;text-align:justify;text-wrap:pretty">{{ dd.overview }}</p>
        </div>
        <div class="sc-ov-col" style="background:#FBF5E8;border:1px solid #E0D0AE;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(90,70,40,.07)">
          <div style="position:relative;aspect-ratio:4/3;background:repeating-linear-gradient(45deg,#E3D2B0 0 13px,#DCC9A4 13px 26px)">
            <Image :src="dd.image" fallback="logo" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />
          </div>
          <div style="padding:16px 18px;display:flex;flex-direction:column;gap:11px">
            <div style="display:flex;gap:12px"><span style="font-size:12.5px;color:#8A7350;width:96px;flex:none">Thờ phụng</span><span style="font-size:13.5px;color:#2A2018;font-weight:500">{{ dd.worship }}</span></div>
            <div style="display:flex;gap:12px"><span style="font-size:12.5px;color:#8A7350;width:96px;flex:none">Niên đại</span><span style="font-size:13.5px;color:#2A2018;font-weight:500">{{ dd.era }}</span></div>
            <div style="display:flex;gap:12px"><span style="font-size:12.5px;color:#8A7350;width:96px;flex:none">Khoảng cách</span><span style="font-size:13.5px;color:#2A2018;font-weight:500">{{ dd.distance }}</span></div>
            <div style="display:flex;gap:12px"><span style="font-size:12.5px;color:#8A7350;width:96px;flex:none">Văn bản</span><span style="font-size:13.5px;color:#2A2018;font-weight:500">{{ dd.rankMeta }}</span></div>
          </div>
        </div>
      </div>
    </section>

    <template v-if="dd.land">
    <!-- CADASTRAL / hồ sơ địa chính -->
    <section style="max-width:1180px;margin:0 auto;padding:0 clamp(16px,4vw,40px) clamp(20px,3vw,36px)">
      <div style="background:#FBF5E8;border:1px solid #E0D0AE;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(90,70,40,.07)">
        <div style="background:#2C4A5E;padding:14px 22px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <span style="color:#E7C56B;font-size:15px">▦</span>
          <h2 style="font-family:'Oswald',sans-serif;font-weight:600;font-size:18px;color:#F6ECD7;margin:0;text-transform:uppercase;letter-spacing:.5px">Hồ sơ địa chính &amp; khoanh vùng bảo vệ</h2>
          <span style="font-size:12px;color:rgba(231,197,107,.85);margin-left:auto">Đất di tích lịch sử – văn hóa</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:1px;background:#E0D0AE">
          <div style="background:#FBF5E8;padding:14px 18px"><div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#B98F37;font-weight:600">Tờ bản đồ</div><div style="font-family:'Oswald',sans-serif;font-size:20px;color:#2A2018;margin-top:3px">{{ dd.land.sheet }}</div></div>
          <div style="background:#FBF5E8;padding:14px 18px"><div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#B98F37;font-weight:600">Thửa đất</div><div style="font-family:'Oswald',sans-serif;font-size:20px;color:#2A2018;margin-top:3px">{{ dd.land.parcel }}</div></div>
          <div style="background:#FBF5E8;padding:14px 18px"><div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#B98F37;font-weight:600">Tổng diện tích</div><div style="font-family:'Oswald',sans-serif;font-size:20px;color:#9E3B2E;margin-top:3px">{{ dd.land.total }} m²</div></div>
          <div style="background:#FBF5E8;padding:14px 18px"><div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#B98F37;font-weight:600">Khu vực bảo vệ I</div><div style="font-family:'Oswald',sans-serif;font-size:20px;color:#2A2018;margin-top:3px">{{ dd.land.kv1 }} m²</div></div>
          <div style="background:#FBF5E8;padding:14px 18px"><div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#B98F37;font-weight:600">Khu vực bảo vệ II</div><div style="font-family:'Oswald',sans-serif;font-size:20px;color:#2A2018;margin-top:3px">{{ dd.land.kv2 }} m²</div></div>
        </div>
        <div style="padding:14px 22px 18px;border-top:1px solid #EDE0C4">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#B98F37;font-weight:600;margin-bottom:10px">Ranh giới tứ cận (khu vực bảo vệ II)</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px">
            <template v-for="(b, __i) in dd.land.borders" :key="__i">
              <div style="display:flex;gap:10px;align-items:baseline"><span style="font-family:'Oswald',sans-serif;font-size:12px;color:#9E3B2E;font-weight:600;width:64px;flex:none;text-transform:uppercase">{{ b.d }}</span><span style="font-size:13.5px;color:#473A2C;text-wrap:pretty">{{ b.t }}</span></div>
            </template>
          </div>
        </div>
      </div>
    </section>
    </template>

    <template v-if="dd.rich">
    <!-- TIMELINE / lịch sử hành chính -->
    <section style="background:#F4E8CF;border-top:1px solid #E0D0AE;border-bottom:1px solid #E0D0AE">
      <div style="max-width:1180px;margin:0 auto;padding:clamp(32px,4vw,52px) clamp(16px,4vw,40px)">
        <div style="display:flex;align-items:center;gap:12px;margin:0 0 8px"><span style="width:10px;height:10px;background:#9E3B2E;transform:rotate(45deg);flex:none"></span><h2 style="font-family:'Playfair Display',serif;font-weight:800;font-size:clamp(23px,3vw,32px);color:#2A2018;margin:0;letter-spacing:-.3px">Lịch sử hành chính</h2><span style="font-family:'Carattere',cursive;color:#9E3B2E;font-size:26px">Through the eras</span></div>
        <p style="font-size:14.5px;color:#6A5A46;margin:0 0 22px;max-width:70ch">{{ dd.access }}</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">
          <template v-for="(tl, __i) in dd.timeline" :key="__i">
            <div style="background:#FBF5E8;border:1px solid #E0D0AE;border-radius:10px;padding:18px;position:relative">
              <div style="position:absolute;top:18px;right:18px;width:26px;height:26px;border-radius:50%;background:#9E3B2E;color:#E7C56B;display:flex;align-items:center;justify-content:center;font-family:'Oswald',sans-serif;font-size:13px;font-weight:700">{{ tl.no }}</div>
              <div style="font-family:'Oswald',sans-serif;font-weight:600;font-size:17px;color:#9E3B2E;margin:0 0 6px;max-width:80%">{{ tl.year }}</div>
              <p style="font-size:14px;color:#473A2C;margin:0;text-wrap:pretty">{{ tl.text }}</p>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- DEITIES — Tam vị thượng đẳng thần -->
    <section style="max-width:1180px;margin:0 auto;padding:clamp(36px,5vw,60px) clamp(16px,4vw,40px)">
      <div class="sc-deities-grid">
        <!-- col-6: phần giới thiệu ở trên, ảnh ban thờ ở dưới -->
        <div class="sc-deities-aside">
          <h2 style="font-family:'Playfair Display',serif;font-weight:800;font-size:clamp(24px,3vw,34px);color:#2A2018;margin:0;letter-spacing:-.3px">{{ dd.deitiesTitle }}</h2>
          <p style="font-family:'Carattere',cursive;color:#9E3B2E;font-size:30px;margin:2px 0 10px">Three Sacred Deities</p>
          <div style="display:flex;align-items:center;gap:14px;margin:0 0 12px"><span style="color:#B98F37">◆</span><span style="height:1px;flex:1;background:linear-gradient(90deg,#C9B68F,transparent)"></span></div>
          <p style="font-size:15px;color:#6A5A46;margin:0 0 22px;text-align:justify;text-wrap:pretty">{{ dd.deitiesIntro }}</p>
          <div style="border-radius:14px;overflow:hidden;border:1px solid #E0D0AE;box-shadow:0 6px 22px rgba(90,70,40,.12)">
            <Image :src="dd.altarImg" fallback="logo" style="display:block;width:100%;height:100%;object-fit:cover" />
          </div>
        </div>
        <!-- col-6: danh sách các vị được thờ (không ảnh, vẫn đánh số) -->
        <div style="display:flex;flex-direction:column;gap:14px">
          <template v-for="(g, __i) in dd.deities" :key="__i">
            <div style="display:flex;gap:16px;background:#FBF5E8;border:1px solid #E0D0AE;border-radius:12px;padding:16px 18px;box-shadow:0 2px 12px rgba(90,70,40,.07)">
              <span style="flex:none;width:36px;height:36px;border-radius:50%;background:#9E3B2E;color:#E7C56B;display:flex;align-items:center;justify-content:center;font-family:'Oswald',sans-serif;font-weight:700;border:2px solid #E7C56B">{{ g.no }}</span>
              <div style="display:flex;flex-direction:column;gap:7px;min-width:0">
                <div>
                  <h3 style="font-family:'Oswald',sans-serif;font-weight:600;font-size:20px;color:#2A2018;margin:0">{{ g.name }}</h3>
                  <div v-if="g.huy" style="font-size:12.5px;color:#A08B68;font-style:italic">{{ g.huy }}</div>
                </div>
                <div v-if="g.role" style="font-size:12px;color:#2C4A5E;background:#E7EEF1;border:1px solid #CFE0E6;border-radius:6px;padding:6px 10px;align-self:flex-start;text-wrap:pretty">{{ g.role }}</div>
                <p v-if="g.story" style="font-size:14px;color:#473A2C;margin:0;line-height:1.6;text-wrap:pretty">{{ g.story }}</p>
                <div v-if="g.hoa" style="display:flex;align-items:center;gap:8px;margin-top:2px;padding-top:10px;border-top:1px dashed #D8C5A2"><span style="color:#B98F37;font-size:13px">✦</span><span style="font-size:13px;color:#9E3B2E;font-weight:500">{{ g.hoa }}</span></div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- ARCHITECTURE -->
    <section style="background:#241A12;color:#E9DCC2">
      <div style="max-width:1180px;margin:0 auto;padding:clamp(36px,5vw,60px) clamp(16px,4vw,40px)">
        <div style="display:flex;align-items:center;gap:12px;margin:0 0 6px"><span style="width:10px;height:10px;background:#E7C56B;transform:rotate(45deg);flex:none"></span><h2 style="font-family:'Playfair Display',serif;font-weight:800;font-size:clamp(23px,3vw,32px);color:#F6ECD7;margin:0;letter-spacing:-.3px">Kiến trúc nghệ thuật</h2><span style="font-family:'Carattere',cursive;color:#E7C56B;font-size:28px">Architecture &amp; Art</span></div>
        <p style="font-size:15.5px;color:rgba(233,220,194,.82);margin:0 0 26px;max-width:74ch;text-align:justify;text-wrap:pretty">{{ dd.architecturePlan }}</p>
        <div style="display:flex;gap:clamp(20px,3vw,36px);flex-wrap:wrap;align-items:flex-start">
          <div style="flex:1 1 260px;min-width:240px">
            <div style="font-family:'Oswald',sans-serif;text-transform:uppercase;letter-spacing:1px;font-size:13px;color:#E7C56B;margin-bottom:12px">Cấu trúc ngoại vi · Exterior</div>
            <div style="display:flex;flex-direction:column;gap:10px">
              <template v-for="(x, __i) in dd.exterior" :key="__i">
                <div style="display:flex;gap:11px;align-items:flex-start"><span style="color:#9E3B2E;margin-top:3px">◈</span><span style="font-size:14.5px;color:#E9DCC2;line-height:1.55;text-wrap:pretty">{{ x.t }}</span></div>
              </template>
            </div>
          </div>
          <div style="flex:1 1 260px;min-width:240px">
            <div style="font-family:'Oswald',sans-serif;text-transform:uppercase;letter-spacing:1px;font-size:13px;color:#E7C56B;margin-bottom:12px">Nội thất · Interior</div>
            <div style="display:flex;flex-direction:column;gap:10px">
              <template v-for="(y, __i) in dd.interior" :key="__i">
                <div style="display:flex;gap:11px;align-items:flex-start"><span style="color:#B98F37;margin-top:3px">◆</span><span style="font-size:14.5px;color:#E9DCC2;line-height:1.55;text-wrap:pretty">{{ y.t }}</span></div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- RELICS -->
    <section style="max-width:1180px;margin:0 auto;padding:clamp(36px,5vw,60px) clamp(16px,4vw,40px)">
      <div style="display:flex;align-items:center;gap:12px;margin:0 0 6px"><span style="width:10px;height:10px;background:#9E3B2E;transform:rotate(45deg);flex:none"></span><h2 style="font-family:'Playfair Display',serif;font-weight:800;font-size:clamp(23px,3vw,32px);color:#2A2018;margin:0;letter-spacing:-.3px">Di vật &amp; cổ vật</h2><span style="font-family:'Carattere',cursive;color:#B07A2E;font-size:28px">Relics &amp; Antiquities</span></div>
      <p style="font-size:15px;color:#6A5A46;margin:0 0 24px;max-width:74ch;text-align:justify;text-wrap:pretty">{{ dd.relicsIntro }}</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px">
        <template v-for="(r, __i) in dd.relics" :key="__i">
          <div style="background:#FBF5E8;border:1px solid #E0D0AE;border-radius:10px;padding:16px 18px;border-top:3px solid #B98F37">
            <div style="display:flex;align-items:center;gap:9px;margin-bottom:7px"><span style="font-family:'Oswald',sans-serif;color:#C9B68F;font-size:15px;font-weight:700">{{ r.no }}</span><h3 style="font-family:'Oswald',sans-serif;font-weight:600;font-size:16.5px;color:#9E3B2E;margin:0">{{ r.n }}</h3></div>
            <p style="font-size:13.5px;color:#473A2C;margin:0;line-height:1.55;text-wrap:pretty">{{ r.d }}</p>
          </div>
        </template>
      </div>
    </section>

    <!-- FESTIVAL -->
    <section style="background:#F4E8CF;border-top:1px solid #E0D0AE;border-bottom:1px solid #E0D0AE">
      <div style="max-width:1180px;margin:0 auto;padding:clamp(36px,5vw,60px) clamp(16px,4vw,40px);display:flex;gap:clamp(24px,4vw,44px);flex-wrap:wrap;align-items:flex-start">
        <div style="flex:1 1 300px;min-width:260px">
          <div style="display:flex;align-items:center;gap:12px;margin:0 0 6px"><span style="width:10px;height:10px;background:#B5532A;transform:rotate(45deg);flex:none"></span><h2 style="font-family:'Playfair Display',serif;font-weight:800;font-size:clamp(23px,3vw,32px);color:#2A2018;margin:0;letter-spacing:-.3px">Lễ hội &amp; tín ngưỡng</h2></div>
          <p style="font-family:'Carattere',cursive;color:#9E3B2E;font-size:28px;margin:0 0 18px">Festivals &amp; Beliefs</p>
          <div style="display:flex;flex-direction:column;gap:10px">
            <template v-for="(d, __i) in dd.festivalDays" :key="__i">
              <div style="display:flex;align-items:center;gap:14px;background:#FBF5E8;border:1px solid #E0D0AE;border-radius:9px;padding:12px 16px">
                <span style="font-family:'Oswald',sans-serif;font-weight:600;color:#9E3B2E;font-size:15px;background:#F4E8CF;border:1px solid #E0D0AE;border-radius:6px;padding:6px 12px;white-space:nowrap">{{ d.d }}</span>
                <span style="font-size:15px;color:#2A2018;font-weight:500">{{ d.t }}</span>
              </div>
            </template>
          </div>
        </div>
        <div style="flex:1 1 300px;min-width:260px">
          <div style="aspect-ratio:16/10;border-radius:12px;overflow:hidden;border:1px solid #E0D0AE;box-shadow:0 6px 22px rgba(90,70,40,.12);margin-bottom:14px">
            <Image :src="dd.festivalImg" fallback="logo" style="display:block;width:100%;height:100%;object-fit:cover" />
          </div>
          <h3 style="font-family:'Oswald',sans-serif;font-weight:600;font-size:16px;color:#9E3B2E;margin:0 0 8px;text-transform:uppercase;letter-spacing:.5px">Nghi thức rước kiệu</h3>
          <p style="font-size:14.5px;color:#473A2C;margin:0;line-height:1.65;text-align:justify;text-wrap:pretty">{{ dd.festivalRite }}</p>
        </div>
      </div>
    </section>

    <!-- GALLERY -->
    <section style="max-width:1180px;margin:0 auto;padding:clamp(36px,5vw,56px) clamp(16px,4vw,40px)">
      <div style="display:flex;align-items:center;gap:12px;margin:0 0 20px"><span style="width:10px;height:10px;background:#9E3B2E;transform:rotate(45deg);flex:none"></span><h2 style="font-family:'Playfair Display',serif;font-weight:800;font-size:clamp(23px,3vw,32px);color:#2A2018;margin:0;letter-spacing:-.3px">Thư viện hình ảnh</h2><span style="font-family:'Carattere',cursive;color:#B07A2E;font-size:28px">Gallery</span></div>
      <div class="sc-gallery-grid">
        <template v-for="(im, __i) in dd.gallery" :key="__i">
          <div
            :class="['sc-gallery-item', im.image ? 'sc-gallery-item--clickable' : '']"
            :role="im.image ? 'button' : null"
            :tabindex="im.image ? 0 : null"
            :aria-label="im.image ? `Xem ảnh: ${im.cap}` : null"
            @click="im.image && openLightbox(__i)"
            @keydown.enter="im.image && openLightbox(__i)"
            @keydown.space.prevent="im.image && openLightbox(__i)"
          >
            <Image :src="im.image" fallback="logo" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />
            <span v-if="im.image" class="sc-gallery-item__zoom" aria-hidden="true">⤢</span>
          </div>
        </template>
      </div>
      <div style="margin-top:18px;padding:14px 18px;background:#FBF5E8;border:1px dashed #C9B68F;border-radius:10px;font-size:13px;color:#8A7350;text-wrap:pretty">{{ dd.conservation }}</div>
    </section>
    </template>

    <!-- FALLBACK for sites without full content yet -->
    <template v-if="dd.basic">
    <section style="max-width:1180px;margin:0 auto;padding:0 clamp(16px,4vw,40px) clamp(40px,6vw,72px)">
      <div style="background:#FBF5E8;border:1px dashed #C9B68F;border-radius:12px;padding:36px;text-align:center">
        <div style="font-size:30px;color:#C9B68F;margin-bottom:10px">⌛</div>
        <h3 style="font-family:'Oswald',sans-serif;font-size:20px;color:#2A2018;margin:0 0 8px;text-transform:uppercase;letter-spacing:.5px">{{ dd.basicTitle }}</h3>
        <p style="font-size:14.5px;color:#6A5A46;max-width:56ch;margin:0 auto;text-wrap:pretty">{{ dd.basicNote }}</p>
      </div>
    </section>
    </template>

    <!-- LIGHTBOX: xem chi tiết ảnh trong "Thư viện hình ảnh".
         Teleport ra <body> để thoát khỏi mọi containing-block/stacking
         context của ancestor (main có animation transform, section có
         overflow-x:auto ở nơi khác...) — nếu không, `position:fixed`
         có thể bị "giam" trong ancestor và không nổi lên trên cùng. -->
    <Teleport to="body">
    <Transition name="sc-lb">
      <div
        v-if="lightboxOn"
        class="sc-lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="lightboxItem?.cap || 'Xem ảnh'"
        @click.self="closeLightbox"
      >
        <button
          class="sc-lightbox__close"
          type="button"
          aria-label="Đóng"
          @click="closeLightbox"
        >
          ×
        </button>
        <button
          v-if="galleryLen > 1"
          class="sc-lightbox__nav sc-lightbox__nav--prev"
          type="button"
          aria-label="Ảnh trước"
          @click.stop="stepLightbox(-1)"
        >
          ‹
        </button>
        <button
          v-if="galleryLen > 1"
          class="sc-lightbox__nav sc-lightbox__nav--next"
          type="button"
          aria-label="Ảnh sau"
          @click.stop="stepLightbox(1)"
        >
          ›
        </button>
        <figure class="sc-lightbox__stage" @click.stop>
          <div class="sc-lightbox__frame">
            <Image
              :src="lightboxItem?.image"
              fallback="logo"
              loading="eager"
              fetchpriority="high"
              class="sc-lightbox__img"
            />
          </div>
          <figcaption class="sc-lightbox__cap">
            <span class="sc-lightbox__idx">{{ lightboxIdx + 1 }} / {{ galleryLen }}</span>
            <span>{{ lightboxItem?.cap }}</span>
          </figcaption>
        </figure>
      </div>
    </Transition>
    </Teleport>
  </main>
  </template>
</template>

<style scoped>
/* FACT STRIP — facts flex 1 bên trái, QR chip bên phải; QR dùng theme
   tối để hoà nền xanh của strip, viền vàng để vẫn nổi bật. */
.sc-fact-strip {
  max-width: 1180px;
  margin: 0 auto;
  padding: 22px clamp(16px, 4vw, 40px);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: clamp(14px, 2.2vw, 24px);
  flex-wrap: wrap;
}
.sc-fact-list {
  flex: 1 1 460px;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 4px;
}
.sc-fact-qr-card {
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
.sc-fact-qr-link {
  display: flex;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.sc-fact-qr-link:hover,
.sc-fact-qr-link:focus-visible {
  transform: translateY(-1px);
}
.sc-fact-qr__icon {
  width: 112px;
  height: 112px;
  flex: none;
  background: #fff;
  border: 1px solid rgba(231, 197, 107, 0.5);
  border-radius: 5px;
  position: relative;
  background-image: repeating-linear-gradient(
      45deg,
      #2a2018 0 2.5px,
      transparent 2.5px 5px
    ),
    repeating-linear-gradient(
      135deg,
      #2a2018 0 2.5px,
      transparent 2.5px 5px
    );
  background-size: 7px 7px;
  overflow: hidden;
}
/* Nút "Chia sẻ": desktop nằm trong hero, mobile chuyển xuống làm hàng
   hành động bên dưới CÙNG card QR (.sc-fact-qr-card) — không phải box
   riêng. Cùng 1 handler sharePage, chỉ khác vị trí hiển thị theo breakpoint.
   !important bắt buộc: nút hero có style="display:flex" inline (specificity
   cao hơn mọi class), không có !important thì rule ẩn bên dưới vô tác dụng. */
.sc-share-btn--qr {
  display: none;
}
@media (max-width: 768px) {
  /* col-6/col-6: trái QR, phải nút Chia sẻ ghim góc dưới-phải — xem
     preview đã duyệt (grid thay flex, không còn divider ngang). */
  .sc-fact-qr-card {
    flex: 1 1 100%;
    max-width: none;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .sc-fact-qr-link {
    align-items: center;
    justify-content: center;
  }
  .sc-share-btn--hero {
    display: none !important;
  }
  .sc-share-btn--qr {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    /* Ghim nút vào góc dưới-phải Ô LƯỚI của chính nó (button là grid item
       trực tiếp) — align-self/justify-self, không phải flex-direction. */
    align-self: end;
    justify-self: end;
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

/* OVERVIEW — 2 cột col-6/col-6 đều nhau; cột trái không stretch — kết
   thúc ở nội dung để không bị khoảng trắng bên trong cột. Mobile xếp
   chồng. */
.sc-ov-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(22px, 3vw, 40px);
  align-items: start;
}
.sc-ov-col {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Thanh audio thuyết minh — tự dựng (nút play/pause + progress), phát
   qua đối tượng Audio() quản lý trong <script>, không dùng thẻ <audio>.
   Đặt ngay trên đoạn Tổng quan/Overview. */
.sc-audio-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 16px;
  padding: 10px 14px;
  background: #fbf5e8;
  border: 1px solid #e0d0ae;
  border-radius: 999px;
}
.sc-audio-bar__play {
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: #9e3b2e;
  color: #f6ecd7;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.15s ease;
}
.sc-audio-bar__play:hover {
  background: #7c2b21;
}
.sc-audio-bar__play:active {
  transform: scale(0.94);
}
.sc-audio-bar__track {
  flex: 1;
  min-width: 0;
  height: 6px;
  background: #e0d0ae;
  border-radius: 999px;
  cursor: pointer;
  overflow: hidden;
}
.sc-audio-bar__track-fill {
  height: 100%;
  background: #9e3b2e;
  border-radius: 999px;
  transition: width 0.1s linear;
}
.sc-audio-bar__time {
  flex: none;
  font-family: "Roboto Condensed", sans-serif;
  font-size: 12px;
  color: #8a7350;
  white-space: nowrap;
}
@media (max-width: 768px) {
  .sc-ov-grid {
    grid-template-columns: 1fr;
  }
}

/* DEITIES — Tam vị Thành hoàng làng */
.sc-deities-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(22px, 3vw, 40px);
  align-items: start;
}
.sc-deities-aside {
  position: sticky;
  top: 24px;
  height: auto;
}
/* Mobile: xếp chồng theo cột, bỏ sticky để các khối văn bản tự đẩy nhau xuống */
@media (max-width: 768px) {
  .sc-deities-grid {
    display: flex;
    flex-direction: column;
    height: auto;
  }
  .sc-deities-aside {
    position: static;
    top: auto;
    height: auto;
  }
}

/* ─── Gallery grid ───
   Tự viết CSS Grid (không dùng .row/.col-4 của Bootstrap) — cố định
   đúng 3 ảnh/hàng, gap tính đúng cách (trừ hao trước khi chia cột nên
   không bao giờ bị bẻ hàng thiếu ảnh như flex + % width cố định). */
.sc-gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
/* ─── Gallery grid item ───
   Cùng hình thức card cũ (viền + nền giấy), thêm tương tác hover
   khi item có ảnh thật để click mở lightbox. */
.sc-gallery-item {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: 10px;
  overflow: hidden;
  background: repeating-linear-gradient(
    45deg,
    #e3d2b0 0 13px,
    #dcc9a4 13px 26px
  );
  border: 1px solid #e0d0ae;
}
.sc-gallery-item--clickable {
  cursor: zoom-in;
  transition: transform 0.22s ease, box-shadow 0.22s ease,
    border-color 0.22s ease;
}
.sc-gallery-item--clickable:hover,
.sc-gallery-item--clickable:focus-visible {
  transform: translateY(-2px);
  border-color: #b98f37;
  box-shadow: 0 8px 22px rgba(90, 70, 40, 0.18);
  outline: none;
}
.sc-gallery-item--clickable:focus-visible {
  outline: 2px solid #e7c56b;
  outline-offset: 2px;
}
.sc-gallery-item__zoom {
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
.sc-gallery-item--clickable:hover .sc-gallery-item__zoom,
.sc-gallery-item--clickable:focus-visible .sc-gallery-item__zoom {
  opacity: 1;
  transform: scale(1);
}

/* ─── Lightbox modal ───
   Fullscreen overlay tối; ảnh contain vừa khung, caption dưới ảnh
   kèm số thứ tự. Nav trái/phải + Đóng góc phải trên. ESC / ← → +
   click nền để đóng. */
.sc-lightbox {
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
.sc-lightbox__stage {
  width: 100%;
  max-width: min(1200px, 95vw);
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
  margin: auto 0;
}
/* Khung ảnh: kích thước CỐ ĐỊNH theo khung màn hình (viewport), không
   đổi theo tỉ lệ từng ảnh — chuyển ảnh dọc ↔ ngang không làm modal
   nhảy/co giãn, giữ trải nghiệm xem ổn định. Ảnh chỉ "contain" bên
   trong khung này, phần dư được letterbox bằng màu nền khung. */
.sc-lightbox__frame {
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
.sc-lightbox__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.sc-lightbox__cap {
  color: #f6ecd7;
  font-size: 14.5px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 700px;
  line-height: 1.5;
  text-wrap: pretty;
  margin: 0;
}
.sc-lightbox__idx {
  font-family: "Oswald", sans-serif;
  font-size: 12px;
  letter-spacing: 1.5px;
  color: #e7c56b;
  text-transform: uppercase;
}
.sc-lightbox__close,
.sc-lightbox__nav {
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
  transition: background 0.18s ease, transform 0.2s ease,
    border-color 0.18s ease;
}
.sc-lightbox__close {
  top: clamp(12px, 2vw, 24px);
  right: clamp(12px, 2vw, 28px);
  width: 44px;
  height: 44px;
  font-size: 28px;
}
.sc-lightbox__close:hover,
.sc-lightbox__close:focus-visible {
  background: #9e3b2e;
  border-color: rgba(231, 197, 107, 0.6);
  transform: rotate(90deg);
  outline: none;
}
.sc-lightbox__nav {
  top: 50%;
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
  font-size: 34px;
  font-weight: 300;
}
.sc-lightbox__nav:hover,
.sc-lightbox__nav:focus-visible {
  background: rgba(158, 59, 46, 0.85);
  border-color: rgba(231, 197, 107, 0.6);
  outline: none;
}
.sc-lightbox__nav--prev {
  left: clamp(10px, 2vw, 28px);
}
.sc-lightbox__nav--next {
  right: clamp(10px, 2vw, 28px);
}
@media (max-width: 640px) {
  .sc-lightbox__frame {
    width: min(100%, 92vw);
    height: min(58vh, 520px);
  }
  .sc-lightbox__nav {
    width: 42px;
    height: 42px;
    font-size: 28px;
  }
  .sc-lightbox__close {
    width: 40px;
    height: 40px;
    font-size: 24px;
  }
  .sc-lightbox__cap {
    font-size: 13px;
  }
}

/* Transition đóng/mở lightbox */
.sc-lb-enter-active,
.sc-lb-leave-active {
  transition: opacity 0.22s ease;
}
.sc-lb-enter-active .sc-lightbox__stage,
.sc-lb-leave-active .sc-lightbox__stage {
  transition: transform 0.28s cubic-bezier(0.2, 0.7, 0.2, 1),
    opacity 0.24s ease;
}
.sc-lb-enter-from,
.sc-lb-leave-to {
  opacity: 0;
}
.sc-lb-enter-from .sc-lightbox__stage,
.sc-lb-leave-to .sc-lightbox__stage {
  opacity: 0;
  transform: scale(0.94);
}
</style>
