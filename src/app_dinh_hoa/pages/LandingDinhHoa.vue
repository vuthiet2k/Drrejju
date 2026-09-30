<template>
  <div class="dh-landing">
    <!-- ================================================================= -->
    <!-- 1. HERO BANNER: DANH LAM THẮNG CẢNH CHÙA HANG -->
    <!-- ================================================================= -->
    <section id="hero" class="dh-hero-section">
      <div class="dh-hero-bg">
        <img
          src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1920&q=85"
          alt="Chùa Hang Tiên Lữ Phật Động - ATK Định Hóa"
          class="dh-hero-img"
        />
        <div class="dh-hero-overlay"></div>
      </div>

      <div class="dh-hero-content">
        <div class="dh-hero-top-row">
          <div class="dh-hero-quote-card">
            <span class="dh-quote-badge">DI TÍCH LỊCH SỬ</span>
            <p class="dh-quote-text">
              Danh thắng có tự độc đáo nằm trong lòng hang đá vôi kỳ vĩ gắn với thời kỳ kháng chiến và nơi lưu trú, làm việc của Bác Hồ sau chiến dịch Biên giới 1950.
            </p>
          </div>

          <div class="dh-hero-title-group">
            <h1 class="dh-hero-main-title">
              DI TÍCH LỊCH SỬ<br />
              <span>DANH LAM THẮNG CẢNH</span>
            </h1>
            <p class="dh-hero-location-tag">THỦ ĐÔ KHÁNG CHIẾN ATK ĐỊNH HÓA — THÁI NGUYÊN</p>
          </div>
        </div>

        <div class="dh-hero-bottom-row">
          <div class="dh-hero-cta-group">
            <a href="#sa-ban-3d" class="dh-btn dh-btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                <line x1="8" y1="2" x2="8" y2="18"></line>
                <line x1="16" y1="6" x2="16" y2="22"></line>
              </svg>
              <span>Mở Sa Bàn Số 3D</span>
            </a>
            <a href="#vr360" class="dh-btn dh-btn-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
              <span>Tham Quan VR360</span>
            </a>
          </div>

          <div class="dh-hero-view-switch">
            <button
              type="button"
              class="dh-switch-btn"
              :class="{ active: !heroVrMode }"
              @click="heroVrMode = false"
            >
              ẢNH TĨNH
            </button>
            <button
              type="button"
              class="dh-switch-btn"
              :class="{ active: heroVrMode }"
              @click="heroVrMode = true"
            >
              VR360 TỰ XOAY
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. QUICK STATS BAR (FACT STRIP) -->
    <!-- ================================================================= -->
    <section class="dh-stats-strip">
      <div class="dh-container dh-stats-grid">
        <div v-for="(stat, idx) in quickStats" :key="idx" class="dh-stat-item">
          <div class="dh-stat-value">{{ stat.value }}</div>
          <div class="dh-stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 3. OVERVIEW: THỦ ĐÔ KHÁNG CHIẾN ATK ĐỊNH HÓA -->
    <!-- ================================================================= -->
    <section id="tong-quan" class="dh-section dh-overview-section">
      <div class="dh-container dh-overview-grid">
        <div class="dh-overview-left">
          <span class="dh-section-kicker">CỘI NGUỒN CÁCH MẠNG</span>
          <h2 class="dh-section-title">
            Thủ đô Kháng chiến<br />
            <span class="dh-text-gold">ATK ĐỊNH HÓA</span>
          </h2>
          <div class="dh-fact-list">
            <div v-for="(fact, fidx) in communeFacts" :key="fidx" class="dh-fact-row">
              <span class="dh-fact-key">{{ fact.k }}</span>
              <span class="dh-fact-val">{{ fact.v }}</span>
            </div>
          </div>
        </div>

        <div class="dh-overview-right">
          <p class="dh-paragraph-justify">
            Nằm ở vị trí chiến lược hiểm trở "tiến có thể đánh, lui có thể giữ" phía tây bắc Thái Nguyên, Định Hóa được Trung ương Đảng, Chính phủ và Chủ tịch Hồ Chí Minh tin tưởng chọn làm trung tâm An Toàn Khu (ATK) trong suốt cuộc kháng chiến chống thực dân Pháp (1946 – 1954).
          </p>
          <p class="dh-paragraph-justify">
            Dưới những tán rừng đại ngàn và lán trại dã chiến, Bác Hồ cùng Đại tướng Võ Nguyên Giáp và các cơ quan đầu não quân sự đã trực tiếp làm việc, chỉ huy phong trào cách mạng cả nước và vạch định những kế hoạch tác chiến mang tính bước ngoặt, đỉnh cao là chiến thắng lịch sử Điện Biên Phủ "lừng lẫy năm châu, chấn động địa cầu".
          </p>
          <p class="dh-paragraph-justify">
            Ngày nay, quần thể Di tích Quốc gia Đặc biệt ATK Định Hóa với 128 điểm di tích lịch sử cách mạng được tái hiện sinh động qua không gian số hóa 3D/VR, kết nối những mốc son lịch sử hào hùng cùng bản sắc văn hóa đặc sắc của đồng bào các dân tộc Việt Bắc.
          </p>
        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 4. TIMELINE: HÌNH THÀNH VÀ PHÁT TRIỂN -->
    <!-- ================================================================= -->
    <section id="nien-bieu" class="dh-section dh-timeline-section">
      <div class="dh-container">
        <div class="dh-section-header-center">
          <span class="dh-section-kicker">TIẾN TRÌNH LỊCH SỬ</span>
          <h2 class="dh-section-title">HÌNH THÀNH VÀ PHÁT TRIỂN</h2>
          <p class="dh-section-desc">
            Hành trình lịch sử từ khởi dựng Tiên Lữ Phật Động năm 1719, cao trào cách mạng 1945, đại bản doanh kháng chiến ATK đến kỷ nguyên bảo tồn số hóa.
          </p>
        </div>

        <!-- Featured Historic Image Display -->
        <div class="dh-timeline-featured-card">
          <img
            :src="currentMilestone.image"
            :alt="currentMilestone.title"
            class="dh-timeline-featured-img"
          />
          <div class="dh-timeline-featured-info">
            <span class="dh-timeline-badge">{{ currentMilestone.period }}</span>
            <h3 class="dh-timeline-info-title">{{ currentMilestone.title }}</h3>
            <p class="dh-timeline-info-desc">{{ currentMilestone.desc }}</p>
          </div>
        </div>

        <!-- Horizontal Milestone Navigator -->
        <div class="dh-timeline-nav-wrapper">
          <button type="button" class="dh-timeline-arrow" @click="prevMilestone" aria-label="Previous">
            &larr;
          </button>
          <div class="dh-timeline-nav-bar">
            <button
              v-for="(item, midx) in timelineMilestones"
              :key="midx"
              type="button"
              class="dh-milestone-pill"
              :class="{ active: midx === activeMilestoneIndex }"
              @click="activeMilestoneIndex = midx"
            >
              {{ item.year }}
            </button>
          </div>
          <button type="button" class="dh-timeline-arrow" @click="nextMilestone" aria-label="Next">
            &rarr;
          </button>
        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 5. 3D ARCHITECTURAL MODEL: SA BÀN KIẾN TRÚC DI SẢN 3D -->
    <!-- ================================================================= -->
    <section id="sa-ban-3d" class="dh-section dh-model3d-section">
      <div class="dh-container">
        <div class="dh-section-header-center">
          <span class="dh-section-kicker">KHÔNG GIAN KIẾN TRÚC</span>
          <h2 class="dh-section-title">SA BÀN KIẾN TRÚC DI SẢN 3D</h2>
          <p class="dh-section-desc">
            Tái tạo hình học chi tiết kiến trúc đình chùa, lán nứa ATK với công nghệ đồ họa không gian ba chiều WebGL.
          </p>
        </div>

        <div class="dh-model3d-card">
          <!-- 3D Canvas / Mockup -->
          <div class="dh-model3d-viewport">
            <div class="dh-model3d-mode-toggles">
              <button
                type="button"
                class="dh-view-mode-btn"
                :class="{ active: model3dMode === 'model' }"
                @click="model3dMode = 'model'"
              >
                Xem Mô Hình
              </button>
              <button
                type="button"
                class="dh-view-mode-btn"
                :class="{ active: model3dMode === 'wireframe' }"
                @click="model3dMode = 'wireframe'"
              >
                Bản Vẽ 3D
              </button>
            </div>

            <div class="dh-3d-wireframe-display">
              <svg viewBox="0 0 600 340" width="100%" height="100%" class="dh-svg-isometric">
                <defs>
                  <linearGradient id="gradHouse" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9" />
                    <stop offset="100%" stop-color="#E6E7E1" stop-opacity="0.4" />
                  </linearGradient>
                </defs>
                <!-- Isometric House Wireframe Graphic matching mockup -->
                <polygon points="300,40 500,120 500,240 300,320 100,240 100,120" fill="url(#gradHouse)" stroke="#D4AF37" stroke-width="2" />
                <line x1="300" y1="40" x2="300" y2="320" stroke="#D4AF37" stroke-width="2" />
                <line x1="100" y1="120" x2="300" y2="200" stroke="#D4AF37" stroke-width="1.5" />
                <line x1="500" y1="120" x2="300" y2="200" stroke="#D4AF37" stroke-width="1.5" />
                <!-- Callout points -->
                <circle cx="300" cy="120" r="8" fill="#F4203D" stroke="#FFF" stroke-width="2" />
                <text x="315" y="125" fill="#140808" font-size="12" font-weight="bold">1. Mái đao cổ kính</text>
                <circle cx="200" cy="180" r="8" fill="#D4AF37" stroke="#FFF" stroke-width="2" />
                <text x="215" y="185" fill="#140808" font-size="12" font-weight="bold">2. Hệ thống vì kèo gỗ</text>
                <circle cx="400" cy="200" r="8" fill="#D4AF37" stroke="#FFF" stroke-width="2" />
                <text x="415" y="205" fill="#140808" font-size="12" font-weight="bold">3. Khung dầm chịu lực</text>
              </svg>
            </div>
          </div>

          <!-- Component Anatomy Panel -->
          <div class="dh-model3d-sidebar">
            <h4 class="dh-sidebar-title">CẤU KIỆN KIẾN TRÚC</h4>
            <div class="dh-anatomy-list">
              <div
                v-for="(part, pidx) in architecturalParts"
                :key="pidx"
                class="dh-anatomy-item"
                :class="{ active: pidx === selectedPartIndex }"
                @click="selectedPartIndex = pidx"
              >
                <span class="dh-anatomy-num">0{{ pidx + 1 }}</span>
                <div class="dh-anatomy-info">
                  <span class="dh-anatomy-name">{{ part.name }}</span>
                  <span class="dh-anatomy-desc">{{ part.desc }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 6. VR360 VIRTUAL TOUR STRIP -->
    <!-- ================================================================= -->
    <section id="vr360" class="dh-section dh-vr360-section">
      <div class="dh-container">
        <div class="dh-section-header-center">
          <span class="dh-section-kicker">THỰC TẾ ẢO ĐA ĐIỂM</span>
          <h2 class="dh-section-title dh-text-white">VR360 Virtual Tour</h2>
          <p class="dh-section-desc dh-text-light">
            Khám phá trọn vẹn không gian 360 độ các điểm di tích lịch sử đại ngàn ATK với thuyết minh âm thanh tự động.
          </p>
        </div>

        <div class="dh-vr-cinema-box">
          <div class="dh-vr-cinema-viewport">
            <img
              :src="currentVrScene.image"
              :alt="currentVrScene.name"
              class="dh-vr-cinema-img"
            />
            <div class="dh-vr-cinema-scrim"></div>
            <div class="dh-vr-cinema-hud">
              <span class="dh-vr-current-badge">ĐANG XEM KHÔNG GIAN 360</span>
              <h3 class="dh-vr-current-title">{{ currentVrScene.name }}</h3>
              <p class="dh-vr-current-subtitle">{{ currentVrScene.category }}</p>
            </div>
          </div>

          <!-- Bottom Scene Thumbnails Carousel -->
          <div class="dh-vr-thumbs-row">
            <div
              v-for="(scene, sidx) in vrScenes"
              :key="sidx"
              class="dh-vr-thumb-card"
              :class="{ active: sidx === activeVrIndex }"
              @click="activeVrIndex = sidx"
            >
              <img :src="scene.image" :alt="scene.name" class="dh-vr-thumb-img" />
              <span class="dh-vr-thumb-name">{{ scene.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 7. SITES GRID: ĐỊA ĐIỂM DI TÍCH TIÊU BIỂU -->
    <!-- ================================================================= -->
    <section id="dia-diem" class="dh-section dh-sites-section">
      <div class="dh-container">
        <div class="dh-section-header-flex">
          <div>
            <span class="dh-section-kicker">QUẦN THỂ DI TÍCH</span>
            <h2 class="dh-section-title">Địa Điểm</h2>
          </div>
          <a href="#dia-diem" class="dh-view-all-link">Xem tất cả di tích &rarr;</a>
        </div>

        <div class="dh-sites-grid">
          <div
            v-for="(site, sidx) in heritageSites.slice(0, 3)"
            :key="sidx"
            class="dh-site-card"
            :class="{ 'dh-site-card--highlight': site.highlight }"
          >
            <div class="dh-site-img-wrapper">
              <img :src="site.image" :alt="site.name" class="dh-site-img" />
              <span class="dh-site-badge" :class="{ 'dh-badge-red': site.highlight }">
                {{ site.badge }}
              </span>
            </div>
            <div class="dh-site-body">
              <span class="dh-site-cat">{{ site.category }}</span>
              <h3 class="dh-site-title">{{ site.name }}</h3>
              <p class="dh-site-desc">{{ site.desc }}</p>
              <div class="dh-site-footer">
                <span class="dh-site-feature-tag" v-if="site.hasVR">✦ VR360 Tour</span>
                <span class="dh-site-feature-tag" v-if="site.has3D">✦ Sa bàn 3D</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 8. FESTIVALS & CATEGORIES FILTER -->
    <!-- ================================================================= -->
    <section id="le-hoi" class="dh-section dh-events-section">
      <div class="dh-container dh-events-layout">
        <!-- Left: Event Cards -->
        <div class="dh-events-left">
          <span class="dh-section-kicker">SỰ KIỆN TRUYỀN THỐNG</span>
          <h2 class="dh-section-title" style="margin-bottom: 24px;">Lễ Hội & Kỷ Niệm</h2>

          <div class="dh-events-stack">
            <div v-for="(ev, eidx) in festivalEvents" :key="eidx" class="dh-event-card">
              <div class="dh-event-img-box">
                <img :src="ev.image" :alt="ev.title" class="dh-event-img" />
                <div class="dh-event-date-badge">
                  <span class="dh-date-day">{{ ev.dateDay }}</span>
                  <span class="dh-date-month">{{ ev.dateMonth }}</span>
                </div>
              </div>
              <div class="dh-event-info">
                <h3 class="dh-event-title">{{ ev.title }}</h3>
                <span class="dh-event-subtitle">{{ ev.subtitle }}</span>
                <p class="dh-event-desc">{{ ev.desc }}</p>
                <a href="#le-hoi" class="dh-event-link">Khám phá chi tiết &rarr;</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Categories & Search -->
        <div class="dh-events-right">
          <div class="dh-search-box">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Tìm kiếm di tích, lễ hội..."
              class="dh-search-input"
            />
          </div>

          <div class="dh-category-panel">
            <h4 class="dh-category-title">CATEGORIES</h4>
            <div class="dh-category-list">
              <button
                v-for="(cat, cidx) in categories"
                :key="cidx"
                type="button"
                class="dh-category-btn"
                :class="{ active: activeCategory === cat }"
                @click="activeCategory = cat"
              >
                <span>{{ cat }}</span>
                <span class="dh-cat-bullet">✦</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 9. BENTO GALLERY: THƯ VIỆN ĐA PHƯƠNG TIỆN -->
    <!-- ================================================================= -->
    <section class="dh-section dh-bento-section">
      <div class="dh-container">
        <div class="dh-section-header-center">
          <span class="dh-section-kicker">KHO TƯ LIỆU VĂN KHỐ</span>
          <h2 class="dh-section-title">BẢO TÀNG SỐ HÓA ATK</h2>
        </div>

        <div class="dh-bento-grid">
          <div
            v-for="(item, bidx) in bentoGalleryItems"
            :key="bidx"
            class="dh-bento-card"
            :class="item.span"
          >
            <template v-if="item.isAction">
              <div class="dh-bento-action-card">
                <span class="dh-bento-cat">{{ item.category }}</span>
                <h3 class="dh-bento-action-title">{{ item.title }}</h3>
                <a href="#dia-diem" class="dh-btn dh-btn-primary" style="margin-top: 14px;">
                  Khám Phá Toàn Diện
                </a>
              </div>
            </template>
            <template v-else>
              <img :src="item.image" :alt="item.title" class="dh-bento-img" />
              <div class="dh-bento-scrim"></div>
              <div class="dh-bento-content">
                <span class="dh-bento-cat">{{ item.category }}</span>
                <h4 class="dh-bento-title">{{ item.title }}</h4>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  communeFacts,
  quickStats,
  timelineMilestones,
  heritageSites,
  festivalEvents,
  bentoGalleryItems,
} from "../common/dinhHoaData.js";

const heroVrMode = ref(false);
const activeMilestoneIndex = ref(3); // Default to 1947–1948 milestone
const model3dMode = ref("model");
const selectedPartIndex = ref(0);
const activeVrIndex = ref(0);
const searchQuery = ref("");
const activeCategory = ref("TẤT CẢ");

const currentMilestone = computed(() => timelineMilestones[activeMilestoneIndex.value]);

function prevMilestone() {
  activeMilestoneIndex.value =
    (activeMilestoneIndex.value - 1 + timelineMilestones.length) % timelineMilestones.length;
}

function nextMilestone() {
  activeMilestoneIndex.value =
    (activeMilestoneIndex.value + 1) % timelineMilestones.length;
}

const architecturalParts = [
  { name: "Cột Quân giới & Cột Lim cổ", desc: "Hệ thống cột chịu lực chính bằng gỗ lim và gỗ rừng tự nhiên bền vững." },
  { name: "Mái đao uốn cong truyền thống", desc: "Mái ngói hài cổ kính dốc cong thanh thoát mang đậm phong cách thời Hậu Lê." },
  { name: "Hệ khung xà ngang & cốn mê", desc: "Liên kết mộng gỗ chạm khắc hoa văn cúc dây và vân mây thời kháng chiến." },
  { name: "Hầm chỉ huy & Hầm trú ẩn dã chiến", desc: "Công trình hào giao thông bí mật kết nối các lán trại cơ quan đầu não." },
  { name: "Bàn làm việc của Bác & Đại tướng", desc: "Nội thất mộc mạc bằng tre nứa đặc trưng căn cứ địa Việt Bắc." },
  { name: "Sân mít tinh & Cổng tam quan", desc: "Quảng trường diễn ra các sự kiện vũ trang cách mạng lịch sử." },
];

const vrScenes = [
  {
    name: "Chùa Hang (Tiên Lữ Phật Động)",
    category: "Di tích lịch sử - Danh lam thắng cảnh",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Xưởng Đội Cấn K77",
    category: "Cái nôi vũ khí quân giới",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Cơ quan Bộ Tổng Tham Mưu (Đồi Tỉ)",
    category: "Đại bản doanh tác chiến Điện Biên Phủ",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Đình Quan Đế Chợ Chu",
    category: "Địa điểm mít tinh giải phóng 28/3",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  },
];

const currentVrScene = computed(() => vrScenes[activeVrIndex.value]);

const categories = [
  "TẤT CẢ",
  "DI TÍCH ATK",
  "KIẾN TRÚC CỔ",
  "LỄ HỘI & VĂN HÓA",
  "ẢNH 3D/VR360",
  "KHÁC",
];
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Asap+Condensed:wght@600;700;800&family=Asap:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Saira+Extra+Condensed:wght@700;800&display=swap');

.dh-landing {
  background-color: #140808;
  color: #FBF4E6;
  font-family: 'Asap', sans-serif;
  overflow-x: hidden;
}

.dh-container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 24px;
}

.dh-section {
  padding: 72px 0;
  position: relative;
}

.dh-section-kicker {
  display: inline-block;
  font-family: 'Asap Condensed', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2.5px;
  color: #D4AF37;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.dh-section-title {
  font-family: 'Asap Condensed', sans-serif;
  font-size: clamp(26px, 3.5vw, 40px);
  font-weight: 800;
  color: #FBF4E6;
  line-height: 1.2;
  margin: 0 0 14px;
}

.dh-text-gold {
  color: #D4AF37;
}

.dh-text-white {
  color: #FFFFFF;
}

.dh-text-light {
  color: #D1BEA8;
}

.dh-section-desc {
  font-size: 15px;
  color: #D1BEA8;
  max-width: 720px;
  margin: 0 auto;
  line-height: 1.6;
}

.dh-section-header-center {
  text-align: center;
  margin-bottom: 44px;
}

.dh-section-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 36px;
}

.dh-paragraph-justify {
  text-align: justify;
  text-justify: inter-word;
  line-height: 1.75;
  hyphens: auto;
  font-size: 15px;
  color: #D1BEA8;
  margin-bottom: 16px;
}

.dh-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.25s ease;
}

.dh-btn-primary {
  background: #F4203D;
  color: #FFFFFF;
  border: 1px solid #F4203D;
  box-shadow: 0 4px 16px rgba(244, 32, 61, 0.35);
}

.dh-btn-primary:hover {
  background: #d81630;
  transform: translateY(-2px);
}

.dh-btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(8px);
}

.dh-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #D4AF37;
  color: #D4AF37;
}

/* ==================== 1. HERO ==================== */
.dh-hero-section {
  position: relative;
  min-height: clamp(520px, 85vh, 760px);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.dh-hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.dh-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
}

.dh-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(20, 8, 8, 0.45) 0%,
    rgba(20, 8, 8, 0.75) 60%,
    #140808 100%
  );
}

.dh-hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 40px 24px 48px;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.dh-hero-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 28px;
  flex-wrap: wrap;
}

.dh-hero-quote-card {
  max-width: 440px;
  background: rgba(20, 8, 8, 0.75);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 12px;
  padding: 16px 20px;
  backdrop-filter: blur(10px);
}

.dh-quote-badge {
  font-size: 10px;
  font-weight: 700;
  color: #D4AF37;
  letter-spacing: 1.5px;
  background: rgba(212, 175, 55, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
}

.dh-quote-text {
  font-size: 13.5px;
  line-height: 1.55;
  color: #FBF4E6;
  margin: 8px 0 0;
}

.dh-hero-title-group {
  text-align: right;
}

.dh-hero-main-title {
  font-family: 'Asap Condensed', sans-serif;
  font-size: clamp(32px, 5.5vw, 64px);
  font-weight: 800;
  color: #FFFFFF;
  line-height: 1.08;
  margin: 0 0 8px;
}

.dh-hero-main-title span {
  color: #D4AF37;
}

.dh-hero-location-tag {
  font-family: 'Asap Condensed', sans-serif;
  font-size: 13px;
  letter-spacing: 2px;
  color: #D1BEA8;
  margin: 0;
}

.dh-hero-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.dh-hero-cta-group {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.dh-hero-view-switch {
  display: flex;
  background: rgba(20, 8, 8, 0.85);
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 8px;
  padding: 4px;
}

.dh-switch-btn {
  background: transparent;
  border: none;
  color: #D1BEA8;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dh-switch-btn.active {
  background: #D4AF37;
  color: #140808;
}

/* ==================== 2. STATS ==================== */
.dh-stats-strip {
  background: #1C1010;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  padding: 24px 0;
}

.dh-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
}

.dh-stat-item {
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 12px;
}

.dh-stat-item:last-child {
  border-right: none;
}

.dh-stat-value {
  font-family: 'Asap Condensed', sans-serif;
  font-size: 38px;
  font-weight: 800;
  color: #D4AF37;
  line-height: 1;
}

.dh-stat-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #D1BEA8;
  text-transform: uppercase;
  margin-top: 6px;
}

/* ==================== 3. OVERVIEW ==================== */
.dh-overview-section {
  background: #180D0D;
}

.dh-overview-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 48px;
  align-items: flex-start;
}

.dh-fact-list {
  margin-top: 24px;
  background: #221010;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 16px 20px;
}

.dh-fact-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 13.5px;
}

.dh-fact-row:last-child {
  border-bottom: none;
}

.dh-fact-key {
  color: #D1BEA8;
}

.dh-fact-val {
  color: #D4AF37;
  font-weight: 600;
  text-align: right;
}

/* ==================== 4. TIMELINE ==================== */
.dh-timeline-section {
  background: #140808;
}

.dh-timeline-featured-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  height: clamp(340px, 45vh, 480px);
  margin-bottom: 30px;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.dh-timeline-featured-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dh-timeline-featured-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(20, 8, 8, 0.95) 80%);
  padding: 32px 28px 24px;
}

.dh-timeline-badge {
  font-size: 11px;
  font-weight: 700;
  color: #140808;
  background: #D4AF37;
  padding: 3px 10px;
  border-radius: 4px;
  text-transform: uppercase;
}

.dh-timeline-info-title {
  font-family: 'Asap Condensed', sans-serif;
  font-size: 24px;
  color: #FFFFFF;
  margin: 10px 0 6px;
}

.dh-timeline-info-desc {
  font-size: 14px;
  color: #D1BEA8;
  margin: 0;
  max-width: 760px;
  line-height: 1.6;
}

.dh-timeline-nav-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.dh-timeline-arrow {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #221010;
  border: 1px solid #D4AF37;
  color: #D4AF37;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.dh-timeline-arrow:hover {
  background: #D4AF37;
  color: #140808;
}

.dh-timeline-nav-bar {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 4px;
}

.dh-milestone-pill {
  padding: 10px 20px;
  border-radius: 8px;
  background: #221010;
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: #D1BEA8;
  font-family: 'Asap Condensed', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.dh-milestone-pill.active {
  background: #D4AF37;
  color: #140808;
  border-color: #D4AF37;
  box-shadow: 0 0 14px rgba(212, 175, 55, 0.4);
}

/* ==================== 5. MODEL 3D ==================== */
.dh-model3d-section {
  background: #180D0D;
}

.dh-model3d-card {
  display: grid;
  grid-template-columns: 2fr 1fr;
  background: #221010;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 16px;
  overflow: hidden;
}

.dh-model3d-viewport {
  position: relative;
  background: #140808;
  min-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.dh-model3d-mode-toggles {
  position: absolute;
  top: 18px;
  left: 18px;
  display: flex;
  gap: 8px;
  z-index: 5;
}

.dh-view-mode-btn {
  background: rgba(20, 8, 8, 0.8);
  border: 1px solid #D4AF37;
  color: #D4AF37;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.dh-view-mode-btn.active {
  background: #D4AF37;
  color: #140808;
}

.dh-3d-wireframe-display {
  width: 100%;
  max-width: 540px;
}

.dh-model3d-sidebar {
  padding: 28px 24px;
  background: #1C1010;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.dh-sidebar-title {
  font-family: 'Asap Condensed', sans-serif;
  font-size: 15px;
  letter-spacing: 1.5px;
  color: #D4AF37;
  margin: 0 0 16px;
}

.dh-anatomy-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dh-anatomy-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  background: #261414;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dh-anatomy-item.active,
.dh-anatomy-item:hover {
  border-color: #D4AF37;
  background: #331A1A;
}

.dh-anatomy-num {
  font-family: 'Asap Condensed', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #D4AF37;
}

.dh-anatomy-info {
  display: flex;
  flex-direction: column;
}

.dh-anatomy-name {
  font-size: 13.5px;
  font-weight: 600;
  color: #FBF4E6;
}

.dh-anatomy-desc {
  font-size: 11.5px;
  color: #A89886;
  margin-top: 2px;
}

/* ==================== 6. VR360 ==================== */
.dh-vr360-section {
  background: #0E0505;
}

.dh-vr-cinema-box {
  background: #180D0D;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 16px;
  overflow: hidden;
}

.dh-vr-cinema-viewport {
  position: relative;
  height: clamp(340px, 50vh, 500px);
}

.dh-vr-cinema-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dh-vr-cinema-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(14, 5, 5, 0.95) 100%);
}

.dh-vr-cinema-hud {
  position: absolute;
  bottom: 24px;
  left: 28px;
  z-index: 3;
}

.dh-vr-current-badge {
  font-size: 11px;
  font-weight: 700;
  color: #D4AF37;
  letter-spacing: 1.5px;
}

.dh-vr-current-title {
  font-family: 'Asap Condensed', sans-serif;
  font-size: 28px;
  color: #FFFFFF;
  margin: 6px 0 2px;
}

.dh-vr-current-subtitle {
  font-size: 14px;
  color: #D1BEA8;
  margin: 0;
}

.dh-vr-thumbs-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  padding: 18px 24px;
  background: #140808;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.dh-vr-thumb-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  background: #221010;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dh-vr-thumb-card.active,
.dh-vr-thumb-card:hover {
  border-color: #D4AF37;
  background: #2E1515;
}

.dh-vr-thumb-img {
  width: 52px;
  height: 38px;
  border-radius: 4px;
  object-fit: cover;
}

.dh-vr-thumb-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #FBF4E6;
}

/* ==================== 7. SITES GRID ==================== */
.dh-sites-section {
  background: #180D0D;
}

.dh-view-all-link {
  color: #D4AF37;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.dh-sites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 28px;
}

.dh-site-card {
  background: #221010;
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.dh-site-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
  border-color: #D4AF37;
}

.dh-site-card--highlight {
  border-color: #F4203D;
  box-shadow: 0 0 20px rgba(244, 32, 61, 0.2);
}

.dh-site-img-wrapper {
  position: relative;
  height: 200px;
}

.dh-site-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dh-site-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(20, 8, 8, 0.85);
  border: 1px solid #D4AF37;
  color: #D4AF37;
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.8px;
}

.dh-badge-red {
  background: #F4203D;
  border-color: #F4203D;
  color: #FFFFFF;
}

.dh-site-body {
  padding: 20px;
}

.dh-site-cat {
  font-size: 11px;
  color: #A89886;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.dh-site-title {
  font-family: 'Asap Condensed', sans-serif;
  font-size: 20px;
  color: #FFFFFF;
  margin: 6px 0 10px;
}

.dh-site-desc {
  font-size: 13.5px;
  color: #D1BEA8;
  line-height: 1.55;
  margin-bottom: 14px;
}

.dh-site-footer {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #D4AF37;
  font-weight: 600;
}

/* ==================== 8. EVENTS ==================== */
.dh-events-section {
  background: #140808;
}

.dh-events-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.dh-events-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dh-event-card {
  display: flex;
  background: #221010;
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 12px;
  overflow: hidden;
}

.dh-event-img-box {
  position: relative;
  width: 220px;
  min-width: 200px;
}

.dh-event-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dh-event-date-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #D4AF37;
  color: #140808;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 800;
  line-height: 1;
}

.dh-date-day {
  font-size: 18px;
}

.dh-date-month {
  font-size: 11px;
}

.dh-event-info {
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.dh-event-title {
  font-family: 'Asap Condensed', sans-serif;
  font-size: 19px;
  color: #FFFFFF;
  margin: 0 0 4px;
}

.dh-event-subtitle {
  font-size: 12px;
  color: #D4AF37;
  margin-bottom: 8px;
}

.dh-event-desc {
  font-size: 13.5px;
  color: #D1BEA8;
  line-height: 1.5;
  margin-bottom: 12px;
}

.dh-event-link {
  color: #D4AF37;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.dh-search-input {
  width: 100%;
  padding: 12px 16px;
  background: #221010;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  color: #FBF4E6;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  margin-bottom: 24px;
}

.dh-search-input:focus {
  border-color: #D4AF37;
}

.dh-category-panel {
  background: #221010;
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 12px;
  padding: 20px;
}

.dh-category-title {
  font-family: 'Asap Condensed', sans-serif;
  font-size: 14px;
  letter-spacing: 1.5px;
  color: #D4AF37;
  margin: 0 0 14px;
}

.dh-category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dh-category-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #2A1515;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  color: #D1BEA8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dh-category-btn.active,
.dh-category-btn:hover {
  background: #D4AF37;
  color: #140808;
  border-color: #D4AF37;
}

.dh-cat-bullet {
  font-size: 10px;
}

/* ==================== 9. BENTO GRID ==================== */
.dh-bento-section {
  background: #180D0D;
}

.dh-bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.dh-bento-card {
  position: relative;
  min-height: 220px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.25);
}

.dh-bento-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dh-bento-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(20, 8, 8, 0.9) 100%);
}

.dh-bento-content {
  position: absolute;
  bottom: 16px;
  left: 18px;
  right: 18px;
  z-index: 2;
}

.dh-bento-cat {
  font-size: 10px;
  font-weight: 700;
  color: #D4AF37;
  letter-spacing: 1px;
}

.dh-bento-title {
  font-family: 'Asap Condensed', sans-serif;
  font-size: 18px;
  color: #FFFFFF;
  margin: 4px 0 0;
}

.dh-bento-action-card {
  background: #2A1515;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 24px;
}

.dh-bento-action-title {
  font-family: 'Asap Condensed', sans-serif;
  font-size: 22px;
  color: #FFFFFF;
  margin: 8px 0 0;
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 900px) {
  .dh-overview-grid,
  .dh-model3d-card,
  .dh-events-layout {
    grid-template-columns: 1fr;
  }

  .dh-event-card {
    flex-direction: column;
  }

  .dh-event-img-box {
    width: 100%;
    height: 180px;
  }

  .dh-hero-title-group {
    text-align: left;
  }
}
</style>
