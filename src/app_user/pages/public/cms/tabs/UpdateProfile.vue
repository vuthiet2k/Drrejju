<script>
import { BASE_URL } from "@/helpers/api/axiosHttp";
import http from "@/helpers/api/axiosHttp";
import { errorToast, successToast } from "@/helpers/api/toastStyle";
import Image from "@/base/components/image/Image.vue";
import CoverImage from "@/assets/images/nft/bg-home.jpg";
import { inject } from "vue";

export default {
  data() {
    return {
      birthConfig: {
        altFormat: "d/m/Y",
        altInput: true,
        dateFormat: "Y-m-d",
      },
      have_change_birth: false,
      baseURL: "",
      infoUser: {},
      publicInfo: {
        email: true,
        phone: true,
        address: true,
      },
      userFacebook: "",
      userGitHub: "",
      userKCN: {},
      // userFullName: '',
      attemptSubmit: false,
      statusCode: 0,
      validation: {
        email: {
          invalid: false,
          isexits: false,
        },
        phone: false,
      },
      have_new_image_update: false,
      preveiw_image_upload: "",
      CoverImage,
    };
  },
  components: {
    Image,
    // flatPickr,
  },
  created() {
    const vm = this;
    vm.infoUser = inject("user");
    // vm.userFullName = `${vm.infoUser.first_name} ${vm.infoUser.last_name}`;
    if (!vm.infoUser.phone) vm.publicInfo.phone = false;
    if (!vm.infoUser.address) vm.publicInfo.address = false;
    if (!vm.infoUser.email) vm.publicInfo.email = false;
    // if (Object.keys(vm.infoUser.info_public).length > 0) {
    //   if (vm.infoUser.hasOwnProperty('email')) vm.publicInfo.email = vm.infoUser.info_public.email;
    //   if (vm.infoUser.hasOwnProperty('phone')) vm.publicInfo.phone = vm.infoUser.info_public.phone;
    //   if (vm.infoUser.hasOwnProperty('address')) vm.publicInfo.address = vm.infoUser.info_public.address;
    // }
    if (vm.infoUser.social_network_link) {
      for (let i = 0; i < vm.infoUser.social_network_link.length; i++) {
        if (vm.infoUser.social_network_link[i].facebook)
          vm.userFacebook = vm.infoUser.social_network_link[i].facebook;
        if (vm.infoUser.social_network_link[i].github)
          vm.userGitHub = vm.infoUser.social_network_link[i].github;
      }
    }
  },
  computed: {
    // missingEmail: function () {
    //   if (this.infoUser.email === '') {
    //     this.validation.email.invalid = false;
    //     this.validation.email.isexits = false;
    //   }
    //   return this.infoUser.email === '';
    // },
    // missingPhone: function () {
    //   return this.infoUser.phone === '';
    // },
  },
  mounted() {
    const vm = this;
    vm.localURL = window.location.origin;
    vm.baseURL = BASE_URL;
  },
  methods: {
    changeBirth() {
      const vm = this;
      vm.have_change_birth = true;
    },

    handleUploadImage(e) {
      const vm = this;
      const file = e.target.files[0];
      vm.infoUser.photo = file;
      vm.have_new_image_update = true;

      const reader = new FileReader();
      reader.onload = (event) => {
        vm.preveiw_image_upload = event.target.result;
      };
      reader.readAsDataURL(file);
    },
    async handleSubmit(id) {
      const vm = this;
      this.attemptSubmit = true;
      // if (vm.missingEmail || vm.missingPhone)
      //   event.preventDefault();
      // else {
      const item = new FormData(document.getElementById("form-profile"));
      if (this.have_change_birth) {
        item.append("birth", this.infoUser.birth);
      }
      let avatar = document.getElementById("profile-img-file-input").files[0];
      if (avatar) {
        item.append("photo", avatar);
      }
      /*let cover = document.getElementById('profile-foreground-img-file-input').files[0];
      if (cover) {
        item.append('cover_img', cover);
      }*/
      item.append(
        "info_public",
        `{"email": ${vm.publicInfo.email}, "phone": ${vm.publicInfo.phone}, "address": ${vm.publicInfo.address}}`
      );
      if (vm.userFacebook !== "" || vm.userGitHub !== "") {
        let social = `[`;
        if (vm.userFacebook !== "") {
          social += `{"facebook": "${vm.userFacebook}"}`;
          if (vm.userGitHub !== "") social += `,`;
        }
        if (vm.userGitHub !== "") {
          social += `{"github": "${vm.userGitHub}"}`;
        }
        social += `]`;
        item.append("social_network_link", social);
      }

      try {
        const response = await http.patch(`/user/${id}/`, item);
        if (response.status === 200) {
          vm.infoUser = response.data;
          successToast("Đã cập nhật thông tin!");
        }
      } catch (error) {
        try {
          errorToast(error.response.data.message);
        } catch (error) {
          errorToast("Cập nhật thất bại!");
        }
      }
    },
  },
  watch: {
    "infoUser.first_name": function () {
      this.attemptSubmit = false;
    },
    "infoUser.last_name": function () {
      this.attemptSubmit = false;
    },
    "infoUser.phone": function () {
      this.attemptSubmit = false;
    },
    "infoUser.email": function () {
      this.attemptSubmit = false;
    },
    "infoUser.birth": function () {
      this.attemptSubmit = false;
    },
    "infoUser.gender": function () {
      this.attemptSubmit = false;
    },
    "infoUser.address": function () {
      this.attemptSubmit = false;
    },
    "infoUser.introduce": function () {
      this.attemptSubmit = false;
    },
  },
};
</script>

<template>
  <form id="form-profile">
    <b-row class="g-3">
      <b-col xl="3">
        <b-card no-body>
          <b-card-body class="p-4">
            <div class="text-center">
              <div
                class="profile-user position-relative d-inline-block mx-auto mb-4"
              >
                <div v-if="!have_new_image_update">
                  <Image
                    :src="infoUser.photo"
                    fallback="user"
                    class="rounded-circle avatar-xl img-thumbnail user-profile-image"
                    alt="user-profile-image"
                  />
                </div>
                <Image
                  :src="preveiw_image_upload"
                  fallback="user"
                  class="rounded-circle avatar-xl img-thumbnail user-profile-image"
                  alt="user-profile-image"
                  v-else
                />
                <div class="avatar-xs p-0 rounded-circle profile-photo-edit">
                  <input
                    id="profile-img-file-input"
                    type="file"
                    class="profile-img-file-input"
                    @change="handleUploadImage"
                  />
                  <label
                    for="profile-img-file-input"
                    class="profile-photo-edit avatar-xs"
                  >
                    <span
                      class="avatar-title rounded-circle bg-light text-body"
                    >
                      <i class="ri-camera-fill"></i>
                    </span>
                  </label>
                </div>
              </div>
              <h5 class="fs-16 mb-1">
                {{ infoUser?.first_name }} {{ infoUser?.last_name }}
              </h5>
              <!-- <p class="text-muted mb-0">{{ userKCN.name_display }}</p> -->
            </div>
          </b-card-body>
        </b-card>
        
        <b-card class="d-none" no-body>
          <b-card-body>
            <h5 class="card-title mb-4">Liên kết</h5>
            <div class="mb-3 d-flex">
              <div class="avatar-xs d-block flex-shrink-0 me-3">
                <span class="avatar-title rounded-circle fs-16 bg-primary">
                  <i class="ri-facebook-fill"></i>
                </span>
              </div>
              <input
                type="text"
                class="form-control"
                id="websiteInput"
                placeholder="Link to Faceook"
                v-model="userFacebook"
              />
            </div>
            <div class="mb-3 d-flex">
              <div class="avatar-xs d-block flex-shrink-0 me-3">
                <span
                  class="avatar-title rounded-circle fs-16 bg-dark text-light"
                >
                  <i class="ri-github-fill"></i>
                </span>
              </div>
              <input
                type="email"
                class="form-control"
                id="gitUsername"
                placeholder="Link to Github"
                v-model="userGitHub"
              />
            </div>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col xl="9">
        <b-card no-body class="">
          <b-card-header class="d-flex align-items-center"
            ><div class="card-title mb-0 flex-grow-1 gap-10">
              <button
                type="button"
                class="btn btn-soft-primary waves-effect waves-light me-2"
              >
                Chỉnh sửa
              </button>
              <button
                type="button"
                class="btn btn-warning btn-icon waves-effect waves-light"
                @click.prevent="handleSubmit(infoUser.id)"
              >
                <i class="ri-save-2-fill"></i>
              </button>
            </div>
            <a
              href="javascript:void(0)"
              @click="$emit('closeEdit')"
              class="btn btn-outline-primary btn-icon waves-effect waves-light"
            >
              <i class="ri-close-line"></i>
            </a>
          </b-card-header>
          <b-card-body class="p-4">
            <b-row>
              <b-col lg="6">
                <div class="mb-3">
                  <label for="firstnameInput" class="form-label">Họ</label>
                  <input
                    type="text"
                    class="form-control"
                    id="firstnameInput"
                    name="first_name"
                    placeholder="Nhập họ và tên đệm"
                    v-model="infoUser.first_name"
                  />
                </div>
              </b-col>
              <b-col lg="6">
                <div class="mb-3">
                  <label for="lastnameInput" class="form-label">Tên</label>
                  <input
                    type="text"
                    class="form-control"
                    id="lastnameInput"
                    name="last_name"
                    placeholder="Nhập tên"
                    v-model="infoUser.last_name"
                  />
                </div>
              </b-col>
              <b-col lg="6">
                <div class="mb-3">
                  <label for="phonenumberInput" class="form-label"
                    >Số điện thoại</label
                  >

                  <div class="input-group">
                    <input
                      type="tel"
                      class="form-control"
                      :class="{
                        'is-invalid':
                          (attemptSubmit && missingPhone) ||
                          (attemptSubmit && validation.phone),
                      }"
                      id="phonenumberInput"
                      name="phone"
                      placeholder="Nhập số điện thoại"
                      v-model="infoUser.phone"
                    />
                    <div class="input-group-text">
                      <input
                        class="form-check-input mt-0 cursor-pointer"
                        type="checkbox"
                        value=""
                        v-b-tooltip.hover
                        title="Công khai thông tin của bạn"
                        v-model="publicInfo.phone"
                      />
                    </div>
                  </div>
                  <div
                    class="invalid-feedback d-block"
                    v-if="attemptSubmit && missingPhone"
                  >
                    Vui lòng nhập số điện thoại
                  </div>
                  <div
                    class="invalid-feedback d-block"
                    v-if="attemptSubmit && validation.phone"
                  >
                    Số điện thoại không hợp lệ
                  </div>
                </div>
              </b-col>
              <b-col lg="6">
                <div class="mb-3">
                  <label for="emailInput" class="form-label">Email</label>
                  <div class="input-group">
                    <input
                      type="email"
                      class="form-control"
                      :class="{
                        'is-invalid':
                          (attemptSubmit && missingEmail) ||
                          (attemptSubmit && validation.email.invalid) ||
                          (attemptSubmit && validation.email.isexits),
                      }"
                      id="emailInput"
                      placeholder="Nhập địa chỉ email"
                      name="email"
                      v-model="infoUser.email"
                    />
                    <div class="input-group-text">
                      <input
                        class="form-check-input mt-0 cursor-pointer"
                        type="checkbox"
                        value=""
                        v-b-tooltip.hover
                        title="Công khai thông tin của bạn"
                        v-model="publicInfo.email"
                      />
                    </div>
                  </div>
                  <div
                    class="invalid-feedback d-block"
                    v-if="attemptSubmit && missingEmail"
                  >
                    Vui lòng nhập địa chỉ email
                  </div>
                  <div
                    class="invalid-feedback d-block"
                    v-if="attemptSubmit && validation.email.invalid"
                  >
                    Email không hợp lệ
                  </div>
                  <div
                    class="invalid-feedback d-block"
                    v-else-if="attemptSubmit && validation.email.isexits"
                  >
                    Email này đã được đăng ký với tài khoản khác
                  </div>
                </div>
              </b-col>
              <b-col lg="6">
                <div class="mb-3">
                  <label class="form-label">Ngày sinh</label>
                  <!-- <flat-pickr v-model="infoUser.birth" :config="birthConfig" class="form-control flatpickr-input" /> -->
                  <input
                    type="date"
                    class="form-control"
                    id="exampleInputdate"
                    v-model="infoUser.birth"
                    @change="changeBirth"
                  />
                </div>
              </b-col>
              <b-col lg="6">
                <div class="mb-3">
                  <label class="form-label">Giới tính</label>
                  <select
                    class="form-select"
                    v-model="infoUser.gender"
                    name="gender"
                  >
                    <option value="0" selected>Nam</option>
                    <option value="1">Nữ</option>
                  </select>
                </div>
              </b-col>
              <b-col lg="12">
                <div class="mb-3">
                  <label class="form-label" for="addressInput">Địa chỉ</label>
                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      id="addressInput"
                      placeholder="Nhập địa chỉ"
                      name="address"
                      v-model="infoUser.address"
                    />
                    <div class="input-group-text">
                      <input
                        class="form-check-input mt-0 cursor-pointer"
                        type="checkbox"
                        value=""
                        v-b-tooltip.hover
                        title="Công khai thông tin của bạn"
                        v-model="publicInfo.address"
                      />
                    </div>
                  </div>
                </div>
              </b-col>
              <b-col lg="12">
                <div class="mb-3 pb-2">
                  <label for="exampleFormControlTextarea" class="form-label"
                    >Giới thiệu</label
                  >
                  <textarea
                    class="form-control"
                    id="exampleFormControlTextarea"
                    rows="6"
                    v-model="infoUser.introduce"
                    name="introduce"
                  >
                  </textarea>
                </div>
              </b-col>
              <!-- <b-col lg="12">
                    <div class="hstack gap-2 justify-content-end">
                      <router-link type="button" class="btn btn-soft-danger w-sm d-flex align-items-center" to="/profile">
                        <i class="bx bx-rotate-left me-1 align-bottom"></i> Hủy bỏ
                      </router-link>
                      <button type="submit" class="btn btn-success w-sm" @click.prevent="handleSubmit(infoUser.id)">
                        <i class="ri-save-3-line me-1 align-bottom"></i> Lưu
                      </button>
                    </div>
                  </b-col> -->
            </b-row>
          </b-card-body>
        </b-card>
      </b-col>
      <div class="mb-3"></div>
    </b-row>
  </form>
</template>
