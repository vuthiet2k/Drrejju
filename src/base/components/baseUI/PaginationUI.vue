<template>
  <div class="d-flex justify-content-end">
    <div class="pagination-wrap hstack gap-2" style="display: flex">
      <div
        v-if="currentPage > 1"
        class="page-item pagination-prev cursor-pointer"
        @click="handleClickDefaut('pre')"
      >
        Trước
      </div>
      <ul class="pagination listjs-pagination mb-0">
        <li
          :class="{ active: item == currentPage }"
          v-for="(item, index) in pageShow"
          :key="index"
          @click="handleClickChangePage(item)"
        >
          <a class="page" href="#" target="_self" data-i="1" data-page="8">{{
            item
          }}</a>
        </li>
      </ul>
      <div
        v-if="currentPage < pageSize"
        class="page-item pagination-next cursor-pointer"
        @click="handleClickDefaut('next')"
      >
        Sau
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    currentPage: {
      type: Number,
      default: 1,
    },
    pageSize: {
      type: Number,
      default: 1,
    },
    sizeShow: {
      type: Number,
      default: 5,
    },
  },
  methods: {
    handleClickChangePage: function (page) {
      this.$emit("change", page);
    },
    handleClickDefaut: function (type) {
      const vm = this;
      switch (type) {
        case "pre":
          if (vm.currentPage == 1) return;
          vm.handleClickChangePage(vm.currentPage - 1);
          break;
        case "next":
          if (vm.currentPage == vm.pageSize) return;
          vm.handleClickChangePage(vm.currentPage + 1);
          break;
      }
    },
  },
  computed: {
    pageShow: function () {
      let results = [];
      if (this.pageSize < this.sizeShow) {
        for (let i = 1; i <= this.pageSize; i++) {
          results = [...results, i];
        }
      } else if (this.pageSize - this.currentPage < this.sizeShow) {
        for (let i = this.pageSize; i > this.pageSize - this.sizeShow; i--) {
          results = [i, ...results];
        }
      } else if (this.currentPage <= parseInt(this.sizeShow / 2)) {
        for (let i = 1; i <= this.sizeShow; i++) {
          results = [...results, i];
        }
      } else {
        let varCheck = parseInt(this.sizeShow / 2);
        for (
          let i = this.currentPage - varCheck;
          i <= this.currentPage + varCheck;
          i++
        ) {
          results = [...results, i];
        }
      }
      return results;
    },
  },
};
</script>
