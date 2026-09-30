<template>
  <UpdateProfile
    @closeEdit="() => (isEditing = false)"
    v-if="isEditing"
  ></UpdateProfile>
  <b-row class="g-3" v-else>
    <b-col lg="3">
      <AccordionInfor :disabled="true" title="Ảnh đại diện">
        <!-- <Photo :currentPhoto="infoUser.photo"></Photo> -->
        <div class="d-flex justify-content-center">
          <div
            style="width: 150px"
            class="profile-user position-relative d-inline-block mx-auto"
          >
            <Image
              :src="infoUser.photo"
              fallback="user"
              class="rounded-circle avatar-xl img-thumbnail user-profile-image"
              alt="user-profile-image"
            />
          </div>
        </div>
      </AccordionInfor>
    </b-col>
    <b-col lg="9">
      <AccordionInfor :disabled="true" title="Thông tin cá nhân">
        <template #icon>
          <a
            href="javascript:void(0)"
            class="btn btn-warning btn-icon waves-effect waves-light"
            @click="toggleEdit"
            style="pointer-events: all"
          >
            <i :class="isEditing ? 'ri-close-line' : 'ri-edit-box-line'"></i>
          </a>
        </template>
        <div class="table-responsive">
          <table class="table table-borderless mb-0">
            <tbody>
              <tr>
                <th class="ps-0 fw-normal" style="width: 40%" scope="row">
                  Họ và tên:
                </th>
                <td class="text-muted">
                  {{ infoUser?.first_name || "_" }}
                  {{ infoUser?.last_name || "_" }}
                </td>
              </tr>
              <tr>
                <th class="ps-0 fw-normal" scope="row">Giới tính:</th>
                <td class="text-muted">
                  {{
                    infoUser?.gender === 0
                      ? "Nam"
                      : infoUser?.gender === 1
                      ? "Nữ"
                      : "_"
                  }}
                </td>
              </tr>
              <tr>
                <th class="ps-0 fw-normal" scope="row">Ngày sinh:</th>
                <td class="text-muted">
                  {{ infoUser?.birth ? formatDate(infoUser?.birth) : "_" }}
                </td>
              </tr>
              <tr>
                <th class="ps-0 fw-normal" scope="row">Ngày tham gia:</th>
                <td class="text-muted">
                  {{
                    infoUser?.date_joined
                      ? new Date(infoUser?.date_joined).toLocaleDateString(
                          "en-GB"
                        )
                      : "_"
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AccordionInfor>

      <AccordionInfor :disabled="true" title="Thông tin định danh">
        <div class="row g-3">
          <div class="col-6">
            <div class="table-responsive">
              <table class="table table-borderless mb-0">
                <tbody>
                  <tr>
                    <th class="ps-0 fw-normal" style="width: 40%" scope="row">
                      CCCD/CMND:
                    </th>
                    <td class="text-muted">01234567890</td>
                  </tr>
                  <tr>
                    <th class="ps-0 fw-normal" scope="row">Hộ chiếu:</th>
                    <td class="text-muted">
                      {{ "0123456789" }}
                    </td>
                  </tr>
                  <tr>
                    <th class="ps-0 fw-normal" scope="row">Quê quán:</th>
                    <td class="text-muted">
                      {{ "_" }}
                    </td>
                  </tr>
                  <tr>
                    <th class="ps-0 fw-normal" scope="row">Nơi thường trú:</th>
                    <td class="text-muted">
                      {{ "_" }}
                    </td>
                  </tr>
                  <tr>
                    <th class="ps-0 fw-normal" scope="row">Nơi ở hiện nay:</th>
                    <td class="text-muted">
                      {{ "_" }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="col-6">
            <DocumentExtraction
              :disabled="true"
              @read="() => {}"
            ></DocumentExtraction>
          </div>
        </div>
      </AccordionInfor>

      <AccordionInfor :disabled="true" title="Thông tin liên hệ">
        <div class="table-responsive">
          <table class="table table-borderless mb-0">
            <tbody>
              <tr>
                <th class="ps-0 fw-normal" scope="row">Điện thoại:</th>
                <td class="text-muted">
                  {{ infoUser?.phone || "_" }}
                </td>
              </tr>
              <tr>
                <th class="ps-0 fw-normal" scope="row">Email:</th>
                <td class="text-muted">
                  {{ infoUser?.email || "_" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AccordionInfor>
    </b-col>
  </b-row>
</template>

<script setup>
import { ref, defineProps, computed } from "vue";
import DocumentExtraction from "@/base/components/document-extraction/DocumentExtraction.vue";
import AccordionInfor from "@/base/components/dtwinUI/AccordionInfor.vue";
import UpdateProfile from "./UpdateProfile.vue";
import Image from "@/base/components/image/Image.vue";

// Props
const props = defineProps({
  infoUser: {
    type: Object,
    required: true,
  },
});
// Refs
const isEditing = ref(false);

const infoUser = computed(() => props.infoUser);

// Methods
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-GB");
};
const toggleEdit = () => {
  isEditing.value = !isEditing.value;
};
</script>
