<script setup>
import { ref, inject } from "vue";
import AccordionInfor from "@/base/components/dtwinUI/AccordionInfor.vue";

const isConfirmed = ref(false);
const infoUser = inject("user");
const userFacebook = "";
const userGitHub = "";
</script>

<template>
  <div class="">
    <div class="row g-3 pb-5">
      <div class="col-xxl-5">
        <AccordionInfor title="Thông tin đăng nhập">
          <div class="table-responsive">
            <table class="table table-hover align-middle table-nowrap mb-0">
              <tbody>
                <tr>
                  <th class="text-muted fw-normal" scope="row">Điện thoại:</th>
                  <td class="">
                    {{ infoUser?.phone || "_" }}
                  </td>
                </tr>
                <tr>
                  <th class="text-muted fw-normal" scope="row">Email:</th>
                  <td class="">
                    {{ infoUser?.email || "_" }}
                  </td>
                </tr>
                <tr>
                  <th class="text-muted fw-normal" scope="row">Mật khẩu:</th>
                  <td class="">*********</td>
                </tr>
                <tr>
                  <th class="text-muted fw-normal" scope="row">
                    Xác thực 2 yếu tố:
                  </th>
                  <td class="">Đang tắt</td>
                </tr>
              </tbody>
            </table>
          </div>
        </AccordionInfor>

        <AccordionInfor title="Tài khoản liên kết">
          <b-row>
            <b-col cols="6">
              <div class="d-flex mt-2">
                <div class="flex-shrink-0 avatar-xs align-self-center me-3">
                  <div class="avatar-title rounded bg-primary text-white">
                    <i class="ri-facebook-fill fs-16"></i>
                  </div>
                </div>
                <div class="flex-grow-1 overflow-hidden">
                  <p class="mb-0 fs-13">Facebook :</p>
                  <a
                    v-if="userFacebook !== ''"
                    :href="userFacebook || '#'"
                    class="text-info text-decoration-underline"
                  >
                    {{ userFacebook || "Chưa liên kết" }}
                  </a>
                </div>
              </div>
            </b-col>
            <b-col cols="6">
              <div class="d-flex mt-2">
                <div class="flex-shrink-0 avatar-xs align-self-center me-3">
                  <div class="avatar-title rounded bg-dark text-light">
                    <i class="ri-github-fill fs-16"></i>
                  </div>
                </div>
                <div class="flex-grow-1 overflow-hidden">
                  <p class="mb-0 fs-13">Github :</p>
                  <a
                    v-if="userGitHub !== ''"
                    :href="userGitHub || '#'"
                    class="text-info text-decoration-underline"
                  >
                    {{ userGitHub || "Chưa liên kết" }}
                  </a>
                </div>
              </div>
            </b-col>
          </b-row>
        </AccordionInfor>
      </div>

      <div class="col-xxl-7">
        <AccordionInfor title="Xóa tài khoản">
          <div class="table-responsive">
            <table class="table table-borderless mb-0">
              <tbody>
                <tr>
                  <td class="p-3">
                    <div class="d-flex align-items-start">
                      <i class="ri-alert-line text-warning fs-18 me-3 mt-1"></i>
                      <div>
                        <p class="text-muted mb-2">
                          <strong class="text-primary">Cảnh báo:</strong> Khi
                          xóa tài khoản bạn sẽ không truy cập và sử dụng được
                          <span v-if="false">các sản phẩm của DTWIN</span>. Nếu bạn là quản trị hệ thống
                          thì cần bàn giao quyền quản trị cho người khác trước
                          khi xóa tài khoản.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="p-3 pt-0">
                    <div class="form-check d-flex align-items-center gap-2">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        v-model="isConfirmed"
                      />
                      <label class="form-check-label text-primary fw-medium">
                        Tôi hiểu và chắc chắn muốn xóa tài khoản
                      </label>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="p-3 pt-2">
                    <button class="btn btn-primary" :disabled="!isConfirmed">
                      <i class="ri-delete-bin-line me-2"></i>
                      Xóa tài khoản vĩnh viễn
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </AccordionInfor>
      </div>
      <!-- end col -->
    </div>
  </div>
</template>
