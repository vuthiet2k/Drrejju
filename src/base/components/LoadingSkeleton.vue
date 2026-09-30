<script setup>
import { useLoading } from "@/composables/useLoading";
import { defineProps, computed } from "vue";

const { isLoading } = useLoading();

const props = defineProps({
  title: {
    type: String,
    default: "Đang chuyển trang...",
  },
  spinnerType: {
    type: String,
    default: "border", // border | grow
  },
  spinnerColor: {
    type: String,
    default: "primary",
  },
});

const spinnerClass = computed(
  () => `spinner-${props.spinnerType} text-${props.spinnerColor}`
);
</script>
<template>
  <transition name="fade">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content text-center">
        <div
          :class="spinnerClass"
          style="width: 3rem; height: 3rem"
          role="status"
        ></div>

        <div class="mt-3 text-muted small">
          {{ title }}
        </div>
      </div>
    </div>
  </transition>
</template>
<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;

  /* Không đen – chỉ mờ + blur */
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(6px);

  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  pointer-events: none;
}

/* Fade nhẹ khi chuyển trang */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
