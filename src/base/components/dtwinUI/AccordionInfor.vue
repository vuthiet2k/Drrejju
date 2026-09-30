<script setup>
import { defineProps, defineEmits, ref, watch } from "vue";

const emit = defineEmits(["update:modelValue", "toggle"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: "Accordion",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  bodyClass: {
    type: String,
    default: "",
  },
});

const show = ref(props.modelValue);

// Theo dõi thay đổi từ bên ngoài
watch(
  () => props.modelValue,
  (newVal) => {
    show.value = newVal;
  }
);

const handleClickHiden = () => {
  if (props.disabled) return;

  show.value = !show.value;
  emit("update:modelValue", show.value);
  emit("toggle", {
    id: props.accordionId,
    isOpen: show.value,
    title: props.title,
  });
};
</script>
<template>
  <div
    class="w-100 card shadow-none"
    :data-accordion-id="props.accordionId"
    :data-accordion-open="show"
    :class="{ 'accordion-disabled': props.disabled }"
  >
    <div
      class="bg-head-title card-header accordion-header"
      :class="props.headerClass"
      @click="handleClickHiden"
      :data-header="props.accordionId"
    >
      <button
        class="w-100 accordion-button"
        type="button"
        :disabled="props.disabled"
        :aria-expanded="show"
      >
        <h5 class="card-title fw-bold mb-0">{{ props.title }}</h5>
      </button>
      <slot name="icon" :is-open="show">
        <i
          :class="show ? 'rotage' : ''"
          class="fs-18 cursor-pointer ri-arrow-down-s-line accordion-arrow"
          style="transition: all 0.3s linear 0s"
        ></i>
      </slot>
    </div>

    <!-- Thêm transition cho hiệu ứng mượt mà -->
    <transition name="accordion">
      <div
        v-show="show"
        class="card-body accordion-content"
        :class="props.bodyClass"
        :aria-hidden="!show"
      >
        <slot></slot>
      </div>
    </transition>
  </div>
</template>
<style scoped>
.bg-head-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.bg-head-title:hover {
  background-color: #f8f9fa;
}

.rotage {
  transform: rotate(180deg);
}

.accordion-disabled {
  /* opacity: 0.6; */
  pointer-events: none;
}

.accordion-disabled .bg-head-title {
  cursor: not-allowed;
}

/* Hiệu ứng transition */
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

.accordion-enter-from {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.accordion-enter-to {
  max-height: 500px; /* Hoặc giá trị đủ lớn */
  opacity: 1;
  transform: translateY(0);
}

.accordion-leave-from {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
}

.accordion-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

</style>
