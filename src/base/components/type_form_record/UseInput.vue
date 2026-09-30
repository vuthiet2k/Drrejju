<script setup>
import { ref, defineProps, defineEmits, useAttrs } from "vue";
import Modal from "@/base/components/dtwinUI/Modal.vue";
import passUser from "../user/passUser.vue";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  type: { type: String, default: "text" },
  placeholder: String,
  modelValue: [String, File],
  disable: Boolean,
  idUser: String,
});
const iShowModal = ref(false);
const attrs = useAttrs(); // Thu thập các props không khai báo

const showPassword = ref(false);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const updateValue = (value) => {
  emit("update:modelValue", value);
};

const handleChange = ($e) => {
  let value = $e.target.value;
  if (props.type === "file") {
    value = $e.target.files[0];
  }
  updateValue(value);
};
</script>
<template>
  <div class="w-100">
    <div v-if="props.disable" class="form-control bg-body" disabled>
      {{ props.modelValue }}
      <b-row>
        <b-col sm="6"> </b-col>
        <b-col sm="6" class="text-end">
          <label
            class="text-secondary pointer-cursor-custom mb-0 cursor-pointer"
            @click="iShowModal = true"
          >
            <i class="mdi mdi-form-textbox-password"></i>
            Đổi mật khẩu
          </label>
        </b-col>
      </b-row>

      <Modal
        :id="`modal-pass-user${props.idUser}`"
        v-model="iShowModal"
        size="xl"
        :title="`Đổi mật khẩu`"
        hideFooter
      >
        <passUser
          :idUser="props.idUser"
          @close="iShowModal = false"
          @password-changed="iShowModal = false"
        ></passUser>
      </Modal>
    </div>
    <div
      v-else-if="props.type === 'password'"
      class="position-relative auth-pass-inputgroup"
    >
      <input
        v-bind="attrs"
        :type="showPassword ? 'text' : 'password'"
        class="form-control pe-5"
        :placeholder="props.placeholder"
        :value="props.modelValue"
        @input="handleChange"
        autocomplete="new-password"
      />
      <button
        class="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
        type="button"
        tabindex="-1"
        @click="togglePassword"
      >
        <i
          :class="showPassword ? 'ri-eye-off-fill' : 'ri-eye-fill'"
          class="align-middle"
        />
      </button>
    </div>

    <input
      v-else
      class="form-control"
      v-bind="attrs"
      :type="props.type"
      :placeholder="props.placeholder"
      :value="props.modelValue"
      @input="handleChange"
      @change="handleChange"
    />
  </div>
</template>
