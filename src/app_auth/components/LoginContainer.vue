<template>
  <div class="d-flex flex-column justify-content-between">
    <!-- Header -->
    <login-header />

    <!-- Conditional Rendering -->
    <div v-if="!stateVerify">
      <login-form
        v-if="!isOtpMode"
        @submit="handlePasswordLogin"
        @toggle-otp-mode="toggleOtpMode"
        @resend-verify="handleResendVerify"
        :is-verify="isVerify"
        :user-id="UserID"
      />

      <otp-login-form v-else @submit="handleOtpLogin" @send-otp="sendOtp" />

      <!-- Social Login -->
      <social-login
        @google-login="handleGoogleLogin"
        @toggle-otp-mode="toggleOtpMode"
      />
    </div>

    <!-- Verify Email -->
    <div v-else class="p-lg-5 p-4">
      <verify-email :id-user="UserID" />
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, provide } from "vue";
import { useRouter, useRoute } from "vue-router";
import LoginHeader from "./LoginHeader.vue";
import LoginForm from "./LoginForm.vue";
import OtpLoginForm from "./OtpLoginForm.vue";
import SocialLogin from "./SocialLogin.vue";
import VerifyEmail from "./VerifyEmail.vue";
import { errorToast, successToast } from "@/helpers/api/toastStyle";
import { usePost } from "@/helpers/api/api.js";
import Token from "../../helpers/user/user.js";
import axios from "axios";
import { SERVER_URL } from "@/helpers/utils/config_system.js";

const router = useRouter();
const route = useRoute();

// Props & Emits
const props = defineProps({
  stateVerify: Boolean,
  UserID: String,
});

const emit = defineEmits(["update:stateVerify", "update:UserID"]);

// State
const isOtpMode = ref(false);
const isVerify = ref(false);
const checkNextPage = ref("/");
const rememberMe = ref(true);
provide("remember-me", rememberMe);

// Methods
const toggleOtpMode = (mode) => {
  isOtpMode.value = mode;
};

const handlePasswordLogin = async (formData) => {
  try {
    const response = await usePost("login", formData);
    const status = response.status;
    const res = await response.json();

    if (
      status === 400 &&
      Object.values(res)[0]?.includes("User not authenticate")
    ) {
      emit("update:UserID", res.user_id);
      isVerify.value = true;
      return;
    }

    if (res?.access_token) {
      await handleSuccessfulLogin(res);
    } else {
      errorToast("Tài khoản hoặc mật khẩu không chính xác!");
    }
  } catch (error) {
    errorToast("Đăng nhập thất bại!");
  }
};

const handleOtpLogin = async (otpData) => {
  try {
    const formData = new FormData();
    formData.append("identifier", otpData.identifier);
    formData.append("otp", otpData.otp);
    formData.append("grant_type", "otp");

    const fullUrl = SERVER_URL + "/api/login/";
    const resp = await usePost(fullUrl, formData, false);
    const res = await resp.json();

    if (resp.ok && res?.access_token) {
      await handleSuccessfulLogin(res);
    } else {
      const errMsg = res?.detail || res?.message || "Xác thực OTP thất bại!";
      errorToast(errMsg);
    }
  } catch (error) {
    errorToast("Có lỗi khi xác thực OTP!");
  }
};

const handleGoogleLogin = async (response) => {
  try {
    const res = await axios.post(`${SERVER_URL}/oauth/google/`, {
      token: response.credential,
    });

    if (res.data?.access_token) {
      await handleSuccessfulLogin(res.data);
    } else {
      errorToast("Đăng nhập thất bại!");
    }
  } catch (error) {
    errorToast("Đăng nhập Google thất bại!");
  }
};

const sendOtp = async (identifier, fc_then = () => {}) => {
  try {
    const formData = new FormData();
    formData.append("identifier", identifier);
    const fullUrl = SERVER_URL + "/api/login/request-otp/";
    const resp = await usePost(fullUrl, formData, false);

    if (resp.ok) {
      successToast("Mã OTP đã được gửi đến email của bạn");
      fc_then();
      return true;
    } else {
      const json = await resp.json();
      const msg = json?.detail || json?.msg || "Không gửi được OTP";
      errorToast(msg);
      return false;
    }
  } catch (error) {
    errorToast("Không gửi được OTP. Vui lòng thử lại!");
    return false;
  }
};

const handleResendVerify = async () => {
  try {
    const formData = new FormData();
    await usePost(
      `user/${props.UserID}/send-new-authentication-code/`,
      formData
    );
    emit("update:stateVerify", true);
  } catch (error) {
    errorToast("Gửi lại mã xác thực thất bại!");
  }
};

const handleSuccessfulLogin = async (userData) => {
  let pramsAll = undefined;
  if (route.query.redirect) {
    checkNextPage.value = route.query.redirect;
    if (route.query) pramsAll = route.query;
  }

  await Token().setUser(userData, rememberMe.value);
  router.push({
    path: checkNextPage.value,
    params: { ...pramsAll },
  });
};
</script>
