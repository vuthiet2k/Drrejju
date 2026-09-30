<script setup>
import { defineProps, defineEmits, ref, computed, watch } from "vue";
import flatPickr from "vue-flatpickr-component";
import { Vietnamese } from "flatpickr/dist/l10n/vn";
import { parseDate } from "../../common/common";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  dateConfig: {
    type: Object,
    default: () => ({
      allowInput: true, // Cho phép nhập tay
      altFormat: "d/m/Y",
      altInput: true,
      dateFormat: "Y-m-d",
    }),
  },
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {},
  disabled: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  isDateTime: {
    type: Boolean,
    default: false,
  },
});

// Cấu hình Flatpickr dựa trên isDateTime
const computedDateConfig = computed(() => ({
  allowInput: true, // Cho phép nhập tay
  locale: Vietnamese,
  ...props.dateConfig,
  altFormat: props.isDateTime ? "d/m/Y H:i" : "d/m/Y",
  dateFormat: props.isDateTime ? "Y-m-d H:i" : "Y-m-d",
  enableTime: props.isDateTime,
  time_24hr: props.isDateTime,
}));

// Reactive date value
const dateValue = ref(props.modelValue ? new Date(props.modelValue) : "");

// Cập nhật giá trị khi người dùng chọn ngày
const updateValue = (value) => {
  dateValue.value = value;
  if (props.isDateTime) {
    // Nếu là ngày giờ, định dạng lại giá trị
    value = value.replace(" ", "T") + ":00"; // Thêm :00 để đảm bảo định dạng ISO
  }
  emit("update:modelValue", value);
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      var d = parseDate(props.modelValue);
      // d.setHours(d.getHours());
      dateValue.value = d.toISOString();
    } else {
      dateValue.value = "";
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="input-group">
    <flat-pickr
      :placeholder="props.placeholder"
      v-model="dateValue"
      @update:model-value="updateValue"
      :config="computedDateConfig"
      class="form-control flatpickr-input"
      :class="{ 'bg-disabled': props.disabled }"
      :disabled="props.disabled"
      :required="props.required"
    ></flat-pickr>
    <div
      v-if="props.icon"
      class="input-group-text bg-primary border-primary text-white"
    >
      <i class="ri-calendar-2-line"></i>
    </div>
  </div>
</template>

<style>
.input-group
  > :not(:first-child):not(.dropdown-menu):not(.valid-tooltip):not(
    .valid-feedback
  ):not(.invalid-tooltip):not(.invalid-feedback) {
  border-radius: 0.25rem !important;
  margin-left: 0px !important;
}
</style>

<style scoped>
.bg-disabled {
  background-color: var(--vz-input-disabled-bg) !important;
}
</style>
