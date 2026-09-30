<script setup>
import { computed, inject } from "vue";
import { useRouter } from "vue-router";
import ShowApp from "../user/ShowApp.vue";
import Notify from "../user/Notify.vue";
import UserVue from "../user/User.vue";
const router = useRouter();
const user = inject("user");

const isSmallScreen = computed(() => {
  return window.screen.width < 768;
});
const handleClickViewApp = () => {
  if (isSmallScreen.value) {
    router.push({ name: "AppsPage" });
  }
};
</script>
<template>
  <div class="d-flex align-items-center h-100 position-relative map-header">
    <div class="d-flex align-items-center">
      <template v-if="user?.id">
        <!-- <Notification></Notification> -->
        <div
          class="dropdown topbar-head-dropdown"
          :class="{ 'ms-1': !isSmallScreen }"
        >
          <button
            @click="handleClickViewApp"
            type="button"
            class="btn btn-topbar btn-ghost-info rounded-circle p-0"
            data-bs-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
            :class="{ 'w-100': isSmallScreen, 'btn-icon': !isSmallScreen }"
          >
            <i class="bx bx-category-alt fs-20"></i>
          </button>
          <ShowApp></ShowApp>
        </div>
      </template>
      <Notify classIcon="text-primary"></Notify>
      <div
        class="d-flex align-items-center justify-content-center cursor-pointer dropdown p-1 ms-2"
        v-if="user?.id"
      >
        <UserVue></UserVue>
      </div>
      <router-link
        :to="{ name: 'Login' }"
        type="button"
        v-else
        @click="handleClickLogOut"
        class="btn btn-soft-info p-0"
        :class="{
          'd-flex btn-sm rounded-pill border-info fw-semibold align-items-center p-1':
            !isSmallScreen,
          'rounded-circle w-100': isSmallScreen,
        }"
      >
        <i class="ri-login-box-line" :class="{ 'fs-4': isSmallScreen }"></i>
        <span class="login-text">Đăng nhập</span>
      </router-link>
    </div>
  </div>
</template>
<style>
.line__inital--app {
  line-height: initial;
  min-height: 35px;
  align-items: center;
  font-size: 13px;
}

.dropdown__notis--small {
  width: 300px;

  @media (min-width: 768px) {
    transform: translate3d(45px, 55.6667px, 0px) !important;
  }
}
</style>
