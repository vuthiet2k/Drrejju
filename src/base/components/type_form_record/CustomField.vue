<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";
import ButtonIcon from "@/base/components/baseUI/ButtonIcon.vue"; // Giữ lại ButtonIcon

// Định nghĩa props và emit
const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
    default: () => [], // Đảm bảo modelValue luôn là một mảng
  },
  field: {},
});

const emit = defineEmits(["update:modelValue"]);

// Đồng bộ filterValues với modelValue
const filterValues = ref(props.modelValue?.length ? [...props.modelValue] : []);

// Theo dõi sự thay đổi của filterValues và phát emit
watch(
  filterValues,
  (newVal) => {
    emit("update:modelValue", newVal);
  },
  { deep: true }
);

// Thêm trường mới
const handleAddField = () => {
  filterValues.value.push({
    name: "",
    type: "text",
    options: [""], // Mặc định có 1 tùy chọn rỗng
    required: false, // Thêm trường bắt buộc
  });
};

// Xóa trường
const handleDeleteField = (index) => {
  filterValues.value.splice(index, 1);
};
</script>

<template>
  <div>
    <!-- Vòng lặp qua filterValues -->
    <div v-for="(field, index) in filterValues" :key="index" class="card mb-3">
      <div class="card-body px-0 pt-0">
        <div class="row">
          <div class="col-7">
            <input
              type="text"
              class="form-control"
              v-model="field.name"
              placeholder="Nhập tên hiển thị"
              :disabled="props.field.disable"
            />
          </div>
          <div class="col-5">
            <select
              v-model="field.type"
              class="form-control"
              :disabled="props.field.disable"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="select">Select</option>
              <option value="radio">Radio</option>
              <option value="checkbox">Checkbox</option>
            </select>
          </div>
        </div>

        <!-- Hiển thị tùy chọn nếu type là select, radio hoặc checkbox -->
        <div
          v-if="['select', 'radio', 'checkbox'].includes(field.type)"
          class="mt-3"
        >
          <label class="form-label">Tùy chọn:</label>
          <div
            v-for="(option, optIndex) in field.options"
            :key="optIndex"
            class="d-flex align-items-center mb-2"
          >
            <input
              type="text"
              class="form-control me-2"
              v-model="field.options[optIndex]"
              placeholder="Nhập giá trị"
              :disabled="props.field.disable"
            />
            <button
              v-show="!props.field.disable"
              type="button"
              class="btn-close"
              @click="field.options.splice(optIndex, 1)"
            ></button>
          </div>
          <ButtonIcon
            v-show="!props.field.disable"
            classIcon="ri-add-line"
            name="Thêm tùy chọn"
            class="border-0 btn-sm mt-2"
            type="light"
            @click="field.options.push('')"
          ></ButtonIcon>
        </div>
      </div>

      <!-- Bắt buộc và Xóa trường -->
      <div
        class="card-footer py-1 d-flex justify-content-end align-items-center"
      >
        <div class="d-flex align-items-center float-end">
          <i
            v-show="!props.field.disable"
            class="ri-delete-bin-fill text-danger fs-20"
            @click="handleDeleteField(index)"
          ></i>
          <div class="px-1 py-2"></div>
          <div class="px-1 py-2 border-start"></div>
          <div class="form-check form-switch">
            <label class="form-check-label"> Bắt buộc </label>
            <input
              class="form-check-input"
              v-model="field.required"
              type="checkbox"
              role="switch"
              :disabled="props.field.disable"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Nút thêm trường mới -->
    <ButtonIcon
      v-show="!props.field.disable"
      classIcon="ri-add-line"
      name="Thêm trường mới"
      class="border-0"
      type="light"
      @click="handleAddField"
    ></ButtonIcon>
  </div>
</template>
