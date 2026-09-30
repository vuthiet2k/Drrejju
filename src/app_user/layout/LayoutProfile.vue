<script setup>
import { inject } from "vue";
import Image from "@/base/components/image/Image.vue";
import CoverImage from "@/assets/images/nft/bg-home.jpg";
// import { CompanyInfor } from "@/helpers/user/company.js";

const infoUser = inject("user");
</script>

<template>
  <div class="">
    <div class="p-3 profile-foreground position-relative">
      <div class="profile-wid-bg">
        <Image
          :fallback="CoverImage"
          :src="infoUser.cover_img"
          alt=""
          class="profile-wid-img"
          style="opacity: 0.5"
        />
      </div>
    </div>
    <div class="p-3 profile-wrapper">
      <b-row class="g-4">
        <b-col lg="auto">
          <div class="profile-user position-relative d-inline-block mx-auto">
            <Image
              fallback="user"
              :src="infoUser?.photo"
              class="rounded-circle avatar-md img-thumbnail user-profile-image"
              alt="user-profile-image"
              style="width: 4rem; height: 4rem"
            />
          </div>
        </b-col>
        <b-col>
          <div class="p-2">
            <h5 class="text-white mb-1">
              {{ infoUser?.first_name }} {{ infoUser?.last_name }}
            </h5>
            <!-- <p class="text-white-75">{{ userKCN.name_display }}</p> -->
            <div class="hstack text-white-50 gap-1">
              <div>
                <i
                  class="ri-building-line me-1 text-white-75 fs-16 align-middle"
                ></i>
                {{ infoUser?.department?.name || "_" }}
              </div>
            </div>
          </div>
        </b-col>
      </b-row>
    </div>
    <b-row class="p-3">
      <b-col lg="12">
        <div class="pb-5">
          <slot></slot>
        </div>
      </b-col>
    </b-row>
  </div>
</template>
