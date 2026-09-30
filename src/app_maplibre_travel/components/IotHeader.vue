<script setup>
// Faithful clone of thaihai.metatwin.vn top bar + horizontal menu.
//   Topbar (#page-topbar): aerial background photo + left→right white gradient,
//   left logo = Thái Nguyên province, centred uppercase title (text-primary),
//   right logo = Sở Văn hoá. A hamburger toggles the menu on small screens.
//   Below: a centred horizontal menu (Velzon `menu-link` styling) with the same
//   items, coloured icons and dropdowns as the original, plus VI/EN flags.
// Dropdowns are Vue-driven (hover on desktop, tap on mobile) because the theme's
// horizontal-layout JS does not run inside this embedded SPA.
import { ref } from 'vue'
import { useTenant } from '../common/tenant'

const { site: SITE, routeNames: RN, intro } = useTenant()

const lang = ref(localStorage.getItem('iot_lang') || 'vi')
function setLang(l) { lang.value = l; localStorage.setItem('iot_lang', l) }

const menuOpen = ref(false)
const openDrop = ref(null)
function toggleDrop(k) { openDrop.value = openDrop.value === k ? null : k }
function closeAll() { menuOpen.value = false; openDrop.value = null }
</script>

<template>
  <!-- ============ Top bar ============ -->
  <header class="iot-topbar"
          :style="SITE.cover ? { backgroundImage: `url(${SITE.cover})` } : {}">
    <div class="iot-topbar__veil"></div>
    <div class="iot-topbar__inner">
      <!-- hamburger (mobile) -->
      <button type="button" class="btn btn-sm px-3 fs-16 iot-topbar__burger" @click="menuOpen = !menuOpen">
        <span class="hamburger-icon"><span></span><span></span><span></span></span>
      </button>

      <div class="navbar-header w-100 iot-navrow">
        <!-- logo left -->
        <div class="navbar-brand-box horizontal-logo">
          <router-link :to="{ name: RN.home }" class="logo">
            <img v-if="SITE.logoLeft" :src="SITE.logoLeft" alt="" class="logo-header" />
          </router-link>
        </div>

        <!-- centred title -->
        <div class="d-flex w-100 align-self-center justify-content-center text-center">
          <h1 class="text-uppercase mb-0 card-title text-primary fw-bold header-text" style="z-index: 1"
              v-html="SITE.name"></h1>
        </div>

        <!-- logo right -->
        <div class="navbar-brand-box horizontal-logo">
          <a href="#!" class="logo">
            <img v-if="SITE.logoRight" :src="SITE.logoRight" alt="" class="logo-header" />
          </a>
        </div>
      </div>
    </div>
  </header>

  <!-- ============ Horizontal menu ============ -->
  <nav class="iot-menu">
    <ul class="navbar-nav iot-menu__nav" :class="{ open: menuOpen }">
      <li class="nav-item">
        <router-link class="nav-link menu-link" :to="{ name: RN.home }" @click="closeAll">
          <i class="ri-home-3-line" style="color:#E74C3C"></i> <span>Trang chủ</span>
        </router-link>
      </li>

      <li class="nav-item iot-menu__item" @mouseenter="openDrop = 'intro'" @mouseleave="openDrop = null">
        <a class="nav-link menu-link" href="javascript:void(0)" @click.stop="toggleDrop('intro')">
          <i class="ri-honour-line" style="color:#3498DB"></i> <span>Giới thiệu</span>
        </a>
        <div class="iot-menu__drop" :class="{ show: openDrop === 'intro' }">
          <ul class="nav nav-sm flex-column">
            <li class="nav-item">
              <router-link :to="{ name: RN.intro }" class="nav-link menu-link" @click="closeAll">
                <span>{{ intro?.title || SITE.name || 'Giới thiệu' }}</span>
              </router-link>
            </li>
            <!-- <li class="nav-item">
              <a class="nav-link menu-link"
                 href="https://play.google.com/store/apps/details?id=com.gugotech.atk.dulichchauthanh"
                 target="_blank" rel="noopener">Android</a>
            </li>
            <li class="nav-item">
              <a class="nav-link menu-link"
                 href="https://apps.apple.com/vn/app/du-l%E1%BB%8Bch-ch%C3%A2u-th%C3%A0nh-b%E1%BA%BFn-tre/id6447753498?l=vi"
                 target="_blank" rel="noopener">IOS</a>
            </li> -->
          </ul>
        </div>
      </li>

      <li class="nav-item iot-menu__item" @mouseenter="openDrop = 'dest'" @mouseleave="openDrop = null">
        <a class="nav-link menu-link" href="javascript:void(0)" @click.stop="toggleDrop('dest')">
          <i class="ri-database-line" style="color:#17A589"></i> <span>Điểm đến</span>
        </a>
        <div class="iot-menu__drop" :class="{ show: openDrop === 'dest' }">
          <ul class="nav nav-sm flex-column">
            <li class="nav-item">
              <router-link :to="{ name: RN.locations }" class="nav-link menu-link" @click="closeAll"><span>Địa điểm du lịch</span></router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{ name: RN.relics }" class="nav-link menu-link" @click="closeAll"><span>Phân khu</span></router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{ name: RN.festivals }" class="nav-link menu-link" @click="closeAll"><span>Sự kiện và lễ hội</span></router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{ name: RN.tours }" class="nav-link menu-link" @click="closeAll"><span>Tuyến du lịch</span></router-link>
            </li>
          </ul>
        </div>
      </li>

      <li class="nav-item">
        <router-link class="nav-link menu-link" :to="{ name: RN.contact }" @click="closeAll">
          <i class="ri-phone-line" style="color:#a570a5"></i> <span>Góp ý</span>
        </router-link>
      </li>

      <!-- language flags -->
      <div class="lang__container">
        <li class="nav-item flag__vi">
          <a class="nav-link menu-link" :class="{ active: lang === 'vi' }" href="javascript:void(0)" @click="setLang('vi')" title="Tiếng Việt">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-15 -10 30 20">
              <rect fill="#DA251d" x="-20" y="-15" width="40" height="30" />
              <!-- five-pointed star as a single polygon (no document-level ids) -->
              <polygon fill="#FF0"
                points="0,-8 1.796,-2.472 7.608,-2.472 2.906,0.944 4.702,6.472 0,3.056 -4.702,6.472 -2.906,0.944 -7.608,-2.472 -1.796,-2.472" />
            </svg>
          </a>
        </li>
        <li class="flag__us">
          <a class="nav-link menu-link" :class="{ active: lang === 'en' }" href="javascript:void(0)" @click="setLang('en')" title="English">
            <img src="https://thaihai.metatwin.vn/static/assets/images/us.png" alt="" />
          </a>
        </li>
      </div>
    </ul>
  </nav>
</template>

<style scoped>
/* ---- Top bar (was #page-topbar on the original; a plain scoped class here to
   avoid colliding with the dashboard theme's fixed #page-topbar rules) ---- */
.iot-topbar {
  position: relative;
  z-index: 1;
  background-position: center;
  background-size: cover;
  background-color: var(--vz-primary, var(--iot-primary));
}
.iot-topbar__veil {
  position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(to right, rgba(255,255,255,0), #ffffffb3, #ffffffb3, rgba(255,255,255,0));
}
.iot-topbar__inner { position: relative; max-width: 650px; margin: 0 auto; }
.iot-topbar__burger { position: absolute; left: 0; top: 50%; transform: translateY(-50%); z-index: 2; display: none; }
.iot-navrow { position: relative; z-index: 1; height: 70px; display: flex; align-items: center; padding: 0 calc(1.5rem / 2); }
.iot-navrow .horizontal-logo { display: block; }
.logo-header { width: 56px; height: 56px; object-fit: contain; }
.header-text { word-spacing: 2.3px; line-height: 1.5rem; font-size: 18px; }

/* ---- Horizontal menu ---- */
.iot-menu { background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.06); position: sticky; top: 0; z-index: 1000; }
.iot-menu__nav { display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 2px; margin: 0; padding: 0; min-height: 46.5px; list-style: none; }
.iot-menu .nav-link.menu-link {
  display: flex; align-items: center; gap: 6px; padding: 12px 15px;
  text-transform: uppercase; font-size: 12px !important; font-weight: 500; white-space: nowrap; color: #545a6d;
}
.iot-menu .nav-link.menu-link:hover,
.iot-menu .nav-link.menu-link.router-link-exact-active { color: var(--vz-primary, var(--iot-primary)); }
.iot-menu__item { position: relative; }
.iot-menu__drop {
  position: absolute; top: 100%; left: 0; min-width: 230px; background: #fff;
  border: 1px solid #e9ebec; border-radius: 6px; box-shadow: 0 5px 20px rgba(0,0,0,.1);
  padding: 8px; display: none; z-index: 30;
}
.iot-menu__drop.show { display: block; }
.iot-menu__drop .nav-link.menu-link { text-transform: none; font-size: 12.5px !important; padding: 8px 12px; border-radius: 5px; }
.iot-menu__drop .nav-link.menu-link:hover { background: rgba(var(--iot-primary-rgb), .08); }

/* language flags */
.lang__container { display: flex; align-items: center; list-style: none; margin: 0; padding: 0; }
.flag__vi, .flag__us { position: relative; align-self: center; }
.flag__vi a, .flag__us a { padding: 12px 14px !important; opacity: .5; }
.flag__vi a.active, .flag__us a.active { opacity: 1; }
.flag__vi svg, .flag__us img { width: 18px; height: 14px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); object-fit: cover; }

/* ---- Responsive (matches portal.css breakpoints) ---- */
@media (max-width: 1024px) {
  .iot-topbar__burger { display: inline-flex; }
  .iot-menu__nav { flex-direction: column; align-items: stretch; display: none; }
  .iot-menu__nav.open { display: flex; flex-direction: row; }
  .iot-menu__item { position: static; }
  .iot-menu__drop { position: static; display: none; box-shadow: none; border: none; padding: 0 0 4px 22px; }
  .iot-menu__drop.show { display: block; }
  .lang__container { padding: 8px 14px; }
}
@media (max-width: 800px) {
  .iot-topbar__inner { max-width: 340px; }
  .header-text { font-size: 14px; word-spacing: 0; line-height: 1rem; }
  .logo-header { width: 40px; height: 40px; }
  .iot-navrow { height: 70px; padding: 0 calc(1.5rem / 4); }
}
@media (max-width: 400px) {
  .iot-topbar__inner { max-width: 280px; }
  .header-text { font-size: 12px; }
  .logo-header { width: 30px; height: 30px; }
}
</style>
