<template>
  <div class="position-relative h-100 tab">
    <div
      ref="tabRef"
      class="w-100 h-100"
      :class="{ collapsed: !isContentVisible }"
    >
      <div class="content" :class="{ show: isContentVisible }">
        <SimpleBar class="h-100" direction="vertical">
          <div style="overflow-x: hidden; min-width: 200px">
            <div class="d-flex align-items-center">
              <slot name="header"></slot>
            </div>
            <slot name="body"></slot>
          </div>
        </SimpleBar>
      </div>
      <!-- Resizer ở bên PHẢI -->
      <div
        class="resizer"
        @mousedown="startResizing"
        :class="{ hidden: !isContentVisible }"
      ></div>
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
const emit = defineEmits(["update:modelValue", "update:width", "width-change"]);

// State nội bộ dùng khi không có v-model từ cha
const internalVisible = ref(false);

// Tính xem component đang controlled (có v-model) hay uncontrolled
const isControlled = computed(() => props.modelValue !== undefined);
const isWidthControlled = computed(() => props.width !== undefined);
const internalWidth = ref(450); // Giá trị mặc định

// Computed lai giữa prop và internal
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

// Biến để theo dõi đang resize
const isResizing = ref(false);

// các biến cho resize
let startX = 0;
let startWidth = 0;
const minWidth = 200;
const maxWidth = 600;

function startResizing(e) {
  if (!tabRef.value || !isContentVisible.value) return;

  isResizing.value = true;
  startX = e.clientX;
  startWidth = parseInt(getComputedStyle(tabRef.value).width, 10);

  // Thêm class để tối ưu hiệu suất
  document.body.classList.add("resizing");
  tabRef.value.classList.add("resizing");

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(e) {
  if (!isResizing.value || !tabRef.value) return;
  e.preventDefault();

  // Kéo bên PHẢI nên không cần đảo ngược delta
  const delta = e.clientX - startX;
  let newWidth = startWidth + delta;
  newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
  tabRef.value.style.width = newWidth + "px";

  emitWidth(newWidth);
}

function onMouseUp() {
  isResizing.value = false;

  // Remove classes
  document.body.classList.remove("resizing");
  if (tabRef.value) {
    tabRef.value.classList.remove("resizing");
  }

  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
}
onMounted(() => {
  if (tabRef.value) {
    const initialWidth = currentWidth.value;
    tabRef.value.style.width = initialWidth + "px";

    // Emit width ban đầu
    emitWidth(initialWidth);
  }
});
onBeforeUnmount(() => {
  isResizing.value = false;
  document.body.classList.remove("resizing");
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
});
</script>

<style scoped>
.tab {
  transition: width 0.3s ease-out;
  width: 450px;
  height: 100%;
  position: relative;
}

/* Khi đang resize, tắt transition để mượt mà */
.tab.resizing {
  transition: none !important;
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
  min-width: 200px;
}

.content.show {
  opacity: 1;
  width: 100%;
}

.content:not(.show) {
  opacity: 0;
}

/* Toggle button ở bên PHẢI */
.toggle-button {
  cursor: pointer;
  position: absolute;
  left: 100%; /* Đặt bên phải tab */
  z-index: 1;
  top: 50%;
  transform: translateY(-50%);
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
}

/* Resizer ở bên PHẢI */
.resizer {
  position: absolute;
  right: 0; /* Đặt bên phải */
  top: 0;
  width: 3px;
  height: 100%;
  cursor: ew-resize;
  /* background: rgba(0, 0, 0, 0.1); */
  z-index: 2;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  pointer-events: auto;
  transition: background 0.2s;
}

.resizer:hover {
  background: rgba(0, 0, 0, 0.3);
}

.resizer.hidden {
  display: none;
  pointer-events: none;
}
</style>
