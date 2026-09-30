<script>
import { layoutComputed } from "@/state/helpers";

import Vertical from "./vertical";
import Horizontal from "./horizontal";
import TwoColumns from "./twocolumn";

export default {
  props: {
    pageLayout: {
      type: String,
      default: "vertical",
    },
    isSticky: Boolean,
    isLight: Boolean,
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
    manageDynamic: { type: Boolean, default: true },
  },
  components: {
    Vertical,
    Horizontal,
    TwoColumns,
  },
  data() {
    return {};
  },
  computed: {
    ...layoutComputed,
  },
  mounted() {
    // document.documentElement.setAttribute("data-layout", this.pageLayout);
    // document.documentElement.setAttribute("data-sidebar", "dark");
  },
  methods: {
    toggleHamburgerMenu() {
      var windowSize = document.documentElement.clientWidth;
      let layoutType = document.documentElement.getAttribute("data-layout");
      let visiblilityType = document.documentElement.getAttribute(
        "data-sidebar-visibility"
      );

      document.documentElement.setAttribute("data-sidebar-visibility", "show");

      if (windowSize > 767)
        document.querySelector(".hamburger-icon").classList.toggle("open");

      //For collapse horizontal menu
      if (
        document.documentElement.getAttribute("data-layout") === "horizontal"
      ) {
        document.body.classList.contains("menu")
          ? document.body.classList.remove("menu")
          : document.body.classList.add("menu");
      }

      //For collapse vertical menu

      if (
        visiblilityType === "show" &&
        (layoutType === "vertical" || layoutType === "semibox")
      ) {
        if (windowSize < 1025 && windowSize > 767) {
          document.body.classList.remove("vertical-sidebar-enable");
          document.documentElement.getAttribute("data-sidebar-size") == "sm"
            ? document.documentElement.setAttribute("data-sidebar-size", "")
            : document.documentElement.setAttribute("data-sidebar-size", "sm");
        } else if (windowSize > 1025) {
          document.body.classList.remove("vertical-sidebar-enable");
          if (
            document.documentElement.getAttribute("data-sidebar-size") == "lg"
          ) {
            document.documentElement.setAttribute("data-sidebar-size", "sm");
            document.getElementById(
              "bottom__menu--content"
            ).innerHTML = `© IOTLink`;
          } else {
            document.documentElement.setAttribute("data-sidebar-size", "lg");
            document.getElementById(
              "bottom__menu--content"
            ).innerHTML = `${new Date().getFullYear()} © DTwin Team. Design & Develop by DTwin Team`;
          }
        } else if (windowSize <= 767) {
          document.body.classList.add("vertical-sidebar-enable");
          document.documentElement.setAttribute("data-sidebar-size", "lg");
        }
      }

      //Two column menu
      if (document.documentElement.getAttribute("data-layout") == "twocolumn") {
        document.body.classList.contains("twocolumn-panel")
          ? document.body.classList.remove("twocolumn-panel")
          : document.body.classList.add("twocolumn-panel");
      }
    },
  },
};
</script>

<template>
  <div class="position-relative">
    <button
      @click="toggleHamburgerMenu"
      type="button"
      class="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger position-absolute"
      id="topnav-hamburger-icon"
    >
      <span class="hamburger-icon">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </button>
    <Vertical
      ref="vertical"
      v-if="pageLayout === 'vertical'"
      :layout="layoutType"
      :systemMenu="systemMenu"
      :address="address"
      :slug="slug"
      :chooseMenu="chooseMenu"
      :manageDynamic="manageDynamic"
    >
      <slot />
    </Vertical>
    <Horizontal v-if="pageLayout === 'horizontal'" :layout="layoutType">
      <slot />
    </Horizontal>
    <TwoColumns v-if="pageLayout === 'twocolumn'" :layout="layoutType">
      <slot />
    </TwoColumns>
  </div>
</template>
