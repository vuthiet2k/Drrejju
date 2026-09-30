<script setup>
import { ref, defineProps, defineEmits, watch } from "vue";
import ButtonIcon from "@/base/components/baseUI/ButtonIcon.vue"; // Giữ lại ButtonIcon

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
    default: () => [], // Đảm bảo modelValue luôn là một mảng
  },
  field: {},
});

// Mảng chứa danh mục và các giá trị liên kết
const categorizedData = ref(
  props.modelValue?.length ? [...props.modelValue] : []
);

// Theo dõi thay đổi của categorizedData và phát emit
watch(
  categorizedData,
  (newVal) => {
    emit("update:modelValue", newVal);
  },
  { deep: true }
);

// Hàm để thêm một danh mục mới với cấu trúc title_head và values
const addCategory = () => {
  categorizedData.value.push({
    title_head: "",
    values: [{ name: "", value: "" }], // Đảm bảo danh mục mới luôn có ít nhất một trường
  });
};

// Hàm để thêm một cặp name-value vào danh mục
const addOption = (categoryIndex) => {
  categorizedData.value[categoryIndex].values.push({ name: "", value: "" });
};

// Hàm để xóa một cặp name-value trong danh mục, với kiểm tra
const removeOption = (categoryIndex, valueIndex) => {
  if (categorizedData.value[categoryIndex].values.length > 1) {
    categorizedData.value[categoryIndex].values.splice(valueIndex, 1);
  } else {
    alert("Danh mục phải có ít nhất một trường!"); // Hiển thị cảnh báo người dùng
  }
};

// Hàm để xóa toàn bộ một danh mục
const removeCategory = (categoryIndex) => {
  categorizedData.value.splice(categoryIndex, 1);
};
</script>

<template>
  <div>
    <div
      v-for="(category, catIndex) in categorizedData"
      :key="catIndex"
      class="mb-3"
    >
      <div class="mb-2">
        <input
          type="text"
          class="form-control"
          placeholder="Nhập tên danh mục"
          v-model="category.title_head"
          :disabled="props.field.disable"
        />
      </div>
      <div
        v-for="(option, optIndex) in category.values"
        :key="optIndex"
        class="d-flex align-items-center mb-2 gap-2"
      >
        <div class="row flex-1">
          <div class="col-6">
            <input
              type="text"
              class="form-control me-2"
              placeholder="Nhập tên hiển thị"
              v-model="option.name"
              :disabled="props.field.disable"
            />
          </div>
          <div class="col flex-1 ps-0">
            <input
              type="text"
              class="form-control me-2"
              placeholder="Nhập giá trị"
              v-model="option.value"
              :disabled="props.field.disable"
            />
          </div>
        </div>
        <div
          class="d-flex gap-2 align-items-center"
          v-show="!props.field.disable"
        >
          <button
            type="button"
            class="btn-close"
            @click="removeOption(catIndex, optIndex)"
          ></button>
        </div>
      </div>
      <div class="d-flex align-items-center justify-content-between">
        <ButtonIcon
          v-show="!props.field.disable"
          classIcon="ri-add-line"
          name="Thêm trường"
          type="light"
          @click="addOption(catIndex)"
        ></ButtonIcon>

        <ButtonIcon
          v-show="!props.field.disable"
          classIcon="ri-delete-bin-5-fill"
          name="Xóa danh mục"
          type="danger"
          @click="removeCategory(catIndex)"
        ></ButtonIcon>
      </div>
    </div>
    <ButtonIcon
      v-show="!props.field.disable"
      classIcon="ri-add-line"
      name="Thêm danh mục"
      @click="addCategory"
    ></ButtonIcon>
  </div>
</template>
