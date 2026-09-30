<template>
  <header class="dh-header">
    <div class="dh-header-container">
      <!-- Logo Brand -->
      <a href="#hero" class="dh-logo-group" @click.prevent="scrollTo('#hero')">
        <div class="dh-logo-badge">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#D4AF37">
            <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 11h2v4h-2zm0 5h2v2h-2z"/>
          </svg>
        </div>
        <div class="dh-brand-text">
          <span class="dh-brand-title">ĐỊNH HOÁ</span>
          <span class="dh-brand-sub">THỦ ĐÔ KHÁNG CHIẾN ATK</span>
        </div>
      </a>

      <!-- Desktop Nav Menu -->
      <nav class="dh-nav-menu" :class="{ 'dh-nav-open': mobileOpen }">
        <a href="#hero" class="dh-nav-link" @click.prevent="scrollTo('#hero')">Trang chủ</a>
        <a href="#tong-quan" class="dh-nav-link" @click.prevent="scrollTo('#tong-quan')">Giới thiệu</a>
        <a href="#nien-bieu" class="dh-nav-link" @click.prevent="scrollTo('#nien-bieu')">Niên biểu</a>
        <a href="#sa-ban-3d" class="dh-nav-link" @click.prevent="scrollTo('#sa-ban-3d')">Sa bàn 3D</a>
        <a href="#vr360" class="dh-nav-link" @click.prevent="scrollTo('#vr360')">VR360</a>
        <a href="#dia-diem" class="dh-nav-link" @click.prevent="scrollTo('#dia-diem')">Địa điểm</a>
        <a href="#le-hoi" class="dh-nav-link" @click.prevent="scrollTo('#le-hoi')">Lễ hội</a>
      </nav>

      <!-- Right Actions: Language Switch & Mobile Toggle -->
      <div class="dh-actions">
        <button type="button" class="dh-lang-btn" @click="toggleLang">
          <span class="dh-lang-text">{{ currentLang }}</span>
        </button>
        <button type="button" class="dh-burger-btn" @click="mobileOpen = !mobileOpen" aria-label="Toggle menu">
          <span class="dh-burger-bar"></span>
          <span class="dh-burger-bar"></span>
          <span class="dh-burger-bar"></span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";

const currentLang = ref("VI");
const mobileOpen = ref(false);

function toggleLang() {
  currentLang.value = currentLang.value === "VI" ? "EN" : "VI";
}

function scrollTo(selector) {
  mobileOpen.value = false;
  const el = document.querySelector(selector);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Asap+Condensed:wght@600;700;800&family=Asap:wght@400;500;600;700&family=Saira+Extra+Condensed:wght@700;800&display=swap');

.dh-header {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(18, 12, 10, 0.88);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(212, 175, 55, 0.25);
  font-family: 'Asap', sans-serif;
  transition: all 0.3s ease;
}

.dh-header-container {
  max-width: 1360px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dh-logo-group {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.dh-logo-badge {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: #140808;
  border: 1px solid #D4AF37;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
}

.dh-brand-text {
  display: flex;
  flex-direction: column;
}

.dh-brand-title {
  font-family: 'Saira Extra Condensed', 'Asap Condensed', sans-serif;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #FFFFFF;
  line-height: 1.05;
}

.dh-brand-sub {
  font-family: 'Asap Condensed', sans-serif;
  font-size: 11px;
  letter-spacing: 1.5px;
  color: #D4AF37;
  font-weight: 600;
}

.dh-nav-menu {
  display: flex;
  align-items: center;
  gap: 24px;
}

.dh-nav-link {
  color: #FBF4E6;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 4px;
  position: relative;
  transition: color 0.2s ease;
}

.dh-nav-link:hover {
  color: #E1AF3B;
}

.dh-nav-link::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #D4AF37;
  transition: width 0.25s ease;
}

.dh-nav-link:hover::after {
  width: 100%;
}

.dh-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dh-lang-btn {
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid #D4AF37;
  border-radius: 6px;
  padding: 6px 14px;
  color: #D4AF37;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dh-lang-btn:hover {
  background: #D4AF37;
  color: #140808;
}

.dh-burger-btn {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 32px;
  height: 26px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px;
}

.dh-burger-bar {
  width: 100%;
  height: 2px;
  background-color: #D4AF37;
  border-radius: 2px;
}

@media (max-width: 900px) {
  .dh-burger-btn {
    display: flex;
  }

  .dh-nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: #140808;
    border-bottom: 1px solid #4D2020;
    flex-direction: column;
    padding: 16px 24px;
    gap: 16px;
    display: none;
  }

  .dh-nav-menu.dh-nav-open {
    display: flex;
  }
}
</style>
