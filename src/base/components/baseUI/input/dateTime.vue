<script setup>
import { defineProps, defineEmits, ref } from "vue";
import flatPickr from "vue-flatpickr-component";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  dateConfig: {
    type: Object,
    default: function () {
      return {
        allowInput: true, // Cho phép nhập tay
        altFormat: "d/m/Y",
        altInput: true,
        dateFormat: "Y-m-d",
      };
    },
  },
  modelValue: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "Ngày",
  },
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
});

const selectedDate = ref();

const updateValue = (value) => {
  selectedDate.value = value;
  emit("update:modelValue", value);
};
</script>

<template>
  <label class="form-label">
    {{ props.label }}
    <span class="text-danger" v-if="required">*</span>
  </label>
  <div class="input-group">
    <flat-pickr
      :placeholder="props.label"
      :modelValue="props.modelValue"
      @update:model-value="updateValue"
      :config="props.dateConfig"
      class="form-control flatpickr-input border-radius__left"
      :disabled="props.disabled"
      :required="props.required"
    ></flat-pickr>
    <span
      v-if="props.icon"
      class="input-group-text border-0"
      style="border-left: 2px solid #ced4da !important"
    >
      <i class="ri-calendar-event-line"></i
    ></span>
  </div>
</template>

<style scoped>
.border-radius__left {
  border-top-left-radius: 0.25rem !important;
  border-bottom-left-radius: 0.25rem !important;
}
</style>
