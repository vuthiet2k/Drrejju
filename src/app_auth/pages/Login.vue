<script setup>
import { ref, watch } from "vue";
import AuthLayout from "../layouts/AuthLayout.vue";
import LoginContainer from "../components/LoginContainer.vue";
import userState from "@/helpers/state/dataUser";
import { useRouter } from "vue-router";

const router = useRouter();
const stateVerify = ref(false);
const UserID = ref("");

watch(
  () => userState.value.id,
  (value) => {
    if (value) {
      router.push("/");
    }
  }
);
</script>

<template>
  <AuthLayout>
    <LoginContainer
      :state-verify="stateVerify"
      :user-id="UserID"
      @update:state-verify="stateVerify = $event"
      @update:user-id="UserID = $event"
    />
  </AuthLayout>
</template>
