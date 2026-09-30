<template>
  <div
    class="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100"
  >
    <div class="bg-overlay"></div>
    <div class="auth-page-content overflow-hidden pt-lg-5">
      <b-container>
        <b-row>
          <b-col lg="12">
            <b-card no-body class="overflow-hidden">
              <b-row class="g-0">
                <!-- Left Side - Background & Logo -->
                <b-col lg="6">
                  <div class="p-lg-5 p-4 h-100">
                    <div class="d-none d-lg-block">
                      <div
                        class="bg-overlay bg-center d-flex align-items-center"
                      >
                        <img :src="BackgrounImage" alt="" style="width: 100%" />
                      </div>
                    </div>
                    <div class="bg-overlay bg-auth"></div>
                    <div class="d-none d-lg-block">
                      <div
                        class="bg-overlay bg-center d-flex align-items-center justify-content-center bg-auth-logo"
                      >
                        <!-- <img :src="Logo80Years" alt="" style="width: 50%" /> -->
                      </div>
                    </div>
                    <div class="position-relative h-100 d-flex flex-column">
                      <div class="mb-0 mb-lg-4 d-flex">
                        <router-link :to="{ path: '/' }" class="d-block">
                          <Image
                            :src="ConfigSystem.logo"
                            fallback="logo"
                            alt=""
                            height="40"
                          />
                        </router-link>
                        <h2
                          class="d-flex flex-column align-items-center justify-content-center mx-auto title-login"
                        >
                          <span class="text-uppercase"
                            >Bộ Ngoại Giao Việt Nam
                          </span>
                          <span class="fs-18 sub-title-mofa"
                            >Ministry of foreign Affairs of Viet Nam</span
                          >
                        </h2>
                      </div>
                      <div class="mt-auto">
                        <!-- Content for left side can be added via slot if needed -->
                        <slot name="left-content"></slot>
                      </div>
                    </div>
                  </div>
                </b-col>

                <!-- Right Side - Main Content -->
                <b-col lg="6">
                  <div
                    class="p-lg-5 p-4 h-100 d-flex flex-column"
                    style="min-height: 450px"
                  >
                    <slot></slot>
                    <router-view />
                  </div>
                </b-col>
              </b-row>
            </b-card>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
import { ConfigSystem } from "@/base/store/api/server_api";
import Image from "@/base/components/image/Image.vue";
import BackgrounImage from "@/assets/auth/digital-world-map-pixe.png";
// import Logo80Years from "@/assets/auth/Logo_80_year.png"; // tạm bỏ: ảnh 5.32MB nặng bundle

export default {
  name: "AuthLayout",
  components: {
    Image,
  },
  data() {
    return {
      ConfigSystem: ConfigSystem,
      BackgrounImage,
      // Logo80Years, // tạm bỏ cùng import Logo_80_year.png ở trên
    };
  },
};
</script>

<style scoped>
.bg-auth {
  background: linear-gradient(to bottom, #94b5de, #4b71b7);
}
.bg-center {
  background-color: transparent;
}
.bg-auth-logo {
  opacity: 1;
}
.auth-bg-cover {
  background: transparent;
  height: 100vh;
}
.title-login {
  color: #fff;
  text-align: center;
  text-transform: uppercase;
  font-weight: 900;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.75);
  z-index: 1;
}
@media (max-width: 1199.98px) {
  .sub-title-mofa {
    font-size: 15px !important;
  }
}
</style>
