<template>
  <LayoutDtwin2025>
    <LayoutProfile>
      <router-view />
    </LayoutProfile>
  </LayoutDtwin2025>
</template>

<script setup>
import LayoutDtwin2025 from "@/base/layouts/LayoutDtwin2025.vue";
import LayoutProfile from "./LayoutProfile.vue";
</script>
