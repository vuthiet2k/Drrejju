<template>
  <footer class="custom-footer h-auto text-start pb-3">
    <div class="container">
      <div class="hstack gap-3 flex-wrap footer__menu">
        <a href="#" class="text-white"><i class="ri-home-4-line align-bottom me-1"></i> Trang
          chủ</a>
        <div class="vr"></div>
        <router-link to="#" class="text-white">Điều khoản</router-link>
        <div class="vr"></div>
        <router-link to="#" class="text-white">Chính sách</router-link>

      </div>
      <h5 class="text-white fs-16 text-uppercase footer__title mb-0 pb-0">{{ ConfigSystem.config.title_vn }}</h5>
      <p>{{ ConfigSystem.config.title_en }}</p>
      <div class="row">
        <div class="col-lg-6">
          <div class="card-body footer__content">
            <!-- <p>
              <i class="mdi mdi-office-building-cog-outline me-1 align-bottom"></i>
              Đơn vị phát triển: 0000
            </p> -->
            <p><i class="ri-map-pin-line me-1 align-bottom"></i> Địa chỉ: {{ ConfigSystem.config.contact.address }}</p>
            <p><i class="ri-phone-line me-1 align-bottom"></i> Điện thoại: {{ ConfigSystem.config.contact.phone }}</p>
            <p><i class="ri-printer-line align-bottom"></i> Fax: {{ ConfigSystem.config.contact.fax }}</p>
            <p><i class="mdi mdi-email me-1 align-bottom"></i> Email: {{ ConfigSystem.config.contact.email }}</p>
            <p><i class="mdi mdi-web me-1 align-bottom"></i> Website: {{ ConfigSystem.config.contact.website }}</p>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="email-form">
            <div class="subscribe">
              <input type="text" class="form-control" placeholder="Đăng ký để nhận thông tin mới nhất"
                v-model="userEmail">
              <button class="btn btn-danger">Đăng ký</button>
            </div>
          </div>
        </div>
      </div>
      <div class="copyright">
        <p class="copy-rights" v-if="false">
          {{ new Date().getUTCFullYear() }} © DTwin Team
        </p>
        <div class="card-body text-sm-end social__container">
          <ul class="list-inline mb-0 footer-social-link">
            <li class="list-inline-item">
              <a href="javascript: void(0);" class="avatar-xs d-block">
                <div class="avatar-title rounded-circle">
                  <i class="ri-facebook-fill"></i>
                </div>
              </a>
            </li>
            <li class="list-inline-item">
              <a href="javascript: void(0);" class="avatar-xs d-block">
                <div class="avatar-title rounded-circle">
                  <i class="ri-github-fill"></i>
                </div>
              </a>
            </li>
            <li class="list-inline-item">
              <a href="javascript: void(0);" class="avatar-xs d-block">
                <div class="avatar-title rounded-circle">
                  <i class="ri-linkedin-fill"></i>
                </div>
              </a>
            </li>
            <li class="list-inline-item">
              <a href="javascript: void(0);" class="avatar-xs d-block">
                <div class="avatar-title rounded-circle">
                  <i class="ri-google-fill"></i>
                </div>
              </a>
            </li>
            <!-- <li class="list-inline-item">
              <a href="javascript: void(0);" class="avatar-xs d-block">
                <div class="avatar-title rounded-circle">
                  <i class="ri-dribbble-line"></i>
                </div>
              </a>
            </li> -->
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
/* eslint-disable */
import { ConfigSystem } from "@/base/store/api/server_api";

</script>

<style lang="scss" scoped>
footer {
  font-weight: 500;
  position: relative;
  padding: 36px 0;
  background-color: #003d59;

  &::before {
    content: none;
  }

  .footer__menu {
    margin-bottom: 2em;
  }

  .footer__title {
    margin-bottom: 16px;
  }

  .footer__content p {
    padding: 6px 0;
    margin-bottom: 0;
  }

  .copyright {
    display: flex;
    align-items: center;

    p {
      margin-top: 15px;
      color: #fff;
    }
  }

  .email-form {
    width: 100%;

    .subscribe {
      width: 100%;
      display: flex;
      max-width: 480px;

      input {
        margin-right: 12px;
        height: 48px;
      }

      button {
        min-width: 100px;
        display: inline-block;
        height: 48px;
      }
    }
  }
}
</style>