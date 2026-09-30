<script>
import TopbarHeaderPortal from "./landing/TopbarHeaderPortal.vue";
import FooterPortal from "./landing/FooterPortal.vue";

export default {
  name: "LayoutPortal",
  props: {
    isSticky: Boolean,
    isLight: Boolean
  },
  components: {
    'footer-portal': FooterPortal,
    'topbar-header-portal': TopbarHeaderPortal
  },

  mounted() {
  }
}
</script>

<template>
  <div id="layout-wrapper landing">
    <topbar-header-portal :sticky-bar="isSticky" :is-light="isLight" />
    <div class="vertical-overlay"></div>
    <slot></slot>
    <footer-portal />
  </div>
</template>
