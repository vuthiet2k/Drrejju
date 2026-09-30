<script>
import router from "@/router";
import { SimpleBar } from "simplebar-vue3";
import { layoutComputed } from "@/state/helpers";
import NavBar from "../components/nav-bar";
import Menu from "../components/menu.vue";
import RightBar from "../components/right-bar";
import Footer from "../components/footer";
import PageHeader from "../components/page-header.vue";
import { ConfigSystem } from "@/base/store/api/server_api";

localStorage.setItem("hoverd", false);

/**
 * Vertical layout
 */
export default {
  components: {
    NavBar,
    RightBar,
    Footer,
    SimpleBar,
    Menu,
    PageHeader,
  },
  props: {
    systemMenu: Boolean,
    address: {
      type: Object,
      default: function () {
        return {
          title: "",
          details: [],
        };
      },
    },
    slug: {
      type: String,
      default: "kcn-song-cong-2",
    },
    chooseMenu: {
      type: String,
      default: "none",
    },
    manageDynamic: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      ConfigSystem: ConfigSystem,
      isMenuCondensed: false,
      dNoneNavbar: false,
      componentsNavbar: undefined,
    };
  },
  computed: {
    ...layoutComputed,
    sidebarSize: {
      get() {
        return this.$store ? this.$store.state.layout.sidebarSize : {} || {};
      },
      set(type) {
        return this.changeSidebarSize({
          sidebarSize: type,
        });
      },
    },
  },
  created: () => {
    document.body.removeAttribute("data-layout", "horizontal");
    document.body.removeAttribute("data-topbar", "dark");
    document.body.removeAttribute("data-layout-size", "boxed");
  },
  methods: {
    setComponentsNavbar: function (component) {
      this.dNoneNavbar = true;
      this.componentsNavbar = component;
    },
    initActiveMenu() {
      if (
        document.documentElement.getAttribute("data-sidebar-size") ===
        "sm-hover"
      ) {
        localStorage.setItem("hoverd", true);
        document.documentElement.setAttribute(
          "data-sidebar-size",
          "sm-hover-active"
        );
      } else if (
        document.documentElement.getAttribute("data-sidebar-size") ===
        "sm-hover-active"
      ) {
        localStorage.setItem("hoverd", false);
        document.documentElement.setAttribute("data-sidebar-size", "sm-hover");
      } else {
        document.documentElement.setAttribute("data-sidebar-size", "sm-hover");
      }
    },
    toggleMenu() {
      document.body.classList.toggle("sidebar-enable");

      if (window.screen.width >= 992) {
        // eslint-disable-next-line no-unused-vars
        router.afterEach((routeTo, routeFrom) => {
          document.body.classList.remove("sidebar-enable");
          document.body.classList.remove("vertical-collpsed");
        });
        document.body.classList.toggle("vertical-collpsed");
      } else {
        // eslint-disable-next-line no-unused-vars
        router.afterEach((routeTo, routeFrom) => {
          document.body.classList.remove("sidebar-enable");
        });
        document.body.classList.remove("vertical-collpsed");
      }
      this.isMenuCondensed = !this.isMenuCondensed;
    },
    toggleRightSidebar() {
      document.body.classList.toggle("right-bar-enabled");
    },
    hideRightSidebar() {
      document.body.classList.remove("right-bar-enabled");
    },
  },
  mounted() {
    if (localStorage.getItem("hoverd") == "true") {
      document.documentElement.setAttribute(
        "data-sidebar-size",
        "sm-hover-active"
      );
    }

    document.getElementById("overlay").addEventListener("click", () => {
      document.body.classList.remove("vertical-sidebar-enable");
    });
  },
};
</script>

<template>
  <div id="layout-wrapper">
    <NavBar :address="address" :slug="slug" />
    <div>
      <!-- ========== Left Sidebar Start ========== -->
      <!-- ========== App Menu ========== -->
      <div class="app-menu navbar-menu">
        <!-- LOGO -->
        <div class="navbar-brand-box">
          <!-- Dark Logo-->
          <router-link to="/" class="logo logo-dark" style="line-height: 85px">
            <span class="logo-sm">
              <img
                :src="ConfigSystem.logo"
                alt=""
                height="50"
              />
            </span>
            <span class="logo-lg">
              <img
                :src="ConfigSystem.logo"
                alt=""
                height="50"
              />
            </span>
          </router-link>
          <!-- Light Logo-->
          <router-link to="/" class="logo logo-light">
            <span class="logo-sm">
              <img
                :src="ConfigSystem.logo"
                alt=""
                height="50"
              />
            </span>
            <span class="logo-lg">
              <img
                :src="ConfigSystem.logo"
                alt=""
                height="50"
              />
            </span>
          </router-link>
          <button
            type="button"
            class="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
            id="vertical-hover"
            @click="initActiveMenu"
          >
            <i class="ri-record-circle-line"></i>
          </button>
        </div>
        <SimpleBar id="scrollbar" class="h-100" ref="scrollbar">
          <MenuSystem :chooseMenu="chooseMenu" v-if="systemMenu"></MenuSystem>
          <div v-else-if="dNoneNavbar">
            <component :is="componentsNavbar"></component>
          </div>
          <Menu :slug="slug" :chooseMenu="chooseMenu" v-else></Menu>
        </SimpleBar>
        <div class="sidebar-background"></div>
      </div>
      <!-- Left Sidebar End -->
      <!-- Vertical Overlay-->
      <div class="vertical-overlay" id="overlay"></div>
    </div>
    <!-- ============================================================== -->
    <!-- Start Page Content here -->
    <!-- ============================================================== -->
    <div class="main-content" :class="{ 'h-100vh': manageDynamic }">
      <div class="h-100 page-content">
        <!-- Start Content-->
        <b-container class="h-100" fluid>
          <PageHeader :items="address.details" />
          <slot />
        </b-container>
      </div>
      <Footer />
    </div>
    <!-- <div class="main-content h-100">
      <div class="page-content pb-0">
        <b-container fluid class="h-100">
          <PageHeader v-show="chooseMenu !== `demo-app`" :items="address.details" />
          <slot v-if="chooseMenu === `demo-app`" name="apps_layouts"></slot>
          <div v-else class="chat-wrapper d-lg-flex gap-1 mx-n3 mt-n1 p-1 h-100">
            <div class="file-manager-content w-100 bg-light">
              <slot />
            </div>
          </div>
        </b-container>
      </div>
    </div> -->
    <RightBar />
  </div>
</template>

<style scoped>
.h-100vh {
  height: 100vh !important;
}
</style>
