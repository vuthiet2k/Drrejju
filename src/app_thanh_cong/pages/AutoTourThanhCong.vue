<script setup>
import { computed } from "vue";
import Vr360AutoTour from "../components/Vr360AutoTour.vue";
import { buildXaThanhCongAutoTour } from "../common/autoTourData.js";

const autoTourData = computed(() => buildXaThanhCongAutoTour());
</script>

<template>
  <main
    style="max-width: 1180px; margin: 0 auto; padding: clamp(16px, 3vw, 28px) clamp(12px, 4vw, 36px); animation: scIn 0.4s ease both"
  >
    <div style="margin-bottom: 14px">
      <h2
        style="font-family: 'Oswald', sans-serif; font-weight: 700; font-size: clamp(22px, 3.5vw, 32px); margin: 0; color: #2a2018"
      >
        VR360 Tự động — 9 điểm di tích
      </h2>
      <p style="color: #6a5a46; margin: 4px 0 0; font-size: 15px">
        Bấm “Khám phá ngay” để hệ thống tự dẫn tour qua từng di tích kèm thuyết minh.
      </p>
    </div>
    <div
      style="position: relative; width: 100%; height: 78vh; min-height: 460px; max-height: 860px; border-radius: 12px; overflow: hidden; border: 3px solid #2c4a5e"
    >
      <Vr360AutoTour :data="autoTourData" title="Di tích Xã Thành Công" />
    </div>
  </main>
</template>
