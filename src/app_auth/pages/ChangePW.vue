<script>
// import {Token} from "../../../helpers/user/user.js";
// import {errorToast, successToast} from "../../../helpers/api/toastStyle";
import { errorToast, successToast } from "@/helpers/api/toastStyle";
import http from "@/helpers/api/axiosHttp";
import { inject } from "vue";
import AuthLayout from "../layouts/AuthLayout.vue";

export default {
  components: {
    AuthLayout,
  },
  data() {
    return {
      id: "",
      username: "",
      currPass: "",
      newPass: "",
      rePass: "",
      checkPass: false,
      attemptSubmit: false,
      showPass: {
        old: false,
        new: false,
        renew: false,
      },
      infoUser: {},
    };
  },
  computed: {
    missingCurrPass: function () {
      return this.currPass === "";
    },
    missingNewPass: function () {
      return this.newPass === "";
    },
    missingRePass: function () {
      return this.rePass === "";
    },
    passNotMatch: function () {
      return this.rePass !== this.newPass;
    },
    passSameOld: function () {
      if (this.missingCurrPass) return;
      if (this.checkPass) return;
      return this.newPass === this.currPass;
    },
  },
  created() {
    const vm = this;
    vm.infoUser = inject("user");
    vm.id = inject("user").id;
    vm.username = inject("user").username;
  },
  methods: {
    handleSubmit: async function (event) {
      this.attemptSubmit = true;
      if (
        this.missingCurrPass ||
        this.missingNewPass ||
        this.missingRePass ||
        this.passNotMatch
      ) {
        event.preventDefault();
      } else {
        // let status = 0;
        let item = new FormData();
        item.append("password_old", this.currPass);
        item.append("password_new", this.rePass);

        // usePost(`user/change-password`, item).then(data => {
        //   status = data.status;
        //   return data.json();
        // }).then(res => {
        //   if (status === 400 && Object.values(res)?.includes(`Mật khẩu không chính xác.`)) {
        //     this.checkPass = true;
        //     event.preventDefault();
        //     return;
        //   }
        //   if (this.passSameOld) {
        //     event.preventDefault();
        //     return;
        //   }
        //   if (status === 202) {
        //     this.attemptSubmit = false;
        //     successToast("Thay đổi mật khẩu thành công!");
        //     this.currPass = '';
        //     this.newPass = '';
        //     this.rePass = '';
        //   }
        // })
        try {
          const response = await http.post(`/user/change-password/`, item);
          if (response.status === 202) {
            this.attemptSubmit = false;
            successToast("Thay đổi mật khẩu thành công!");
            this.currPass = "";
            this.newPass = "";
            this.rePass = "";
          }
        } catch (error) {
          try {
            errorToast(error.response.data.message);
          } catch (error) {
            errorToast("Thay đổi thất bại!");
          }
        }
      }
    },
  },
  mounted() {},
  watch: {
    currPass: function () {
      this.attemptSubmit = false;
    },
    newPass: function () {
      this.attemptSubmit = false;
    },
    rePass: function () {
      this.attemptSubmit = false;
    },
  },
};
</script>

<template>
  <AuthLayout>
    <div class="">
      <h5 class="text-primary">Đổi mật khẩu</h5>
      <p class="text-muted">
        Mật khẩu mới của bạn phải khác với mật khẩu đã sử dụng trước đó.
      </p>

      <div class="">
        <form>
          <b-row>
            <b-col lg="6" class="mb-3">
              <label class="form-label">Tài khoản người dùng</label>
              <input
                type="text"
                class="form-control pe-5"
                v-model="infoUser.username"
                disabled
              />
            </b-col>
            <b-col lg="6" class="mb-3">
              <label class="form-label">Họ và tên</label>
              <input
                type="text"
                class="form-control pe-5"
                :value="infoUser.first_name + ' ' + infoUser.last_name"
                disabled
              />
            </b-col>
          </b-row>
          <div class="mb-3">
            <label class="form-label" for="password-input"
              >Mật khẩu hiện tại <span class="text-danger">*</span></label
            >
            <div class="position-relative auth-pass-inputgroup">
              <input
                :type="showPass.old ? 'text' : 'password'"
                class="form-control pe-5 password-input"
                v-model="currPass"
                id="password-input"
                placeholder="Nhập mật khẩu hiện tại"
                :class="{
                  'is-invalid':
                    (attemptSubmit && missingCurrPass) ||
                    (attemptSubmit && checkPass),
                }"
              />
              <button
                @click="showPass.old = !showPass.old"
                type="button"
                id="password-addon"
                class="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
                :class="{
                  'me-3':
                    (attemptSubmit && missingCurrPass) ||
                    (attemptSubmit && checkPass),
                }"
              >
                <i
                  class="align-middle"
                  :class="showPass.old ? 'ri-eye-off-fill' : 'ri-eye-fill'"
                ></i>
              </button>
            </div>
            <div
              class="invalid-feedback d-block"
              v-if="attemptSubmit && missingCurrPass"
            >
              Mật khẩu hiện tại không được để trống.
            </div>
            <div
              class="invalid-feedback d-block"
              v-if="attemptSubmit && checkPass"
            >
              Mật khẩu hiện tại chưa đúng, vui lòng thử lại.
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label" for="new-password-input"
              >Mật khẩu mới <span class="text-danger">*</span></label
            >
            <div class="position-relative auth-pass-inputgroup">
              <input
                :type="showPass.new ? 'text' : 'password'"
                class="form-control pe-5 password-input"
                v-model="newPass"
                placeholder="Nhập mật khẩu mới"
                id="new-password-input"
                :class="{
                  'is-invalid':
                    (attemptSubmit && missingNewPass) ||
                    (attemptSubmit && passSameOld),
                }"
              />
              <button
                type="button"
                id="new-password-addon"
                @click="showPass.new = !showPass.new"
                class="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
                :class="{
                  'me-3':
                    (attemptSubmit && missingNewPass) ||
                    (attemptSubmit && passSameOld),
                }"
              >
                <i
                  class="align-middle"
                  :class="showPass.new ? 'ri-eye-off-fill' : 'ri-eye-fill'"
                ></i>
              </button>
            </div>
            <div
              class="invalid-feedback d-block"
              v-if="attemptSubmit && missingNewPass"
            >
              Mật khẩu mới không được để trống.
            </div>
            <div
              class="invalid-feedback d-block"
              v-if="attemptSubmit && passSameOld"
            >
              Mật khẩu mới không được trùng với mật khẩu hiện tại.
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label" for="confirm-new-password-input"
              >Xác nhận mật khẩu mới <span class="text-danger">*</span></label
            >
            <div class="position-relative auth-pass-inputgroup">
              <input
                :type="showPass.renew ? 'text' : 'password'"
                class="form-control pe-5 password-input"
                v-model="rePass"
                placeholder="Nhập lại mật khẩu mới"
                id="confirm-new-password-input"
                :class="{
                  'is-invalid':
                    (attemptSubmit && missingRePass) ||
                    (attemptSubmit && passNotMatch),
                }"
              />
              <button
                @click="showPass.renew = !showPass.renew"
                type="button"
                class="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
                :class="{
                  'me-3':
                    (attemptSubmit && missingRePass) ||
                    (attemptSubmit && passNotMatch),
                }"
              >
                <i
                  class="align-middle"
                  :class="showPass.renew ? 'ri-eye-off-fill' : 'ri-eye-fill'"
                ></i>
              </button>
            </div>
            <div
              class="invalid-feedback d-block"
              v-if="attemptSubmit && missingRePass"
            >
              Xác nhận mật khẩu mới không được để trống.
            </div>
            <div
              class="invalid-feedback d-block"
              v-if="attemptSubmit && passNotMatch && rePass !== ''"
            >
              Mật khẩu không trùng khớp với mật khẩu mới.
            </div>
          </div>

          <div class="mt-4">
            <b-button
              variant="success"
              class="w-100"
              type="submit"
              @click.prevent="handleSubmit"
            >
              Đổi mật khẩu
            </b-button>
          </div>
        </form>
      </div>

      <div class="mt-5 text-center">
        <a
          onclick="history.back()"
          class="fw-semibold text-primary text-decoration-underline cursor-pointer"
        >
          Quay lại
        </a>
      </div>
    </div>
  </AuthLayout>
</template>
