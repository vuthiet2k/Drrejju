<script setup>
import { defineProps, defineEmits, ref } from "vue";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: "Accordion",
  },
});

const show = ref(props.modelValue);
const handleClickHiden = () => {
  show.value = !show.value;
  emit("update:modelValue", show.value);
};
</script>

<template>
  <div class="w-100">
    <div class="w-100" @click="handleClickHiden">
      <slot name="header">
        <div class="mb-3 pe-2 bg-head-title">
          <button class="w-100 accordion-button p-2 fw-bold" type="button">
            {{ props.title }}
          </button>
          <i
            :class="show ? 'rotate' : ''"
            class="fs-18 cursor-pointer ri-arrow-down-s-line"
            style="transition: all 0.3s linear 0s"
          ></i>
        </div>
      </slot>
    </div>
    <transition name="slide">
      <div v-show="show">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.bg-head-title {
  background-color: #dbe4ff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rotate {
  transform: rotate(180deg);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 1000px;
  opacity: 1;
}
</style>
