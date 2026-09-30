<script setup>
import { computed, inject, onMounted } from "vue";
import { useStore } from "vuex";
import Image from "@/base/components/image/Image.vue";
import ButtonIcon from "@/base/components/baseUI/ButtonIcon.vue";

const store = useStore();
const user = inject("user");

const AvatarUser = computed(() => {
  if (user.value?.photo) return `${user.value.photo}`;
  if (user.value?.gender == 0) {
    return require("@/assets/images/users/boy.png");
  }
  if (user.value?.gender == 1) {
    return require("@/assets/images/users/girl.png");
  }
  return require("@/assets/images/users/user-dummy-img.jpg");
});

const changeToDarkMode = () => {
  if (store.state.layout.mode == "light") {
    store.dispatch("layout/changeMode", { mode: "dark" });
    localStorage.setItem("theme", "dark");
  } else {
    store.dispatch("layout/changeMode", { mode: "light" });
    localStorage.setItem("theme", "light");
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    store.dispatch("layout/changeMode", { mode: savedTheme });
  }
});
const getDisplayName = (_user = user.value) => {
  if (!_user) return "Chưa có thông tin";

  const name = `${_user.first_name ?? ""} ${_user.last_name ?? ""}`.trim();
  return name || _user.username || _user.email || "Thông tin";
};
</script>

<template>
  <div v-if="user?.id" class="dropdown topbar-user bg-transparent">
    <div
      class="cursor-pointer"
      data-bs-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
    >
      <span class="d-flex align-items-center">
        <Image
          fallback="user"
          class="rounded-circle header-profile-user border border-4 border-white"
          :src="AvatarUser"
          alt="Header Avatar"
        />
        <!-- <span class="text-start ms-xl-2">
          <span class="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
            {{ user.username }}
          </span>
          <span
            class="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text"
          >
            {{ user.user_role?.name }}
          </span>
        </span> -->
      </span>
    </div>
    <div class="dropdown-menu dropdown-menu-end">
      <!-- <h6 class="dropdown-header">Chào mừng&nbsp;{{ user.username }}!</h6> -->
      <router-link class="dropdown-item" :to="{ name: 'Profile' }">
        <span class="text-start d-flex align-items-center">
          <i
            class="mdi mdi-account-circle text-muted fs-18 align-middle me-1"
          ></i>
          <div class="d-flex flex-column">
            <span class="fw-medium">{{ getDisplayName() }} </span>
            <span
              v-if="user?.department?.name"
              class="user-name-sub-text small"
            >
              {{ user.department.name }}
            </span>
          </div>
        </span>
      </router-link>
      <div class="dropdown-divider"></div>
      <router-link class="dropdown-item" :to="{ name: 'AppMyApp' }"
        ><i class="ri-apps-line text-muted fs-18 align-middle me-1"></i>
        <span class="align-middle">Ứng dụng</span>
      </router-link>
      <div class="dropdown-divider"></div>
      <router-link class="dropdown-item" to="/change-password">
        <i class="ri-rotate-lock-fill text-muted fs-18 align-middle me-1"></i>
        <span class="align-middle">Đổi mật khẩu</span>
      </router-link>
      <div class="dropdown-item d-none" @click="changeToDarkMode">
        <i
          class="text-muted fs-18 align-middle me-1"
          :class="
            store.state.layout.mode == 'light' ? 'bx bx-moon' : 'bx bx-sun'
          "
        ></i>
        <span class="align-middle"
          >{{
            `Chuyển chế độ ${
              store.state.layout.mode == "light" ? "tối" : "sáng"
            }`
          }}
        </span>
      </div>
      <router-link :to="{ name: 'Logout' }">
        <div class="dropdown-item">
          <i class="mdi mdi-logout text-muted fs-18 align-middle me-1"></i>
          <span class="align-middle" data-key="t-logout">Đăng xuất</span>
        </div>
      </router-link>
    </div>
  </div>

  <div v-else class="">
    <router-link :to="{ name: 'Login' }">
      <ButtonIcon
        type="info"
        name="Đăng nhập"
        classIcon="ri-login-box-line"
        aria-haspopup="true"
        aria-expanded="false"
      >
      </ButtonIcon>
    </router-link>
  </div>
</template>

<style scoped>
@media (min-width: 768px) {
  .home__tina .header-profile-user {
    width: 58px;
    height: 58px;
    object-fit: cover;
  }
  .header-profile-user {
    width: 3rem;
    height: 3rem;
  }
}
</style>
