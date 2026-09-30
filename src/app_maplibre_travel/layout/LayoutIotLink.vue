<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import IotHeader from '../components/IotHeader.vue'
import IotFooter from '../components/IotFooter.vue'
import { provideTenant } from '../common/tenant'
import { thanhCongMaplibreTenant } from '../common/thanhCongTenant'
import './iot-theme.css'

// The home page is a full-screen map portal — no footer there. The tenant-
// specific layouts pass in their own `homeRoute` name; the default here keeps
provideTenant(thanhCongMaplibreTenant)

const props = defineProps({
  homeRoute: { type: String, default: 'MaplibreTravelHome' },
})
const route = useRoute()
const isHome = computed(() => route.name === props.homeRoute)
</script>

<template>
  <div class="iot-root">
    <IotHeader />
    <main class="iot-main">
      <router-view />
    </main>
    <IotFooter v-if="!isHome" />
  </div>
</template>
