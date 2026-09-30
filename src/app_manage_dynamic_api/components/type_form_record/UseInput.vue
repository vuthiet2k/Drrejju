<script setup>
import { defineProps, defineEmits } from "vue";

const emit = defineEmits([]);
const props = defineProps({
  type: {
    type: String,
    default: "text",
  },
  placeholder: {
    type: String,
  },
  modelValue: {
    type: String,
  },
});

const handleChange = ($e) => {
  let value = $e.target.value;
  switch (props.type) {
    case "file":
      value = $e.target.files[0];
      break;
    default:
  }
  emit("update:modelValue", value);
};
</script>

<template>
  <div class="w-100">
    <input
      class="form-control"
      :type="props.type"
      :placeholder="props.placeholder"
      @change="($e) => handleChange($e)"
    />
  </div>
</template>
