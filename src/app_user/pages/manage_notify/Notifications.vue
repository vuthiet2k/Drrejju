<template>
  <BTabs
    navClass="nav nav-pills animation-nav profile-nav gap-2 gap-lg-3 flex-grow-1"
    contentClass="text-muted mt-3"
    pills
  >
    <!-- Tab: Tất cả -->
    <BTab
      title="Tất cả"
      active
      @click="handleClickActiveTab('all')"
      value="all"
    >
      <NotificationListUI
        v-if="tabActive == 'all'"
        :type="tabActive"
        :key="'all'"
      />
    </BTab>

    <!-- Tab: Hệ thống -->
    <BTab
      title="Hệ thống"
      @click="handleClickActiveTab('system')"
      value="system"
    >
      <NotificationListUI
        v-if="tabActive == 'system'"
        :type="tabActive"
        :key="'system'"
      />
    </BTab>

    <!-- Tab: Công việc -->
    <BTab title="Công việc" @click="handleClickActiveTab('work')" value="work">
      <NotificationListUI
        v-if="tabActive == 'work'"
        :type="tabActive"
        :key="'work'"
      />
    </BTab>

    <!-- Tab: Cá nhân -->
    <BTab
      title="Cá nhân"
      @click="handleClickActiveTab('personal')"
      value="personal"
    >
      <NotificationListUI
        v-if="tabActive == 'personal'"
        :type="tabActive"
        :key="'personal'"
      />
    </BTab>
  </BTabs>
</template>

<script setup>
import { ref } from "vue";
import NotificationListUI from "./NotificationListUI.vue";

const tabActive = ref("all");
const handleClickActiveTab = (tab) => {
  tabActive.value = tab;
};
</script>
