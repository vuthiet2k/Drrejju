<script>
import HeaderUser from '../../components/header/HeaderUser.vue'
// import MenuPortal from "./MenuPortal";
import { ConfigSystem } from "@/base/store/api/server_api";
import Image from "@/base/components/image/Image.vue";

export default {
  name: "TopbarHeaderPortal",
  components: {
    HeaderUser,
    Image,
    // MenuPortal
  },
  props: {
    stickyBar: Boolean,
    isLight: Boolean,
  },
  computed: {
    smallScreen() {
      return window.screen.width <= 991;
    }
  },
  data() {
    return {
      ConfigSystem: ConfigSystem,
      isFixed: false,
      topBarLight: false,
    };
  },

  mounted() {
    window.addEventListener("scroll", function (ev) {
      ev.preventDefault();
      var navbar = document.getElementById("navbar");
      if (navbar) {
        if (
          document.body.scrollTop >= 50 ||
          document.documentElement.scrollTop >= 50
        ) {
          navbar.classList.add("is-sticky");
        } else {
          navbar.classList.remove("is-sticky");
        }
      }
    });
    if (this.stickyBar === true) {
      this.isFixed = true;
    } else {
      this.isFixed = false;
    }

    if (this.isLight === true) {
      this.topBarLight = true;
    } else {
      this.topBarLight = false;
    }
  },
  methods: {},
};
</script>
<template>
  <nav class="navbar navbar-expand-lg navbar-landing py-0" id="navbar"
    :class="{ 'fixed-top': isFixed, 'navbar-light': topBarLight }" style="height: 54px">
    <b-container id="header__container--portal">
      <router-link to="/" class="navbar-brand">
        <Image :src="ConfigSystem.logo" fallback="logo" class="card-logo card-logo-dark navbar--brand__logo"
          alt="logo dark" style="height: 36px" />
        <Image :src="ConfigSystem.logo" fallback="logo"
          class="card-logo card-logo-light navbar--brand__logo" alt="logo light" style="height: 36px" />
      </router-link>
      <button class="navbar-toggler py-0 fs-20 text-body" type="button" data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasTop" aria-controls="offcanvasTop">
        <i class="mdi mdi-menu"></i>
      </button>
      <div v-show="!smallScreen" class="nav-item user">
        <HeaderUser></HeaderUser>
      </div>
    </b-container>
  </nav>
  <div class="offcanvas offcanvas-top bg-primary" tabindex="-1" id="offcanvasTop" aria-labelledby="offcanvasTopLabel"
    style="min-height:55vh;">
    <div class="offcanvas-body p-2">
      <div class="d-flex justify-content-between align-items-center border-bottom px-2 pb-1" style="border: #cccccc">
        <router-link to="/" class="navbar-brand">
          <Image :src="ConfigSystem.logo" fallback="logo"
            class="card-logo card-logo-dark navbar--brand__logo" alt="logo dark" style="height: 36px" />
          <Image :src="ConfigSystem.logo" fallback="logo"
            class="card-logo card-logo-light navbar--brand__logo" alt="logo light" style="height: 36px" />
        </router-link>
        <HeaderUser></HeaderUser>
      </div>
      <!-- <MenuPortal></MenuPortal> -->
      <div class="mt-2 text-center">
        <button class="btn btn-soft-danger btn-md btn-icon rounded-circle light-dark-mode text-white-75" type="button"
          data-bs-toggle="offcanvas" data-bs-target="#offcanvasTop" aria-controls="offcanvasTop">
          <div class="btn-content"><i class="ri-close-fill fs-22"></i></div>
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
@media screen and (max-width: 991px) {
  #header__container--portal {
    justify-content: space-between;
  }

  #offcanvasTop {
    color: #cccccc;
  }
}
</style>
