<script setup>
import { useThanhCongShared } from "../common/useThanhCongShared.js";
import logoThaiNguyen from "../assets/logo-thai-nguyen.png";

const { t } = useThanhCongShared();
</script>

<template>
  <footer style="background:#241A12;color:rgba(246,236,215,.7);margin-top:0">
    <div
      style="height:4px;background:repeating-linear-gradient(90deg,#9E3B2E 0 7px,#B98F37 7px 14px,#2C4A5E 14px 21px)"
    ></div>
    <div
      style="max-width:1180px;margin:0 auto;padding:36px clamp(16px,4vw,40px);display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;align-items:center"
    >
      <div style="display:flex;align-items:center;gap:12px">
        <img :src="logoThaiNguyen" alt="Logo Thái Nguyên" style="width:44px;height:44px;flex:none;object-fit:contain" />
        <div>
          <div style="font-family:'Oswald',sans-serif;color:#F6ECD7;font-size:16px;font-weight:600">{{ t.brand }}</div>
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#E7C56B;margin-top:2px">
            {{ t.brandSub }}
          </div>
        </div>
      </div>
      <div style="font-size:12.5px;color:rgba(246,236,215,.5);text-wrap:pretty;max-width:48ch">{{ t.footerCredit }}</div>
    </div>
  </footer>
</template>
