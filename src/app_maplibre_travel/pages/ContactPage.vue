<script setup>
// Góp ý — mirrors contact.html (Velzon): title + card with map (col-xl-8) and
// a Bootstrap form (col-xl-4). Static build: no backend, hands off to mailto.
import { reactive, ref } from 'vue'
import { useTenant } from '../common/tenant'
import MaplibreTravelView from '../components/MaplibreTravelView.vue'

const { site: SITE, mapDefaults: MAP_DEFAULTS } = useTenant()

const form = reactive({ title: '', name: '', email: '', phone: '', address: '', question: '' })
const done = ref(false)
const errorMsg = ref('')

function reset() { Object.keys(form).forEach((k) => (form[k] = '')); errorMsg.value = '' }
function submit() {
  errorMsg.value = ''
  if (!form.title || !form.name || !form.email || !form.question) {
    errorMsg.value = 'Vui lòng nhập Tiêu đề, Họ tên, Email và Nội dung.'
    return
  }
  const body = `Họ tên: ${form.name}\nEmail: ${form.email}\nĐiện thoại: ${form.phone}\nĐịa chỉ: ${form.address}\n\n${form.question}`
  window.location.href = `mailto:?subject=${encodeURIComponent(form.title)}&body=${encodeURIComponent(body)}`
  done.value = true
}
</script>

<template>
  <div class="container py-4">
    <div class="text-center mb-3">
      <h4 class="fw-bold text-secondary text-uppercase fs-22">Góp ý với chúng tôi</h4>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="row g-4">
          <div class="col-xl-8">
            <div style="width:100%;min-height:480px;height:100%;">
              <MaplibreTravelView :center="MAP_DEFAULTS.center" :zoom="MAP_DEFAULTS.zoom"
                         :markers="[{ ...MAP_DEFAULTS.center, title: SITE.name }]" height="100%" />
            </div>
          </div>
          <div class="col-xl-4 col-md-8 mx-auto">
            <div v-if="!done">
              <form @submit.prevent="submit">
                <div class="mb-2">
                  <label class="form-label">Tiêu đề <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="form.title" />
                </div>
                <div class="mb-2">
                  <label class="form-label">Họ và tên <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="form.name" />
                </div>
                <div class="mb-2">
                  <label class="form-label">Email <span class="text-danger">*</span></label>
                  <input type="email" class="form-control" v-model="form.email" />
                </div>
                <div class="mb-2">
                  <label class="form-label">Điện thoại</label>
                  <input type="text" class="form-control" v-model="form.phone" />
                </div>
                <div class="mb-2">
                  <label class="form-label">Địa chỉ</label>
                  <input type="text" class="form-control" v-model="form.address" />
                </div>
                <div class="mb-2">
                  <label class="form-label">Nội dung câu hỏi <span class="text-danger">*</span></label>
                  <textarea class="form-control" v-model="form.question" rows="3"></textarea>
                </div>
                <p v-if="errorMsg" class="text-danger small mb-2">{{ errorMsg }}</p>
                <div class="row mt-3">
                  <div class="col"><button type="button" class="btn btn-danger w-100" @click="reset">Nhập lại</button></div>
                  <div class="col"><button type="submit" class="btn btn-primary w-100">Gửi</button></div>
                </div>
              </form>
            </div>
            <div v-else class="py-4">
              <h4 class="text-success">Cảm ơn bạn đã gửi thông điệp đến chúng tôi!</h4>
              <span class="cursor-pointer link-primary" @click="done = false; reset()">Gửi thêm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>
