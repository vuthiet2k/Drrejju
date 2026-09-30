<script setup>
// Detail wrapper — mirrors the original portal detail card (Velzon):
// a titled card with body, plus back link + loading/not-found states.
defineProps({
  title: { type: String, default: '' },
  loading: Boolean,
  notFound: Boolean,
  backTo: { type: [String, Object], default: null },
  backLabel: { type: String, default: 'Quay lại' },
})
</script>
<template>
  <div class="container py-4">
    <router-link v-if="backTo" :to="backTo" class="btn btn-sm btn-soft-primary mb-3">
      <i class="ri-arrow-left-line align-bottom me-1"></i>{{ backLabel }}
    </router-link>
    <div class="card shadow-none border mb-0">
      <div v-if="title" class="card-header">
        <h4 class="card-title mb-0">{{ title }}</h4>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>
        <div v-else-if="notFound" class="text-center text-muted py-5">Không tìm thấy dữ liệu</div>
        <slot v-else />
      </div>
    </div>
  </div>
</template>
