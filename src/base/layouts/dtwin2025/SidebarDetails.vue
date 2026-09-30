<!-- layouts/components/SidebarDetails.vue -->
<template>
  <div
    ref="sidebarRef"
    class="p-2 h-100 card mb-0 desktop-sidebar-detail"
    v-show="isShowingDetails"
    style="width: 190px; z-index: 1"
  >
    <transition name="slide-fade">
      <div
        class="flex-shrink-0 sidebar-detail"
        v-if="activeMenu"
        key="active-menu"
      >
        <ul class="navbar-nav h-100">
          <li
            class="nav-item"
            v-for="(menu, index) in menuDetails"
            :key="menu.name || index"
          >
            <b-link
              class="nav-link menu-link d-flex align-items-center gap-2 d-none"
              :href="'#sidebarMenu' + index"
              data-bs-toggle="collapse"
              role="button"
              aria-expanded="true"
              :aria-controls="'sidebarMenu' + index"
            >
              <i class="fs-18" :class="menu?.meta?.icon"></i>
              <span data-key="t-dashboards">{{ menu?.meta?.title }}</span>
            </b-link>
            <div
              class="collapse menu-dropdown show"
              :id="'sidebarMenu' + index"
            >
              <ul class="nav nav-sm flex-column gap-1">
                <li
                  class="nav nav-pills"
                  v-for="sub in menu.subMenu"
                  :key="sub.name"
                >
                  <router-link
                    :to="{ name: sub.name, params: $route.params }"
                    class="nav-link d-flex align-items-center gap-2 w-100 hover__bg__active"
                    :class="{
                      'text-primary bg__active': route.name == sub.name,
                    }"
                    @click="hideDetails"
                  >
                    <i class="fs-18" :class="sub?.meta?.icon"></i>
                    {{ sub?.meta?.name }}
                  </router-link>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>

      <div class="flex-shrink-0 sidebar-detail" v-else key="no-active-menu">
        <div class="text-center text-muted py-4">
          <i class="ri-information-line fs-1 mb-2"></i>
          <p>Vui lòng chọn một menu</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { defineProps, defineEmits, ref, onMounted, onUnmounted } from "vue";

const route = useRoute();
const sidebarRef = ref(null);

defineProps({
  isShowingDetails: Boolean,
  activeMenu: Object,
  menuDetails: Array,
});

const emit = defineEmits(["hide-details"]);

const hideDetails = () => {
  emit("hide-details");
};

// Xử lý click outside
const handleClickOutside = (event) => {
  if (sidebarRef.value && !sidebarRef.value.contains(event.target)) {
    // Kiểm tra xem click có phải trên desktop sidebar không
    const desktopSidebar = document.querySelector(".desktop-sidebar");
    const mobileSidebar = document.querySelector(".mobile-bottom-nav");
    if (desktopSidebar && desktopSidebar.contains(event.target)) {
      return; // Nếu click trên desktop sidebar thì không đóng
    }
    if (mobileSidebar && mobileSidebar.contains(event.target)) {
      return; // Nếu click trên mobile sidebar thì không đóng
    }

    hideDetails();
  }
};

// Thêm event listener khi component mounted
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

// Dọn dẹp event listener khi component unmounted
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.bg__active {
  background-color: rgb(214 214 214 / 60%);
}

.hover__bg__active:hover {
  background-color: rgb(214 214 214 / 60%);
}

.desktop-sidebar-detail {
  position: relative;
}
</style>
