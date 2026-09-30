<script setup>
// List page — mirrors CardViewPortal (card_view_portal.js): a search box on the
// right, a Bootstrap gallery grid of cards, and a "Xem thêm" load-more link.
import { ref, onMounted } from 'vue'
import { useTenant } from '../common/tenant'
import EntityCard from './EntityCard.vue'

const { list: listData } = useTenant()

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  collection: { type: String, required: true },
  routeName: { type: String, required: true },
  variant: { type: String, default: 'default' },
})

const items = ref([])
const page = ref(1)
const totalPages = ref(1)
const query = ref('')
const loading = ref(false)

function fetchPage(reset = false) {
  loading.value = true
  const data = listData(props.collection, { q: query.value, page: page.value, perPage: 12 })
  totalPages.value = data.total_pages
  items.value = reset ? data.results : [...items.value, ...data.results]
  loading.value = false
}
function reload() { page.value = 1; fetchPage(true) }
function loadMore() { if (page.value < totalPages.value) { page.value += 1; fetchPage(false) } }
let deb
function onSearch(e) { query.value = e.target.value; clearTimeout(deb); deb = setTimeout(reload, 300) }

onMounted(reload)
</script>

<template>
  <div class="container py-4">
    <div class="row g-3 d-flex justify-content-between align-items-center mb-1">
      <div class="col-md-6">
        <h4 class="mb-0 fw-semibold text-primary">{{ title }}</h4>
        <p v-if="subtitle" class="text-muted mb-0">{{ subtitle }}</p>
      </div>
      <div class="col-md-3">
        <div class="search-box">
          <input type="text" class="form-control" placeholder="Tìm kiếm..." @input="onSearch" />
          <i class="ri-search-line search-icon"></i>
        </div>
      </div>
    </div>

    <div class="row gallery-wrapper h-auto mt-2">
      <div v-for="item in items" :key="item.id" class="element-item col-xxl-3 col-xl-4 col-sm-6">
        <EntityCard :item="item" :variant="variant" :to="{ name: routeName, params: { id: item.id } }" />
      </div>

      <div v-if="!loading && !items.length" class="col-12 text-center text-muted py-5">
        Không có dữ liệu
      </div>

      <div class="w-100 d-flex justify-content-center my-3">
        <span v-if="!loading && page < totalPages" @click="loadMore"
              class="link-success text-decoration-underline cursor-pointer">
          Xem thêm <i class="ri-arrow-right-line align-bottom"></i>
        </span>
      </div>

      <div v-if="loading" class="col-12 text-center py-4">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>
