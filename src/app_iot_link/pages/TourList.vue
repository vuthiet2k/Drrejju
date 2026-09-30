<script setup>
import EntityListPage from '../components/EntityListPage.vue'
import { useTenant } from '../common/tenant'
const { routeNames: RN } = useTenant()
</script>
<template>
  <EntityListPage title="Tuyến du lịch" collection="routes" :route-name="RN.tourDetail" variant="tour" />
</template>
