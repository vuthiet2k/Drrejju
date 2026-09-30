<script setup>
// Main map search box (mirror of the original main_search.js): a home button,
// a text input and a directions button, with a results dropdown that mixes
// local (static @data) places and live Map4D place results + a loading spinner.
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useTenant } from '../common/tenant'
import { stripHtml } from '../common/media'
import { searchMap4dPlaces } from '../common/map4dRoute'

const props = defineProps({ places: { type: Array, default: () => [] } })
const emit = defineEmits(['home', 'directions', 'pick-place', 'pick-point'])

const { site } = useTenant()
const logo = site.logo1
const query = ref('')
const focused = ref(false)
const loading = ref(false)
const mapResults = ref([])
let timer = null

const localResults = computed(() => {
  const t = query.value.trim().toLowerCase()
  if (!t) return []
  return props.places.filter((p) => stripHtml(p.name).toLowerCase().includes(t)).slice(0, 5)
})
const showResults = computed(() => focused.value && !!query.value.trim())

watch(query, (v) => {
  clearTimeout(timer)
  mapResults.value = []
  if (!v.trim()) { loading.value = false; return }
  loading.value = true
  timer = setTimeout(async () => {
    mapResults.value = await searchMap4dPlaces(v.trim())
    loading.value = false
  }, 500)
})

function pickPlace(p) { query.value = ''; focused.value = false; emit('pick-place', p) }
function pickPoint(m) { query.value = ''; focused.value = false; emit('pick-point', m) }
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="ms">
    <div class="ms__bar">
      <button type="button" class="btn btn-icon btn-soft-secondary ms__home" title="Trang chủ" @click="emit('home')">
        <i class="ri-home-4-line align-bottom fs-18"></i>
      </button>
      <input v-model="query" type="text" class="form-control ms__input" placeholder="Tìm kiếm..."
             @focus="focused = true" @blur="focused = false" />
      <button type="button" class="btn btn-icon btn-primary ms__dir" title="Chỉ đường" @click="emit('directions')">
        <i class="ri-direction-fill align-bottom fs-18"></i>
      </button>
    </div>

    <div v-if="showResults" class="ms__results">
      <button v-for="p in localResults" :key="p.id" type="button" class="ms__item" @mousedown.prevent="pickPlace(p)">
        <img :src="logo" class="ms__logo" alt="" /><span v-html="p.name"></span>
      </button>
      <button v-for="(m, i) in mapResults" :key="'m' + i" type="button" class="ms__item" @mousedown.prevent="pickPoint(m)">
        <i class="mdi mdi-map-marker ms__mk"></i><span>{{ m.name }}<template v-if="m.address">, {{ m.address }}</template></span>
      </button>
      <div v-if="loading" class="lds-ring"><div></div><div></div><div></div><div></div></div>
      <div v-if="!loading && !localResults.length && !mapResults.length" class="ms__empty">Không tìm thấy địa điểm nào</div>
    </div>
  </div>
</template>

<style scoped>
.ms { width: min(440px, 92vw); pointer-events: auto; }
.ms__bar { display: flex; align-items: center; gap: 4px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, .25); padding: 5px; }
.ms__home, .ms__dir { flex: none; width: 40px; height: 40px; border-radius: 6px; }
.ms__input { border: none; box-shadow: none; height: 40px; flex: 1; }
.ms__input:focus { border: none; box-shadow: none; }

.ms__results { margin-top: 6px; background: #fff; border-radius: 8px; box-shadow: 0 6px 24px rgba(0, 0, 0, .18); padding: 4px; max-height: 60vh; overflow-y: auto; }
.ms__item { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; border: none; background: none; padding: 9px 10px; border-radius: 6px; cursor: pointer; font-size: 14px; color: #212529; }
.ms__item:hover { background: #eef2f7; }
.ms__logo { width: 26px; height: 26px; object-fit: contain; flex: none; }
.ms__mk { font-size: 20px; color: #4a7dff; flex: none; }
.ms__empty { padding: 12px; color: #878a99; font-size: 13px; text-align: center; }

/* loading spinner (mirror of the original .lds-ring) */
.lds-ring { display: flex; justify-content: center; padding: 8px 0; }
.lds-ring div { box-sizing: border-box; display: block; position: relative; width: 28px; height: 28px; border: 3px solid var(--iot-primary, #405189); border-radius: 50%; animation: lds-ring 1.2s cubic-bezier(.5, 0, .5, 1) infinite; border-color: var(--iot-primary, #405189) transparent transparent transparent; margin: 0 -14px; }
.lds-ring div:nth-child(1) { animation-delay: -0.45s; }
.lds-ring div:nth-child(2) { animation-delay: -0.3s; }
.lds-ring div:nth-child(3) { animation-delay: -0.15s; }
@keyframes lds-ring { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }
</style>
