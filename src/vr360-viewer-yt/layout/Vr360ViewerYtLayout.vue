<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import ViewerAdapterYt from '../adapters/ViewerAdapterYt.js';
import YtControlBar from '../components/YtControlBar.vue';
import YtNavButton from '../components/YtNavButton.vue';
import YtSceneListPanel from '../components/YtSceneListPanel.vue';
import YtSceneTitlePill from '../components/YtSceneTitlePill.vue';
import { controlsHidden } from '../state/hudVisibilityState.js';
import '../styles/vr360-yt.css';

// Shell owns adapter + presentation state. Scene switching + audio + view
// remain owned by the core through the facade.
const props = defineProps({
  facade: { type: Object, required: true },
  hostRef: { type: Object, default: null }, // ref to the .tour-viewer-page host — Teleport target
  tourTitle: { type: String, default: '' },
  autoHideMs: { type: Number, default: 2000 },
});
const emit = defineEmits(['command-result', 'adapter-error']);

const adapter = shallowRef(null);
const sceneState = shallowRef({
  scenes: [], currentScene: null, currentSceneId: '', currentSceneIndex: -1,
  totalScenes: 0, isFirstScene: false, isLastScene: false,
});
const audioState = shallowRef({ available: false });
const autorotateState = shallowRef({ available: false, enabled: null });
const viewMode = shallowRef(null);
const fullscreen = shallowRef(false);
const poiHidden = shallowRef(false);
const introState = shallowRef({ available: false, interactive: true });
const errorState = shallowRef(null);
const sceneListOpen = ref(false);
// Ẩn thủ công thanh điều khiển (yt-control-bar) — ĐỘC LẬP với tự-ẩn theo
// thời gian rảnh (idle/data-idle ở dưới): bật lên là control-bar luôn ẩn
// bất kể di/dừng chuột, phù hợp khi chỉ muốn xem VR mà không muốn thanh
// điều khiển che ảnh/hiện lên khi rê chuột qua. Nút "Ẩn điều khiển" nằm
// NGAY TRONG control-bar nên khi ẩn sẽ không bấm lại được — 2 lối để hiện
// lại: nút nổi .yt-restore-controls (luôn hiện, xem template) HOẶC tap 1
// cái (không kéo) lên ảnh panorama, xem điều kiện controlsHidden trong
// onSurfacePointerUp bên dưới.
// `controlsHidden` import từ state/hudVisibilityState.js (module-scope,
// KHÔNG phải ref cục bộ) — trang nhúng đổi site/tour qua :key khiến
// component này bị huỷ + tạo lại; nếu để ref cục bộ, trạng thái ẩn sẽ mất
// và control-bar tự bật lại ngay sau khi remount.
function toggleControlsHidden() {
  controlsHidden.value = !controlsHidden.value;
  // scheduleIdle() tự đọc controlsHidden mới nhất: bật lên → ẩn ngay; tắt
  // đi → hiện lại + đếm ngược tự-ẩn bình thường.
  scheduleIdle();
}
const idle = ref(false);
const teleportTarget = ref(null);

let unsubscribers = [];
let idleTimer = 0;

const capabilities = computed(() => adapter.value?.capabilities || {});

// Kiosk auto-advance: cộng dồn góc yaw (lon) qua các view-change event.
// Khi vượt 360° VÀ đang bật autorotate → chuyển cảnh tiếp theo (loop về scene
// đầu nếu đang ở cảnh cuối). Reset khi:
//   - Đổi cảnh (bất kỳ lý do gì)
//   - Tắt autorotate
//   - Vừa mới trigger advance (tránh double-fire trong cùng scene)
let cumulativeYaw = 0;
let lastYaw = null;
let advanceScheduled = false;
const AUTO_ADVANCE_THRESHOLD = 360;

function resetYawAccumulator() {
  cumulativeYaw = 0;
  lastYaw = null;
  advanceScheduled = false;
}

function normalizeDelta(prev, curr) {
  // lon wrap: 359° → 1° should be delta ~2°, not -358°.
  let d = curr - prev;
  if (d > 180) d -= 360;
  else if (d < -180) d += 360;
  return d;
}

function onAutoAdvanceViewChange(view) {
  if (advanceScheduled) return;
  if (!autorotateState.value.enabled) return;
  const yaw = Number(view?.lon);
  if (!Number.isFinite(yaw)) return;
  if (lastYaw === null) { lastYaw = yaw; return; }
  const delta = normalizeDelta(lastYaw, yaw);
  lastYaw = yaw;
  // Người dùng đang tự kéo xoay (isInteracting) — vẫn cập nhật lastYaw để
  // làm mốc đúng cho lần sau, nhưng KHÔNG cộng dồn vào cumulativeYaw. Trước
  // đây cộng dồn MỌI view-change bất kể nguồn gốc (auto-rotate hay người
  // dùng tự kéo), nên chỉ cần người dùng xoay xem cảnh 1 vòng bằng tay là
  // bị tính nhầm thành "auto-rotate đã quay đủ 360°" và nhảy sang cảnh khác.
  if (isInteracting.value) return;
  cumulativeYaw += Math.abs(delta);
  if (cumulativeYaw < AUTO_ADVANCE_THRESHOLD) return;
  advanceScheduled = true;
  triggerAutoAdvance();
}

function triggerAutoAdvance() {
  if (!adapter.value) return;
  const state = adapter.value.getSceneState();
  if (!state.totalScenes || state.totalScenes < 2) return;
  // Ở cảnh cuối → quay về cảnh đầu (loop kiosk mode).
  if (state.isLastScene) {
    const firstScene = state.scenes[0];
    if (firstScene?.id) adapter.value.goToScene(firstScene.id);
  } else {
    adapter.value.nextScene();
  }
}
const isIntroComplete = computed(() => {
  const state = introState.value;
  if (!state.available) return true;
  return state.completed === true || state.interactive === true;
});
const isReady = computed(() => Boolean(adapter.value) && isIntroComplete.value);
const currentSceneName = computed(() => sceneState.value.currentScene?.name || sceneState.value.currentScene?.title || '');

function syncState() {
  if (!adapter.value) return;
  sceneState.value = adapter.value.getSceneState();
  audioState.value = adapter.value.getAudioState();
  autorotateState.value = adapter.value.getAutorotateState();
  viewMode.value = adapter.value.getViewMode();
  fullscreen.value = adapter.value.isFullscreen() === true;
  introState.value = adapter.value.getIntroState();
  const poi = adapter.value.getPoiState();
  poiHidden.value = poi.hidden === true;
}

function scheduleIdle() {
  if (idleTimer) window.clearTimeout(idleTimer);
  idleTimer = 0;
  // Đang ẩn thủ công (controlsHidden) — khoá cứng idle=true, không cho bất
  // kỳ hoạt động nào (hover, bấm hotspot chuyển cảnh...) làm cả HUD (kể cả
  // tiêu đề cảnh yt-title-pill) tự bật lên giữa chừng. Trước đây chỉ
  // .yt-control-bar bị khoá ẩn riêng qua data-controls-hidden, còn idle vẫn
  // chạy bình thường nên bấm POI chuyển cảnh vẫn gọi onActivity() → hiện
  // lại yt-title-pill (và cả control-bar nếu đang hiện dở giữa 2 lần bấm).
  if (controlsHidden.value) { idle.value = true; return; }
  idle.value = false;
  idleTimer = window.setTimeout(() => { idle.value = true; }, props.autoHideMs);
}

function onActivity() { scheduleIdle(); }
function onSurfaceLeave() { idle.value = true; if (idleTimer) window.clearTimeout(idleTimer); idleTimer = 0; }

// Con trỏ đang nằm hẳn trên chính HUD (thanh điều khiển, cụm nút trái/phải,
// settings, danh sách cảnh) → tạm dừng HOÀN TOÀN bộ đếm tự ẩn, giống Youtube
// (di chuột vào thanh điều khiển thì controls không tự ẩn dù đứng yên bao
// lâu). Trước đây chỉ "pointermove" mới reset timer nên nếu người dùng rê
// tới nút rồi đứng yên (cân nhắc bấm, đọc menu Cài đặt...) quá autoHideMs,
// cả 2 cụm nút trái/phải bị pointer-events:none dù chuột vẫn đang ở trên đó.
function onHudPointerEnter() {
  if (controlsHidden.value) return; // đang ẩn thủ công — hover vào HUD (kể cả nút restore) không được đánh thức
  if (idleTimer) { window.clearTimeout(idleTimer); idleTimer = 0; }
  idle.value = false;
}
function onHudPointerLeave() { scheduleIdle(); }

// Đang kéo/chạm để xoay panorama → ẩn HUD NGAY (không chờ scheduleIdle),
// và trong lúc kéo pointermove không được phép "đánh thức" HUD trở lại
// (trước đây pointermove bắn liên tục khi kéo khiến idle không bao giờ
// thành true — thanh điều khiển chình ình suốt lúc xoay).
const isInteracting = ref(false);
let pointerDownPos = null;
let pointerDownTime = 0;
const CLICK_MOVE_TOLERANCE = 5; // px
const CLICK_MAX_DURATION = 250; // ms

// Bấm trúng HUD (yt-hud) HOẶC hotspot/landmark của viewer lõi (xem
// PanoramaViewer.vue -> isViewerControlTarget, giữ đồng bộ 2 danh sách này)
// đều không phải thao tác kéo xoay/click nền — nếu không loại trừ, bấm
// hotspot để chuyển cảnh sẽ vô tình bị tính là "click nền" và trigger
// toggleAutorotate() ở onSurfacePointerUp bên dưới, dù người dùng chỉ đang
// điều hướng sang cảnh khác.
const NON_DRAG_TARGET_SELECTOR = '.yt-hud, .panorama-hotspot, .panorama-info-area, .area-landmark, .area-landmark-label, .landmark-presentation, .landmark-label';

function onSurfacePointerDown(e) {
  // Bấm trúng HUD hoặc hotspot/landmark — không tính là thao tác xoay
  // canvas, chỉ đánh dấu hoạt động (hiện lại HUD như hover bình thường).
  if (e.target?.closest?.(NON_DRAG_TARGET_SELECTOR)) { onActivity(); return; }
  pointerDownPos = { x: e.clientX, y: e.clientY };
  pointerDownTime = Date.now();
  isInteracting.value = true;
  idle.value = true; // ẩn HUD ngay lập tức khi bắt đầu kéo
  if (idleTimer) { window.clearTimeout(idleTimer); idleTimer = 0; }
}

function onSurfacePointerMove(e) {
  if (isInteracting.value) return; // đang kéo xoay — giữ HUD ẩn, không reset timer
  if (e.target?.closest?.('.yt-hud')) {
    if (controlsHidden.value) return; // đang ẩn thủ công — di chuột trong HUD (nút restore) không được đánh thức
    // Đang di chuột ngay trong vùng HUD — giữ hiện, KHÔNG đặt lịch ẩn (mỗi
    // lần move ở đây gọi scheduleIdle() như cũ sẽ tự đặt lại timer 2s, đè
    // lên trạng thái tạm dừng từ onHudPointerEnter và vẫn tự ẩn khi đứng
    // yên trong lúc đọc menu/nhắm nút).
    if (idleTimer) { window.clearTimeout(idleTimer); idleTimer = 0; }
    idle.value = false;
    return;
  }
  scheduleIdle();
}

function onSurfacePointerUp(e) {
  const wasInteracting = isInteracting.value;
  isInteracting.value = false;
  scheduleIdle();
  if (!wasInteracting || !pointerDownPos) return;
  const dx = Math.abs(e.clientX - pointerDownPos.x);
  const dy = Math.abs(e.clientY - pointerDownPos.y);
  const dt = Date.now() - pointerDownTime;
  pointerDownPos = null;
  // Lệch chuột/ngón tay rất nhỏ + bấm nhanh → coi là CLICK (không phải kéo
  // xoay).
  if (dx < CLICK_MOVE_TOLERANCE && dy < CLICK_MOVE_TOLERANCE && dt < CLICK_MAX_DURATION) {
    if (controlsHidden.value) {
      // Đang ẩn thủ công control-bar (nút bấm cũng đang ẩn theo) — 1 tap
      // trên ảnh là lối thoát duy nhất để hiện lại, giống cơ chế
      // tap-to-reveal quen thuộc ở các trình xem ảnh/video toàn màn hình.
      // scheduleIdle() ở đầu hàm chạy lúc controlsHidden còn true nên đã
      // khoá idle=true — gọi lại để tính lại đúng (hiện + đếm ngược).
      controlsHidden.value = false;
      scheduleIdle();
      return;
    }
    // → bật/tắt tự động xoay, giống hành vi Play/Pause khi bấm vào video
    // của Youtube.
    if (capabilities.value.autorotate && isIntroComplete.value) {
      adapter.value?.toggleAutorotate();
    }
  }
}

function subscribeSurface(el) {
  if (!el) return () => {};
  el.addEventListener('pointerdown', onSurfacePointerDown, { passive: true });
  el.addEventListener('pointermove', onSurfacePointerMove, { passive: true });
  window.addEventListener('pointerup', onSurfacePointerUp, { passive: true });
  el.addEventListener('touchstart', onActivity, { passive: true });
  el.addEventListener('keydown', onActivity);
  el.addEventListener('mouseleave', onSurfaceLeave);
  return () => {
    el.removeEventListener('pointerdown', onSurfacePointerDown);
    el.removeEventListener('pointermove', onSurfacePointerMove);
    window.removeEventListener('pointerup', onSurfacePointerUp);
    el.removeEventListener('touchstart', onActivity);
    el.removeEventListener('keydown', onActivity);
    el.removeEventListener('mouseleave', onSurfaceLeave);
  };
}

function clearSubscriptions() {
  for (const unsub of unsubscribers.splice(0)) unsub();
}

function connectFacade(facade) {
  clearSubscriptions();
  adapter.value?.disconnect();
  adapter.value = new ViewerAdapterYt(facade);
  adapter.value.connect();
  resetYawAccumulator();
  const stateEvents = [
    'ready', 'scene-change', 'view-change', 'view-mode-change', 'load-progress', 'load-complete',
    'audio-state-change', 'audio-timeupdate', 'audio-volumechange',
    'autorotate-change', 'fullscreen-change', 'intro-start',
    'intro-phase-change', 'intro-complete', 'poi-visibility-change',
  ];
  for (const eventName of stateEvents) {
    unsubscribers.push(adapter.value.on(eventName, syncState));
  }
  // Auto-advance sau 1 vòng khi autorotate ON.
  unsubscribers.push(adapter.value.on('view-change', onAutoAdvanceViewChange));
  // Reset accumulator khi đổi cảnh (bất kỳ nguồn nào).
  unsubscribers.push(adapter.value.on('scene-change', resetYawAccumulator));
  // Reset khi autorotate toggle — tránh cộng dồn góc từ session xoay tay.
  unsubscribers.push(adapter.value.on('autorotate-change', resetYawAccumulator));
  unsubscribers.push(adapter.value.on('error', (error) => {
    errorState.value = error;
    emit('adapter-error', error);
  }));
  syncState();
}

function selectScene(sceneId) {
  if (!adapter.value || !sceneId) return;
  try {
    const result = adapter.value.goToScene(sceneId);
    if (result?.then) {
      result
        .then((resolved) => emit('command-result', { name: 'go-to-scene', result: resolved }))
        .catch((error) => emit('command-result', { name: 'go-to-scene', error }));
    } else {
      emit('command-result', { name: 'go-to-scene', result });
    }
  } catch (error) {
    emit('command-result', { name: 'go-to-scene', error });
  }
}

function handleCommandResult(result) {
  syncState();
  emit('command-result', result);
}

function toggleSceneList() { sceneListOpen.value = !sceneListOpen.value; }
function closeSceneList() { sceneListOpen.value = false; }

// Resolve teleport target from either the injected hostRef (Vr360ViewerYt wrapper)
// or fallback to querying the DOM once the core is mounted.
async function resolveTarget() {
  await nextTick();
  const host = props.hostRef?.value || props.hostRef;
  const el = host?.$el || host;
  if (el?.classList?.contains('tour-viewer-page')) {
    teleportTarget.value = el;
    return;
  }
  teleportTarget.value = document.querySelector('.tour-viewer-page');
}

let stopSurfaceSubscription = () => {};
watch(teleportTarget, (el) => {
  stopSurfaceSubscription();
  stopSurfaceSubscription = el ? subscribeSurface(el) : () => {};
  if (el) scheduleIdle();
});

watch(
  () => props.facade,
  (facade) => {
    if (!facade) return;
    try { connectFacade(facade); }
    catch (error) { emit('adapter-error', error); }
    resolveTarget();
  },
  { immediate: true },
);

onMounted(() => { resolveTarget(); });
onBeforeUnmount(() => {
  clearSubscriptions();
  adapter.value?.destroy();
  adapter.value = null;
  stopSurfaceSubscription();
  if (idleTimer) window.clearTimeout(idleTimer);
});
</script>

<template>
  <Teleport v-if="teleportTarget && isReady" :to="teleportTarget">
    <div
      class="yt-hud"
      :data-idle="idle ? 'true' : 'false'"
      :data-controls-hidden="controlsHidden ? 'true' : 'false'"
      aria-label="Trình xem VR360 Youtube-style"
      @pointerenter="onHudPointerEnter"
      @pointerleave="onHudPointerLeave"
    >
      <YtSceneTitlePill
        :tour-title="tourTitle"
        :scene-name="currentSceneName"
        :scene-index="sceneState.currentSceneIndex"
        :total-scenes="sceneState.totalScenes"
        :audio-playing="Boolean(audioState.playing)"
      />

      <YtSceneListPanel
        :scenes="sceneState.scenes"
        :current-scene-id="sceneState.currentSceneId || ''"
        :open="sceneListOpen"
        :disabled="introState.available && !introState.interactive"
        @select-scene="selectScene"
        @close="closeSceneList"
      />

      <YtControlBar
        :adapter="adapter"
        :capabilities="capabilities"
        :scene-state="sceneState"
        :audio-state="audioState"
        :autorotate-state="autorotateState"
        :poi-hidden="poiHidden"
        :view-mode="viewMode"
        :available-view-modes="adapter?.getAvailableViewModes() || []"
        :fullscreen="fullscreen"
        :scene-list-open="sceneListOpen"
        :controls-hidden="controlsHidden"
        :disabled="introState.available && !introState.interactive"
        @command-result="handleCommandResult"
        @toggle-scene-list="toggleSceneList"
        @toggle-controls="toggleControlsHidden"
      />

      <!-- Nút nổi hiện lại control-bar khi đang ẩn thủ công — nằm NGOÀI
           .yt-control-bar/.yt-fadeable nên luôn hiện, không tự ẩn theo
           idle. Không có nút này thì không còn cách nào bấm lại được vì
           nút "Ẩn điều khiển" gốc đã bị ẩn theo chính control-bar. -->
      <YtNavButton
        v-if="controlsHidden"
        class="yt-restore-controls"
        label="Hiện lại điều khiển"
        @activate="toggleControlsHidden"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </YtNavButton>
    </div>
  </Teleport>
</template>
