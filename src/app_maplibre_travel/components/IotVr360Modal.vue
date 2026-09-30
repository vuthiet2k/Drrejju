<script setup>
// Vue-driven VR360 modal — shows a tour URL in an iframe. Replaces the original
// Bootstrap `.bs-example-modal-lg` + data-bs-toggle markup.
defineProps({ url: { type: String, default: '' } })
const emit = defineEmits(['close'])
</script>

<template>
  <Transition name="vr-fade">
    <div v-if="url" class="vr-modal" @click.self="emit('close')">
      <div class="vr-modal__dialog">
        <button type="button" class="vr-modal__close" aria-label="Đóng" @click="emit('close')">
          <i class="ri-close-line"></i>
        </button>
        <iframe :src="url" frameborder="0" allowfullscreen></iframe>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.vr-modal { position: fixed; inset: 0; z-index: 2000; background: rgba(0, 0, 0, .6); display: flex; align-items: center; justify-content: center; padding: 24px; }
.vr-modal__dialog { position: relative; width: min(1000px, 96vw); height: min(80vh, 720px); background: #000; border-radius: 8px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, .5); }
.vr-modal__dialog iframe { width: 100%; height: 100%; border: 0; }
.vr-modal__close { position: absolute; top: 10px; right: 10px; z-index: 2; width: 36px; height: 36px; border-radius: 50%; border: none; background: rgba(255, 255, 255, .9); color: #212529; font-size: 22px; cursor: pointer; display: grid; place-items: center; }
.vr-modal__close:hover { background: #fff; }
.vr-fade-enter-active, .vr-fade-leave-active { transition: opacity .2s; }
.vr-fade-enter-from, .vr-fade-leave-to { opacity: 0; }
</style>
