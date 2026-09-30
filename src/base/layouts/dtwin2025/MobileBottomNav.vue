<!-- layouts/components/MobileBottomNav.vue -->
<template>
  <div class="mobile-bottom-nav" v-if="currentAppInfo?.allPages && isMobile">
    <SimpleBar class="h-100">
      <div class="bottom-nav-container">
        <template v-if="showMenuDetails">
          <!-- Trường hợp có menu con: click mở offcanvas -->
          <a
            v-for="item in currentAppInfo.allPages"
            :key="item.id"
            href="javascript:void(0);"
            class="bottom-nav-item col-3"
            :class="{ active: item.active }"
            @click="openMobileMenu(item)"
          >
            <div class="nav-icon">
              <i :class="item.meta.icon"></i>
            </div>
            <span class="nav-label">{{ item.meta.title }}</span>
          </a>
        </template>
        <template v-else>
          <!-- Trường hợp không có menu con: chuyển trang trực tiếp -->
          <router-link
            v-for="item in currentAppInfo.allPages"
            :key="item.id"
            :to="{ name: item.name }"
            class="bottom-nav-item col-3"
            :class="{ active: item.active }"
          >
            <div class="nav-icon">
              <i :class="item.meta.icon"></i>
            </div>
            <span class="nav-label">{{ item.meta.title }}</span>
          </router-link>
        </template>

        <!-- Nút cài đặt -->
        <!-- <a
          href="javascript:void(0);"
          class="bottom-nav-item col-3"
          @click="openSettingsMenu"
        >
          <div class="nav-icon">
            <i class="mdi mdi-cog-outline"></i>
          </div>
          <span class="nav-label">Cài đặt</span>
        </a> -->
      </div>
    </SimpleBar>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import { SimpleBar } from "simplebar-vue3";

defineProps({
  currentAppInfo: Object,
  isMobile: Boolean,
  showMenuDetails: Boolean,
  openMobileMenu: Function,
  openSettingsMenu: Function,
});
</script>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #ffffff;
  border-top: 1px solid #e0e0e0;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 1000;
  box-sizing: border-box;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
  display: none;
}

.bottom-nav-container {
  display: flex;
  height: 100%;
  padding: 0 8px;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #65676b;
  transition: all 0.2s ease;
  position: relative;
  min-height: 100%;
  height: 58px;
  cursor: pointer;
}

.bottom-nav-item.active {
  color: #1877f2;
}

.bottom-nav-item.active::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: #1877f2;
  border-radius: 0 0 3px 3px;
}

.nav-icon {
  font-size: 20px;
  margin-bottom: 2px;
  transition: transform 0.2s ease;
}

.bottom-nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  line-height: 1.2;
}

.bottom-nav-item:hover {
  color: #1877f2;
  background: rgba(24, 119, 242, 0.05);
}

.bottom-nav-item:active .nav-icon {
  transform: scale(0.95);
}

.bottom-nav-item.active:active .nav-icon {
  transform: scale(1.05);
}

@media (max-width: 767.98px) {
  .mobile-bottom-nav {
    display: block;
  }
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .mobile-bottom-nav {
    padding-bottom: env(safe-area-inset-bottom);
    height: calc(60px + env(safe-area-inset-bottom));
  }

  .bottom-nav-container {
    margin-bottom: env(safe-area-inset-bottom);
  }
}
</style>
