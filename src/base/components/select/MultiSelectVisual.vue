<template>
  <div
    class="d-flex align-items-center flex-row tree__visual--multi form-control p-0"
    :customID="customID"
    @click="handleClickVisual"
    :class="{ 'disable-bg': disable }"
  >
    <div class="mt-2 ms-2" v-if="data?.length" :customID="customID">
      <!-- Buttons with Label -->
      <button
        type="button"
        :disabled="disable"
        class="btn btn-primary btn-label waves-effect waves-light btn-sm btn-el-visual button-margin-visual"
        v-for="el in data"
        :key="el.id"
      >
        <i
          class="ri-close-line label-icon align-middle fs-16 me-2 icon-close-el"
          :customID="customID"
          @click="handleClickRemove(el)"
        ></i>
        {{ getLabelField(el) }}
      </button>
    </div>
    <div style="pointer-events: none;" class="text-muted d-flex align-items-center ps-3" v-else>
      <i>{{ palaceholder }}</i>
    </div>
  </div>
</template>

<style scoped>
.disable-bg {
  background-color: var(--vz-input-disabled-bg) !important;
  opacity: 1;
}

.tree__visual--multi {
  min-height: 37.5px;
  border-radius: 0.25rem;
}

.remove-selected {
  color: #fff;
  margin-right: 7px;
  border-color: #536295;
  padding: 0 8px;
}

.btn-el-visual {
  padding-left: 31px;
  margin-bottom: 6px;
}

.button-margin-visual {
  margin-right: 5px;
}

.icon-close-el {
  width: 25.5px;
}
</style>

<script>
export default {
  components: {},
  computed: {},
  props: {
    disable: {},
    customID: {},
    data: {},
    labelField: {},
    subLabelField: {},
    palaceholder: {
      type: String,
      default: "Chọn",
    },
  },
  methods: {
    handleClickVisual() {
      if (!this.disable) this.$emit("on-click-visual", true);
    },
    handleClickRemove(node) {
      if (!this.disable) this.$emit("on-remove-node", node);
    },
    getLabelField(node) {
      const valueLabel = node[this.labelField]
        ? node[this.labelField]
        : node[this.subLabelField];
      return valueLabel;
    },
  },
};
</script>
