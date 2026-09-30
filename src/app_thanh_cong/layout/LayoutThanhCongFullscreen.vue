<script setup>
import "../assets/thanhcong-fonts.css";
import "../assets/thanhcong-base.css";
import HeaderThanhCong from "../components/HeaderThanhCong.vue";
</script>

<template>
  <div class="tc-root tc-root--fullscreen">
    <HeaderThanhCong />
    <main class="tc-fullscreen-stage">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
/* Header (position:sticky) giữ nguyên hàng đầu, phần còn lại của viewport
   dành hết cho router-view (bản đồ/3D) — không Footer.
   min-height (không phải height cố định) + bỏ overflow:hidden: bình
   thường (viewport đủ cao) layout vẫn y hệt full màn hình, không cuộn.
   Nhưng nếu viewport quá thấp (cửa sổ trình duyệt nhỏ, landscape mobile),
   .tc-fullscreen-stage có min-height riêng làm sàn — khi flex không đủ
   chỗ, trang tự cao hơn viewport và cho cuộn, thay vì ép map/3D co nhỏ
   xuống dưới mức dùng được rồi khoá cứng không xem được phần còn lại. */
.tc-root--fullscreen {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.tc-fullscreen-stage {
  flex: 1;
  min-height: 480px;
  position: relative;
}
</style>
