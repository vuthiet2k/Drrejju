<template>
  <Teleport to="body">
    <b-modal
      :id="props.id"
      :visible="props.modelValue"
      v-bind="attrs"
      @hide="handleHide"
      @ok="handleOk"
      @cancel="handleCancel"
      no-close-on-ok
    >
      <!-- Slot cho tiêu đề -->
      <template #modal-title>
        <slot name="title"></slot>
      </template>

      <!-- Slot cho nội dung -->
      <slot></slot>

      <!-- Slot cho footer -->
      <template #modal-footer>
        <slot name="footer"></slot>
      </template>
    </b-modal>
  </Teleport>
</template>

<script setup>
import {
  watch,
  onMounted,
  onUnmounted,
  defineProps,
  defineEmits,
  useAttrs,
} from "vue";
import { Modal } from "bootstrap";

const props = defineProps({
  id: { type: String, required: true },
  modelValue: { type: Boolean, required: true },
});
const attrs = useAttrs();
const emit = defineEmits(["update:modelValue", "ok"]);
let modalElement;
let modalInstance = null;
const handleHideEvent = (event) => {
  if (!event.defaultPrevented) {
    emit("update:modelValue", false);
  }
  setTimeout(() => {
    const modalStillOpen = document.querySelector(".modal.show");

    if (!modalStillOpen) {
      // Nếu modal đã đóng thì remove backdrop
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
    } else {
      // Nếu modal vẫn mở thì đảm bảo backdrop tồn tại
      let backdrop = document.querySelector(".modal-backdrop");
      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.className = "modal-backdrop fade show";
        document.body.appendChild(backdrop);
      }
      document.body.classList.add("modal-open");
    }
  }, 300);
};

onUnmounted(() => {
  modalElement.removeEventListener("hide.bs.modal", handleHideEvent);
});

onMounted(() => {
  modalElement = document.getElementById(props.id);
  modalInstance = new Modal(modalElement);

  // Sự kiện khi modal hiển thị để cập nhật modelValue
  modalElement.addEventListener("shown.bs.modal", () => {
    emit("update:modelValue", true);
  });

  modalElement.addEventListener("hide.bs.modal", handleHideEvent);
});

const handleHide = ($e) => {
  emit("update:modelValue", false);
  if ($e?.trigger == "close") {
    modalInstance.hide(); // Ẩn modal sau khi xử lý sự kiện "Cancel"
  }
};

const handleOk = ($e) => {
  $e.preventDefault();
  emit("ok", modalInstance);
};

const handleCancel = () => {
  emit("cancel");
  modalInstance.hide(); // Ẩn modal sau khi xử lý sự kiện "Cancel"
};

// Watch modelValue để hiện hoặc ẩn modal
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      modalInstance.show();
    } else {
      modalInstance.hide();
    }
  }
);
</script>
