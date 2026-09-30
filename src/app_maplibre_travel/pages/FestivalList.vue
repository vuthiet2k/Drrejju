<script setup>
import EntityListPage from '../components/EntityListPage.vue'
import { useTenant } from '../common/tenant'
const { routeNames: RN } = useTenant()
</script>
<template>
  <EntityListPage title="Sự kiện và lễ hội" collection="festivals" :route-name="RN.festivalDetail" />
</template>
