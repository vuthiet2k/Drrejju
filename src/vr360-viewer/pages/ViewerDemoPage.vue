<script setup>
import { ref } from 'vue';

import fixture from '../assets/demo-tour.json';
import Vr360ViewerLayout from '../layout/Vr360ViewerLayout.vue';

const tour = ref(fixture);
</script>

<template>
  <Vr360ViewerLayout :tour="tour" :options="{ brand: 'VR360 DEMO', autoRotate: false }" />
</template>
