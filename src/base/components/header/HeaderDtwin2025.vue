<template>
  <header class="header-custom card mb-0">
    <div class="row justify-content-center align-items-center h-100 px-3">
      <div
        class="col-12 d-flex justify-content-between align-items-center"
        style="min-height: 4.5rem"
      >
        <!-- Left Section -->
        <div class="d-flex align-items-center">
          <!-- Apps Dropdown -->
          <div class="dropdown topbar-head-dropdown header-item">
            <button type="button" class="btn btn-icon btn-topbar">
              <i class="fs-22" :class="route?.meta?.icon"></i>
            </button>
          </div>

          <!-- Date & Time -->
          <div class="flex-grow-1">
            <div class="page-title-box m-0 p-0 shadow-none">
              <h4 class="mb-0 bg-transparent">
                {{ route?.meta?.name ?? route?.meta?.title ?? "DTWIN" }}
              </h4>
            </div>
          </div>
        </div>

        <!-- Right Section -->
        <div
          class="top__dropdown d-flex gap-2 justify-content-center align-items-center"
        >
          <router-link to="/">
            <Image
              fallback="logo"
              class="rounded-circle header-profile-user object-cover"
              style="border: 1px solid #ccc"
              :src="ConfigSystem.logo"
              alt="Header Avatar"
            />
          </router-link>
          <Notify classIcon="btn-ghost-primary" />
          <User />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRoute } from "vue-router";
import Notify from "@/base/components/user/Notify.vue";
import User from "@/base/components/user/User.vue";
import Image from "@/base/components/image/Image.vue";
import { ConfigSystem } from "@/base/store/api/server_api";

const route = useRoute();
</script>

<style scoped>
.header-custom {
  z-index: 1;
}
</style>

<style>
.top__dropdown .dropdown-menu.show {
  top: 13px !important;
}
</style>
