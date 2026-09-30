<template>
  <div ref="divToHide" :customID="id">
    <div class="position-relative">
      <input
        type="text"
        class="form-control"
        :placeholder="placeholder"
        autocomplete="off"
        v-model="searchQuery"
        v-if="!multiSelect"
        :disabled="disable"
        :customID="id"
        @click="isShow = true"
        @keydown.enter.prevent
        :class="{
          'is-invalid': !valueLabel && required,
          'is-invalid': multiSelectedData.length < 1 && required && multiSelect,
        }"
      />

      <span
        class="position-absolute cursor-pointer text-muted mdi mdi-close-circle search-widget-icon search-widget-icon-close"
        v-if="searchQuery && !disable"
        @click.stop="searchQuery = ''"
        style="right: 4px; top: 50%; transform: translateY(-50%)"
      ></span>
    </div>

    <MultiSelectVisual
      :customID="id"
      :data="multiSelectedData"
      :subLabelField="subLabelField"
      v-if="multiSelect"
      :labelField="labelField"
      @on-remove-node="removeElementMulti"
      @on-click-visual="isShow = true"
      :disable="disable"
    >
    </MultiSelectVisual>
    <div
      v-if="isShow"
      :customID="id"
      class="bg-white position-absolute top-100 w-100 start-0 border shadow-lg"
      style="z-index: 2"
    >
      <SimpleBar style="max-height: 250px">
        <template v-if="displayedTreeData && displayedTreeData.length > 0">
          <TreeNode
            :id="id"
            v-for="node in displayedTreeData"
            :key="node.id"
            :node="node"
            :loopField="loopField"
            :selectedData="selectedData"
            :multiSelectedData="multiSelectedData"
            :ignoreSelect="ignoreSelect"
            :subLabelField="subLabelField"
            :labelField="labelField"
            class="w-100"
            :customID="id"
            :multiSelect="multiSelect"
            :ignoreObject="ignoreObject"
            @click-node="emitNode"
          />
        </template>
        <template v-else>
          <notMatchSearch :description="'Không có dữ liệu nào'" />
        </template>
      </SimpleBar>
    </div>
  </div>
</template>

<script>
import { SimpleBar } from "simplebar-vue3";
import TreeNode from "./TreeNode.vue";
import { uuidv4 } from "@/helpers/utils/uuid/uuid.js";
import MultiSelectVisual from "@/base/components/select/MultiSelectVisual.vue";
import {
  pushOrRemoveItemInList,
  removeItemFromList,
} from "@/base/components/select/multiSelectHandler.js";
import { isNullOrEmpty } from "@/helpers/utils/objectHandle.js";
import { buildStructure } from "@/helpers/utils/tree_structure.js";
import API from "@/app_manage_dynamic_api/helper/api/useAxios.js";
import notMatchSearch from "@/base/components/search/notMatchSearch.vue";

export default {
  name: "Tree",
  components: {
    TreeNode,
    SimpleBar,
    MultiSelectVisual,
    notMatchSearch,
  },
  data: () => {
    return {
      id: "",
      localTreeData: [], // Biến nội bộ để giữ dữ liệu cây
      displayedTreeData: [], // Biến nội bộ để giữ dữ liệu cây
      selectedData: {},
      multiSelectedData: [],
      valueLabel: "",
      searchQuery: "",
      isShow: false,
      count: 0,
    };
  },
  props: {
    placeholder: {
      type: String,
      default: "Chọn mục…", // giá trị hiển thị khi chưa chọn gì
    },
    api: {
      type: String,
      default: "",
    },
    treeData: {
      required: true,
      default: [
        {
          id: null,
          name: "Dữ liệu trống",
        },
      ],
    },
    loopField: {
      type: String,
      default: "children",
    },
    labelField: {
      type: String,
      default: "name",
    },
    subLabelField: {
      type: String,
      default: "name_display",
    },
    ignoreSelect: {
      default: {},
    },
    defaultSelected: {
      default: {},
    },
    multiSelect: {
      type: Boolean,
      required: false,
      default: false,
    },
    disable: {
      type: Boolean,
      required: false,
      default: false,
    },
    ignoreObject: {
      type: Object,
      default: () => {
        return {
          id: "",
        };
      },
    },
    required: {
      type: Boolean,
      default: false,
    },
    convert: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    handleClickOutside(event) {
      const customID = event.target.getAttribute("customID");
      if (customID != this.id) {
        this.isShow = false;
      }
    },
    getValueLabel(data) {
      if (!isNullOrEmpty(data)) {
        const valueLabel = data[this.labelField]
          ? data[this.labelField]
          : data[this.subLabelField];
        return valueLabel;
      } else {
        return "";
      }
    },
    onChangeData() {
      if (this.multiSelect) {
        this.$emit("on-selected", this.multiSelectedData);
      } else {
        this.$emit("on-selected", this.selectedData);
        const TEMP_ = this.getValueLabel(this.selectedData);
        this.valueLabel = TEMP_;
        this.searchQuery = TEMP_;
      }
    },
    emitNode(node) {
      this.selectedData = node;
      this.multiSelectedData = pushOrRemoveItemInList(
        this.multiSelectedData,
        node
      );
    },
    removeElementMulti(node) {
      const isRemoved = removeItemFromList(this.multiSelectedData, node);
      this.multiSelectedData = isRemoved.l;
    },
    resetAll() {
      if (!this.multiSelect) {
        if (
          JSON.stringify(this.selectedData) !==
          JSON.stringify(this.defaultSelected)
        ) {
          this.selectedData = { ...this.defaultSelected };
          this.onChangeData();
        }
      } else {
        if (
          JSON.stringify(this.multiSelectedData) !==
          JSON.stringify(this.defaultSelected)
        ) {
          this.multiSelectedData = this.defaultSelected;
          this.onChangeData();
        }
      }
    },

    async fetchTreeData() {
      try {
        const data = await API().call(this.api);
        this.localTreeData = this.convert
          ? buildStructure(data?.results)
          : data;
        this.displayedTreeData = this.localTreeData; // CẬP NHẬT displayedTreeData SAU KHI FETCH
      } catch (error) {
        console.error("Error while fetching tree data:", error);
      }
    },
    filterTreeData() {
      if (!this.searchQuery?.trim()) {
        this.displayedTreeData = this.convert
          ? buildStructure(this.localTreeData)
          : this.localTreeData;
        return;
      }

      const query = this.searchQuery.toLowerCase().trim();

      const filterNodes = (nodes) => {
        const result = [];

        for (const node of nodes) {
          const label = (
            node[this.labelField] ||
            node[this.subLabelField] ||
            ""
          ).toLowerCase();
          const hasMatchingLabel = label.includes(query);

          let newNode = { ...node };

          // Nếu node có children, lọc children trước
          if (node[this.loopField]?.length > 0) {
            const filteredChildren = filterNodes(node[this.loopField]);
            if (filteredChildren.length > 0) {
              newNode[this.loopField] = filteredChildren;
            } else {
              newNode[this.loopField] = [];
            }
          }

          // Giữ node nếu bản thân nó khớp hoặc có children khớp
          if (
            hasMatchingLabel ||
            (newNode[this.loopField] && newNode[this.loopField].length > 0)
          ) {
            result.push(newNode);
          }
        }

        return result;
      };

      this.displayedTreeData = filterNodes(this.localTreeData);
    },
  },
  mounted() {
    this.id = uuidv4();
    window.addEventListener("click", this.handleClickOutside);
    this.resetAll();
    if (this.api) {
      this.fetchTreeData();
    } else if (this.treeData?.length > 0) {
      this.localTreeData = this.convert
        ? buildStructure(this.treeData)
        : this.treeData;
      this.displayedTreeData = this.localTreeData; // KHỞI TẠO displayedTreeData
    }
  },

  beforeUnmount() {
    window.removeEventListener("click", this.handleClickOutside);
  },
  watch: {
    selectedData() {
      this.onChangeData();
    },
    multiSelectedData: {
      handler: function () {
        this.onChangeData();
      },
      deep: true,
    },
    defaultSelected: {
      handler(val, oldVal) {
        // Chỉ reset nếu chưa có lựa chọn nào
        const isEmptySelection = this.multiSelect
          ? this.multiSelectedData.length === 0
          : isNullOrEmpty(this.selectedData);

        if (val !== oldVal && isEmptySelection) {
          this.resetAll();
        }
      },
    },

    treeData: {
      handler(newTreeData) {
        if (!this.api) {
          this.localTreeData = this.convert
            ? buildStructure(newTreeData)
            : newTreeData;
          this.displayedTreeData = this.localTreeData; // CẬP NHẬT displayedTreeData
          this.filterTreeData(); // ÁP DỤNG FILTER NẾU ĐANG CÓ SEARCH
        }
        this.resetAll();
      },
      deep: true,
    },

    searchQuery: {
      handler() {
        this.filterTreeData();
      },
    },
    api: {
      handler(newApi) {
        if (newApi) {
          this.fetchTreeData();
        }
      },
    },
    localTreeData: {
      handler() {
        this.filterTreeData(); // Tự động filter khi localTreeData thay đổi
      },
      deep: true,
    },
  },
};
</script>
