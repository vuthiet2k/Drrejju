<template>
  <div :customID="id" v-if="isNotIgnore(node)">
    <div :customID="id">
      <div
        class="w-100 px-2 py-1 d-flex align-items-center gap-1 cursor-pointer hover-bg-light hover-text-primary"
        :class="{ 'summary-selected': isThisNodeSelected(node) }"
        :customID="id"
      >
        <div v-show="isThisHaveChildren(node)" :customID="id">
          <i
            v-if="isShow"
            class="ri-arrow-down-s-fill fs-18"
            @click="isShow = !isShow"
            :customID="id"
          ></i>
          <i
            v-else
            class="ri-arrow-right-s-fill fs-18"
            @click="isShow = !isShow"
            :customID="id"
          ></i>
        </div>
        <div
          v-show="!isThisHaveChildren(node)"
          style="width: 18px; height: 27.5px"
          :customID="id"
        ></div>
        <div
          @click="
            () => {
              onclickTreeNode(node);
              isShow = !isShow;
            }
          "
          :customID="id"
          class="w-100"
        >
          {{ node[labelField] ? node[labelField] : node[subLabelField] }}
        </div>
      </div>
    </div>
    <div class="summanry-body" v-if="isShow" :customID="id">
      <TreeNode
        :id="id"
        v-for="child in node[loopField]"
        :key="child.id"
        :node="child"
        :loopField="loopField"
        :selectedData="selectedData"
        :multiSelectedData="multiSelectedData"
        :ignoreSelect="ignoreSelect"
        :labelField="labelField"
        :ignoreObject="ignoreObject"
        :multiSelect="multiSelect"
        @click-node="onclickTreeNode"
      />
    </div>
  </div>
</template>

<style scoped>
.summary-selected {
  background-color: #e3f2fd;
}
</style>

<script>
import { isNullOrEmpty } from "@/helpers/utils/objectHandle.js";

export default {
  name: "TreeNode",
  props: {
    id: {},
    selectedData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    multiSelectedData: {
      type: Array,
      default: () => {
        return [];
      },
    },
    node: {
      type: Object,
      required: true,
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
    ignoreObject: {
      type: Object,
      default: () => {
        return {
          id: "",
        };
      },
    },
    multiSelect: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      isShow: false,
    };
  },
  methods: {
    onclickTreeNode(node) {
      // Nếu không cho phép select folder cha mà node có children thì return không xử lý gì thêm
      if (
        this.ignoreSelect.field &&
        node[this.ignoreSelect.field] == this.ignoreSelect.value
      )
        return;
      if (node.id != null) {
        this.$emit("click-node", node);
      }
    },
    isThisNodeSelected(node) {
      if (this.multiSelect) {
        if (!isNullOrEmpty(this.multiSelectedData)) {
          return this.multiSelectedData.some(
            (selectedNode) => selectedNode.id === node.id
          );
        }
        return false;
      } else {
        return node.id == this.selectedData.id;
      }
    },
    isThisHaveChildren(node) {
      return node[this.loopField]?.length > 0 ? true : false;
    },
    isNotIgnore(node) {
      return node.id != this.ignoreObject.id;
    },
  },
};
</script>
