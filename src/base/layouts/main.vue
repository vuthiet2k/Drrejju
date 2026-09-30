<script>
import { layoutComputed } from "@/helpers/state/helpers";

import Vertical from "./vertical";
import Horizontal from "./horizontal";
import TwoColumns from "./twocolumn";

export default {
  props: {
    pageLayout: {
      type: String,
      default: "horizontal",
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
  },
};
</script>

<template>
  <div class="position-relative">
    <Vertical ref="vertical" v-if="pageLayout === 'vertical'" :layout="layoutType" :systemMenu="systemMenu"
      :address="address" :slug="slug" :chooseMenu="chooseMenu">
      <slot />
    </Vertical>
    <Horizontal v-else-if="pageLayout === 'horizontal'" :layout="layoutType">
      <slot />
    </Horizontal>
    <TwoColumns v-else-if="pageLayout === 'twocolumn'" :layout="layoutType">
      <slot />
    </TwoColumns>
  </div>
</template>
