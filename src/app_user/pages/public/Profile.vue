<script setup>
import { inject } from "vue";
import OverviewTab from "./cms/tabs/OverviewTab.vue";
import AccordionInfor from "@/base/components/dtwinUI/AccordionInfor.vue";
import PaginationUI from "@/base/components/baseUI/PaginationUI.vue";

// Inject
const infoUser = inject("user");

const devices = [
  {
    icon: "/img/profile/Icon-Desktop-Windows.svg",
    name: "Windows 10 • Desktop",
    location: "",
    accessTime: "14:23, 13 Tháng 10 2025",
    ip: "14.238.142.74",
  },
  {
    icon: "/img/profile/Icon-Desktop-Windows.svg",
    name: "Windows 10 • Desktop",
    location: "",
    accessTime: "19:52, 12 Tháng 10 2025",
    ip: "27.70.5.194",
  },
  {
    icon: "/img/profile/Icon-Desktop-Windows.svg",
    name: "Windows 10 • Desktop",
    location: "Hà Nội, Việt Nam",
    accessTime: "13:51, 28 Tháng 8 2025",
    ip: "183.91.6.225",
  },
  {
    icon: "/img/profile/Icon-Desktop-Windows.svg",
    name: "Windows 10 • Desktop",
    location: "Hà Nội, Việt Nam",
    accessTime: "14:22, 30 Tháng 7 2025",
    ip: "118.70.13.70",
  },
];

const activityLogs = [
  {
    time: "14:23, 13 Tháng 10 2025",
    action: "Đăng nhập thành công",
    actionIcon: "ri-login-box-line",
    status: "success",
    statusColor: "success",
    software: "TIN A",
    ip: "14.238.142.74",
    device: "Windows 10 • Desktop",
    deviceIcon: "ri-computer-line",
  },
  {
    time: "19:52, 12 Tháng 10 2025",
    action: "Đăng nhập thành công",
    actionIcon: "ri-login-box-line",
    status: "success",
    statusColor: "success",
    software: "TIN A",
    ip: "27.70.5.194",
    device: "Windows 10 • Desktop",
    deviceIcon: "ri-computer-line",
  },
  {
    time: "19:51, 12 Tháng 10 2025",
    action: "Đăng nhập thất bại",
    actionIcon: "ri-close-circle-line",
    status: "failed",
    statusColor: "danger",
    software: "TIN A",
    ip: "27.70.5.194",
    device: "Windows 10 • Desktop",
    deviceIcon: "ri-computer-line",
  },
  {
    time: "13:51, 28 Tháng 8 2025",
    action: "Đổi mật khẩu",
    actionIcon: "ri-key-2-line",
    status: "info",
    statusColor: "info",
    software: "TIN A",
    ip: "183.91.6.225",
    device: "Windows 10 • Desktop",
    deviceIcon: "ri-computer-line",
  },
];

</script>

<template>
  <BTabs
    navClass="nav nav-pills animation-nav profile-nav gap-2 gap-lg-3 flex-grow-1"
    contentClass="text-muted mt-3"
    pills
  >
    <BTab class="nav-link fs-14" title="Thông tin" active>
      <TabPanel value="information">
        <OverviewTab :infoUser="infoUser" />
      </TabPanel>
    </BTab>
    <BTab class="nav-link fs-14" title="Hoạt động">
      <TabPanel value="activity">
        <b-row class="g-3">
          <b-col lg="5">
            <AccordionInfor :disabled="true" title="Thiết bị đã đăng nhập">
              <template #icon>
                <button
                  type="button"
                  class="btn text-nowrap btn-soft-primary btn-sm"
                >
                  Đăng xuất
                </button>
              </template>
              <div
                v-for="(device, index) in devices"
                :key="index"
                class="d-flex align-items-center mb-3"
              >
                <div class="flex-shrink-0 avatar-sm">
                  <div
                    class="avatar-title bg-light text-primary rounded-3 fs-18"
                  >
                    <i class="ri-tablet-line"></i>
                  </div>
                </div>
                <div class="flex-grow-1 ms-3">
                  <h6>
                    {{ device.name }}
                  </h6>
                  <p class="text-muted mb-0">
                    {{ device.location ?? "Không xác định" }}
                  </p>
                </div>
                <div>
                  <a href="javascript:void(0);">Đăng xuất</a>
                </div>
              </div>
            </AccordionInfor>
          </b-col>
          <b-col lg="7">
            <AccordionInfor :disabled="true" title="Nhật ký hoạt động">
              <template #icon>
                <button
                  type="button"
                  class="btn text-nowrap btn-soft-primary btn-sm"
                >
                  Lọc
                </button>
              </template>
              <div class="table-responsive">
                <table class="table table-hover align-middle table-nowrap mb-0">
                  <thead class="">
                    <tr>
                      <th class="ps-3">Thời gian</th>
                      <th>Hành động</th>
                      <th>Phần mềm</th>
                      <th>IP</th>
                      <th class="pe-3">Thiết bị</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(log, index) in activityLogs" :key="index">
                      <td class="ps-3">
                        <small class="text-muted">{{ log.time }}</small>
                      </td>
                      <td>
                        <div class="d-flex align-items-center">
                          <i
                            :class="[
                              log.actionIcon,
                              `text-${log.statusColor} me-2`,
                            ]"
                          ></i>
                          <span
                            :class="`badge bg-${log.statusColor}-subtle text-${log.statusColor}`"
                          >
                            {{ log.action }}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span class="fw-medium">{{ log.software }}</span>
                      </td>
                      <td>
                        <code class="text-muted">{{ log.ip }}</code>
                      </td>
                      <td class="pe-3">
                        <div class="d-flex align-items-center">
                          <i :class="[log.deviceIcon, 'me-2 text-muted']"></i>
                          <small class="text-muted">{{ log.device }}</small>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="card-footer text-end border-top-0">
                <PaginationUI></PaginationUI>
              </div>
            </AccordionInfor>
          </b-col>
        </b-row>
      </TabPanel>
    </BTab>
  </BTabs>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
