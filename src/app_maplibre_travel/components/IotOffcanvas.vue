<script setup>
// A lightweight, Vue-driven left offcanvas panel — replaces Bootstrap's
// data-bs-toggle/#id offcanvas so the home portal needs no global ids and no
// bootstrap JS. Positions itself absolutely inside the (position:relative)
// map portal, beside the left tool rail.
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '360px' },
  left: { type: String, default: '52px' },
  backdrop: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])
function close() { emit('update:modelValue', false) }
</script>

<template>
  <Transition name="oc-fade">
    <div v-if="modelValue && backdrop" class="oc-backdrop" @click="close"></div>
  </Transition>
  <Transition name="oc-slide">
    <aside v-if="modelValue" class="oc" :style="{ width, left }">
      <header class="oc__head">
        <slot name="head">
          <h5 class="oc__title">{{ title }}</h5>
          <button type="button" class="oc__btn" aria-label="Đóng" @click="close">
            <i class="ri-close-line"></i>
          </button>
        </slot>
      </header>
      <div class="oc__body scroll-custom">
        <slot />
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.oc {
  position: absolute; top: 0; height: 100%; max-width: calc(100% - v-bind(left));
  background: #fff; z-index: 8; display: flex; flex-direction: column;
  box-shadow: 2px 0 16px rgba(0, 0, 0, .12); border-right: 1px solid #e9ebec;
}
.oc__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px 14px; border-bottom: 1px solid #e9ebec; }
.oc__title { margin: 0; font-size: 15px; font-weight: 700; }
.oc__btn { border: none; background: none; font-size: 22px; line-height: 1; color: #878a99; cursor: pointer; padding: 0 4px; }
.oc__btn:hover { color: var(--iot-primary); }
.oc__body { flex: 1; overflow-y: auto; padding: 12px 14px; }
.oc-backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, .18); z-index: 7; }

.scroll-custom::-webkit-scrollbar { width: 6px; }
.scroll-custom::-webkit-scrollbar-thumb { border-radius: 10px; background-color: #d1d6db; }

.oc-slide-enter-active, .oc-slide-leave-active { transition: transform .25s ease, opacity .25s ease; }
.oc-slide-enter-from, .oc-slide-leave-to { transform: translateX(-16px); opacity: 0; }
.oc-fade-enter-active, .oc-fade-leave-active { transition: opacity .2s; }
.oc-fade-enter-from, .oc-fade-leave-to { opacity: 0; }

@media (max-width: 720px) {
  .oc { width: calc(100% - v-bind(left)) !important; }
}
</style>
