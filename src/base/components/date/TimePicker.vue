<script setup>
import { defineProps, defineEmits, ref, computed, watch } from "vue";
import flatPickr from "vue-flatpickr-component";
import { Vietnamese } from "flatpickr/dist/l10n/vn";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
    dateConfig: {
        type: Object,
        default: function () {
            return {
                allowInput: true, // Cho phép nhập tay
                enableTime: true,
                noCalendar: true,
                dateFormat: "H:i",
                time_24hr: true
            };
        },
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

const computedDateConfig = computed(() => {
  if (props.isDateTime) {
    return {
      ...props.dateConfig,
      allowInput: true,
      altFormat: "d/m/Y H:i",
      dateFormat: "Y-m-d H:i",
      enableTime: true,
      time_24hr: true,
      locale: Vietnamese,
    };
  }
  return props.dateConfig;
});

const selectedDate = ref(null);

// Watcher to track changes in modelValue and update selectedDate
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      selectedDate.value = newValue;
    } else {
      selectedDate.value = null;
    }
  },
  { immediate: true }
);

const updateValue = (value) => {
  selectedDate.value = value;
  emit("update:modelValue", value);
};
</script>

<template>
  <div class="input-group">
    <flat-pickr
      :placeholder="props.placeholder"
      :modelValue="props.modelValue"
      @update:model-value="updateValue"
      :config="computedDateConfig"
      class="form-control flatpickr-input"
      :class="{ 'bg-disabled': props.disabled }"
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

<style>
.input-group
  > :not(:first-child):not(.dropdown-menu):not(.valid-tooltip):not(
    .valid-feedback
  ):not(.invalid-tooltip):not(.invalid-feedback) {
  border-radius: 0.25rem !important;
  margin-left: 0px !important;
}

.bg-disabled {
  background-color: var(--vz-input-disabled-bg) !important;
}
</style>
