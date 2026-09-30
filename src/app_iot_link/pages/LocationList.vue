<script setup>
import EntityListPage from '../components/EntityListPage.vue'
import { useTenant } from '../common/tenant'
const { routeNames: RN } = useTenant()
</script>
<template>
  <EntityListPage title="Địa điểm du lịch" collection="places" :route-name="RN.locationDetail" />
</template>
