<template>
  <img
    v-bind="$attrs"
    :src="imgSrc"
    :loading="$attrs.loading || 'lazy'"
    :decoding="$attrs.decoding || 'async'"
    :class="['sc-img', { 'sc-img--loaded': loaded }]"
    @load="onLoad"
    @error="onError"
  />
</template>

<script setup>
import { ref, watch, onBeforeUnmount, defineProps } from "vue";
import {
  ImageDefault,
  UserImageDefault,
  LogoDefault,
} from "@/base/components/image/getImage.js";

const props = defineProps({
  src: String,
  fallback: {
    type: String,
    default: ImageDefault,
  },
  // Số lần thử tải lại khi lỗi trước khi chuyển hẳn sang ảnh fallback —
  // giúp ảnh không "mất trắng" vĩnh viễn chỉ vì mạng chập chờn 1 nhịp.
  maxRetries: {
    type: Number,
    default: 2,
  },
  retryDelay: {
    type: Number,
    default: 900,
  },
});

function resolveFallback() {
  if (props.fallback === "user") return UserImageDefault;
  if (props.fallback === "logo") return LogoDefault;
  return props.fallback || ImageDefault;
}

const imgSrc = ref(props.src || resolveFallback()); // nếu src rỗng thì dùng fallback
const loaded = ref(false); // dùng để tắt shimmer chờ khi ảnh đã tải xong
let retryCount = 0;
let retryTimer = null;

watch(
  () => props.src,
  (newSrc) => {
    retryCount = 0;
    clearTimeout(retryTimer);
    loaded.value = false;
    imgSrc.value = newSrc || resolveFallback();
  }
);

function onLoad() {
  loaded.value = true;
}

function onError() {
  const original = props.src;
  // Mạng yếu/chập chờn hay khiến 1 request ảnh bị lỗi dù ảnh vẫn tồn tại —
  // thử tải lại vài lần (kèm cache-buster) trước khi bỏ cuộc sang fallback.
  if (original && retryCount < props.maxRetries) {
    retryCount++;
    clearTimeout(retryTimer);
    retryTimer = setTimeout(() => {
      const sep = original.includes("?") ? "&" : "?";
      imgSrc.value = `${original}${sep}_r=${Date.now()}`;
    }, props.retryDelay * retryCount);
    return;
  }
  loaded.value = true; // hiện fallback ngay, không giữ shimmer chờ mãi
  imgSrc.value = resolveFallback();
}

onBeforeUnmount(() => clearTimeout(retryTimer));
</script>

<style scoped>
/* Placeholder shimmer trong lúc ảnh chưa tải xong — thay vì khoảng trống
   trắng/im lìm khiến người dùng tưởng "không có ảnh" khi mạng yếu. Once
   ảnh load xong, bỏ animation (nội dung ảnh đã phủ kín khung). */
.sc-img:not(.sc-img--loaded) {
  background: linear-gradient(100deg, rgba(120, 120, 120, 0.08) 25%, rgba(120, 120, 120, 0.18) 37%, rgba(120, 120, 120, 0.08) 63%);
  background-size: 400% 100%;
  animation: sc-img-shimmer 1.4s ease infinite;
}
@keyframes sc-img-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0 0;
  }
}
</style>
