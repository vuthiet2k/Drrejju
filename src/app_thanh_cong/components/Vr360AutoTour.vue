<script setup>
import { ref, computed, onMounted, onBeforeUnmount, defineProps, defineEmits } from "vue";
import VrTourViewer from "./VrTourViewer.vue";

// Chế độ "hướng dẫn tự động": hiện 1 poster có nút Khám phá; bấm play thì tour
// tự chạy — mỗi cảnh xoay đúng 1 vòng rồi chuyển cảnh, có 1 audio thuyết minh
// duy nhất cho cả cụm phát xuyên suốt. Người dùng chạm vào là tạm dừng.
const props = defineProps({
  data: { type: Object, required: true },
  title: { type: String, default: "" },
  subtitle: { type: String, default: "Hành trình tự động qua các điểm di tích" },
  posterImage: { type: String, default: "" },
  // Thời lượng mỗi cảnh (giây) khi KHÔNG lấy được thời lượng audio.
  perSceneDuration: { type: Number, default: 20 },
  // Tự chạy ngay khi mount (bỏ qua poster) — dùng khi đã có cú nhấn ở nơi khác.
  autostart: { type: Boolean, default: false },
});
const emit = defineEmits(["ended", "exit"]);

const viewerRef = ref(null);
const audioEl = ref(null);

const started = ref(false);
const paused = ref(false);
const ended = ref(false);
const freeLook = ref(false);
const sceneIndex = ref(0);
const sceneProgress = ref(0);
const audioDuration = ref(0);

const scenes = computed(() => props.data?.scenes || []);
const count = computed(() => scenes.value.length);
const currentName = computed(() => scenes.value[sceneIndex.value]?.name || "");

const audioSrc = computed(() => props.data?.am_thanh_thuyet_minh?.duong_dan_file_audio || "");
const posterTitle = computed(
  () => props.title || props.data?.thong_tin_gioi_thieu?.tieu_de_hop_thong_tin || props.data?.title || "VR360",
);
const posterBg = computed(
  () =>
    props.posterImage ||
    props.data?.thong_tin_gioi_thieu?.anh_dai_dien_2d ||
    scenes.value[0]?.thumb ||
    scenes.value[0]?.image ||
    "",
);
const posterStyle = computed(() =>
  posterBg.value ? { backgroundImage: `url('${posterBg.value}')` } : {},
);

// Thời lượng mỗi cảnh: chia đều audio cho số cảnh (hình + tiếng kết thúc cùng
// lúc); chưa biết thời lượng audio thì dùng mặc định.
function perSceneDur() {
  if (audioDuration.value > 0 && count.value > 0) return audioDuration.value / count.value;
  return props.perSceneDuration;
}

// Tốc độ auto-xoay: rất chậm, êm để người xem không hoa mắt chóng mặt.
// Trước đây xoay trọn 360°/cảnh (~18°/s với cảnh 20s) nên khá nhanh.
const SWEEP_DEG_PER_SEC = 3; // ~3°/giây: chậm, dịu mắt
function sweepDegPerSec() {
  return Math.min(SWEEP_DEG_PER_SEC, 360 / perSceneDur());
}

// ===== vòng lặp thời gian =====
let rafId = null;
let lastT = 0;
let sceneElapsed = 0;

function loop(now) {
  rafId = requestAnimationFrame(loop);
  if (paused.value || ended.value) {
    lastT = now;
    return;
  }
  const dt = lastT ? (now - lastT) / 1000 : 0;
  lastT = now;
  const dur = perSceneDur();
  sceneElapsed += dt;
  sceneProgress.value = Math.min(1, sceneElapsed / dur);
  if (sceneElapsed >= dur) {
    if (sceneIndex.value < count.value - 1) beginScene(sceneIndex.value + 1);
    else finish();
  }
}

function beginScene(i) {
  sceneIndex.value = i;
  sceneElapsed = 0;
  sceneProgress.value = 0;
  if (i > 0) viewerRef.value?.goToScene(i);
  viewerRef.value?.setAutoSweep(true, sweepDegPerSec());
}

let _startedOnce = false;
function beginPlayback() {
  if (_startedOnce) return;
  _startedOnce = true;
  audioEl.value?.play().catch(() => {});
  beginScene(0);
  lastT = 0;
  rafId = requestAnimationFrame(loop);
}

function play() {
  started.value = true;
  paused.value = false;
  ended.value = false;
  const el = audioEl.value;
  if (el && el.readyState >= 1) {
    beginPlayback();
  } else if (el) {
    el.addEventListener("loadedmetadata", beginPlayback, { once: true });
    el.load?.();
    setTimeout(beginPlayback, 1500); // dự phòng nếu metadata không tới
  } else {
    beginPlayback();
  }
}

function pause() {
  if (!started.value || ended.value) return;
  paused.value = true;
  viewerRef.value?.setAutoSweep(false);
  audioEl.value?.pause();
}
function resume() {
  paused.value = false;
  viewerRef.value?.setAutoSweep(true, sweepDegPerSec());
  audioEl.value?.play().catch(() => {});
}
function togglePause() {
  paused.value ? resume() : pause();
}

function finish() {
  ended.value = true;
  paused.value = true;
  viewerRef.value?.setAutoSweep(false);
  audioEl.value?.pause();
  emit("ended");
}

function replay() {
  ended.value = false;
  paused.value = false;
  const el = audioEl.value;
  if (el) {
    el.currentTime = 0;
    el.play().catch(() => {});
  }
  beginScene(0);
  lastT = 0;
}

function exitToFreeLook() {
  paused.value = true;
  viewerRef.value?.setAutoSweep(false);
  audioEl.value?.pause();
  freeLook.value = true;
  if (rafId) cancelAnimationFrame(rafId);
  emit("exit");
}

function onMeta() {
  const el = audioEl.value;
  if (el && isFinite(el.duration)) audioDuration.value = el.duration;
}
function onAudioEnded() {
  // Audio hết trước khi đi hết cảnh (hiếm) — cứ để phần hình chạy nốt.
}

// Chạm/kéo lên panorama trong lúc auto chạy → tạm dừng để người dùng tự ngắm.
function onStageDown() {
  if (started.value && !ended.value && !freeLook.value && !paused.value) pause();
}

onMounted(() => {
  if (props.autostart) play();
});

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId);
  audioEl.value?.pause();
});
</script>

<template>
  <div class="auto-tour">
    <!-- VIEWER -->
    <div class="at-stage" @pointerdown="onStageDown">
      <VrTourViewer
        ref="viewerRef"
        :data="data"
        :autorotate="freeLook"
        :chromeless="!freeLook"
        :disable-narration="true"
      />
    </div>

    <!-- AUDIO THUYẾT MINH DUY NHẤT CHO CẢ TOUR -->
    <audio
      ref="audioEl"
      :src="audioSrc"
      preload="metadata"
      @loadedmetadata="onMeta"
      @ended="onAudioEnded"
    ></audio>

    <!-- POSTER -->
    <div v-if="!started" class="at-poster" :style="posterStyle">
      <div class="at-poster-scrim"></div>
      <div class="at-poster-inner">
        <div class="at-eyebrow">VR360 · Tự động</div>
        <h1 class="at-title">{{ posterTitle }}</h1>
        <p class="at-desc">{{ subtitle }}</p>
        <button class="at-play" @click="play">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="8 5 20 12 8 19 8 5" /></svg>
          Khám phá ngay
        </button>
        <div class="at-meta">{{ count }} điểm di tích · có thuyết minh</div>
      </div>
    </div>

    <!-- THANH ĐIỀU KHIỂN AUTO -->
    <div v-if="started && !ended && !freeLook" class="at-controls">
      <button class="at-ctrl-btn" :title="paused ? 'Tiếp tục' : 'Tạm dừng'" @click="togglePause">
        <svg v-if="paused" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20 7 4" /></svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
      </button>
      <div class="at-ctrl-mid">
        <div class="at-scene-name">Điểm {{ sceneIndex + 1 }}/{{ count }} — {{ currentName }}</div>
        <div class="at-track"><div class="at-fill" :style="{ width: sceneProgress * 100 + '%' }"></div></div>
      </div>
      <button class="at-exit" @click="exitToFreeLook">Thoát</button>
    </div>

    <!-- Tạm dừng: KHÔNG phủ overlay/nút thừa — trạng thái đã thể hiện ở nút
         play/pause trên thanh điều khiển (togglePause). Kéo để tự ngắm. -->

    <!-- KẾT THÚC -->
    <div v-if="ended" class="at-end">
      <div class="at-end-inner">
        <div class="at-eyebrow">Hoàn thành</div>
        <h2 class="at-end-title">Đã đi hết hành trình di tích</h2>
        <div class="at-end-actions">
          <button class="at-play" @click="replay">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>
            Xem lại
          </button>
          <button class="at-exit-lg" @click="exitToFreeLook">Thoát ra xem tự do</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap");

.auto-tour {
  --primary: #8b1a2b;
  --primary-light: #b22e42;
  --accent: #d4a853;
  --bg-dark: rgba(20, 20, 28, 0.85);
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 320px;
  overflow: hidden;
  font-family: "Be Vietnam Pro", sans-serif;
  background: #0a0a0f;
  color: #fff;
}
.at-stage { position: absolute; inset: 0; }

/* POSTER */
.at-poster {
  position: absolute; inset: 0; z-index: 400; background-size: cover; background-position: center;
  display: flex; align-items: center; justify-content: center; text-align: center;
}
.at-poster-scrim {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, rgba(10, 10, 15, 0.45) 0%, rgba(10, 10, 15, 0.82) 100%);
}
.at-poster-inner { position: relative; z-index: 1; padding: 24px; max-width: 640px; }
.at-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: var(--accent); margin-bottom: 14px; }
.at-title {
  font-size: clamp(28px, 5vw, 48px); font-weight: 700; margin: 0 0 14px; line-height: 1.15;
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.6);
}
.at-desc { font-size: clamp(14px, 2vw, 17px); color: rgba(255, 255, 255, 0.85); margin: 0 0 30px; line-height: 1.6; }
.at-play {
  display: inline-flex; align-items: center; gap: 10px; padding: 15px 34px; border: none; cursor: pointer;
  border-radius: 40px; background: var(--primary); color: #fff; font-family: inherit; font-size: 16px; font-weight: 700;
  box-shadow: 0 10px 30px rgba(139, 26, 43, 0.55); transition: transform 0.2s ease, background 0.2s ease;
  animation: atPlayPulse 2s ease-in-out infinite;
}
.at-play:hover { background: var(--primary-light); transform: translateY(-2px); }
.at-play svg { width: 22px; height: 22px; }
@keyframes atPlayPulse {
  0%, 100% { box-shadow: 0 10px 30px rgba(139, 26, 43, 0.55), 0 0 0 0 rgba(212, 168, 83, 0.5); }
  50% { box-shadow: 0 10px 30px rgba(139, 26, 43, 0.55), 0 0 0 16px rgba(212, 168, 83, 0); }
}
.at-meta { margin-top: 20px; font-size: 13px; color: rgba(255, 255, 255, 0.6); letter-spacing: 0.5px; }

/* THANH ĐIỀU KHIỂN */
.at-controls {
  position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 200;
  display: flex; align-items: center; gap: 14px; padding: 8px 12px 8px 8px; width: min(560px, calc(100% - 32px));
  background: var(--bg-dark); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 40px; box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4);
}
.at-ctrl-btn {
  width: 42px; height: 42px; flex: none; border-radius: 50%; border: none; cursor: pointer;
  background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; transition: background 0.2s ease;
}
.at-ctrl-btn:hover { background: var(--primary-light); }
.at-ctrl-btn svg { width: 18px; height: 18px; }
.at-ctrl-mid { flex: 1; min-width: 0; }
.at-scene-name {
  font-size: 13px; font-weight: 600; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.at-track { height: 4px; border-radius: 4px; background: rgba(255, 255, 255, 0.16); overflow: hidden; }
.at-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--primary-light), var(--accent)); transition: width 0.15s linear; }
.at-exit {
  flex: none; padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent; color: rgba(255, 255, 255, 0.85); font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;
}
.at-exit:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }

/* KẾT THÚC */
.at-end {
  position: absolute; inset: 0; z-index: 400; display: flex; align-items: center; justify-content: center; text-align: center;
  background: radial-gradient(ellipse at center, rgba(10, 10, 15, 0.7) 0%, rgba(10, 10, 15, 0.92) 100%);
}
.at-end-inner { padding: 24px; }
.at-end-title { font-size: clamp(22px, 4vw, 34px); font-weight: 700; margin: 8px 0 28px; }
.at-end-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
.at-exit-lg {
  padding: 15px 28px; border-radius: 40px; border: 1px solid rgba(255, 255, 255, 0.25); background: transparent;
  color: #fff; font-family: inherit; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;
}
.at-exit-lg:hover { background: rgba(255, 255, 255, 0.1); }

@media (max-width: 768px) {
  .at-controls { bottom: 12px; gap: 10px; }
  .at-exit { padding: 8px 12px; }
}
</style>
