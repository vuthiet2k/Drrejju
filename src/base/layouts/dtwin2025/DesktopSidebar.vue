<!-- layouts/components/DesktopSidebar.vue -->
<template>
  <div
    class="card d-flex flex-column h-100 px-1 desktop-sidebar"
    style="width: 5rem; min-width: 5rem"
  >
    <!-- Navigation Menu -->
    <ul class="nav nav-pills nav-flush flex-column mb-auto text-center">
      <div
        class="d-flex justify-content-center align-items-center"
        style="height: 5rem"
      >
        <div class="top__dropdown dropdown topbar-head-dropdown header-item">
          <button
            type="button"
            class="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle border"
            data-bs-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <i class="bx bx-category-alt fs-22"></i>
          </button>
          <ShowApp />
        </div>
      </div>
      <template v-if="currentAppInfo?.allPages">
        <li
          v-for="item in currentAppInfo.allPages"
          :key="item.id"
          class="nav-item w-100 mb-1"
        >
          <template v-if="showMenuDetails">
            <a
              href="#"
              @click.prevent="handleMenuDetails(item)"
              :class="[
                'hover__bg__active nav-link py-2 rounded-2 table-hover d-flex flex-column align-items-center',
                { 'text-primary bg__active': item.active },
              ]"
              :title="item.meta.title"
            >
              <i :class="[item.meta.icon, 'fs-18']"></i>
              <small
                class="sidebar-text text-nowrap text-truncate"
                style="max-width: 4rem"
              >
                {{ item.meta.title }}
              </small>
            </a>
          </template>
          <template v-else>
            <router-link
              :to="{ name: item.name }"
              :class="[
                'hover__bg__active nav-link py-2 rounded-2 table-hover d-flex flex-column align-items-center',
                { 'text-primary bg__active': item.active },
              ]"
              :title="item.meta.title"
            >
              <i :class="[item.meta.icon, 'fs-18']"></i>
              <small
                class="sidebar-text text-nowrap text-truncate"
                style="max-width: 4rem"
              >
                {{ item.meta.title }}
              </small>
            </router-link>
          </template>
        </li>
      </template>
    </ul>

    <!-- Settings -->
    <!-- <div class="nav nav-pills" style="border-top: 1px solid var(--vz-primary)">
      <a
        href="#"
        class="my-1 align-items-center d-flex flex-column hover-bg-light nav-link py-2 rounded-2 table-hover w-100"
        @click="openSettingsMenu"
      >
        <i class="mdi mdi-cog-outline fs-18"></i>
        <small class="sidebar-text text-nowrap">Cài đặt</small>
      </a>
    </div> -->
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import ShowApp from "@/base/components/user/ShowApp.vue";

defineProps({
  currentAppInfo: Object,
  showMenuDetails: Boolean,
  handleMenuDetails: Function,
  openSettingsMenu: Function,
});
</script>

<style scoped>
.bg__active {
  background-color: rgb(214 214 214 / 60%);
}

.hover__bg__active:hover {
  background-color: rgb(214 214 214 / 60%);
}

@media (max-width: 767.98px) {
  .desktop-sidebar {
    display: none !important;
  }
}
</style>
