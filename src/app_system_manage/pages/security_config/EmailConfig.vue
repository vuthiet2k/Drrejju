<script setup>
import { ref } from "vue";
import API from "@/helpers/api/useAxios.js";
import { errorToast } from "@/helpers/api/toastStyle";

import ConfigSystem from "../../layout/ConfigSystem.vue";
import AccordionRecord from "@/base/components/dtwinUI/AccordionInfor.vue";
import ButtonIcon from "@/base/components/baseUI/ButtonIcon.vue";

const { get, patch } = API();

/**
 * =========================
 * State (PHÙ HỢP BACKEND)
 * =========================
 */
const emailData = ref({
  id: null,
  name: "system_email",
  email: "",
  password: "",
  created_date: null,
  updated_date: null,
});

const isLoading = ref(false);

/**
 * =========================
 * Fetch email config
 * =========================
 */
const fetchEmailData = async () => {
  isLoading.value = true;
  try {
    const response = await get("mail-config/");
    emailData.value = {
      ...emailData.value,
      ...response,
      name: response.name || "system_email",
      password: "",
    };
  } catch {
    errorToast("Không tải được cấu hình email");
  } finally {
    isLoading.value = false;
  }
};

fetchEmailData();

/**
 * =========================
 * Save email config
 * =========================
 */
const saveEmailData = async () => {
  if (!emailData.value.email) {
    return errorToast("Email không được để trống");
  }

  await patch(
    "mail-config/",
    emailData.value,
    "Lưu cấu hình email thành công!",
    "Lưu cấu hình email thất bại"
  );
  emailData.value.password = "";
};
</script>

<template>
  <ConfigSystem>
    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Đang tải cấu hình email...</p>
    </div>

    <template v-else>
      <AccordionRecord title="Cấu hình Email hệ thống">
        <div class="p-3">
          <div class="row">
            <!-- Email -->
            <div class="col-md-12 mb-3">
              <label class="form-label">Email hệ thống</label>
              <input
                type="email"
                class="form-control"
                v-model="emailData.email"
                placeholder="example@gmail.com"
              />
            </div>

            <!-- Password -->
            <div class="col-md-12 mb-3">
              <label class="form-label">Mật khẩu email</label>
              <input
                type="password"
                class="form-control"
                v-model="emailData.password"
                placeholder="Nhập mật khẩu mới nếu muốn thay đổi"
              />
            </div>

            <div class="col-12">
              <small class="text-muted">
                Email này được dùng để gửi OTP, email hệ thống và thông báo hỗ
                trợ.
              </small>
            </div>
          </div>
        </div>
      </AccordionRecord>

      <!-- Toolbar -->
      <Teleport to="#toolbar-config-home">
        <div class="d-flex gap-2 justify-content-end">
          <ButtonIcon
            type="danger"
            classIcon="las la-undo-alt"
            name="Làm mới"
            @click="fetchEmailData"
          />
          <ButtonIcon
            type="primary"
            name="Lưu cấu hình"
            classIcon="ri-save-line"
            @click="saveEmailData"
          />
        </div>
      </Teleport>
    </template>
  </ConfigSystem>
</template>
