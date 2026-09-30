<script setup>
defineProps({
  tourTitle: { type: String, default: '' },
  sceneName: { type: String, default: '' },
  sceneIndex: { type: Number, default: -1 },
  totalScenes: { type: Number, default: 0 },
  audioPlaying: { type: Boolean, default: false },
});
</script>

<template>
  <div class="yt-title-pill yt-fadeable" role="status" aria-live="polite">
    <!-- Badge "đang nghe" — chỉ hiện khi thuyết minh đang phát, kiểu chấm
         nhấp nháy + equalizer giống badge "ĐANG XEM" ở trang di tích. -->
    <span v-if="audioPlaying" class="yt-audio-live">
      <span class="yt-audio-live__bars" aria-hidden="true"><i></i><i></i><i></i></span>
    </span>
    <span class="yt-title-pill__name">{{ sceneName || tourTitle || 'VR360' }}</span>
  </div>
</template>
