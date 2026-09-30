<template>
  <div class="mt-4">
    <form @submit.prevent="handleSubmit">
      <!-- Email Field -->
      <div class="mb-3">
        <label for="email" class="form-label">Tài khoản</label>
        <input
          type="email"
          class="form-control"
          tabindex="1"
          :class="{ 'is-invalid': attemptSubmit && missingEmail }"
          id="email"
          placeholder="Nhập tài khoản hoặc email"
          v-model="form.email"
          required
        />
        <div
          class="invalid-feedback d-block"
          v-if="attemptSubmit && missingEmail"
        >
          Vui lòng nhập email
        </div>
      </div>

      <!-- OTP Field -->
      <div class="mb-3">
        <label class="form-label">Mã OTP</label>
        <div class="position-relative auth-pass-inputgroup mb-2">
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              :class="{ 'is-invalid': attemptSubmit && missingOtp }"
              placeholder="Nhập mã OTP"
              v-model="form.otp"
              @keyup.enter="handleSubmit"
              tabindex="2"
              style="border-right: 0"
              required
            />
            <ButtonIcon
              :disabled="sendingOtp || missingEmail || otpCountdown > 0"
              type="info"
              classIcon="ri-send-plane-2-fill"
              @click.prevent="sendOtpCode"
              :name="
                sendingOtp
                  ? ''
                  : otpCountdown > 0
                  ? `Gửi lại sau ${otpCountdown}s`
                  : 'Gửi OTP'
              "
            >
            </ButtonIcon>
          </div>
          <div
            class="invalid-feedback d-block"
            v-if="attemptSubmit && missingOtp"
          >
            Vui lòng nhập mã OTP
          </div>

          <small
            v-if="isOtpSent"
            class="text-muted position-absolute end-0 bottom-100 mb-2 me-2 fs-12"
          >
            Vui lòng kiểm mã OPT trong email !
          </small>
        </div>
      </div>
      <div class="form-check">
        <label class="form-check-label">
          <input
            class="form-check-input"
            type="checkbox"
            v-model="rememberMe"
          />
          Nhớ tài khoản của tôi
        </label>
      </div>

      <!-- Submit Button -->
      <div class="mt-4">
        <b-button
          :disabled="isSubmitting || missingOtp || missingEmail"
          variant="success"
          class="w-100"
          @click.prevent="handleSubmit"
        >
          <span
            v-if="isSubmitting"
            class="spinner-border spinner-border-sm me-2"
            role="status"
          ></span>
          Đăng nhập
        </b-button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, defineEmits, inject } from "vue";
import ButtonIcon from "@/base/components/baseUI/ButtonIcon.vue";

const emit = defineEmits(["submit", "toggle-otp-mode", "send-otp"]);

// Reactive data
const form = ref({
  email: "",
  otp: "",
});
const attemptSubmit = ref(false);
const isSubmitting = ref(false);
const sendingOtp = ref(false);
const isOtpSent = ref(false);
const otpCountdown = ref(0);
let otpTimer = null;

const rememberMe = inject("remember-me");

// Computed
const missingEmail = computed(() => form.value.email === "");
const missingOtp = computed(() => form.value.otp === "");

// Methods
const handleSubmit = () => {
  attemptSubmit.value = true;

  if (missingEmail.value || missingOtp.value) {
    return;
  }

  isSubmitting.value = true;
  emit("submit", {
    identifier: form.value.email,
    otp: form.value.otp,
  });

  setTimeout(() => {
    isSubmitting.value = false;
  }, 1000);
};

const sendOtpCode = () => {
  if (missingEmail.value) {
    attemptSubmit.value = true;
    return;
  }

  if (otpCountdown.value > 0) return;

  sendingOtp.value = true;
  emit("send-otp", form.value.email, () => {
    isOtpSent.value = true;
    startOtpCountdown();
    sendingOtp.value = false;
  });
};

const startOtpCountdown = () => {
  otpCountdown.value = 60;
  if (otpTimer) clearInterval(otpTimer);

  otpTimer = setInterval(() => {
    if (otpCountdown.value > 0) {
      otpCountdown.value--;
    } else {
      clearInterval(otpTimer);
      otpTimer = null;
    }
  }, 1000);
};

// Cleanup
onUnmounted(() => {
  if (otpTimer) clearInterval(otpTimer);
});
</script>
