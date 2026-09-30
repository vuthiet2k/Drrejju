import { ref, onMounted, onUnmounted, computed } from "vue";

// Bản sao cục bộ của app_public/state/useIsMobile.js — mỗi app tự chứa
// composable riêng theo quy ước của dự án.
export function useIsMobile(breakpoint = 640) {
  const windowWidth = ref(typeof window !== "undefined" ? window.innerWidth : breakpoint + 1);

  const updateWidth = () => {
    windowWidth.value = window.innerWidth;
  };

  onMounted(() => {
    window.addEventListener("resize", updateWidth);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", updateWidth);
  });

  const isMobile = computed(() => windowWidth.value <= breakpoint);

  return { isMobile, windowWidth };
}
