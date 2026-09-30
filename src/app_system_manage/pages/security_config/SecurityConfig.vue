<!-- HomeConfigUnified.vue -->
<script setup>
import { ref, shallowRef, computed } from "vue";
import API from "@/helpers/api/useAxios.js";
import { errorToast, successToast } from "@/helpers/api/toastStyle";
import ConfigSystem from "../../layout/ConfigSystem.vue";
import AccordionRecord from "@/base/components/dtwinUI/AccordionInfor.vue";
import ButtonIcon from "@/base/components/baseUI/ButtonIcon.vue";

// ================== TABS CONFIGURATION ==================
// Tổng hợp tất cả các tab
const tabs = ref([
  // Tab cấu hình bảo mật
  {
    id: "system",
    name: "Bảo mật",
    icon: "ri-article-line",
    type: "system",
  },
]);

const configData = ref({
  password_length: 8,
  password_exclude_characters: "$%^&*()",
  session_timeout_minutes: 30,
});

// ================== REACTIVE STATE ==================
const activeTab = shallowRef(tabs.value[0]);
const isLoading = ref(true);

// ================== COMPUTED ==================
const isSystemTab = computed(() => activeTab.value.type === "system");

const { get, patch } = API();

const fetchConfigData = async () => {
  isLoading.value = true;
  try {
    const response = await get("/system/security/");
    configData.value = response;
  } catch (error) {
    console.error("Error fetching config data:", error);
  } finally {
    isLoading.value = false;
  }
};
fetchConfigData();

const handleSaveConfig = async () => {
  try {
    await patch("/system/security/", configData.value);
    // Hiển thị thông báo thành công (có thể sử dụng thư viện thông báo nếu có)
    successToast("Cấu hình đã được lưu thành công!");
  } catch (error) {
    console.error("Error saving config data:", error);
    errorToast("Lưu cấu hình thất bại. Vui lòng thử lại.");
  }
};

// Độ dài mật khẩu
const PasswordLengthChoices = [
  { value: 8, label: "8 ký tự" },
  { value: 10, label: "10 ký tự" },
  { value: 12, label: "12 ký tự" },
  { value: 16, label: "16 ký tự" },
];

// Session timeout (phút)
const SessionTimeoutChoices = [
  { value: 15, label: "15 phút" },
  { value: 30, label: "30 phút" },
  { value: 45, label: "45 phút" },
  { value: 60, label: "60 phút" },
];

// // Refresh token expiry (ngày)
// const RefreshTokenExpiryChoices = [
//   { value: 7, label: "7 ngày" },
//   { value: 15, label: "15 ngày" },
//   { value: 30, label: "30 ngày" },
// ];

// // Số lần đăng nhập sai tối đa
// const MaxFailedLoginChoices = [
//   { value: 3, label: "3 lần" },
//   { value: 5, label: "5 lần" },
//   { value: 10, label: "10 lần" },
// ];

// // Thời gian khóa tài khoản (phút)
// const AccountLockoutDurationChoices = [
//   { value: 15, label: "15 phút" },
//   { value: 30, label: "30 phút" },
//   { value: 60, label: "60 phút" },
// ];
</script>

<template>
  <ConfigSystem>
    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Đang tải cấu hình...</p>
    </div>

    <!-- Security Config Forms -->
    <template v-else-if="isSystemTab">
      <AccordionRecord :title="`Cấu hình ${activeTab.name}`">
        <div class="p-3">
          <div class="config-form">
            <div class="mb-4">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">
                      <i class="ri-list-check-2 me-1"></i>
                      Độ dài mật khẩu tối thiểu
                    </label>
                    <select
                      class="form-select"
                      v-model="configData.password_length"
                    >
                      <option value="" disabled>Chọn số lượng</option>
                      <option
                        v-for="option in PasswordLengthChoices"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </option>
                    </select>
                    <div class="form-text text-muted">
                      Người dùng cần đặt mật khẩu có độ dài tối thiểu là
                      <span class="text-danger">{{
                        configData.password_length
                      }}</span>
                      ký tự
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">
                      <i class="ri-list-check-2 me-1"></i>
                      Thời gian hết phiên (phút)
                    </label>
                    <select
                      class="form-select"
                      v-model="configData.session_timeout_minutes"
                    >
                      <option value="" disabled>Chọn số lượng</option>
                      <option
                        v-for="option in SessionTimeoutChoices"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </option>
                    </select>
                    <div class="form-text text-muted">
                      Phiên đăng nhập sẽ tự động hết hạn sau
                      <span class="text-danger">{{
                        configData.session_timeout_minutes
                      }}</span>
                      phút & tự động cập nhật phiên mới nếu còn hiệu lực của
                      token
                    </div>
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label">
                      <i class="ri-list-check-2 me-1"></i>
                      Các ký tự cấm trong mật khẩu
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="configData.password_exclude_characters"
                    />
                    <div class="form-text text-muted">
                      Người dùng không thể đặt mật khẩu chứa các ký tự cấm này:
                      <span class="text-danger">{{
                        configData.password_exclude_characters
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AccordionRecord>
      <Teleport to="#toolbar-config-home">
        <!-- Action buttons -->
        <div class="d-flex gap-2 justify-content-end">
          <ButtonIcon
            type="danger"
            name="Làm mới"
            classIcon="las la-undo-alt me-2"
            @click="fetchConfigData"
          />
          <ButtonIcon
            @click="handleSaveConfig()"
            type="primary"
            classIcon="ri-save-line"
            name="Lưu cấu hình"
          />
        </div>
      </Teleport>
    </template>
  </ConfigSystem>
</template>
