<template>
  <LoadingSkeleton />
  <router-view />
</template>
<style>
.dropdown-item {
  cursor: pointer;
}
</style>

<script setup>
import { provide } from "vue";
import Token from "./helpers/user/user.js";
import userState from "./helpers/state/dataUser";
import LoadingSkeleton from "./base/components/LoadingSkeleton.vue";
import { clearAllCachedData } from "@/helpers/cache/cache";

clearAllCachedData();
provide("user", userState);
provide("logout", () => {
  Token().removeUser();
  userState.value = { isLogin: false };
});
</script>
