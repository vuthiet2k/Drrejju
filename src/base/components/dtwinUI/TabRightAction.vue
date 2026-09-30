<template>
  <div class="position-relative h-100 tab">
    <div ref="tabRef" class="h-100" :class="{ collapsed: !isContentVisible }">
      <div class="content" :class="{ show: isContentVisible }">
        <SimpleBar class="h-100" direction="vertical">
          <div style="overflow-x: hidden">
            <div class="d-flex align-items-center">
              <slot name="header"></slot>
            </div>
            <slot name="body"></slot>
          </div>
        </SimpleBar>
      </div>
      <div
        class="resizer"
        @mousedown="startResizing"
        :class="{ hidden: !isContentVisible }"
      ></div>
    </div>

    <div
      class="toggle-button p-0 bg-white shadow border d-none"
      @click="toggleContent"
    >
      <i
        :class="
          isContentVisible ? 'ri-arrow-right-s-fill' : 'ri-arrow-left-s-fill'
        "
        class="fs-16"
      ></i>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  onBeforeUnmount,
  computed,
  defineProps,
  defineEmits,
  onMounted,
} from "vue";
import { SimpleBar } from "simplebar-vue3";

// ref để trỏ tới div.tab
const tabRef = ref(null);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: undefined,
  },
  width: {
    type: Number,
    default: undefined,
  },
});
const emit = defineEmits(["update:modelValue", "width-change", "update:width"]);

// State nội bộ
const internalVisible = ref(false);
const internalWidth = ref(350); // Giá trị mặc định

// Tính xem component đang controlled hay uncontrolled
const isControlled = computed(() => props.modelValue !== undefined);
const isWidthControlled = computed(() => props.width !== undefined);

// Computed cho visibility
const isContentVisible = computed({
  get() {
    return isControlled.value ? props.modelValue : internalVisible.value;
  },
  set(val) {
    if (isControlled.value) {
      emit("update:modelValue", val);
    } else {
      internalVisible.value = val;
    }
  },
});

// Hàm để emit width
function emitWidth(newWidth) {
  if (isWidthControlled.value) {
    emit("update:width", newWidth);
  } else {
    internalWidth.value = newWidth;
  }
  // Luôn emit event width-change
  emit("width-change", newWidth);
}

// Lấy width hiện tại (chỉ để đọc)
const currentWidth = computed(() => {
  return isWidthControlled.value ? props.width : internalWidth.value;
});

// Ẩn/hiện panel khi click
const toggleContent = () => {
  isContentVisible.value = !isContentVisible.value;
};

// các biến cho resize
let isResizing = false;
let startX = 0;
let startWidth = 0;
const minWidth = 0;
const maxWidth = 600;

function startResizing(e) {
  if (!tabRef.value) return;
  isResizing = true;
  startX = e.clientX;
  startWidth = parseInt(
    document.defaultView.getComputedStyle(tabRef.value).width,
    10
  );

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(e) {
  if (!isResizing || !tabRef.value) return;
  e.preventDefault();
  const delta = e.clientX - startX;
  let newWidth = startWidth - delta; // đảo ngược
  newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

  // Cập nhật width
  tabRef.value.style.width = newWidth + "px";
  emitWidth(newWidth); // Gọi hàm emit width
}

function onMouseUp() {
  isResizing = false;
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
}

// Khởi tạo width khi component mounted
onMounted(() => {
  if (tabRef.value) {
    const initialWidth = currentWidth.value;
    tabRef.value.style.width = initialWidth + "px";
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
});
</script>

<style scoped>
.tab {
  transition: width 0.3s ease-out;
  width: 350px;
  height: 100%;
  box-sizing: border-box;
}
.tab.collapsed {
  width: 3px !important;
  overflow: hidden;
}
.content {
  width: 100%;
  overflow: hidden;
  transition: opacity 0.3s ease-out;
  height: 100%;
}
.content.show {
  opacity: 1;
  width: 100%;
}
.content:not(.show) {
  opacity: 0;
}
.toggle-button {
  cursor: pointer;
  position: absolute;
  left: 0;
  z-index: 1;
  top: 50%;
  transform: translate(-100%, -50%);
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}
.resizer {
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  cursor: ew-resize;
  /* background: rgba(0, 0, 0, 0.1); */
  z-index: 2;
  /* Ngăn chặn selection */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  /* Tối ưu pointer events */
  pointer-events: auto;
}
.resizer:hover {
  background: rgba(0, 0, 0, 0.3);
}

.resizer.hidden {
  display: none;
  pointer-events: none;
}
</style>
