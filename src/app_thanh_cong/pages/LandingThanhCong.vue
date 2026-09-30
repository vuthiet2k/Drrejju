<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useThanhCongShared } from "../common/useThanhCongShared.js";
import {
  getThanhCongData,
  getThanhCongThemes,
} from "../common/thanhCongData.js";
import Image from "@/base/components/image/Image.vue";
import timelineImg1 from "../@data/image/Timeline_TC/1.jpg";
import timelineImg2 from "../@data/image/Timeline_TC/2.jpg";
import timelineImg3 from "../@data/image/Timeline_TC/3.jpg";
import timelineImg4 from "../@data/image/Timeline_TC/4.jpg";
const timelineImgs = [timelineImg1, timelineImg2, timelineImg3, timelineImg4];
const timelineSwiper = ref(null);
function onTimelineSwiperInit(swiper) {
  timelineSwiper.value = swiper;
}

// Instance Swiper riêng của từng thẻ địa điểm (mục "09 Điểm di tích"), để 2 nút
// trái/phải điều khiển đúng ảnh của thẻ đang bấm.
const siteSwipers = reactive({});
function onSiteSwiperInit(siteId, swiper) {
  siteSwipers[siteId] = swiper;
}

// Instance Swiper riêng của từng thẻ chủ đề (Nghệ thuật hát Soọng cô, Bản sắc
// Sán Dìu, Tín ngưỡng hòa quyện), để 2 nút trái/phải điều khiển đúng ảnh của
// thẻ đang bấm.
const themeSwipers = reactive({});
function onThemeSwiperInit(ccId, swiper) {
  themeSwipers[ccId] = swiper;
}
// import Vr360AutoTour from "../components/Vr360AutoTour.vue";
import VrTourViewer from "../components/VrTourViewer.vue";
import { buildXaThanhCongAutoTour } from "../common/autoTourData.js";
import { lunarToDate } from "../common/lunarDate.js";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Autoplay } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
const swiperModules = [Pagination, Autoplay];

const isOverview = true;

const {
  t,
  lang,
  showSecondary,
  isMobile,
  windowWidth,
  goMap,
  goVr,
  openDetail,
  // openTheme,
} = useThanhCongShared();

const D = computed(() => getThanhCongData());
const L = (o) => o[lang.value];

const heroImg = computed(() => D.value.sites[0]?.image || "");
// Hero slideshow: 9 ảnh đại diện của 9 điểm di tích (mỗi site 1 ảnh chính),
// kèm tên để hiện badge riêng cho từng ảnh.
const heroSlides = computed(() =>
  D.value.sites
    .map((s, i) => ({ id: s.id, num: i + 1, src: s.image, name: L(s).n }))
    .filter((s) => s.src),
);

// Hero: switch từ ảnh tĩnh sang VR360 (một cảnh). Ảnh pano được preload ngay khi
// mount để bấm chuyển là hiện ngay, không cần thấy màn hình tải.
const HERO_VR_IMG =
"https://storage.vanmanhit.com/uploads/panoramas/Fly1_1784604148919_cbc7af.jpg";
// "https://storage.vanmanhit.com/uploads/panoramas/1_1784605665283_8a4fb3.jpg";
const heroVrOn = ref(false);

// Hero slideshow: instance Swiper + slide đang active, để dựng pagination
// và badge riêng NGOÀI cây Swiper (khắc phục bug: nếu để mặc định bên
// trong, chúng bị khối nội dung hero (pointer-events:auto, z-index cao
// hơn) đè lên, thấy được nhưng không bấm được — vì z-index của con chỉ
// so sánh được trong stacking context của Swiper, không "vượt" lên trên
// một sibling z-index cao hơn của chính Swiper).
const heroSwiper = ref(null);
const heroActiveIndex = ref(0);
const heroActiveSlide = computed(
  () => heroSlides.value[heroActiveIndex.value] || null,
);
function onHeroSwiperInit(swiper) {
  heroSwiper.value = swiper;
  heroActiveIndex.value = swiper.realIndex || 0;
}
function onHeroSlideChange(swiper) {
  heroActiveIndex.value = swiper.realIndex ?? swiper.activeIndex ?? 0;
}
function goToHeroSlide(i) {
  const sw = heroSwiper.value;
  if (!sw) return;
  if (heroSlides.value.length > 1) sw.slideToLoop(i);
  else sw.slideTo(i);
}
const heroVrData = computed(() => ({
  title: "Xã Thành Công",
  scenes: [
    {
      id: "hero",
      name: "Xã Thành Công",
      image: HERO_VR_IMG,
      thumb: HERO_VR_IMG,
      initialView: {fov: 86, lat: 9.6, lon: 181.5},
      hotspots: [],
    },
  ],
}));
onMounted(() => {
  const img = new window.Image();
  img.src = HERO_VR_IMG;
});

// ===== Lightbox ảnh "Hình thành & phát triển" =====
const timelineLightboxOn = ref(false);
const timelineLightboxIdx = ref(0);
function openTimelineLightbox(idx = 0) {
  timelineLightboxIdx.value = idx;
  timelineLightboxOn.value = true;
}
function closeTimelineLightbox() {
  timelineLightboxOn.value = false;
}
function onTimelineLightboxKey(e) {
  if (e.key === "Escape") closeTimelineLightbox();
}
watch(timelineLightboxOn, (on) => {
  if (typeof document === "undefined") return;
  if (on) {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onTimelineLightboxKey);
  } else {
    document.body.style.overflow = "";
    window.removeEventListener("keydown", onTimelineLightboxKey);
  }
});
onBeforeUnmount(() => {
  if (typeof document !== "undefined") {
    document.body.style.overflow = "";
    window.removeEventListener("keydown", onTimelineLightboxKey);
  }
});

// Mục Video giới thiệu: nhúng VR360 tự động; chỉ mount engine khi người dùng
// bấm play (tránh tải three.js + toàn bộ ảnh pano ngay khi vào trang chủ).
const showAuto = ref(false);
const autoTourData = computed(() => buildXaThanhCongAutoTour());
const videoPoster = computed(
  () => autoTourData.value.scenes?.[0]?.thumb || heroImg.value,
);

// ===== 09 điểm di tích =====
const sites = computed(() =>
  D.value.sites.map((s, i) => ({
    id: s.id,
    num: i + 1,
    d3: s.d3,
    name: L(s).n,
    type: L(s).t,
    desc: L(s).d,
    altName: s.en.n,
    image: s.image || "",
    images: [s.image, ...(s.images || [])].filter(Boolean),
    openDetail: openDetail(s.id),
  })),
);

const sitesCols = computed(() => {
  const w = windowWidth.value;
  if (w <= 520) return "1fr";
  if (w <= 900) return "repeat(2,1fr)";
  return "repeat(3,1fr)";
});

// ===== thống kê nhanh =====
const stats = computed(() => [
  {
    value: "09",
    label: lang.value === "vi" ? "Điểm di tích" : "Heritage sites",
  },
  { value: "02", label: lang.value === "vi" ? "Mô hình 3D" : "3D models" },
  { value: "09", label: "VR360" },
  // Tạm ẩn mục "06 Lễ hội" theo yêu cầu — bật lại bằng cách bỏ comment dòng dưới.
  // { value: "06", label: lang.value === "vi" ? "Lễ hội" : "Festivals" },
]);

// ===== giới thiệu xã =====
// Số liệu chuẩn sau khi hợp nhất xã Thành Công + xã Vạn Phái ngày 01/7/2025.
const communeFacts = computed(() =>
  lang.value === "vi"
    ? [
        { v: "43,45 km²", k: "Diện tích tự nhiên" },
        { v: "16", k: "Xóm trực thuộc" },
        { v: "28.581", k: "Dân số (người)" },
        { v: "~ 658", k: "Mật độ (người/km²)" },
        { v: "Kinh · Sán Dìu", k: "Bản sắc dân tộc" },
        { v: "Xóm Xuân Hà", k: "Trụ sở UBND xã" },
        { v: "09", k: "Di tích cấp tỉnh" },
        { v: "Hồ Suối Lạnh", k: "Tiềm năng du lịch" },
      ]
    : [
        { v: "43.45 km²", k: "Natural area" },
        { v: "16", k: "Hamlets" },
        { v: "28,581", k: "Population" },
        { v: "~ 658", k: "Density (people/km²)" },
        { v: "Kinh · San Diu", k: "Ethnic identity" },
        { v: "Xuan Ha hamlet", k: "Commune HQ" },
        { v: "09", k: "Provincial relics" },
        { v: "Suoi Lanh Lake", k: "Tourism potential" },
      ],
);

// ===== chủ đề: ẩm thực / văn hoá / tín ngưỡng =====
const communeCards = computed(() =>
  getThanhCongThemes().map((th) => ({
    id: th.id,
    color: th.color,
    img: th.img || "",
    gallery: (th.gallery && th.gallery.length ? th.gallery : [th.img]).filter(
      Boolean,
    ),
    ...th[lang.value],
  })),
);

// ===== lễ hội — timeline vuốt nhọn =====
const festIndex = ref(null);
const MS_DAY = 86400000;
// Đồng hồ sống: `new Date()` trong computed chỉ tính lại khi có dependency
// đổi — nếu không có nowTick, "còn X ngày" sẽ đứng yên từ lúc mount, không
// tự lùi ngày khi người dùng để mở trang qua nửa đêm. Tick mỗi phút đủ để
// countdown và cờ "đang diễn ra" luôn khớp ngày thực tế.
const nowTick = ref(Date.now());
let nowTimer = null;
onMounted(() => {
  nowTimer = setInterval(() => {
    nowTick.value = Date.now();
  }, 60000);
});
onBeforeUnmount(() => {
  if (nowTimer) clearInterval(nowTimer);
});
// Các mốc dương lịch ứng với 1 lễ hội, quanh thời điểm `now`. Lễ hội ghi
// theo âm lịch (cal:'al' — toàn bộ 15 lễ hội hiện có) phải đổi sang dương
// lịch mới tính được "đang diễn ra"/"còn bao nhiêu ngày"; đọc thẳng m/d như
// ngày dương sẽ lệch 3–7 tuần. Quét 3 năm âm liên tiếp vì một ngày âm cuối
// năm (ví dụ 12 tháng Chạp) rơi sang đầu năm dương kế tiếp.
function festivalStarts(f, now) {
  const y = now.getFullYear();
  const starts = [];
  for (const yy of [y - 1, y, y + 1]) {
    const dt = f.cal === "al" ? lunarToDate(f.d, f.m, yy) : new Date(yy, f.m - 1, f.d);
    if (dt) starts.push(dt);
  }
  return starts.sort((a, b) => a - b);
}

const festRaw = computed(() => {
  void nowTick.value;
  const now = new Date();
  return D.value.festivals.map((f) => {
    const starts = festivalStarts(f, now);
    const endOf = (start) =>
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + f.dur);
    const current = starts.find((s) => now >= s && now < endOf(s)) || null;
    const ongoing = !!current;
    // Kỳ kế tiếp: mốc gần nhất còn ở phía trước (nếu đang diễn ra thì
    // daysUntil = 0 nên không dùng tới).
    const next = starts.find((s) => s > now) || starts[starts.length - 1];
    const daysUntil = ongoing
      ? 0
      : Math.max(0, Math.ceil((next - now) / MS_DAY));
    return {
      f,
      lf: f[lang.value],
      m: f.m,
      ongoing,
      daysUntil,
      // Kỳ lễ hội của chu kỳ hiện tại đã khép lại (mốc gần nhất đều ở sau lưng).
      passed: !ongoing && !starts.some((s) => s > now),
    };
  });
});
const festSorted = computed(() =>
  festRaw.value.slice().sort((a, b) => a.m - b.m),
);
const featRaw = computed(() => {
  const raw = festRaw.value;
  let fi = 0;
  raw.forEach((r, i) => {
    if (r.daysUntil < raw[fi].daysUntil) fi = i;
  });
  return raw[fi];
});
const fN = computed(() => festSorted.value.length);
const featuredSortedIdx = computed(() =>
  Math.max(
    0,
    festSorted.value.findIndex((r) => r === featRaw.value),
  ),
);
const activeIdx = computed(() => {
  const n = fN.value;
  if (festIndex.value == null) return featuredSortedIdx.value;
  return ((festIndex.value % n) + n) % n;
});
const festSlots = computed(() => {
  const n = fN.value;
  const WIN = Math.min(isMobile.value ? 0 : 2, Math.floor((n - 1) / 2));
  const slots = [];
  for (let o = -WIN; o <= WIN; o++) {
    const idx = (((activeIdx.value + o) % n) + n) % n;
    const r = festSorted.value[idx];
    const dist = Math.abs(o);
    const isC = dist === 0;
    // Badge hiện trên MỌI thẻ (không riêng thẻ giữa): đang diễn ra thì báo
    // "Đang diễn ra", còn lại đếm ngược số ngày tới kỳ lễ gần nhất.
    const vi = lang.value === "vi";
    const badge = r.ongoing
      ? (vi ? "Đang diễn ra" : "Happening now")
      : r.daysUntil > 0
      ? (vi ? `Diễn ra sau ${r.daysUntil} ngày` : `In ${r.daysUntil} days`)
      : (vi ? "Sắp diễn ra" : "Upcoming");
    slots.push({
      id: r.f.id,
      name: r.lf.n,
      // intro của lễ hội là MẢNG đoạn văn (xem festivals[] trong
      // thanhCongData.js); thẻ trên carousel chỉ hiện 3 dòng đầu bằng
      // -webkit-line-clamp nên nối các đoạn thành một chuỗi liền.
      intro: Array.isArray(r.lf.intro) ? r.lf.intro.join(" ") : r.lf.intro,
      season: r.lf.s,
      dateLabel: r.lf.dl,
      accent: r.f.c,
      isCenter: isC,
      img: r.f.img || "",
      calLabel:
        r.f.cal === "al"
          ? lang.value === "vi"
            ? "Âm lịch"
            : "Lunar"
          : lang.value === "vi"
          ? "Dương lịch"
          : "Solar",
      cardW: isC
        ? isMobile.value
          ? "clamp(190px,80vw,330px)"
          : "clamp(250px,32vw,348px)"
        : dist === 1
        ? isMobile.value
          ? "clamp(74px,22vw,150px)"
          : "clamp(150px,17vw,206px)"
        : "clamp(98px,12vw,150px)",
      imgH: isC
        ? isMobile.value
          ? "clamp(118px,40vw,200px)"
          : "clamp(150px,19vw,206px)"
        : dist === 1
        ? isMobile.value
          ? "clamp(60px,18vw,118px)"
          : "clamp(88px,11vw,118px)"
        : "clamp(62px,8vw,84px)",
      nameSize: isC
        ? isMobile.value
          ? "clamp(17px,5.2vw,24px)"
          : "clamp(19px,2.5vw,26px)"
        : dist === 1
        ? isMobile.value
          ? "12.5px"
          : "15.5px"
        : "12.5px",
      namePad: isC
        ? "16px 18px 18px"
        : dist === 1
        ? "11px 13px 13px"
        : "9px 10px 10px",
      dateSize: isC ? "13px" : dist === 1 ? "11.5px" : "10px",
      showMeta: isMobile.value ? isC : dist <= 1,
      opacity: dist === 2 ? ".82" : "1",
      badge,
      badgeBg: r.ongoing ? "#1F8A5B" : r.f.c,
      // Thẻ hai bên nhỏ hơn hẳn thẻ giữa nên badge phải co theo, nếu không
      // chuỗi "Còn 364 ngày" tràn khỏi thẻ ở khoảng cách 2.
      badgeSize: isC ? "10px" : dist === 1 ? "9px" : "8.5px",
      badgePad: isC ? "5px 11px" : dist === 1 ? "4px 7px" : "3.5px 6px",
      dotSize: isC ? "20px" : dist === 1 ? "14px" : "11px",
      dotColor: r.f.c,
      dotAnim:
        isC && r === featRaw.value
          ? "featPulse 2.1s ease-out infinite"
          : "none",
      cardBg: isC ? "#FFFDF7" : "#FBF5E8",
      cardBorder: isC ? r.f.c : "#E6D8BA",
      cardShadow: isC
        ? "0 18px 42px rgba(126,43,33,.18)"
        : "0 3px 12px rgba(90,70,40,.1)",
      onClick: isC
        ? openFestival(r.f.id)
        : () => {
            festIndex.value = idx;
          },
    });
  }
  return slots;
});
const festDots = computed(() =>
  festSorted.value.map((r, i) => ({
    active: i === activeIdx.value,
    name: r.lf.n,
    bg: i === activeIdx.value ? r.f.c : "#DCC9A4",
    size: i === activeIdx.value ? "13px" : "9px",
    onClick: () => {
      festIndex.value = i;
    },
  })),
);
const festPrevClick = () => {
  festIndex.value = (activeIdx.value - 1 + fN.value) % fN.value;
};
const festNextClick = () => {
  festIndex.value = (activeIdx.value + 1) % fN.value;
};
const festPos = computed(() => activeIdx.value + 1 + " / " + fN.value);

// mở trang chi tiết lễ hội (giống openFestival trong bản gốc)
import { useRouter } from "vue-router";
const router = useRouter();
function openFestival(id) {
  return () => {
    router.push({ name: "ThanhCongChiTietLeHoi", params: { slug: id } });
    window.scrollTo({ top: 0 });
  };
}
</script>

<template>
  <template v-if="isOverview">
    <main style="animation: scIn 0.4s ease both">
      <!-- hero -->
      <section
        class="hero-sec"
        style="
          position: relative;
          min-height: clamp(420px, 70vh, 640px);
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          background-color: #120d09;
        "
      >
        <template v-if="!heroVrOn || isMobile">
          <Swiper
            :modules="swiperModules"
            :autoplay="{ delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: false }"
            :loop="heroSlides.length > 1"
            :slides-per-view="1"
            :space-between="0"
            :speed="700"
            :grab-cursor="false"
            :allow-touch-move="false"
            class="hero-sec-swiper"
            style="position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0"
            @swiper="onHeroSwiperInit"
            @slideChange="onHeroSlideChange"
          >
            <SwiperSlide v-for="slide in heroSlides" :key="slide.id">
              <!-- Lớp nền: cùng ảnh, cover + blur để lấp phần khuyết 2 bên (không giảm sáng mạnh để tránh xám đục) -->
              <Image
                :src="slide.src"
                fallback="logo"
                aria-hidden="true"
                style="
                  position: absolute;
                  inset: 0;
                  width: 100%;
                  height: 100%;
                  min-width: 100%;
                  min-height: 100%;
                  object-fit: cover;
                  object-position: center;
                  z-index: 0;
                  transform: scale(1.2);
                  transform-origin: center;
                  filter: blur(8px) saturate(1.1);
                "
              />
              <!-- Ảnh chính: ÉP lấp kín container (fill) — không hở, không bé hơn khung -->
              <Image
                :src="slide.src"
                fallback="logo"
                style="
                  position: absolute;
                  inset: 0;
                  width: 100%;
                  height: 100%;
                  min-width: 100%;
                  min-height: 100%;
                  object-fit: contain;
                  object-position: center;
                  z-index: 1;
                "
              />
            </SwiperSlide>
          </Swiper>
        </template>
        <template v-else>
          <!-- VR360 hero: ảnh pano đã preload nên hiện gần như tức thì; engine tự
               xoay chậm mượt (autorotateSpeed=0.04); chromeless để ẩn toolbar/UI. -->
          <div
            class="hero-vr-wrap"
            style="position: absolute; inset: 0; z-index: 1"
          >
            <VrTourViewer
              :data="heroVrData"
              :autorotate="true"
              :chromeless="true"
              :disable-narration="true"
              :sync-hash="false"
            />
          </div>
        </template>
        <!-- scrim ngang: tối bên trái nơi đặt chữ, mờ dần sang phải (giữ cả ở
             chế độ VR để chữ vẫn đọc được trên nền pano) -->
        <div
          style="
            position: absolute;
            inset: 0;
            z-index: 2;
            background: linear-gradient(
              90deg,
              rgba(18, 13, 9, 0.85) 0%,
              rgba(18, 13, 9, 0.5) 45%,
              rgba(18, 13, 9, 0) 80%
            );
            pointer-events: none;
          "
        ></div>
        <!-- Stack góc phải-trên: badge tên điểm di tích (ảnh đang hiện). -->
        <div class="hero-top-right-stack">
        <span v-if="heroActiveSlide && !heroVrOn" class="hero-slide-badge">
          <span class="hero-slide-badge__num">{{ String(heroActiveSlide.num).padStart(2, "0") }}</span>
          <span class="hero-slide-badge__name">{{ heroActiveSlide.name }}</span>
        </span>
        </div>
        <!-- Stack góc phải-dưới: pagination (nếu có nhiều ảnh) + switch
             chuyển đổi Ảnh ↔ VR360, xếp ngang cạnh nhau. Switch hiện khi
             hover section, hoặc luôn hiện khi đang ở chế độ VR để người
             dùng có thể quay lại. -->
        <div class="hero-bottom-right-stack">
        <div v-if="heroSlides.length > 1 && !heroVrOn" class="hero-pagination" role="tablist" aria-label="Chuyển ảnh điểm di tích">
          <button
            v-for="(slide, __hpi) in heroSlides"
            :key="slide.id"
            type="button"
            class="hero-pagination__dot"
            :class="{ active: __hpi === heroActiveIndex }"
            role="tab"
            :aria-selected="__hpi === heroActiveIndex"
            :aria-label="slide.name"
            @click="goToHeroSlide(__hpi)"
          ></button>
        </div>
        <div v-if="!isMobile" class="hero-switch">
          <button
            type="button"
            class="hero-switch-opt"
            :class="{ active: !heroVrOn }"
            @click="heroVrOn = false"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span>{{ lang === "vi" ? "Ảnh" : "Image" }}</span>
          </button>
          <button
            type="button"
            class="hero-switch-opt"
            :class="{ active: heroVrOn }"
            @click="heroVrOn = true"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <ellipse cx="12" cy="12" rx="9" ry="4" />
              <path d="M3 12h18" />
            </svg>
            <span>VR360</span>
          </button>
        </div>
        </div>
        <div
          :style="{
            position: 'relative',
            zIndex: 3,
            maxWidth: '1280px',
            width: '100%',
            margin: '0 auto',
            padding: 'clamp(28px, 5vw, 64px) clamp(16px, 4vw, 40px)',
            pointerEvents: heroVrOn && !isMobile ? 'none' : 'auto',
          }"
        >
          <span
            style="
              display: inline-block;
              font-size: 12px;
              letter-spacing: 3px;
              text-transform: uppercase;
              color: #e7c56b;
              border: 1px solid rgba(231, 197, 107, 0.5);
              padding: 5px 14px;
              border-radius: 999px;
              margin-bottom: 18px;
              text-shadow: 0 1px 6px rgba(0, 0, 0, 0.55);
            "
            >{{ t.heroKicker }}</span
          >
          <h1
            style="
              font-family: 'Oswald', sans-serif;
              font-weight: 700;
              color: #f6ecd7;
              font-size: clamp(34px, 6vw, 68px);
              line-height: 1.05;
              margin: 0 0 14px;
              max-width: 18ch;
              text-wrap: balance;
              text-shadow: 0 3px 22px rgba(0, 0, 0, 0.6),
                0 1px 3px rgba(0, 0, 0, 0.6);
            "
          >
            {{ t.heroTitle }}
          </h1>
          <template v-if="showSecondary">
            <p
              style="
                font-family: 'Carattere', cursive;
                color: #e7c56b;
                font-size: clamp(30px, 4.8vw, 50px);
                line-height: 1.02;
                margin: 4px 0 14px;
                text-shadow: 0 2px 16px rgba(0, 0, 0, 0.6),
                  0 1px 3px rgba(0, 0, 0, 0.55);
              "
            >
              {{ t.heroScript }}
            </p>
          </template>
          <p
            style="
              color: rgba(246, 236, 215, 0.95);
              font-size: clamp(15px, 1.8vw, 19px);
              max-width: 62ch;
              margin: 0 0 26px;
              text-wrap: pretty;
              text-shadow: 0 1px 10px rgba(0, 0, 0, 0.7),
                0 1px 2px rgba(0, 0, 0, 0.65);
            "
          >
            {{ t.heroIntro }}
          </p>
          <div
            style="
              display: flex;
              gap: 12px;
              flex-wrap: wrap;
              pointer-events: auto;
            "
          >
            <button
              @click="goMap"
              style="
                background: #9e3b2e;
                color: #f6ecd7;
                border: none;
                border-radius: 6px;
                padding: 13px 26px;
                font-family: 'Roboto Condensed', sans-serif;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 6px 18px rgba(126, 43, 33, 0.35);
              "
              class="hv1"
            >
              {{ t.heroCta }}
            </button>
            <button
              @click="goVr"
              style="
                background: rgba(246, 236, 215, 0.12);
                color: #f6ecd7;
                border: 1px solid rgba(246, 236, 215, 0.45);
                border-radius: 6px;
                padding: 13px 26px;
                font-family: 'Roboto Condensed', sans-serif;
                font-size: 15px;
                font-weight: 500;
                cursor: pointer;
              "
              class="hv2"
            >
              {{ t.heroCta2 }}
            </button>
          </div>
        </div>
      </section>

      <!-- stats -->
      <section style="background: #2c4a5e">
        <div
          class="stats-grid"
          style="
            max-width: 1180px;
            margin: 0 auto;
            padding: clamp(22px, 3vw, 34px) clamp(16px, 4vw, 40px);
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 18px;
          "
        >
          <template v-for="(s, __i) in stats" :key="__i">
            <div
              style="
                text-align: center;
                color: #f6ecd7;
                border-left: 1px solid rgba(246, 236, 215, 0.18);
                padding: 4px 8px;
              "
            >
              <div
                style="
                  font-family: 'Oswald', sans-serif;
                  font-weight: 700;
                  font-size: clamp(30px, 4vw, 46px);
                  color: #e7c56b;
                  line-height: 1;
                "
              >
                {{ s.value }}
              </div>
              <div
                style="
                  font-size: 12.5px;
                  letter-spacing: 1px;
                  text-transform: uppercase;
                  margin-top: 6px;
                  color: rgba(246, 236, 215, 0.8);
                "
              >
                {{ s.label }}
              </div>
            </div>
          </template>
        </div>
      </section>

      <section
        style="
          max-width: 1180px;
          margin: 0 auto;
          padding: clamp(40px, 6vw, 72px) clamp(16px, 4vw, 40px)
            clamp(8px, 1vw, 12px);
        "
      >
        <div style="text-align: center; margin-bottom: 30px">
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 14px;
              max-width: 520px;
              margin: 0 auto 14px;
            "
          >
            <span
              style="
                height: 1px;
                flex: 1;
                background: linear-gradient(90deg, transparent, #c9b68f);
              "
            ></span
            ><span style="color: #b98f37; font-size: 13px">◆</span
            ><span
              style="
                height: 1px;
                flex: 1;
                background: linear-gradient(90deg, #c9b68f, transparent);
              "
            ></span>
          </div>
          <h2
            style="
              font-family: 'Playfair Display', serif;
              font-weight: 800;
              font-size: clamp(28px, 4.2vw, 44px);
              margin: 0;
              color: #2a2018;
              letter-spacing: -0.5px;
            "
          >
            {{ t.videoTitle }}
          </h2>
          <template v-if="showSecondary"
            ><p
              style="
                font-family: 'Carattere', cursive;
                color: #9e3b2e;
                margin: 2px 0 0;
                font-size: 34px;
                line-height: 1.02;
              "
            >
              {{ t.videoScript }}
            </p></template
          >
          <p
            style="
              color: #6a5a46;
              max-width: 60ch;
              margin: 12px auto 0;
              font-size: 15.5px;
              text-wrap: pretty;
            "
            v-html="t.videoDesc"
          ></p>
        </div>
        <div
          style="
            position: relative;
            max-width: 920px;
            margin: 0 auto;
            height: clamp(320px, 56vw, 520px);
            border-radius: 14px;
            overflow: hidden;
            background: linear-gradient(160deg, #34495e 0%, #22323f 100%);
            border: 3px solid #2c4a5e;
            box-shadow: 0 14px 40px rgba(42, 32, 24, 0.22);
          "
        >
          <template v-if="!showAuto">
            <Image
              :src="videoPoster"
              fallback="logo"
              style="
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
              "
            />
            <div
              style="
                position: absolute;
                inset: 0;
                background: linear-gradient(
                  180deg,
                  rgba(18, 24, 31, 0.35) 0%,
                  rgba(18, 24, 31, 0.72) 100%
                );
              "
            ></div>
            <div
              style="
                position: absolute;
                inset: 0;
                background-image: linear-gradient(
                    rgba(231, 197, 107, 0.06) 1px,
                    transparent 1px
                  ),
                  linear-gradient(
                    90deg,
                    rgba(231, 197, 107, 0.06) 1px,
                    transparent 1px
                  );
                background-size: 44px 44px;
              "
            ></div>
            <div
              style="
                position: absolute;
                inset: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: clamp(10px, 2.6vw, 16px);
                padding: 12px;
                cursor: pointer;
              "
            >
              <span
                style="
                  width: clamp(60px, 16vw, 86px);
                  height: clamp(60px, 16vw, 86px);
                  border-radius: 50%;
                  background: rgba(231, 197, 107, 0.95);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.35);
                "
              >
                <span
                  style="
                    width: 0;
                    height: 0;
                    border-left: 26px solid #2a2018;
                    border-top: 16px solid transparent;
                    border-bottom: 16px solid transparent;
                    margin-left: 7px;
                  "
                ></span>
              </span>
            </div>
            <span
              style="
                position: absolute;
                left: 16px;
                top: 14px;
                background: rgba(44, 74, 94, 0.9);
                color: #e7c56b;
                font-size: 11px;
                font-weight: 600;
                letter-spacing: 1.5px;
                padding: 5px 12px;
                border-radius: 5px;
              "
              >VR360</span
            >
          </template>
          <!-- <template v-else>
            <Vr360AutoTour
              :data="autoTourData"
              :autostart="true"
              title="Di tích Xã Thành Công"
            />
          </template> -->
        </div>
      </section>

      <!-- Về xã Thành Công -->
      <section
        style="
          max-width: 1180px;
          margin: 0 auto;
          padding: clamp(40px, 6vw, 72px) clamp(16px, 4vw, 40px);
        "
      >
        <div
          style="
            display: flex;
            gap: clamp(24px, 4vw, 48px);
            flex-wrap: wrap;
            align-items: flex-start;
          "
        >
          <div style="flex: 1 1 360px; min-width: min(300px, 100%)">
            <div
              style="
                display: flex;
                align-items: baseline;
                flex-wrap: wrap;
                gap: 6px 11px;
                margin: 0 0 16px;
              "
            >
              <span
                style="
                  width: 9px;
                  height: 9px;
                  background: #b98f37;
                  transform: rotate(45deg);
                  flex: none;
                  align-self: center;
                "
              ></span>
              <h3
                style="
                  font-family: 'Oswald', sans-serif;
                  font-weight: 700;
                  font-size: clamp(18px, 2.4vw, 24px);
                  color: #2a2018;
                  margin: 0;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                "
              >
                {{ t.communeTitle }}
              </h3>
              <template v-if="showSecondary"
                ><span
                  style="
                    font-family: 'Carattere', cursive;
                    color: #b07a2e;
                    font-size: 24px;
                    line-height: 1;
                  "
                  >{{ t.communeScript }}</span
                ></template
              >
            </div>
            <p
              class="commune-intro-p"
              style="
                font-size: 16px;
                line-height: 1.7;
                color: #473a2c;
                margin: 0 0 18px;
                text-wrap: pretty;
                text-align: justify;
              "
            >
              {{ t.communeIntro }}
            </p>
            <ul
              style="
                list-style: none;
                margin: 0;
                padding: 0;
                display: flex;
                flex-direction: column;
                gap: 12px;
              "
            >
              <template v-for="(hl, __i) in t.communeHighlights" :key="__i">
                <li class="commune-hl-item" style="display: flex; gap: 10px; align-items: flex-start">
                  <span
                    style="
                      width: 6px;
                      height: 6px;
                      background: #9e3b2e;
                      transform: rotate(45deg);
                      flex: none;
                      align-self: flex-start;
                      margin-top: 7px;
                    "
                  ></span>
                  <p
                    style="
                      margin: 0;
                      font-size: 15px;
                      line-height: 1.7;
                      color: #6a5a46;
                      text-wrap: pretty;
                      text-align: justify;
                    "
                  >
                    <strong style="color: #2a2018; font-weight: 700">{{ hl.t }}:</strong>
                    {{ hl.d }}
                  </p>
                </li>
              </template>
            </ul>
          </div>
          <div style="flex: 1 1 300px; min-width: min(260px, 100%)">
            <div
              style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1px;
                background: #e0d0ae;
                border: 1px solid #e0d0ae;
                border-radius: 12px;
                overflow: hidden;
              "
            >
              <template v-for="(cf, __i) in communeFacts" :key="__i">
                <div style="background: #fbf5e8; padding: 18px 18px">
                  <div
                    style="
                      font-family: 'Oswald', sans-serif;
                      font-weight: 700;
                      font-size: clamp(22px, 3vw, 30px);
                      color: #9e3b2e;
                      line-height: 1;
                    "
                  >
                    {{ cf.v }}
                  </div>
                  <div
                    style="
                      font-size: 12px;
                      letter-spacing: 0.5px;
                      color: #8a7350;
                      margin-top: 5px;
                      text-wrap: pretty;
                    "
                  >
                    {{ cf.k }}
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
        <!-- timeline hình thành & phát triển -->
        <div style="margin-top: 44px">
          <div
            style="
              display: flex;
              align-items: baseline;
              flex-wrap: wrap;
              gap: 6px 11px;
              margin: 0 0 24px;
            "
          >
            <span
              style="
                width: 9px;
                height: 9px;
                background: #b98f37;
                transform: rotate(45deg);
                flex: none;
                align-self: center;
              "
            ></span>
            <h3
              style="
                font-family: 'Oswald', sans-serif;
                font-weight: 700;
                font-size: clamp(18px, 2.4vw, 24px);
                color: #2a2018;
                margin: 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              "
            >
              {{ t.histTitle }}
            </h3>
            <template v-if="showSecondary"
              ><span
                style="
                  font-family: 'Carattere', cursive;
                  color: #b07a2e;
                  font-size: 24px;
                  line-height: 1;
                "
                >{{ t.histScript }}</span
              ></template
            >
          </div>
          <div class="timeline-swiper-wrap">
            <Swiper
              :modules="swiperModules"
              :pagination="{ clickable: true }"
              :slides-per-view="1"
              :loop="true"
              :grab-cursor="true"
              :auto-height="true"
              class="timeline-swiper"
              @swiper="onTimelineSwiperInit"
            >
              <SwiperSlide v-for="(img, idx) in timelineImgs" :key="idx">
                <div
                  class="timeline-img-btn"
                  role="button"
                  tabindex="0"
                  :aria-label="`Xem ảnh Hình thành & phát triển — giai đoạn ${idx + 1}`"
                  style="text-align: center; cursor: zoom-in"
                  @click="openTimelineLightbox(idx)"
                  @keydown.enter="openTimelineLightbox(idx)"
                  @keydown.space.prevent="openTimelineLightbox(idx)"
                >
                  <Image
                    :src="img"
                    fallback="logo"
                    style="max-width: 100%; width: 100%; height: auto; display: block; border-radius: 14px; box-shadow: 0 3px 14px rgba(90, 70, 40, 0.12)"
                  />
                </div>
              </SwiperSlide>
            </Swiper>
            <button
              type="button"
              class="timeline-nav timeline-nav--prev hv5"
              aria-label="Giai đoạn trước"
              @click="timelineSwiper?.slidePrev()"
            >
              ‹
            </button>
            <button
              type="button"
              class="timeline-nav timeline-nav--next hv5"
              aria-label="Giai đoạn sau"
              @click="timelineSwiper?.slideNext()"
            >
              ›
            </button>
          </div>
        </div>
        <!-- ẩm thực + văn hóa + tín ngưỡng -->
        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 18px;
            margin-top: 30px;
          "
        >
          <template v-for="cc in communeCards" :key="cc.id">
            <div
              class="theme-card"
              style="
                text-align: left;
                background: #fbf5e8;
                border: 1px solid #e0d0ae;
                border-radius: 12px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 2px 10px rgba(90, 70, 40, 0.06);
              "
            >
              <div
                style="
                  position: relative;
                  height: 210px;
                  background: repeating-linear-gradient(
                    45deg,
                    #e3d2b0 0 13px,
                    #dcc9a4 13px 26px
                  );
                "
              >
                <Swiper
                  :modules="swiperModules"
                  :pagination="{ clickable: true }"
                  :slides-per-view="1"
                  :space-between="0"
                  :loop="cc.gallery.length > 1"
                  :grab-cursor="true"
                  style="width: 100%; height: 100%"
                  @swiper="(sw) => onThemeSwiperInit(cc.id, sw)"
                >
                  <SwiperSlide v-for="(src, i) in cc.gallery" :key="i">
                    <Image
                      :src="src"
                      fallback="logo"
                      :style="`width:100%;height:100%;object-fit:cover;display:block;--theme-accent:${cc.color}`"
                    />
                  </SwiperSlide>
                </Swiper>
                <template v-if="cc.gallery.length > 1">
                  <span
                    class="theme-card-nav theme-card-nav--prev"
                    role="button"
                    tabindex="0"
                    aria-label="Ảnh trước"
                    @click.stop="themeSwipers[cc.id]?.slidePrev()"
                    @keydown.enter.stop="themeSwipers[cc.id]?.slidePrev()"
                    >‹</span
                  >
                  <span
                    class="theme-card-nav theme-card-nav--next"
                    role="button"
                    tabindex="0"
                    aria-label="Ảnh sau"
                    @click.stop="themeSwipers[cc.id]?.slideNext()"
                    @keydown.enter.stop="themeSwipers[cc.id]?.slideNext()"
                    >›</span
                  >
                </template>
                <span
                  :style="`position:absolute;top:12px;left:12px;background:${cc.color};color:#F6ECD7;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;padding:4px 11px;border-radius:5px;z-index:5;pointer-events:none;box-shadow:0 2px 6px rgba(0,0,0,.25)`"
                  >{{ cc.tag }}</span
                >
              </div>
              <div
                style="
                  padding: 18px 20px 22px;
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  gap: 8px;
                "
              >
                <h3
                  style="
                    font-family: 'Oswald', sans-serif;
                    font-weight: 600;
                    font-size: 19px;
                    color: #2a2018;
                    margin: 0;
                  "
                >
                  {{ cc.title }}
                </h3>
                <p
                  style="
                    font-size: 14px;
                    color: #6a5a46;
                    margin: 0;
                    line-height: 1.6;
                    text-wrap: pretty;
                  "
                >
                  {{ cc.intro || cc.desc }}
                </p>
              </div>
            </div>
          </template>
        </div>
      </section>

      <!-- 09 sites -->
      <section
        id="sec-sites"
        style="
          background: #f4e8cf;
          border-top: 1px solid #e0d0ae;
          border-bottom: 1px solid #e0d0ae;
          scroll-margin-top: 84px;
        "
      >
        <div
          style="
            max-width: 1180px;
            margin: 0 auto;
            padding: clamp(40px, 6vw, 80px) clamp(16px, 4vw, 40px);
          "
        >
          <div style="text-align: center; margin-bottom: 34px">
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 14px;
                max-width: 520px;
                margin: 0 auto 14px;
              "
            >
              <span
                style="
                  height: 1px;
                  flex: 1;
                  background: linear-gradient(90deg, transparent, #c9b68f);
                "
              ></span
              ><span style="color: #b98f37; font-size: 13px">◆</span
              ><span
                style="
                  height: 1px;
                  flex: 1;
                  background: linear-gradient(90deg, #c9b68f, transparent);
                "
              ></span>
            </div>
            <h2
              style="
                font-family: 'Playfair Display', serif;
                font-weight: 800;
                font-size: clamp(28px, 4.2vw, 44px);
                margin: 0;
                color: #2a2018;
                letter-spacing: -0.5px;
              "
            >
              {{ t.secSites }}
            </h2>
            <template v-if="showSecondary"
              ><p
                style="
                  font-family: 'Carattere', cursive;
                  color: #9e3b2e;
                  margin: 2px 0 0;
                  font-size: 34px;
                  line-height: 1.02;
                "
              >
                {{ t.secSitesScript }}
              </p></template
            >
            <p
              style="
                color: #6a5a46;
                max-width: 58ch;
                margin: 12px auto 0;
                font-size: 15.5px;
                text-wrap: pretty;
              "
            >
              {{ t.secSitesDesc }}
            </p>
          </div>
          <div
            :style="`display:grid;grid-template-columns:${sitesCols};gap:22px`"
          >
            <template v-for="site in sites" :key="site.id">
              <button
                @click="site.openDetail"
                style="
                  text-align: left;
                  background: #fbf5e8;
                  border: 1px solid #e0d0ae;
                  border-radius: 10px;
                  overflow: hidden;
                  cursor: pointer;
                  padding: 0;
                  display: flex;
                  flex-direction: column;
                  box-shadow: 0 2px 10px rgba(90, 70, 40, 0.06);
                  transition: transform 0.18s, box-shadow 0.18s;
                "
                class="hv4"
              >
                <div
                  style="
                    position: relative;
                    height: 170px;
                    background: repeating-linear-gradient(
                      45deg,
                      #e3d2b0 0 14px,
                      #dcc9a4 14px 28px
                    );
                  "
                >
                  <Swiper
                    :modules="swiperModules"
                    :loop="site.images.length > 1"
                    :slides-per-view="1"
                    :space-between="0"
                    :grab-cursor="site.images.length > 1"
                    :allow-touch-move="site.images.length > 1"
                    class="site-card-swiper"
                    style="position: absolute; inset: 0; width: 100%; height: 100%"
                    @swiper="(sw) => onSiteSwiperInit(site.id, sw)"
                  >
                    <SwiperSlide v-for="(src, si) in site.images" :key="si">
                      <Image
                        :src="src"
                        fallback="logo"
                        style="width: 100%; height: 100%; object-fit: cover; display: block"
                      />
                    </SwiperSlide>
                  </Swiper>
                  <template v-if="site.images.length > 1">
                    <span
                      class="site-card-nav site-card-nav--prev"
                      role="button"
                      tabindex="0"
                      aria-label="Ảnh trước"
                      @click.stop="siteSwipers[site.id]?.slidePrev()"
                      @keydown.enter.stop="siteSwipers[site.id]?.slidePrev()"
                      >‹</span
                    >
                    <span
                      class="site-card-nav site-card-nav--next"
                      role="button"
                      tabindex="0"
                      aria-label="Ảnh sau"
                      @click.stop="siteSwipers[site.id]?.slideNext()"
                      @keydown.enter.stop="siteSwipers[site.id]?.slideNext()"
                      >›</span
                    >
                  </template>
                  <span
                    style="
                      position: absolute;
                      top: 12px;
                      left: 12px;
                      width: 30px;
                      height: 30px;
                      border-radius: 50%;
                      background: #9e3b2e;
                      color: #f6ecd7;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-family: 'Oswald', sans-serif;
                      font-weight: 700;
                      font-size: 15px;
                      border: 2px solid #e7c56b;
                      z-index: 5;
                      pointer-events: none;
                    "
                    >{{ site.num }}</span
                  >
                  <div
                    style="
                      position: absolute;
                      top: 12px;
                      right: 12px;
                      display: flex;
                      gap: 6px;
                      z-index: 5;
                      pointer-events: none;
                    "
                  >
                    <span
                      style="
                        background: rgba(44, 74, 94, 0.92);
                        color: #e7c56b;
                        font-size: 10px;
                        font-weight: 600;
                        letter-spacing: 0.5px;
                        padding: 4px 8px;
                        border-radius: 4px;
                      "
                      >VR360</span
                    >
                    <template v-if="site.d3"
                      ><span
                        style="
                          background: rgba(158, 59, 46, 0.92);
                          color: #f6ecd7;
                          font-size: 10px;
                          font-weight: 600;
                          letter-spacing: 0.5px;
                          padding: 4px 8px;
                          border-radius: 4px;
                        "
                        >3D</span
                      ></template
                    >
                  </div>
                </div>
                <div style="padding: 18px 20px 20px">
                  <div
                    style="
                      font-size: 11px;
                      letter-spacing: 1.5px;
                      text-transform: uppercase;
                      color: #b98f37;
                      font-weight: 600;
                    "
                  >
                    {{ site.type }}
                  </div>
                  <h3
                    style="
                      font-family: 'Oswald', sans-serif;
                      font-weight: 600;
                      font-size: 21px;
                      margin: 4px 0 2px;
                      color: #2a2018;
                    "
                  >
                    {{ site.name }}
                  </h3>
                  <div
                    style="
                      font-family: 'Carattere', cursive;
                      font-size: 23px;
                      line-height: 1;
                      color: #b07a2e;
                      margin: -2px 0 9px;
                    "
                  >
                    {{ site.altName }}
                  </div>
                  <p
                    style="
                      font-size: 14px;
                      color: #6a5a46;
                      margin: 0;
                      text-wrap: pretty;
                    "
                  >
                    {{ site.desc }}
                  </p>
                </div>
              </button>
            </template>
          </div>
        </div>
      </section>

      <!-- Lễ hội văn hóa — timeline ngang -->
      <section
        id="sec-festivals"
        style="
          background: #fbf5e8;
          border-top: 1px solid #e0d0ae;
          border-bottom: 1px solid #e0d0ae;
          scroll-margin-top: 84px;
        "
      >
        <div
          style="
            max-width: 1180px;
            margin: 0 auto;
            padding: clamp(40px, 6vw, 72px) clamp(16px, 4vw, 40px);
          "
        >
          <div style="text-align: center; margin-bottom: 40px">
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 14px;
                max-width: 520px;
                margin: 0 auto 14px;
              "
            >
              <span
                style="
                  height: 1px;
                  flex: 1;
                  background: linear-gradient(90deg, transparent, #c9b68f);
                "
              ></span
              ><span style="color: #b98f37; font-size: 13px">◆</span
              ><span
                style="
                  height: 1px;
                  flex: 1;
                  background: linear-gradient(90deg, #c9b68f, transparent);
                "
              ></span>
            </div>
            <h2
              style="
                font-family: 'Playfair Display', serif;
                font-weight: 800;
                font-size: clamp(28px, 4.2vw, 44px);
                margin: 0;
                color: #2a2018;
                letter-spacing: -0.5px;
              "
            >
              {{ t.secLink }}
            </h2>
            <p
              style="
                color: #6a5a46;
                max-width: 60ch;
                margin: 12px auto 0;
                font-size: 15.5px;
                text-wrap: pretty;
              "
            >
              {{ t.secLinkDesc }}
            </p>
          </div>
          <div
            class="fest-carousel-row"
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: clamp(6px, 1.5vw, 16px);
              max-width: 1180px;
              margin: 0 auto;
            "
          >
            <button
              @click="festPrevClick"
              style="
                flex: none;
                margin-bottom: 64px;
                width: clamp(42px, 5vw, 52px);
                height: clamp(42px, 5vw, 52px);
                border-radius: 50%;
                background: #fbf5e8;
                border: 1.5px solid #d8c8a6;
                color: #9e3b2e;
                font-size: 24px;
                line-height: 1;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(90, 70, 40, 0.1);
              "
              class="hv5"
            >
              ‹
            </button>
            <div
              style="
                position: relative;
                flex: 1 1 auto;
                min-width: 0;
                padding-top: 6px;
              "
            >
              <div
                style="
                  position: absolute;
                  left: 3%;
                  right: 3%;
                  bottom: 50px;
                  height: 2px;
                  border-radius: 1px;
                  background: linear-gradient(
                    90deg,
                    transparent,
                    #cdb98f 12%,
                    #cdb98f 88%,
                    transparent
                  );
                  z-index: 0;
                "
              ></div>
              <div
                style="
                  display: flex;
                  align-items: flex-end;
                  justify-content: center;
                  gap: clamp(8px, 1.6vw, 20px);
                  position: relative;
                  z-index: 1;
                "
              >
                <template v-for="(s, __i) in festSlots" :key="s.id + '-' + __i">
                  <div
                    :style="`flex:none;width:${s.cardW};display:flex;flex-direction:column;align-items:center;opacity:${s.opacity}`"
                  >
                    <button
                      @click="s.onClick"
                      :style="`width:100%;background:${s.cardBg};border:1.5px solid ${s.cardBorder};border-radius:13px;overflow:hidden;box-shadow:${s.cardShadow};cursor:pointer;text-align:left;padding:0;display:block;margin-bottom:14px`"
                      class="hv6"
                    >
                      <div
                        :style="`position:relative;height:${
                          s.imgH
                        };background:${
                          s.img
                            ? `#E3D2B0 center/cover no-repeat url('${s.img}')`
                            : 'repeating-linear-gradient(45deg,#E3D2B0 0 13px,#DCC9A4 13px 26px)'
                        };display:flex;align-items:center;justify-content:center;color:rgba(122,99,62,.5);font-family:monospace;font-size:9.5px;text-align:center;padding:0 8px`"
                      >
                        <template v-if="!s.img">[ảnh: {{ s.name }}]</template>
                        <template v-if="s.badge">
                          <span
                            :style="`position:absolute;top:9px;left:9px;display:inline-flex;align-items:center;justify-content:center;line-height:1;max-width:calc(100% - 18px);background:${s.badgeBg};color:#F6ECD7;font-size:${s.badgeSize};font-weight:600;letter-spacing:.5px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:${s.badgePad};border-radius:999px;box-shadow:0 3px 10px rgba(0,0,0,.18)`"
                            >{{ s.badge }}</span
                          >
                        </template>
                      </div>
                      <div :style="`padding:${s.namePad}`">
                        <template v-if="s.showMeta"
                          ><div
                            style="
                              display: flex;
                              align-items: center;
                              gap: 6px;
                              margin-bottom: 5px;
                            "
                          >
                            <span
                              :style="`width:7px;height:7px;background:${s.accent};transform:rotate(45deg);flex:none`"
                            ></span
                            ><span
                              style="
                                font-size: 10.5px;
                                letter-spacing: 0.5px;
                                color: #8a7350;
                                font-weight: 600;
                                text-transform: uppercase;
                              "
                              >{{ s.season }}</span
                            >
                          </div></template
                        >
                        <h3
                          :style="`font-family:'Playfair Display',serif;font-weight:700;font-size:${s.nameSize};color:#2A2018;margin:0;line-height:1.2;min-height:2.4em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden`"
                        >
                          {{ s.name }}
                        </h3>
                        <template v-if="s.isCenter">
                          <p
                            style="
                              font-size: 14px;
                              color: #5a4a39;
                              margin: 10px 0 0;
                              line-height: 1.6;
                              text-wrap: pretty;
                              min-height: 4.8em;
                              display: -webkit-box;
                              -webkit-line-clamp: 3;
                              -webkit-box-orient: vertical;
                              overflow: hidden;
                            "
                          >
                            {{ s.intro }}
                          </p>
                          <span
                            style="
                              display: inline-flex;
                              align-items: center;
                              gap: 6px;
                              margin-top: 12px;
                              font-family: 'Roboto Condensed', sans-serif;
                              font-weight: 600;
                              font-size: 13px;
                              color: #9e3b2e;
                            "
                            >{{ t.themeCta }} →</span
                          >
                        </template>
                      </div>
                    </button>
                    <div
                      style="
                        height: 26px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      "
                    >
                      <span
                        :style="`width:${s.dotSize};height:${s.dotSize};border-radius:50%;background:${s.dotColor};border:3px solid #FBF5E8;animation:${s.dotAnim};flex:none`"
                      ></span>
                    </div>
                    <div
                      style="
                        height: 38px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        padding-top: 5px;
                      "
                    >
                      <span
                        :style="`font-family:'Roboto Condensed',sans-serif;font-size:${s.dateSize};color:#9E3B2E;font-weight:600;line-height:1.2`"
                        >{{ s.dateLabel }}</span
                      ><span
                        style="
                          font-size: 9.5px;
                          color: #9c8868;
                          letter-spacing: 0.5px;
                          margin-top: 2px;
                        "
                        >{{ s.calLabel }}</span
                      >
                    </div>
                  </div>
                </template>
              </div>
            </div>
            <button
              @click="festNextClick"
              style="
                flex: none;
                margin-bottom: 64px;
                width: clamp(42px, 5vw, 52px);
                height: clamp(42px, 5vw, 52px);
                border-radius: 50%;
                background: #fbf5e8;
                border: 1.5px solid #d8c8a6;
                color: #9e3b2e;
                font-size: 24px;
                line-height: 1;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(90, 70, 40, 0.1);
              "
              class="hv7"
            >
              ›
            </button>
          </div>
          <div
            style="
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              justify-content: center;
              gap: 9px;
              margin: 24px auto 0;
              max-width: 560px;
            "
          >
            <template v-for="(d, __i) in festDots" :key="'dot-' + __i">
              <button
                @click="d.onClick"
                :title="d.name"
                :style="`width:${d.size};height:${d.size};border-radius:50%;background:${d.bg};border:none;cursor:pointer;padding:0;transition:transform .15s`"
                class="hv8"
              ></button>
            </template>
          </div>
          <div
            style="
              text-align: center;
              margin-top: 12px;
              font-family: 'Roboto Condensed', sans-serif;
              font-size: 13px;
              color: #9c8868;
              letter-spacing: 1px;
            "
          >
            {{ festPos }}
          </div>
        </div>
      </section>
    </main>

    <!-- Lightbox ảnh "Hình thành & phát triển" — cùng kiểu xem ảnh với
         trang chi tiết địa điểm (Teleport ra <body> để thoát khỏi mọi
         containing-block/stacking context của ancestor). -->
    <Teleport to="body">
      <Transition name="timeline-lb">
        <div
          v-if="timelineLightboxOn"
          class="timeline-lightbox"
          role="dialog"
          aria-modal="true"
          :aria-label="t.histTitle"
          @click.self="closeTimelineLightbox"
        >
          <button
            class="timeline-lightbox__close"
            type="button"
            aria-label="Đóng"
            @click="closeTimelineLightbox"
          >
            ×
          </button>
          <figure class="timeline-lightbox__stage" @click.stop>
            <div class="timeline-lightbox__frame">
              <Image :src="timelineImgs[timelineLightboxIdx]" fallback="logo" class="timeline-lightbox__img" />
            </div>
            <figcaption class="timeline-lightbox__cap">{{ t.histTitle }} — Giai đoạn {{ timelineLightboxIdx + 1 }}</figcaption>
          </figure>
        </div>
      </Transition>
    </Teleport>
  </template>
</template>

<style scoped>
.hv1:hover {
  background: #7c2b21;
}
.hv2:hover {
  background: rgba(246, 236, 215, 0.22);
}
.hv3:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 26px rgba(90, 70, 40, 0.16);
}
.hv4:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 26px rgba(90, 70, 40, 0.16);
}
.hv5:hover {
  background: #9e3b2e;
  color: #f6ecd7;
  border-color: #9e3b2e;
}
.hv6:hover {
  box-shadow: 0 14px 32px rgba(126, 43, 33, 0.2);
}
.hv7:hover {
  background: #9e3b2e;
  color: #f6ecd7;
  border-color: #9e3b2e;
}
.hv8:hover {
  transform: scale(1.35);
}

/* Hero VR: ảnh pano đã preload nên không cần hiện lớp "Loading VR360 / 0%" */
.hero-vr-wrap :deep(.loading-screen) {
  display: none !important;
}
.hero-vr-wrap :deep(.vr-tour) {
  background: #120d09;
}

/* Hero slideshow — Swiper 9 ảnh điểm di tích, tự chuyển. */
.hero-sec-swiper :deep(.swiper-wrapper),
.hero-sec-swiper :deep(.swiper-slide) {
  width: 100%;
  height: 100%;
}

/* Pagination TỰ DỰNG (không dùng module Pagination của Swiper): đặt làm
   sibling trực tiếp trong .hero-sec, NGANG CẤP với scrim/content thay vì
   nằm bên trong cây Swiper — nếu để module Pagination mặc định render
   bên trong Swiper (z-index:0), khối nội dung hero (pointer-events:auto,
   z-index:3) đứng cùng cấp cha sẽ đè lên toàn bộ Swiper kể cả khi
   pagination có z-index nội bộ cao hơn — chỉ THẤY được mà không BẤM
   được, vì stacking-context của Swiper bị "giam" dưới content. Dựng
   riêng ở đây thoát khỏi vấn đề đó hoàn toàn. */
.hero-pagination {
  display: flex;
  gap: 8px;
}
.hero-pagination__dot {
  width: 9px;
  height: 9px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(246, 236, 215, 0.5);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}
.hero-pagination__dot:hover {
  background: rgba(246, 236, 215, 0.85);
}
.hero-pagination__dot.active {
  background: #e7c56b;
  transform: scale(1.3);
}
/* Stack góc phải-dưới: pagination + switch Ảnh↔VR360, xếp ngang cạnh
   nhau. Cùng lý do stacking-context như trước: đặt trực tiếp trong
   .hero-sec, KHÔNG lồng trong cây Swiper — nếu không sẽ chỉ THẤY được
   mà không BẤM được do stacking-context của Swiper bị "giam" dưới
   content. */
.hero-bottom-right-stack {
  position: absolute;
  bottom: clamp(18px, 3.2vw, 30px);
  right: clamp(16px, 4vw, 40px);
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 14px;
}
@media (max-width: 640px) {
  .hero-bottom-right-stack {
    display: none;
  }
}

/* Thống kê nhanh (09 điểm di tích / 02 mô hình 3D / 09 VR360) — giữ đúng
   1 hàng ngang trên mobile, không để auto-fit rớt xuống dòng khi màn hẹp. */
@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 8px !important;
  }
}

/* Nút lùi/tiến carousel lễ hội (hv5/hv7) — trên mobile chuyển sang
   position:absolute, nổi đè lên 2 mép carousel thay vì chiếm chỗ trong
   hàng flex, để phần thẻ lễ hội có full chiều rộng. */
.fest-carousel-row {
  position: relative;
}
@media (max-width: 640px) {
  .fest-carousel-row .hv5,
  .fest-carousel-row .hv7 {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 3;
  }
  .fest-carousel-row .hv5 {
    left: 2px;
  }
  .fest-carousel-row .hv7 {
    right: 2px;
  }
}

/* Giới thiệu về Xã Thành Công — lùi lề đoạn giới thiệu + từng highlight
   trên desktop; bỏ lùi lề trên mobile để không chiếm hẹp chỗ đọc. */
.commune-intro-p,
.commune-hl-item {
  padding-left: 2em;
}
@media (max-width: 640px) {
  .commune-intro-p,
  .commune-hl-item {
    padding-left: 0;
  }
}

/* Stack góc phải-trên: badge tên điểm di tích. */
.hero-top-right-stack {
  position: absolute;
  top: clamp(14px, 2vw, 22px);
  right: clamp(14px, 2vw, 22px);
  z-index: 6;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

/* Badge tên địa điểm — hiện theo slide đang active, góc phải-trên
   (cùng stack với switch Ảnh↔VR360). */
.hero-slide-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(18, 13, 9, 0.55);
  backdrop-filter: blur(10px) saturate(1.3);
  -webkit-backdrop-filter: blur(10px) saturate(1.3);
  border: 1px solid rgba(231, 197, 107, 0.35);
  border-radius: 999px;
  padding: 6px 14px 6px 6px;
  pointer-events: none;
}
.hero-slide-badge__num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #9e3b2e;
  color: #f6ecd7;
  font-family: "Oswald", sans-serif;
  font-weight: 700;
  font-size: 11px;
  flex: none;
}
.hero-slide-badge__name {
  font-family: "Oswald", sans-serif;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.3px;
  color: #f6ecd7;
  white-space: nowrap;
}
@media (max-width: 640px) {
  .hero-slide-badge__name {
    font-size: 12px;
    max-width: 46vw;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* Switch Ảnh ↔ VR360 — pill 2 lựa chọn nổi góc phải dưới khung hero,
   cạnh pagination. Luôn hiển thị trên desktop (v-if="!isMobile" ẩn hẳn
   trên mobile), không cần hover mới hiện. */
.hero-switch {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  background: rgba(18, 13, 9, 0.55);
  backdrop-filter: blur(14px) saturate(1.4);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  border: 1px solid rgba(231, 197, 107, 0.35);
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}
.hero-switch-opt {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: none;
  background: transparent;
  color: rgba(246, 236, 215, 0.78);
  font-family: "Roboto Condensed", sans-serif;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  border-radius: 999px;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
}
.hero-switch-opt:hover {
  color: #f6ecd7;
}
.hero-switch-opt.active {
  background: #9e3b2e;
  color: #f6ecd7;
  box-shadow: 0 3px 12px rgba(126, 43, 33, 0.45);
}
.hero-switch-opt svg {
  flex: none;
}

/* Swiper trong card chủ đề — dot điều hướng có nền bán trong suốt để
   luôn đọc được cả khi ảnh sáng hay tối. */
.theme-card :deep(.swiper) {
  width: 100%;
  height: 100%;
}
.theme-card :deep(.swiper-pagination) {
  bottom: 10px !important;
}
.theme-card :deep(.swiper-pagination-bullet) {
  background: rgba(255, 255, 255, 0.75);
  opacity: 0.85;
  width: 8px;
  height: 8px;
  transition: transform 0.18s, background 0.18s, opacity 0.18s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}
.theme-card :deep(.swiper-pagination-bullet-active) {
  background: #ffffff;
  opacity: 1;
  transform: scale(1.25);
}

.timeline-swiper-wrap {
  position: relative;
}
.timeline-swiper {
  position: relative;
  padding-bottom: 28px;
}
.timeline-swiper :deep(.swiper-pagination) {
  bottom: 0 !important;
}
.timeline-swiper :deep(.swiper-pagination-bullet) {
  background: rgba(90, 70, 40, 0.35);
  opacity: 1;
  width: 8px;
  height: 8px;
  transition: transform 0.18s, background 0.18s;
}
.timeline-swiper :deep(.swiper-pagination-bullet-active) {
  background: #b98f37;
  transform: scale(1.25);
}
.timeline-nav {
  position: absolute;
  top: calc(50% - 14px);
  transform: translateY(-50%);
  width: clamp(36px, 5vw, 44px);
  height: clamp(36px, 5vw, 44px);
  border-radius: 50%;
  background: #fbf5e8;
  border: 1.5px solid #d8c8a6;
  color: #9e3b2e;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(90, 70, 40, 0.15);
  z-index: 2;
}
.timeline-nav--prev {
  left: 6px;
}
.timeline-nav--next {
  right: 6px;
}
@media (max-width: 640px) {
  .timeline-nav {
    width: 34px;
    height: 34px;
    font-size: 18px;
  }
}
/* 2 nút trái/phải trên mỗi thẻ ảnh địa điểm (mục "09 Điểm di tích") */
.site-card-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(20, 14, 10, 0.45);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  z-index: 6;
  transition: background 0.18s ease;
}
.site-card-nav:hover,
.site-card-nav:focus-visible {
  background: rgba(158, 59, 46, 0.85);
  outline: none;
}
.site-card-nav--prev {
  left: 6px;
}
.site-card-nav--next {
  right: 6px;
}
/* 2 nút trái/phải trên ảnh thẻ chủ đề (Nghệ thuật hát Soọng cô, Bản sắc
   Sán Dìu, Tín ngưỡng hòa quyện) */
.theme-card-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(20, 14, 10, 0.45);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  z-index: 6;
  transition: background 0.18s ease;
}
.theme-card-nav:hover,
.theme-card-nav:focus-visible {
  background: rgba(158, 59, 46, 0.85);
  outline: none;
}
.theme-card-nav--prev {
  left: 8px;
}
.theme-card-nav--next {
  right: 8px;
}
.timeline-img-btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 14px;
}
.timeline-img-btn:hover {
  transform: translateY(-2px);
}
.timeline-img-btn:focus-visible {
  outline: 2px solid #e7c56b;
  outline-offset: 2px;
}

/* ─── Lightbox ảnh "Hình thành & phát triển" ───
   Fullscreen overlay tối, ảnh contain vừa khung, caption dưới ảnh.
   Cùng kiểu hiển thị với lightbox ở trang chi tiết địa điểm. */
.timeline-lightbox {
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
.timeline-lightbox__stage {
  width: 100%;
  max-width: min(1200px, 95vw);
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
  margin: auto 0;
}
.timeline-lightbox__frame {
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
.timeline-lightbox__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.timeline-lightbox__cap {
  color: #f6ecd7;
  font-size: 14.5px;
  text-align: center;
  max-width: 700px;
  line-height: 1.5;
  margin: 0;
}
.timeline-lightbox__close {
  position: absolute;
  top: clamp(12px, 2vw, 24px);
  right: clamp(12px, 2vw, 28px);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(231, 197, 107, 0.32);
  background: rgba(20, 14, 10, 0.62);
  color: #f6ecd7;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-size: 28px;
  transition: background 0.18s ease, transform 0.2s ease, border-color 0.18s ease;
}
.timeline-lightbox__close:hover,
.timeline-lightbox__close:focus-visible {
  background: #9e3b2e;
  border-color: rgba(231, 197, 107, 0.6);
  transform: rotate(90deg);
  outline: none;
}
@media (max-width: 640px) {
  .timeline-lightbox__frame {
    width: min(100%, 92vw);
    height: min(58vh, 520px);
  }
  .timeline-lightbox__close {
    width: 40px;
    height: 40px;
    font-size: 24px;
  }
  .timeline-lightbox__cap {
    font-size: 13px;
  }
}
.timeline-lb-enter-active,
.timeline-lb-leave-active {
  transition: opacity 0.22s ease;
}
.timeline-lb-enter-active .timeline-lightbox__stage,
.timeline-lb-leave-active .timeline-lightbox__stage {
  transition: transform 0.28s cubic-bezier(0.2, 0.7, 0.2, 1), opacity 0.24s ease;
}
.timeline-lb-enter-from,
.timeline-lb-leave-to {
  opacity: 0;
}
.timeline-lb-enter-from .timeline-lightbox__stage,
.timeline-lb-leave-to .timeline-lightbox__stage {
  opacity: 0;
  transform: scale(0.94);
}
</style>
