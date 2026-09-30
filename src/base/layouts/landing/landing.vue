<script>
import FooterPortal from "./FooterPortal";
import TopbarHeaderPortal from "./TopbarHeaderPortal";

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

<style>
.main-content {
  min-height: 100vh;
}
</style>

<template>
  <div id="layout-wrapper landing">
    <topbar-header-portal :sticky-bar="isSticky" :is-light="isLight"/>
    <div class="vertical-overlay"></div>
    <slot></slot>
    <footer-portal/>
  </div>
</template>