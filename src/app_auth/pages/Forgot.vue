<script>
import { errorToast } from "@/helpers/api/toastStyle";
import { usePost } from "@/helpers/api/api";
import { ConfigSystem } from "@/base/store/api/server_api";
import AuthLayout from "../layouts/AuthLayout.vue";
import Lottie from "@/base/components/widgets/lottie.vue";
import animationData from "@/base/components/widgets/rhvddzym.json";
import animationData2 from "@/base/components/widgets/lupuorrc.json";

export default {
  components: { AuthLayout, Lottie },
  data() {
    return {
      ConfigSystem: ConfigSystem,
      defaultOptions: { animationData: animationData },
      defaultOptions2: { animationData: animationData2 },
      userEA: "",
      attemptSubmit: false,
      stateSite: 1,
      idRequest: "",
      verifyState: false,
      isExits: false,
      hashCode: "",
      newPass: {
        pass: "",
        confirm: "",
      },
      showPass: {
        pass: false,
        repass: false,
      },
      digits: ["", "", "", "", "", ""], // Mảng lưu 6 chữ số
    };
  },
  methods: {
    async handleSubmit(event) {
      this.attemptSubmit = true;
      if (this.missingEA) event.preventDefault();
      else {
        const regexExp =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let status = 0;
        let item = new FormData();
        if (regexExp.test(this.userEA)) item.append("email", this.userEA);
        else item.append("username", this.userEA);

        await usePost("forgot-password", item)
          .then((data) => {
            status = data.status;
            return data.json();
          })
          .then((res) => {
            if (res) {
              if (status === 202) {
                this.idRequest = res.id_request;
                this.stateSite = 2;
                this.attemptSubmit = false;
              }
              if (
                status === 400 &&
                Object.values(res)[0]?.includes(`Tài khoản không tồn tại.`)
              ) {
                this.isExits = true;
                event.preventDefault();
              } else event.preventDefault();
            } else {
              errorToast("Đã xảy ra lỗi. Vui lòng thử lại sau!");
            }
          });
      }
    },
    handleConfirm() {
      this.attemptSubmit = true;
      try {
        let item = new FormData();
        let status = 0;
        item.append("id", this.idRequest);
        item.append("code", this.confirmCode);
        usePost("confirm-code-forgot", item)
          .then((data) => {
            status = data.status;
            return data.json();
          })
          .then((res) => {
            if (status == 400) {
              this.verifyState = true;
            } else {
              this.hashCode = res.hash;
              this.stateSite = 3;
              this.attemptSubmit = false;
            }
            if (this.attemptSubmit && this.missingConfirmCode) {
              errorToast("Vui lòng nhập mã khôi phục");
            }
            if (this.attemptSubmit && this.verifyState) {
              errorToast("Mã khôi phục không đúng. Vui lòng kiểm tra lại");
            }
          });
      } catch (err) {
        return;
      }
    },
    handleNewPass(event) {
      this.attemptSubmit = true;
      if (this.missingNewPass || this.missingCofirmNewPass || this.passNotMatch)
        event.preventDefault();
      else {
        let status = 0;
        let item = new FormData();
        item.append("hash", this.hashCode);
        item.append("new_password", this.newPass.confirm);
        usePost("reset-password", item)
          .then((data) => {
            status = data.status;
            return data.json();
          })
          .then(() => {
            if (status === 400) {
              errorToast("Đã xảy ra lỗi. Vui lòng thử lại sau!");
            } else {
              this.attemptSubmit = false;
              this.stateSite = 4;
            }
          });
      }
    },
    getInputElement(index) {
      return document.getElementById("digit" + index + "-input");
    },

    moveToNext(index) {
      const currentInput = this.getInputElement(index);

      if (currentInput.value.length === 1) {
        if (index < 6) {
          this.getInputElement(index + 1).focus();
          this.digits[index - 1] = currentInput.value;
          this.digits[index] = "";
        } else {
          currentInput.blur();
          // Tự động submit - tắt đi
          // this.handleConfirm();
        }
      }

      // Xử lý xóa - quay lại ô trước
      if (currentInput.value.length === 0 && index > 1) {
        this.getInputElement(index - 1).focus();
        this.digits[index - 2] = "";
      }
    },
  },
  computed: {
    missingEA: function () {
      return this.userEA === "";
    },
    missingConfirmCode: function () {
      return this.confirmCode === "";
    },
    missingNewPass: function () {
      return this.newPass.pass === "";
    },
    missingCofirmNewPass: function () {
      return this.newPass.confirm === "";
    },
    passNotMatch: function () {
      if (this.missingCofirmNewPass) return;
      return this.newPass.confirm !== this.newPass.pass;
    },
    // Mã xác nhận đầy đủ
    confirmCode() {
      return this.digits.join("");
    },

    // Kiểm tra đã nhập đủ 6 số chưa
    isCodeComplete() {
      return (
        this.confirmCode.length === 6 &&
        this.digits.every((digit) => digit !== "")
      );
    },
  },
  watch: {
    "newPass.pass": function () {
      this.attemptSubmit = false;
    },
    "newPass.confirm": function () {
      this.attemptSubmit = false;
    },
    userEA: function () {
      this.attemptSubmit = false;
    },
    confirmCode: function () {
      this.attemptSubmit = false;
    },
  },
};
</script>

<template>
  <AuthLayout>
    <div v-if="stateSite === 1">
      <h5 class="text-primary">Quên mật khẩu?</h5>
      <p class="text-muted">Đừng lo, chúng tôi sẽ hỗ trợ cho bạn</p>

      <div class="mt-2 text-center">
        <lottie
          class="avatar-xl"
          colors="primary:#0ab39c,secondary:#405189"
          :options="defaultOptions"
          :height="120"
          :width="120"
        />
      </div>

      <b-alert variant="warning" class="alert-borderless text-center mb-2" show>
        Nhập thông tin và hướng dẫn sẽ được gửi đến bạn!
      </b-alert>
      <div class="py-2">
        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label class="form-label">
              Tài khoản
              <span class="text-danger">*</span>
            </label>
            <input
              type="text"
              class="form-control"
              placeholder="Nhập tài khoản hoặc email"
              v-model="userEA"
              :class="{
                'is-invalid':
                  (attemptSubmit && missingEA) || (attemptSubmit && isExits),
              }"
            />
            <div
              class="invalid-feedback d-block"
              v-if="attemptSubmit && missingEA"
            >
              Tài khoản hoặc email không được để trống.
            </div>
            <div
              class="invalid-feedback d-block"
              v-if="attemptSubmit && isExits"
            >
              Không tìm thấy tài khoản hoặc email.
            </div>
          </div>
          <div class="text-center mt-4">
            <b-button variant="success" type="submit" class="w-100">
              Gửi yêu cầu
            </b-button>
          </div>
        </form>
      </div>
      <div class="mt-4 text-center">
        <p class="mb-0">
          Bạn đã nhớ tài khoản ?
          <router-link
            :to="{ name: 'Login' }"
            class="fw-semibold text-primary text-decoration-underline"
          >
            Đăng nhập
          </router-link>
        </p>
      </div>
    </div>
    <div v-else-if="stateSite === 2">
      <div class="mb-4">
        <div class="avatar-lg mx-auto">
          <div
            class="avatar-title bg-light text-primary display-5 rounded-circle"
          >
            <i class="ri-mail-line"></i>
          </div>
        </div>
      </div>
      <div class="text-muted text-center mx-lg-3">
        <h4 class="">Xác nhận khôi phục mật khẩu</h4>
        <p>
          Vui lòng nhập mã gồm 6 chữ số được gửi tới email
          <span class="fw-semibold">{{ userEA }}</span>
        </p>
      </div>

      <div class="mt-4">
        <form @submit.prevent="handleConfirm">
          <BRow>
            <BCol cols="2" v-for="index in 6" :key="index">
              <div class="mb-3">
                <label
                  :for="'digit' + index + '-input'"
                  class="visually-hidden"
                >
                  Digit {{ index }}
                </label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  step="1"
                  maxLength="1"
                  class="form-control form-control-lg bg-light border-light text-center"
                  v-on:keyup="moveToNext(index)"
                  v-model="digits[index - 1]"
                  required
                  :id="'digit' + index + '-input'"
                />
              </div>
            </BCol>
          </BRow>

          <div class="mt-3">
            <BButton
              type="submit"
              variant="success"
              class="w-100"
              :disabled="!isCodeComplete"
            >
              Xác nhận
            </BButton>
          </div>
        </form>
      </div>

      <div class="mt-5 text-center">
        <p class="mb-0">
          Không nhận được mã ?
          <a
            href="javascript:void(0)"
            class="fw-semibold text-primary text-decoration-underline"
          >
            Gửi lại
          </a>
        </p>
      </div>
    </div>
    <div
      class="h-100 d-flex flex-column justify-content-center"
      v-else-if="stateSite === 3"
    >
      <h5 class="text-primary">Tạo mật khẩu mới</h5>
      <p class="text-muted">
        Mật khẩu mới của bạn phải khác mật khẩu đã sử dụng trước đó
      </p>

      <form>
        <div class="mb-3">
          <label class="form-label" for="password-input">Mật khẩu</label>
          <div class="position-relative auth-pass-inputgroup">
            <input
              :type="showPass.pass ? 'text' : 'password'"
              class="form-control pe-5 password-input"
              v-model="newPass.pass"
              placeholder="Nhập mật khẩu"
              id="password-input"
              :class="{
                'is-invalid': attemptSubmit && missingNewPass,
              }"
            />
            <button
              :class="{ 'me-3': attemptSubmit && missingNewPass }"
              class="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
              type="button"
              id="password-addon"
              @click="showPass.pass = !showPass.pass"
            >
              <i
                class="align-middle"
                :class="showPass.pass ? 'ri-eye-off-fill' : 'ri-eye-fill'"
              ></i>
            </button>
          </div>
          <div
            class="invalid-feedback d-block"
            v-if="attemptSubmit && missingNewPass"
          >
            Mật khẩu mới không được để trống
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label" for="confirm-pass-input"
            >Xác nhận mật khẩu mới</label
          >
          <div class="position-relative auth-pass-inputgroup mb-3">
            <input
              :type="showPass.repass ? 'text' : 'password'"
              class="form-control pe-5 password-input"
              v-model="newPass.confirm"
              id="confirm-pass-input"
              placeholder="Nhập xác nhận mật khẩu"
              :class="{
                'is-invalid':
                  (attemptSubmit && missingCofirmNewPass) ||
                  (attemptSubmit && passNotMatch),
              }"
            />
            <button
              type="button"
              @click="showPass.repass = !showPass.repass"
              :class="{
                'me-3':
                  (attemptSubmit && missingCofirmNewPass) ||
                  (attemptSubmit && passNotMatch),
              }"
              class="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
            >
              <i
                class="align-middle"
                :class="showPass.repass ? 'ri-eye-off-fill' : 'ri-eye-fill'"
              ></i>
            </button>
          </div>
          <div
            class="invalid-feedback d-block"
            v-if="attemptSubmit && missingCofirmNewPass"
          >
            Nhập lại mật khẩu mới không được để trống
          </div>
          <div
            class="invalid-feedback d-block"
            v-if="attemptSubmit && passNotMatch"
          >
            Hai mật khẩu không trùng khớp
          </div>
        </div>
        <div class="mt-4 w-100 text-center">
          <b-button
            variant="success"
            class="w-100"
            @click.prevent="handleNewPass"
          >
            Xác nhận
          </b-button>
        </div>
      </form>
    </div>
    <template v-else>
      <div class="text-center">
        <div class="mb-4">
          <lottie
            colors="primary:#0ab39c,secondary:#405189"
            :options="defaultOptions2"
            :height="120"
            :width="120"
          />
        </div>
        <h5>Tài khoản của bạn đã được đổi mật khẩu thành công !</h5>
        <p class="text-muted">
          Bây giờ bạn có thể đăng nhập tài khoản của mình bằng mật khẩu mới!
        </p>
        <router-link
          type="button"
          class="btn btn-success mt-4"
          :to="{ name: 'Login' }"
          >Đăng nhập ngay
        </router-link>
      </div>
    </template>
  </AuthLayout>
</template>
