<template>
  <div class="position-relative">
    <p v-if="searchText">
      Từ khóa -
      <span
        ><b>{{ searchText }}</b></span
      >
      - Không phù hợp với kết quả nào!
    </p>
    <div v-else class="text-center py-5">
      <div class="empty-state">
        <i class="ri-article-line fs-1 text-muted mb-3"></i>
        <p class="text-muted">{{ description }}</p>
        <!-- <p class="text-muted mb-4">
                  Chủ đề này hiện chưa có bài viết nào.
                </p> -->
      </div>
    </div>
    <!-- <p>Đề xuất:</p>
    <ul>
      <li>Chắc chắn rằng tất cả từ khóa đều đúng chính tả.</li>
      <li>Hãy thử các từ khóa khác nhau.</li>
      <li>Thử tìm kiếm với từ khóa chung hơn.</li>
    </ul> -->
  </div>
</template>
<script>
export default {
  name: "notMatchSearchComponent",
  props: {
    searchText: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "Không có bản ghi nào",
    },
  },
};
</script>
