<script>
// import "@/assets/scss/frontend/topbar.scss";

export default {
  name: "MenuPortal",
};
</script>
<template>
  <ul class="navbar-nav mx-auto mt-2 mt-lg-0" id="navbar-example">
    <li class="nav-item">
      <router-link class="nav-link menu-link" :to="{ name: 'HomePage' }">
        Trang chủ
      </router-link>
    </li>
    <li class="nav-item">
      <router-link class="nav-link" :to="{ name: 'AboutUsPage' }">
        Về chúng tôi
      </router-link>
    </li>
    <li class="nav-item">
      <div class="dropdown">
        <div class="nav-link menu-link cursor-pointer d-flex" data-bs-toggle="dropdown">
          <span data-key="t-widgets login-title">Bản đồ</span>
        </div>
        <div class="dropdown-menu dropdown-menu-md">
          <router-link class="dropdown-item" :to="{ name: 'MapControl' }">
            <span class="align-middle">Bản đồ thông tin</span></router-link>
          <router-link class="dropdown-item" :to="{ name: 'MapPortal' }">
            <span class="align-middle">Bản đồ xúc tiến</span></router-link>
        </div>
      </div>
    </li>
    <li class="nav-item">
      <router-link class="nav-link" to="#">
        Cẩm nang
      </router-link>
    </li>
    <li class="nav-item">
      <router-link class="nav-link" :to="{ name: 'ContactPage' }">
        Liên hệ
      </router-link>
    </li>
  </ul>
</template>
<style scoped>
.nav-item .nav-link {
  text-transform: uppercase;
  font-weight: 300;
  padding: 16px !important;
  font-size: 14px !important;
}
</style>
