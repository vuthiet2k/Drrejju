<script setup>
import { SimpleBar } from "simplebar-vue3";
import { applications } from "@/helpers/user/applications.js";
</script>

<template>
  <div class="dropdown-menu dropdown-menu-lg p-0 m-0 dropdown-menu-end">
    <div class="p-3">
      <b-row class="align-items-center">
        <b-col>
          <h6 class="m-0 text-uppercase fw-bold">Ứng dụng</h6>
        </b-col>
      </b-row>
    </div>
    <SimpleBar
      style="max-height: 60vh; overflow-x: hidden"
      class="w-100 bg-white"
    >
      <div class="p-2 pt-0">
        <template v-if="applications.length">
          <div
            v-for="(typeApp, indexTypeApp) in applications"
            :key="indexTypeApp"
          >
            <b-row class="g-0 bg-white rounded-3 bg-opacity-75">
              <template v-if="typeApp.listPage.length <= 5">
                <b-col
                  class="col-4"
                  v-for="(app, indexApp) in typeApp.listPage"
                  :key="indexApp"
                >
                  <router-link :to="{ path: `/${app.path}` }">
                    <div class="dropdown-icon-item">
                      <i
                        class="display-6 text-primary"
                        :class="app?.meta.icon"
                      ></i>
                      <span class="mx-2" v-html="app?.meta?.name"></span>
                    </div>
                  </router-link>
                </b-col>
              </template>
              <template v-else>
                <b-col
                  class="col-4"
                  v-for="item in Math.min(typeApp.listPage?.length || 0, 5)"
                  :key="item"
                  md="4"
                >
                  <router-link
                    :to="{ path: `/${typeApp.listPage[item - 1].path}` }"
                  >
                    <div class="dropdown-icon-item">
                      <i
                        class="display-6 text-primary"
                        :class="typeApp.listPage[item - 1]?.meta.icon"
                      ></i>
                      <span
                        class="mx-2"
                        v-html="typeApp.listPage[item - 1]?.meta?.name"
                      ></span>
                    </div>
                  </router-link>
                </b-col>
                <b-col class="col-4" md="4">
                  <router-link :to="{ name: 'AppsPage' }">
                    <div class="dropdown-icon-item">
                      <i class="display-6 text-primary"></i>
                      <img src="@/assets/images/icon/apps/more.png" />
                      <span class="mx-2">Xem thêm</span>
                    </div>
                  </router-link>
                </b-col>
              </template>
            </b-row>
            <div class="border-dashed border-0 border-bottom">
              <div
                class="row align-items-center"
                style="border-bottom: 1px dotted #d5b9b9"
              >
                <!-- <div class="col">
                  <h6 class="m-0 text-uppercase text-success">
                    {{ typeApp.title }}
                  </h6>
                </div> -->
              </div>
            </div>
          </div>
        </template>
        <p v-else>Bạn không có quyền truy cập vào ứng dụng nào!</p>
      </div>
    </SimpleBar>
  </div>
</template>

<style scoped>
.dropdown-menu-lg {
  width: calc(100vw - 65px);
}
.dropdown-menu {
  background-color: #d9e9f5;
}

@media (min-width: 600px) {
  .dropdown-menu-lg {
    width: 380px;
  }
}
</style>
