<template>
  <div class="mt-4">
    <form @submit="handleSubmit">
      <!-- Username Field -->
      <div class="mb-3">
        <label for="username" class="form-label">Tài khoản</label>
        <input
          type="text"
          class="form-control"
          tabindex="1"
          :class="{ 'is-invalid': attemptSubmit && missingUname }"
          id="username"
          placeholder="Nhập tài khoản hoặc email"
          v-model="form.account"
          required
        />
        <div
          class="invalid-feedback d-block"
          v-if="attemptSubmit && missingUname"
        >
          Vui lòng nhập tài khoản
        </div>
      </div>

      <!-- Password Field -->
      <div class="mb-3">
        <div class="float-end">
          <router-link :to="{ name: 'Forgot' }" class="text-muted">
            Quên mật khẩu?
          </router-link>
        </div>
        <label class="form-label" for="password-input">Mật khẩu</label>
        <div class="position-relative auth-pass-inputgroup mb-3">
          <input
            :type="passToggle ? 'text' : 'password'"
            class="form-control pe-5 password-input"
            :class="{ 'is-invalid': attemptSubmit && missingPass }"
            placeholder="Nhập mật khẩu"
            id="password-input"
            v-model="form.password"
            @keyup.enter="handleSubmit"
            tabindex="2"
            required
          />
          <button
            @click="passToggle = !passToggle"
            type="button"
            id="password-addon"
            tabindex="4"
            class="bottom-0 btn btn-sm end-0 p-0 position-absolute text-muted translate-middle"
            :class="{ 'me-3': attemptSubmit && missingPass }"
          >
            <i
              class="align-middle"
              :class="passToggle ? 'ri-eye-off-fill' : 'ri-eye-fill'"
            ></i>
          </button>
          <div
            class="invalid-feedback d-block"
            v-if="attemptSubmit && missingPass"
          >
            Vui lòng nhập mật khẩu
          </div>
        </div>

        <div class="form-check">
          <label class="form-check-label">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="rememberMe"
              id=""
            />
            Nhớ tài khoản của tôi
          </label>
        </div>
      </div>

      <!-- Verify Message -->
      <p v-if="isVerify" class="text-danger fw-semibold mt-3">
        Tài khoản của bạn cần xác thực Email để đăng nhập!<br />
        <span
          class="fw-semibold text-primary text-decoration-underline cursor-pointer"
          @click="$emit('resend-verify')"
        >
          Xác thực tài khoản
        </span>
        hoặc đăng nhập với tài khoản khác
      </p>

      <!-- Submit Button -->
      <div class="mt-4">
        <b-button
          :disabled="isSubmitting"
          type="submit"
          variant="success"
          class="w-100 d-flex justify-content-center align-items-center"
          tabindex="3"
        >
          <span
            v-if="isSubmitting"
            class="spinner-border spinner-border-sm me-2"
            role="status"
          ></span>
          <span>{{ isSubmitting ? "Đang xử lý..." : "Đăng nhập" }}</span>
        </b-button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, inject } from "vue";

defineProps({
  isVerify: Boolean,
  userId: String,
});

const emit = defineEmits(["submit", "toggle-otp-mode", "resend-verify"]);

// Reactive data
const form = ref({
  account: "",
  password: "",
});
const attemptSubmit = ref(false);
const passToggle = ref(false);
const isSubmitting = ref(false);
const rememberMe = inject("remember-me");
// Computed
const missingUname = computed(() => form.value.account === "");
const missingPass = computed(() => form.value.password === "");

// Methods
const handleSubmit = async (event) => {
  event.preventDefault();
  attemptSubmit.value = true;

  if (missingUname.value || missingPass.value) {
    return;
  }

  isSubmitting.value = true;

  const formData = new FormData();
  formData.append("username", form.value.account);
  formData.append("password", form.value.password);

  emit("submit", formData);

  // Reset submitting state after a delay
  setTimeout(() => {
    isSubmitting.value = false;
  }, 1000);
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
