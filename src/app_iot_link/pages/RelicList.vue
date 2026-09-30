<script setup>
import EntityListPage from '../components/EntityListPage.vue'
import { useTenant } from '../common/tenant'
const { routeNames: RN } = useTenant()
</script>
<template>
  <EntityListPage title="Phân khu / Di tích" collection="relics" :route-name="RN.relicDetail" />
</template>
