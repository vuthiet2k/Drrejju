<script setup>
import { callOptionsMap } from "@/app_manage_dynamic_api/common/map/function_map.js";
/* eslint-disable */
import { ref, onMounted, defineEmits } from "vue";

const emit = defineEmits(["map-mounted"]);
const map4dRef = ref(null);

if (!map4d) {
  callOptionsMap();
}
onMounted(() => {
  let options = {
    center: { lat: 16.072163491469226, lng: 108.22690536081757 },
    zoom: 15,
    controls: false,
  };

  let map = new map4d.Map(map4dRef.value, options);
  emit("map-mounted", map);
});
</script>

<template>
  <div ref="map4dRef" class="w-100" style="height: 550px"></div>
</template>
