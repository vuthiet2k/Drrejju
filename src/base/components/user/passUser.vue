<script setup>
import { ref, reactive, watch, defineProps, defineEmits } from "vue";
import { useFetch, usePatch } from "@/helpers/api/api.js";
import { BASE_URL } from "@/helpers/api/axiosHttp.js";
import debounce from "lodash/debounce";
import { errorToast, successToast } from "@/helpers/api/toastStyle";
import FormLoading from "@/base/components/form/builder/components/FormLoading.vue";

const props = defineProps({
  idUser: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(["close", "password-changed"]);

const userToPass = reactive({
  username: "",
  password: "",
  new_password: "",
  re_new_pass: "",
  is_baned: "",
  last_name: "",
  first_name: "",
  photoUrl: "",
  photo: "",
});

const isLoading = ref(true);

const PROXY = BASE_URL.endsWith("/")
  ? BASE_URL + "api"
  : BASE_URL + "/" + "api";

async function getUserDetail(userId) {
  let data = null;
  await useFetch(PROXY + `/user/${userId}/`).then((res) => {
    data = res;
  });
  return data;
}

async function fetchUserDetail(id) {
  if (!id) return;
  isLoading.value = true;
  const data = await getUserDetail(id);
  if (data) {
    userToPass.username = data.username || "";
    userToPass.last_name = data.last_name || "";
    userToPass.first_name = data.first_name || "";
    userToPass.photoUrl =
      data.photo && data.photo !== "/media/null"
        ? data.photo
        : require("@/assets/images/users/user-dummy-img.jpg");
    userToPass.photo = data.photo || "";
    userToPass.is_baned = data.is_baned || "";
    userToPass.new_password = "";
    userToPass.password = "";
  }
  isLoading.value = false;
}

// Debounce fetchUserDetail 1s
const debouncedFetchUserDetail = debounce(fetchUserDetail, 1000);

// Watch idUser prop để tự động lấy dữ liệu user mới, dùng debounce
watch(
  () => props.idUser,
  (newId) => {
    isLoading.value = true;
    debouncedFetchUserDetail(newId);
  },
  { immediate: true }
);

// Hàm submit đổi mật khẩu
async function handleChangePassword(e) {
  e.preventDefault();

  // Validate dữ liệu
  if (!userToPass.new_password || userToPass.new_password.length < 6) {
    errorToast("Mật khẩu mới phải có ít nhất 6 ký tự!");
    return;
  }

  const formData = new FormData();
  formData.append("password", userToPass.new_password);

  try {
    const res = await usePatch(
      `user/${props.idUser}/`,
      formData
    );
    if (res.status === 202 || res.status === 200) {
      successToast("Đổi mật khẩu thành công!");
      emit("password-changed", userToPass.username);
      emit("close");
    } else if (res.status === 403) {
      errorToast("Không có quyền thực hiện!");
    } else {
      const data = await res.json();
      errorToast(data.message || "Đổi mật khẩu thất bại!");
    }
  } catch (err) {
    errorToast("Có lỗi xảy ra khi đổi mật khẩu!");
  }
}

// Hàm đóng form
function handleClose() {
  emit("close");
}
</script>

<template>
  <form @submit.prevent="handleChangePassword">
    <button class="d-none" type="reset" name="reset"></button>
    <template v-if="isLoading">
      <FormLoading />
    </template>
    <template v-else>
      <b-row class="g-0 m-2">
        <b-col xl="12">
          <b-row>
            <b-col class="mb-3" lg="12">
              <button
                class="accordion-button p-2 bg-head-title"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#accor_iconExamplecollapse1"
                aria-expanded="true"
                aria-controls="accor_iconExamplecollapse1"
              >
                THÔNG TIN NGƯỜI DÙNG
              </button>
            </b-col>
            <b-col lg="6">
              <b-row>
                <b-col lg="6" class="mb-3">
                  <label for="fnameInput" class="form-label mb-1">Họ đệm </label>
                  <input
                    type="text"
                    class="form-control"
                    id="fnameInput"
                    placeholder="Nhập họ và tên đệm"
                    name="first_name"
                    v-model="userToPass.first_name"
                    disabled
                  />
                </b-col>
                <b-col lg="6" class="mb-3">
                  <label for="lnameInput" class="form-label mb-1">Tên</label>
                  <input
                    type="text"
                    class="form-control"
                    id="lnameInput"
                    placeholder="Nhập tên"
                    name="last_name"
                    v-model="userToPass.last_name"
                    disabled
                  />
                </b-col>
              </b-row>
              <div>
                <b-row>
                  <b-col sm="6">
                    <label class="form-label mb-1">
                      Tài khoản <span class="text-danger">*</span>
                    </label>
                  </b-col>
                  <b-col sm="6" class="text-end">
                    <router-link to="#">
                      <label
                        class="pointer-cursor-custom"
                        :class="
                          userToPass?.is_baned?.boolean === false
                            ? 'text-success'
                            : 'text-danger'
                        "
                        ><i
                          :class="
                            userToPass?.is_baned?.boolean === false
                              ? 'mdi mdi-account-heart-outline'
                              : 'mdi mdi-account-lock-outline'
                          "
                        ></i>
                        {{ userToPass?.is_baned?.title }}</label
                      >
                    </router-link>
                  </b-col>
                </b-row>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Nhập tên tài khoản"
                  name="username"
                  v-model="userToPass.username"
                  disabled
                />
              </div>
              <b-row>
                <b-col lg="12" class="mb-3">
                  <label class="form-label mb-1 mt-3">
                    Mật khẩu mới <span class="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    class="form-control pe-5 password-input"
                    placeholder="Nhập mật khẩu mới"
                    autocomplete="new-password"
                    v-model="userToPass.new_password"
                  />
                </b-col>
              </b-row>
            </b-col>
            <b-col lg="6">
              <label for="formFileLogoInput" class="form-label"
                >Ảnh đại diện</label
              >
              <div class="img-upload-slot">
                <div class="img-slot">
                  <img
                    class="img-custom"
                    :src="userToPass.photoUrl"
                    v-if="userToPass.photo"
                  />
                  <div class="img-custom" v-else></div>
                </div>
              </div>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-light" type="button" @click="handleClose">
          Huỷ
        </button>
        <button type="submit" class="btn btn-primary">Đổi mật khẩu</button>
      </div>
    </template>
  </form>
</template>

<style scoped>
.bg-head-title {
  background-color: #dbe4ff;
}

.bg-disabled {
  background-color: var(--vz-input-disabled-bg) !important;
}

.img-upload-slot {
  display: grid;
  place-items: center;
}

.label-upload-img {
  position: absolute;
  display: grid;
  padding: 10px;
  border-radius: 50%;
  border: 1px solid #393737;
  background: #d5d5d55c;
  color: #393737;
}

.img-slot {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.25rem;
  background-color: var(--vz-body-bg);
  border: 1px solid var(--vz-border-color);
  border-radius: 0.25rem;
}

.img-custom {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.pointer-cursor-custom {
  cursor: pointer;
}
</style>
