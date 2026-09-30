<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useThanhCongShared } from "../../common/useThanhCongShared.js";
import { getThanhCongThemes } from "../../common/thanhCongData.js";

const isTheme = true;
const route = useRoute();
const { t, lang } = useThanhCongShared();

const td = computed(() => {
  const themes = getThanhCongThemes();
  const found = themes.find((th) => th.id === route.params.slug) || themes[0];
  return { id: found.id, color: found.color, img: found.img || "", ...found[lang.value] };
});
</script>

<template>
  <template v-if="isTheme">
  <main style="animation:scIn .4s ease both">
    <!-- HERO -->
    <section style="position:relative;min-height:clamp(300px,46vh,440px);display:flex;align-items:flex-end;overflow:hidden">
      <div :style="`position:absolute;inset:0;background:${td.img ? `#C2A574 center/cover no-repeat url('${td.img}')` : 'repeating-linear-gradient(135deg,#C9AE7E 0 22px,#C2A574 22px 44px)'}`"></div>
      <div v-if="!td.img" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(90,70,40,.5);font-family:monospace;font-size:12px;letter-spacing:1px">[ẢNH CHỦ ĐỀ — {{ td.title }}]</div>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(36,26,18,.15) 0%,rgba(36,26,18,.35) 45%,rgba(36,26,18,.88) 100%)"></div>
      <div style="position:relative;max-width:1180px;width:100%;margin:0 auto;padding:clamp(20px,4vw,52px) clamp(16px,4vw,40px)">
        <div :style="`display:inline-flex;align-items:center;gap:8px;background:${td.color};color:#F6ECD7;font-size:11.5px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:999px;border:1px solid rgba(231,197,107,.5);margin-bottom:14px`">{{ td.tag }}</div>
        <h1 style="font-family:'Oswald',sans-serif;font-weight:700;color:#F6ECD7;font-size:clamp(32px,5.5vw,58px);margin:0;line-height:1.04;text-transform:uppercase;letter-spacing:.5px">{{ td.title }}</h1>
        <div style="font-family:'Carattere',cursive;color:#E7C56B;font-size:clamp(28px,4vw,42px);line-height:1;margin:2px 0 0">{{ td.script }}</div>
      </div>
    </section>

    <!-- INTRO -->
    <section style="max-width:1180px;margin:0 auto;padding:clamp(34px,5vw,60px) clamp(16px,4vw,40px) clamp(8px,2vw,20px)">
      <div style="display:flex;align-items:center;gap:12px;margin:0 0 16px"><span :style="`width:10px;height:10px;background:${td.color};transform:rotate(45deg);flex:none`"></span><h2 style="font-family:'Oswald',sans-serif;font-weight:700;font-size:clamp(22px,3vw,30px);color:#2A2018;margin:0;text-transform:uppercase;letter-spacing:.5px">{{ t.themeOverview }}</h2></div>
      <p style="font-size:17px;line-height:1.7;color:#473A2C;margin:0;max-width:70ch;text-align:justify;text-wrap:pretty">{{ td.intro }}</p>
    </section>

    <!-- POINTS -->
    <section style="max-width:1180px;margin:0 auto;padding:clamp(8px,2vw,20px) clamp(16px,4vw,40px) clamp(34px,5vw,60px)">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px">
        <template v-for="(p, __i) in td.points" :key="__i">
          <div style="background:#FBF5E8;border:1px solid #E0D0AE;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 2px 10px rgba(90,70,40,.06)">
            <div :style="`height:120px;background:${td.img ? `#E3D2B0 center/cover no-repeat url('${td.img}')` : 'repeating-linear-gradient(45deg,#E3D2B0 0 13px,#DCC9A4 13px 26px)'};display:flex;align-items:center;justify-content:center;color:rgba(122,99,62,.5);font-family:monospace;font-size:10px;text-align:center;padding:0 14px`"><template v-if="!td.img">[ảnh: {{ p.h }}]</template></div>
            <div style="padding:16px 18px 18px;flex:1">
              <h3 style="font-family:'Oswald',sans-serif;font-weight:600;font-size:17px;color:#2A2018;margin:0 0 7px">{{ p.h }}</h3>
              <p style="font-size:14px;color:#6A5A46;margin:0;line-height:1.6;text-wrap:pretty">{{ p.d }}</p>
            </div>
          </div>
        </template>
      </div>
    </section>
  </main>
  </template>
</template>

<style scoped>
</style>
