<script setup>
import { ref, defineProps, defineEmits, watch } from "vue";
import ButtonIcon from "@/base/components/baseUI/ButtonIcon.vue";
import Select from "@/base/components/select/Select.vue";
import { SERVER_URL, ID_ORGANIZATION } from "@/helpers/utils/config_system.js";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
    default: () => [], // Đảm bảo modelValue luôn là một mảng
  },
  field: {
    type: Object,
    default: () => ({}), // Giá trị mặc định cho field
  },
  structure: {},
});

// Đồng bộ targetValues với modelValue
const targetValues = ref(props.modelValue?.length ? [...props.modelValue] : []);

// Theo dõi sự thay đổi của targetValues và phát emit
watch(
  targetValues,
  (newVal) => {
    emit("update:modelValue", newVal);
    checkTotalGoals(); // Gọi hàm kiểm tra tổng mục tiêu mỗi khi targetValues thay đổi
  },
  { deep: true }
);

// Hàm để thêm mục tiêu mới
const addTarget = () => {
  targetValues.value.push({ department: "", goal: null });
};

// Hàm để xóa mục tiêu
const removeTarget = (index) => {
  targetValues.value.splice(index, 1);
};

// Hàm để kiểm tra tổng số mục tiêu
const checkTotalGoals = () => {
  const totalGoals = targetValues.value.reduce((sum, target) => {
    return sum + (target.goal || 0); // Nếu goal không có giá trị, mặc định là 0
  }, 0);

  if (!props.structure?.fields.length || !props.structure?.fields[1]) return;
  if (totalGoals > props.structure?.fields[1].value) {
    alert(`Tổng số mục tiêu đã vượt quá ${props.structure?.fields[1].value}!`); // Hiển thị cảnh báo
  }
};
</script>

<template>
  <div v-cloak class="mt-3">
    <div
      v-for="(target, index) in targetValues"
      :key="index"
      class="d-flex align-items-center mb-2 gap-2"
    >
      <div class="row flex-1">
        <div class="col-6">
          <Select
            :api="`${SERVER_URL}/api/organization/${ID_ORGANIZATION}/department/?all`"
            :isLocalSearch="!props.field.source"
            :localData="props.field.init_data"
            :multiSelect="props.field.multiple"
            :defaultValue="target.department"
            :label="props.field.search_field"
            :searchField="props.field.search_field"
            :labelField="props.field.label_field"
            :isCloseOnSelect="true"
            :disable="props.field.disable"
            :showIcon="props.field.show_icon"
            iconFiled="name"
            @change-data="(data) => (target.department = data)"
          ></Select>
        </div>
        <div class="col flex-1 ps-0">
          <input
            type="number"
            class="form-control me-2"
            placeholder="Nhập giá trị mục tiêu"
            v-model.number="target.goal"
            :disabled="props.field.disable"
          />
        </div>
      </div>
      <button
        v-show="!props.field.disable"
        type="button"
        class="btn-close"
        @click="removeTarget(index)"
        aria-label="Close"
      ></button>
    </div>
    <ButtonIcon
      v-show="!props.field.disable"
      classIcon="ri-add-line"
      name="Thêm mục tiêu"
      @click="addTarget"
    ></ButtonIcon>
  </div>
</template>
