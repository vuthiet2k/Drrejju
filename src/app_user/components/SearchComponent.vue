<template>
  <div class="card">
    <div class="card-header">
      <b-form-input
        v-model="searchQuery"
        placeholder="Tìm kiếm..."
      ></b-form-input>
    </div>
    <b-list-group class="card-body p-0">
      <b-list-group-item
        class="border-0 hover-bg-light"
        v-for="item in filteredItems"
        :key="item.id"
      >
        {{ item.name }}
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: "",
      items: [
        { id: 1, name: "Thông tin cá nhân" },
        { id: 2, name: "Thông tin công ty" },
        { id: 3, name: "Liên kết" },
        // { id: 4, name: "Phúc lợi" },
        // { id: 5, name: "Chứng chỉ" },
        // { id: 6, name: "Bằng cấp" },
        // { id: 7, name: "Kinh nghiệm làm việc" },
        // { id: 8, name: "Kỹ năng" },
        // { id: 9, name: "Vai trò công việc" },
        // { id: 10, name: "Lịch sử tuyển dụng" },
        // { id: 11, name: "Giấy tờ có thời hạn" },
        // { id: 12, name: "Tài liệu đính kèm" },
      ],
    };
  },
  computed: {
    filteredItems() {
      return this.items.filter((item) =>
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
};
</script>
