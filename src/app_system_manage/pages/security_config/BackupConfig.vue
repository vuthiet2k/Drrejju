<script setup>
import { ref } from "vue";
import API from "@/helpers/api/useAxios.js";

import ConfigSystem from "../../layout/ConfigSystem.vue";
import AccordionRecord from "@/base/components/dtwinUI/AccordionInfor.vue";
import ButtonIcon from "@/base/components/baseUI/ButtonIcon.vue";

const { get, patch } = API();

/**
 * =========================
 * State
 * =========================
 */
const backupData = ref({
  id: null,
  name: "backup_database",
  config: {
    enabled: false,
    time: "02:00",
    cycle: "DAILY",
    retention_days: 7,
    max_files: 10,
  },
  created_date: null,
  updated_date: null,
});

const isLoading = ref(false);

/**
 * =========================
 * Choices
 * =========================
 */
const CycleChoices = [
  { value: "DAILY", label: "Hàng ngày" },
  { value: "WEEKLY", label: "Hàng tuần" },
  { value: "MONTHLY", label: "Hàng tháng" },
];

/**
 * =========================
 * Fetch config
 * =========================
 */
const fetchBackupData = async () => {
  isLoading.value = true;
  try {
    const response = await get("backup-database-config/");
    backupData.value = {
      ...backupData.value,
      ...response,
      config: {
        ...backupData.value.config,
        ...response?.config,
      },
    };
  } finally {
    isLoading.value = false;
  }
};

fetchBackupData();

/**
 * =========================
 * Save config
 * =========================
 */
const saveBackupData = async () => {
  const { enabled, time, retention_days, max_files } = backupData.value.config;

  if (enabled && !time) {
    return alert("Vui lòng chọn thời gian chạy sao lưu");
  }

  if (retention_days <= 0 || max_files <= 0) {
    return alert("Số ngày giữ file và số file phải lớn hơn 0");
  }

  await patch(
    `backup-database-config/`,
    { config: backupData.value.config },
    "Lưu cấu hình sao lưu thành công!",
    "Lưu cấu hình sao lưu thất bại"
  );
};
</script>

<template>
  <ConfigSystem>
    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Đang tải cấu hình sao lưu...</p>
    </div>

    <template v-else>
      <AccordionRecord title="Cấu hình Sao lưu tự động">
        <div class="p-3">
          <div class="row">
            <!-- Enable / Disable -->
            <div class="col-md-6 mb-3">
              <label class="form-label d-flex align-items-center gap-2">
                <input
                  type="checkbox"
                  class="form-check-input"
                  v-model="backupData.config.enabled"
                />
                <span>Bật sao lưu tự động</span>
              </label>
            </div>

            <!-- Time -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Thời gian chạy</label>
              <input
                type="time"
                class="form-control"
                v-model="backupData.config.time"
                :disabled="!backupData.config.enabled"
              />
            </div>

            <!-- Cycle -->
            <div class="col-md-12 mb-3">
              <label class="form-label">Chu kỳ sao lưu</label>
              <select
                class="form-select"
                v-model="backupData.config.cycle"
                :disabled="!backupData.config.enabled"
              >
                <option
                  v-for="c in CycleChoices"
                  :key="c.value"
                  :value="c.value"
                >
                  {{ c.label }}
                </option>
              </select>
            </div>

            <!-- Retention days -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Số ngày giữ file</label>
              <input
                type="number"
                min="1"
                class="form-control"
                v-model.number="backupData.config.retention_days"
              />
            </div>

            <!-- Max files -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Số file tối đa</label>
              <input
                type="number"
                min="1"
                class="form-control"
                v-model.number="backupData.config.max_files"
              />
            </div>

            <!-- Description -->
            <div class="col-12">
              <small class="text-muted">
                Hệ thống sẽ tự động sao lưu cơ sở dữ liệu theo cấu hình trên.
                Các file sao lưu cũ sẽ được tự động xoá khi vượt quá giới hạn.
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
            @click="fetchBackupData"
          />
          <ButtonIcon
            type="primary"
            name="Lưu cấu hình"
            classIcon="ri-save-line"
            @click="saveBackupData"
          />
        </div>
      </Teleport>
    </template>
  </ConfigSystem>
</template>
