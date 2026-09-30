<script setup>
import { ref } from "vue";
import { useThanhCongShared } from "../common/useThanhCongShared.js";
import logoThaiNguyen from "../assets/logo-thai-nguyen.png";

const {
  t,
  isMobile,
  isDesktop,
  langVi,
  langEn,
  toggleLang,
  navItems,
  goHome,
} = useThanhCongShared();

// menu thu gọn ở mobile
const menuOpen = ref(false);
const closeMenu = () => {
  menuOpen.value = false;
};
const onLogo = () => {
  closeMenu();
  goHome();
};
const onNav = (item) => {
  closeMenu();
  item.onClick();
};
const pickLang = (wantVi) => {
  if (wantVi !== langVi.value) toggleLang();
};
</script>

<template>
  <header
    style="position:sticky;top:0;z-index:50;background:rgba(247,239,222,.92);backdrop-filter:blur(8px);border-bottom:1px solid #D8C5A2"
  >
    <div
      style="max-width:1180px;margin:0 auto;padding:12px clamp(16px,4vw,40px);display:flex;align-items:center;gap:clamp(12px,3vw,32px);flex-wrap:wrap"
    >
      <button
        @click="onLogo"
        style="display:flex;align-items:center;gap:12px;background:none;border:none;cursor:pointer;padding:0;text-align:left"
      >
        <img :src="logoThaiNguyen" alt="Logo Thái Nguyên" style="width:46px;height:46px;flex:none;object-fit:contain" />
        <span style="display:flex;flex-direction:column;line-height:1.1">
          <span
            style="font-family:'Oswald',sans-serif;font-weight:700;font-size:clamp(14px,2vw,17px);color:#2A2018;letter-spacing:.5px;white-space:nowrap"
            >{{ t.brand }}</span
          >
          <span
            style="font-size:10.5px;letter-spacing:2px;text-transform:uppercase;color:#9E3B2E;white-space:nowrap;margin-top:3px"
            >{{ t.brandSub }}</span
          >
        </span>
      </button>

      <!-- ===== DESKTOP: nav + ngôn ngữ hiển thị đầy đủ ===== -->
      <template v-if="isDesktop">
        <nav style="display:flex;gap:4px;flex-wrap:wrap;margin-left:auto;align-items:center">
          <template v-for="(item, __i) in navItems" :key="__i">
            <button
              @click="item.onClick"
              :style="`position:relative;background:none;border:none;cursor:pointer;font-family:'Roboto Condensed',sans-serif;font-size:14px;font-weight:500;color:${item.color};padding:8px 12px;letter-spacing:.2px`"
              class="hv-nav-item"
            >
              {{ item.label }}
              <template v-if="item.active">
                <span
                  style="position:absolute;left:12px;right:12px;bottom:2px;height:2px;background:#9E3B2E;border-radius:2px"
                ></span>
              </template>
            </button>
          </template>
          <button
            @click="toggleLang"
            title="Tiếng Việt / English"
            style="margin-left:8px;display:flex;align-items:center;padding:5px;border:1px solid #C9B68F;border-radius:7px;background:#FBF5E8;cursor:pointer;line-height:0"
          >
            <template v-if="langVi"
              ><svg width="24" height="16" viewBox="0 0 30 20" style="border-radius:2px;display:block"><rect width="30" height="20" fill="#DA251D"></rect><path d="M15 4.55 L16.41 8.61 L20.71 8.7 L17.28 11.29 L18.53 15.4 L15 12.95 L11.47 15.4 L12.72 11.29 L9.29 8.7 L13.59 8.61 Z" fill="#FFCD00"></path></svg
            ></template>
            <template v-if="langEn"
              ><svg width="24" height="16" viewBox="0 0 60 30" style="border-radius:2px;display:block"><clipPath id="ukfd"><path d="M0 0v30h60V0z"></path></clipPath><g clip-path="url(#ukfd)"><path d="M0 0v30h60V0z" fill="#012169"></path><path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6"></path><path d="M0 0l60 30m0-30L0 30" stroke="#C8102E" stroke-width="3"></path><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"></path><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"></path></g></svg
            ></template>
          </button>
        </nav>
      </template>

      <!-- ===== MOBILE: nút menu gom tất cả ===== -->
      <template v-if="isMobile">
        <button
          @click="menuOpen = !menuOpen"
          :aria-expanded="menuOpen"
          aria-label="Menu"
          style="margin-left:auto;display:flex;flex-direction:column;justify-content:center;gap:5px;width:44px;height:40px;padding:0 10px;border:1px solid #C9B68F;border-radius:8px;background:#FBF5E8;cursor:pointer"
        >
          <span :style="`display:block;height:2px;border-radius:2px;background:#2A2018;transition:transform .2s,opacity .2s;transform:${menuOpen ? 'translateY(7px) rotate(45deg)' : 'none'}`"></span>
          <span :style="`display:block;height:2px;border-radius:2px;background:#2A2018;transition:opacity .2s;opacity:${menuOpen ? '0' : '1'}`"></span>
          <span :style="`display:block;height:2px;border-radius:2px;background:#2A2018;transition:transform .2s,opacity .2s;transform:${menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none'}`"></span>
        </button>
      </template>
    </div>

    <!-- ===== MOBILE: panel menu bung xuống ===== -->
    <template v-if="isMobile && menuOpen">
      <nav
        style="border-top:1px solid #E6D8BA;background:rgba(251,245,232,.98);backdrop-filter:blur(8px);padding:8px clamp(16px,4vw,40px) 14px;display:flex;flex-direction:column;gap:2px"
      >
        <template v-for="(item, __i) in navItems" :key="__i">
          <button
            @click="onNav(item)"
            :style="`display:flex;align-items:center;justify-content:space-between;background:${item.active ? 'rgba(158,59,46,.08)' : 'none'};border:none;border-radius:8px;cursor:pointer;font-family:'Roboto Condensed',sans-serif;font-size:16px;font-weight:${item.active ? '600' : '500'};color:${item.color};padding:13px 14px;text-align:left;width:100%`"
          >
            {{ item.label }}
            <template v-if="item.active"
              ><span style="width:7px;height:7px;background:#9E3B2E;border-radius:50%;flex:none"></span
            ></template>
          </button>
        </template>

        <!-- ngôn ngữ trong menu -->
        <div style="display:flex;align-items:center;gap:10px;margin-top:8px;padding:12px 14px 4px;border-top:1px dashed #D8C5A2">
          <span style="font-family:'Roboto Condensed',sans-serif;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#8A7350;flex:none">{{ langVi ? "Ngôn ngữ" : "Language" }}</span>
          <div style="display:flex;gap:8px;margin-left:auto">
            <button
              @click="pickLang(true)"
              :style="`display:flex;align-items:center;gap:7px;padding:7px 12px;border:1px solid ${langVi ? '#9E3B2E' : '#C9B68F'};border-radius:8px;background:${langVi ? 'rgba(158,59,46,.1)' : '#FBF5E8'};cursor:pointer;opacity:${langVi ? '1' : '.65'};font-family:'Roboto Condensed',sans-serif;font-size:13px;color:#2A2018`"
            >
              <svg width="22" height="15" viewBox="0 0 30 20" style="border-radius:2px;display:block"><rect width="30" height="20" fill="#DA251D"></rect><path d="M15 4.55 L16.41 8.61 L20.71 8.7 L17.28 11.29 L18.53 15.4 L15 12.95 L11.47 15.4 L12.72 11.29 L9.29 8.7 L13.59 8.61 Z" fill="#FFCD00"></path></svg>
              VI
            </button>
            <button
              @click="pickLang(false)"
              :style="`display:flex;align-items:center;gap:7px;padding:7px 12px;border:1px solid ${langEn ? '#9E3B2E' : '#C9B68F'};border-radius:8px;background:${langEn ? 'rgba(158,59,46,.1)' : '#FBF5E8'};cursor:pointer;opacity:${langEn ? '1' : '.65'};font-family:'Roboto Condensed',sans-serif;font-size:13px;color:#2A2018`"
            >
              <svg width="22" height="15" viewBox="0 0 60 30" style="border-radius:2px;display:block"><clipPath id="ukfm"><path d="M0 0v30h60V0z"></path></clipPath><g clip-path="url(#ukfm)"><path d="M0 0v30h60V0z" fill="#012169"></path><path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6"></path><path d="M0 0l60 30m0-30L0 30" stroke="#C8102E" stroke-width="3"></path><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"></path><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"></path></g></svg>
              EN
            </button>
          </div>
        </div>
      </nav>
    </template>

    <div
      style="height:4px;background:repeating-linear-gradient(90deg,#9E3B2E 0 7px,#B98F37 7px 14px,#2C4A5E 14px 21px)"
    ></div>
  </header>
</template>

<style scoped>
.hv-nav-item:hover {
  color: #9e3b2e;
}
</style>
