<script setup>
import "../assets/thanhcong-fonts.css";
import "../assets/thanhcong-base.css";
import HeaderThanhCong from "../components/HeaderThanhCong.vue";
import FooterThanhCong from "../components/FooterThanhCong.vue";
</script>

<template>
  <div class="tc-root">
    <HeaderThanhCong />
    <router-view />
    <FooterThanhCong />
  </div>
</template>
