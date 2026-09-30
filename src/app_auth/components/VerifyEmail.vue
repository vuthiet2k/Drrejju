<script>
// import Lottie from "./widgets/lottie.vue";
// import animationData from "./widgets/lupuorrc.json";
import { usePatch, usePost } from "@/helpers/api/api";
import { successToast } from "@/helpers/api/toastStyle";

export default {
  name: "VerifyEmailComponent",
  props: {
    idUser: {
      type: String
    }
  },
  components: {
    // lottie: Lottie,
  },
  data() {
    return {
      attemptSubmit: false,
      confirmCode: '',
      state: true,
      verifyState: false,
      // defaultOptions: { animationData: animationData },
    }
  },
  computed: {
    missingConfirmCode: function () {
      return this.confirmCode === '';
    },
  },
  methods: {
    async handleConfirm(event) {
      const vm = this;
      vm.attemptSubmit = true;
      if (vm.missingConfirmCode) event.preventDefault();
      else {
        let status = 0;
        let form = new FormData();
        form.append('code', vm.confirmCode);
        usePatch(`user/${vm.idUser}/verify/`, form).then(data => {
          status = data.status;
          return data.json();
        }).then(res => {
          if (res) {
            if (status === 400) {
              vm.verifyState = true;
              event.preventDefault();
            } else vm.state = false
          }
        })
      }
    },
    async handleResendVerify() {
      const vm = this;
      let item = new FormData();
      await usePost(`user/${vm.idUser}/send-new-authentication-code/`, item).then(data => data.json()).then(() => {
        successToast("Mã xác nhận đã được gửi tới email của bạn! Vui lòng kiểm tra lại")
      })
    },
    handleReload() {
      if (window.location.href.includes('register')) {
        this.$router.push({ name: 'LoginPage' });
      } else window.location.reload();
    }
  },
  watch: {
    confirmCode: function () {
      this.attemptSubmit = false;
    }
  }
}
</script>
<template>
  <div v-if="state" class="mt-5">
    <p class="mb-5 text-secondary fw-semibold fst-italic fs-15">Một mã xác thực đã được gửi tới Email
      đăng ký của bạn.<br> Vui lòng kiểm tra Email và nhập mã xác thực để hoàn tất xác thực !</p>
    <div class="my-5">
      <div class="input-group">
        <input type="text" class="form-control" placeholder="Nhập mã xác thực" v-model="confirmCode"
          :class="{ 'is-invalid': attemptSubmit && missingConfirmCode || attemptSubmit && verifyState }">
        <button class="btn btn-primary" type="button" @click="handleConfirm">Xác thực email</button>
      </div>
      <div class="invalid-feedback d-block" v-if="attemptSubmit && missingConfirmCode">
        Vui lòng nhập mã xác thực
      </div>
      <div class="invalid-feedback d-block" v-if="attemptSubmit && verifyState">
        Mã xác thực không đúng. Vui lòng kiểm tra lại
      </div>
    </div>
    <p class="text-muted fst-italic">Chưa nhận được mã?
      <span class="fw-semibold text-primary text-decoration-underline cursor-pointer" @click="handleResendVerify">Nhấn vào
        đây </span> để nhận lại mã
    </p>
  </div>
  <div v-else>
    <div class="text-center py-5">
      <div class="mb-4">
        <lottie colors="primary:#0ab39c,secondary:#405189" :options="defaultOptions" :height="120" :width="120" />
      </div>
      <h5>Tài khoản của bạn đã được xác thực email thành công !</h5>
      <p class="text-muted">Bây giờ bạn có thể sử dụng tài khoản của mình để đăng nhập hệ thống!</p>
      <div @click="handleReload" type="button" class="btn btn-success mt-4">
        Đăng nhập ngay
      </div>
    </div>
  </div>
</template>