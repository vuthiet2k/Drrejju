<script setup>
// Faithful clone of thaihai.metatwin.vn footer (Velzon custom-footer bg-primary).
import { useTenant } from '../common/tenant'

const { site: SITE, routeNames: RN } = useTenant()
</script>

<template>
  <footer class="custom-footer bg-primary py-5">
    <div class="container">
      <div class="row">
        <div class="col-lg-12">
          <div class="border-0">
            <div class="hstack gap-3 mb-3 flex-wrap">
              <router-link :to="{ name: RN.home }" class="text-white">
                <i class="ri-home-4-line align-bottom me-1"></i> Trang chủ
              </router-link>
              <div class="vr"></div>
              <a href="#" class="text-white">Điều khoản</a>
              <div class="vr"></div>
              <a href="#" class="text-white">Chính sách</a>
              <div class="vr"></div>
              <a href="#" class="text-white">Đăng nhập</a>
            </div>
            <div class="card-body pb-0">
              <h5 class="text-white fs-16 text-uppercase">{{ SITE.name }}</h5>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card-body pt-0">
            <p v-if="SITE.address" class="mb-1">Địa chỉ: {{ SITE.address }}</p>
            <p v-if="SITE.phone" class="mb-1">Điện thoại: {{ SITE.phone }}</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
