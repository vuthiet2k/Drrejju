<script>
import { getDifferentArray } from "../../common/common.js";

export default {
  props: {
    placeholder: {
      type: String,
      default: "",
    },
    options: {
      type: Array,
      default: function () {
        return [];
      },
    },
    multip: {
      type: Boolean,
      default: true,
    },
    modelValue: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data: function () {
    return {
      show: false,
      valueChosed: [],
      nameOptionChose: "",
      search: "",
    };
  },
  mounted: function () {
    window.addEventListener("click", () => this.handleClose());
    this.valueChosed = this.modelValue
  },
  unmounted: function () {
    window.removeEventListener("click", () => { });
  },
  methods: {
    emitData: function (value) {
      if (value) {
        this.$emit("data", value);
        this.$emit("update:modelValue", value);
        return;
      }
      this.$emit("data", this.valueChosed);
      this.$emit("update:modelValue", this.valueChosed)
    },
    handleClose: function () {
      this.show = false;
    },
    handleClickChose: function (value) {
      if (this.multip) {
        this.valueChosed = [...this.valueChosed, value];
        this.emitData(this.valueChosed);
        return;
      }
      this.nameOptionChose = value?.name ?? "name";
      this.emitData([value]);
      const vm = this;
      setTimeout(() => {
        vm.handleClose();
      }, 100);
    },
    handleDeleteOption: function (value) {
      this.handleClose();
      if (!this.valueChosed.length) this.valueChosed = this.modelValue
      this.valueChosed = this.valueChosed.filter(
        (item) => item.id !== value.id
      );
      this.emitData();
    },
    handleShowListOption: function () {
      this.show = true;
    },
  },
  computed: {
    optionsFake: function () {
      let result = [];
      result = getDifferentArray(this.options, this.valueChosed);
      return result;
    },
    filterOptions: function () {
      if (!this.optionsFake.length) return [];
      return this.optionsFake.filter((item) =>
        item?.name.includes(this.search)
      );
    },
  },
};
</script>

<template>
  <div class="w-100 position-relative" style="min-height: 37.5px; z-index: 1" @click.stop="handleShowListOption">
    <div class="h-100 form-control position-relative cursor-pointer">
      <div v-if="!multip && nameOptionChose" class="text-black">
        {{ nameOptionChose }}
      </div>
      <div v-else-if="!modelValue.length" class="text-black-50">
        {{ placeholder }}
      </div>
      <template v-else>
        <div v-for="(item, index) in modelValue" :key="index"
          class="my-1 btn btn-sm btn-primary d-inline-flex align-items-center justify-content-center gap-2 me-2"
          @click.stop="handleDeleteOption(item)">
          {{ item.name }}
          <i class="ri-close-line"></i>
        </div>
      </template>
      <!-- icon-- no feature -->
      <div class="position-absolute px-2" style="top: 0; bottom: 0; right: 0">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="37.5" fill="currentColor" class="bi bi-chevron-down"
          viewBox="0 0 16 16">
          <path fill-rule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
        </svg>
      </div>
    </div>

    <!-- show list option -->
    <div v-if="show" class="position-absolute bg-white list-option-style pb-2">
      <div class="w-100 h-100 p-2 mt-1 d-flex flex-column" style="max-height: 195px">
        <input v-model="search" class="form-control form-control-sm" type="text" />
        <div class="py-2 ps-1 fw-medium" v-if="!options.length">
          Không có giá trị nào!
        </div>
        <div class="h-100 w-100 hover-overflowY-scroll" v-else>
          <div class="py-2 ps-1 fw-medium" v-if="!filterOptions.length && !search">
            Bạn đã chọn hết
          </div>
          <div v-else-if="!filterOptions.length && search">
            <div class="py-2 ps-1 fw-medium">Không có kết quả nào!</div>
          </div>
          <div class="row m-0 mt-2" v-else>
            <div v-for="(item, index) in filterOptions" :key="index" class="col-12 p-1 cursor-pointer hover-bg"
              @click="handleClickChose(item)">
              <span class="ellipsis" style="line-height: 20px">
                {{ item.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-option-style {
  top: 100%px;
  left: 0;
  right: 0;
  max-height: 200px;
  border-radius: 4px;
  box-shadow: 0 5px 10px #1e20251f;
}
</style>
