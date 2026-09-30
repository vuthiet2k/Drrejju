<!-- layouts/LayoutDtwin2025.vue -->
<script setup>
import { SimpleBar } from "simplebar-vue3";
import HeaderComponent from "../components/header/HeaderDtwin2025.vue";
import { useLayout } from "./composables/useLayout.js";
import DesktopSidebar from "./dtwin2025/DesktopSidebar.vue";
import MobileBottomNav from "./dtwin2025/MobileBottomNav.vue";
import SidebarDetails from "./dtwin2025/SidebarDetails.vue";

// Sử dụng composition API
const {
  // Refs
  menuDetails,
  isShowingDetails,
  isMobile,

  // Computed
  showMenuDetails,
  currentAppInfo,
  activeMenu,

  // Methods
  handleMenuDetails,
  openSettingsMenu,
} = useLayout();

const hideSidebarDetails = () => {
  isShowingDetails.value = false;
  
};
</script>

<template>
  <div class="position-fixed" style="inset: 0">
    <div class="w-100 h-100 d-flex" style="gap: 1px">
      <!-- Desktop Sidebar -->
      <DesktopSidebar
        :current-app-info="currentAppInfo"
        :show-menu-details="showMenuDetails"
        :handle-menu-details="handleMenuDetails"
        :open-settings-menu="openSettingsMenu"
      />

      <!-- Main Content -->
      <div class="flex-1 d-flex flex-column" style="gap: 1px">
        <HeaderComponent />

        <div class="flex-1 d-flex h-100 position-relative" style="gap: 1px">
          <!-- Desktop Sidebar Details -->
          <template v-if="showMenuDetails">
            <SidebarDetails
              :is-showing-details="isShowingDetails"
              :active-menu="activeMenu"
              :menu-details="menuDetails"
              @hide-details="hideSidebarDetails"
            />
          </template>

          <div class="position-absolute" style="inset: 0; z-index: 0">
            <div class="flex-1 h-100 overflow-relative main__content">
              <SimpleBar style="overflow-x: hidden" class="h-100">
                <slot>
                  <router-view />
                </slot>
              </SimpleBar>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation cho Mobile -->
    <MobileBottomNav
      :current-app-info="currentAppInfo"
      :is-mobile="isMobile"
      :show-menu-details="showMenuDetails"
      :open-mobile-menu="handleMenuDetails"
      :open-settings-menu="openSettingsMenu"
    />
  </div>
</template>

<style scoped>
@media (max-width: 767.98px) {
  .position-absolute {
    bottom: 60px;
  }
  .main__content {
    padding-bottom: 60px;
  }
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  @media (max-width: 767.98px) {
    .position-absolute {
      bottom: calc(60px + env(safe-area-inset-bottom));
    }
  }
}
</style>
