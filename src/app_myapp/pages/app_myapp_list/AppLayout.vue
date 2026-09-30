<script setup>
import LayoutPortal from "@/base/layouts/LayoutPortal.vue";
import { applications, isLoadingApp } from "@/helpers/user/applications.js";
// import BackgrounImage from "@/assets/auth/digital-world-map-pixe.png";
import BackgrounImage from "@/assets/auth/Logo_bng.jpg";

// import Logo80Years from "@/assets/auth/Logo_80_year.png";
</script>

<template>
  <LayoutPortal isSticky isLight>
    <div class="position-relative" style="z-index: 0">
      <section
        class="section counting-section bg-auth align-content-center"
        style="min-height: 100vh"
      >
        <div class="container">
          <!-- Background overlay -->
          <div
            class="position-absolute top-0 start-0 w-100 h-100 bg-overlay-pattern"
            style="z-index: -1"
          >
            <div
              class="bg-overlay bg-transparent bg-center d-flex align-items-center h-100"
            >
              <img
                :src="BackgrounImage"
                alt="background"
                style="width: 100%; object-fit: contain"
              />
            </div>
            <!-- <div
              class="bg-overlay opacity-100 bg-transparent bg-center d-flex align-items-center justify-content-center bg-auth-logo h-100"
            >
              <img :src="Logo80Years" alt="logo" style="width: 40%" />
            </div> -->
          </div>
          <div class="">
            <div
              class="mt-5"
              v-for="(application, index) in applications"
              :key="index"
            >
              <h4 class="section-title text-primary mb-3 text-uppercase">
                {{ application.title }}
              </h4>
              <b-row
                class="row-cols-xxl-5 row-cols-xl-4 row-cols-lg-3 row-cols-md-2 row-cols-1"
              >
                <b-col v-for="(ungdung, i) in application.listPage" :key="i">
                  <router-link :to="`/${ungdung.path}`">
                    <b-card
                      no-body
                      class="card-height-100 cursor-pointer card-animate ribbon-box"
                    >
                      <div
                        class="ribbon-two ribbon-two-danger"
                        v-if="ungdung.meta.backendOnly"
                      >
                        <span>Backend only</span>
                      </div>
                      <b-card-body class="text-center py-4">
                        <i
                          class="display-6 text-primary"
                          :class="ungdung.meta.icon"
                        ></i>
                        <h5 class="mt-4">{{ ungdung.meta.name }}</h5>
                      </b-card-body>
                    </b-card>
                  </router-link>
                </b-col>
              </b-row>
            </div>
            <div
              v-if="!applications.length && !isLoadingApp"
              class="text-center p-3"
            >
              <h4 class="text-white">
                KHÔNG ĐƯỢC QUYỀN TRUY CẬP ỨNG DỤNG NÀO!
              </h4>
            </div>
            <div
              v-if="!applications.length && isLoadingApp"
              class="text-center p-3"
            >
              <h4 class="text-white">ĐANG TẢI ỨNG DỤNG ...!</h4>
            </div>
            <div class="mt-5 w-100 text-center">
              <router-link
                to="/"
                class="btn btn-secondary w-lg waves-effect waves-light"
              >
                <i class="ri-arrow-left-line me-2 fw-semibold align-bottom"></i>
                Trang chủ
              </router-link>
            </div>
          </div>
        </div>
      </section>
    </div>
  </LayoutPortal>
</template>

<style lang="scss" scoped>
.navbar {
  @media (min-width: 992px) {
    &.is-sticky {
      .user {
        svg {
          path {
            fill: var(--vz-dark);
          }
        }
      }
    }
  }
}
.page-content {
  padding: 0;
}
.container-fluid {
  margin: 0;
}
.section {
  padding: 48px 0;
  position: relative;
}

.row-cols-xxl-5.row-cols-xl-4 > .col {
  padding-right: 8px !important;
  padding-left: 8px !important;
}

.bg-auth {
  /* background-image: url("../assets/bg_login3.jpg"); */
  background: linear-gradient(to bottom, white, var(--vz-primary)) !important;
  z-index: -2;
}
</style>
