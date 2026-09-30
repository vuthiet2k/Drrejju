<template>
  <div class="mt-4 text-center">
    <div class="signin-other-title">
      <h5 class="fs-13 mb-4 title">Hoặc</h5>
    </div>

    <div class="d-flex justify-content-center gap-2">
      <!-- Switch to Password -->
      <button
        type="button"
        class="btn btn-info btn-icon waves-effect waves-light"
        title="Đăng nhập với mật khẩu"
        @click.prevent="$emit('toggle-otp-mode', false)"
      >
        <i class="ri-lock-password-line fs-16"></i>
      </button>

      <!-- Switch to OTP -->
      <button
        type="button"
        class="btn btn-dark btn-icon waves-effect waves-light"
        @click.prevent="$emit('toggle-otp-mode', true)"
        title="Đăng nhập với OTP"
      >
        <i class="ri-message-2-line fs-16"></i>
      </button>
      <!-- Switch to SSO -->
      <router-link :to="{ name: 'LoginSSO' }">
        <button
          type="button"
          class="btn btn-primary btn-icon waves-effect waves-light"
          title="Đăng nhập SSO"
        >
          <i class="ri-door-lock-box-line fs-20"></i>
        </button>
      </router-link>

      <!-- Google Login -->
      <button
        type="button"
        class="btn btn-danger btn-icon waves-effect waves-light"
        title="Đăng nhập với Google"
      >
        <GoogleLogin :redirect="true" :callback="handleGoogleLogin">
          <template v-slot:default>
            <i class="ri-google-fill fs-20"></i>
          </template>
        </GoogleLogin>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from "vue";
import { GoogleLogin } from "vue3-google-login";

defineEmits(["toggle-otp-mode"]);

const handleGoogleLogin = (response) => {
  // Forward the Google login response to parent
  // Parent component will handle the actual login logic
  defineEmits().googleLogin(response);
};
</script>

<style scoped>
.google-login-button {
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  padding: 0 !important;
  min-width: unset !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.google-login-button :deep(span) {
  display: none !important;
}
</style>
