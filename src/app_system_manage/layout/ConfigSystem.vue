<script setup>
import { ref } from "vue";
import { SimpleBar } from "simplebar-vue3";
import { useRoute } from "vue-router";

const route = useRoute();

const tabs = ref([
  {
    id: "security",
    name: "Bảo mật",
    icon: "ri-shield-line",
    routeName: "SystemSecurityConfig",
  },
  {
    id: "email",
    name: "Email",
    icon: "ri-mail-line",
    routeName: "SystemEmailConfig",
  },
  {
    id: "backup",
    name: "Sao lưu",
    icon: "ri-database-2-line",
    routeName: "SystemBackupConfig",
  },
]);
</script>

<template>
  <div class="position-absolute d-flex gap-1" style="inset: 0">
    <!-- Sidebar -->
    <SimpleBar class="file-manager-sidebar h-100">
      <ul class="to-do-menu list-unstyled py-3 px-2 border-bottom">
        <li>
          <div class="px-2 mb-2">
            <small class="text-muted text-uppercase fw-semibold">
              HỆ THỐNG
            </small>
          </div>

          <ul class="list-unstyled">
            <li v-for="tab in tabs" :key="tab.id">
              <router-link
                class="nav-link d-flex align-items-center gap-2"
                :to="{ name: tab.routeName }"
                :class="{ active: route.name === tab.routeName }"
              >
                <i :class="tab.icon"></i>
                <span>{{ tab.name }}</span>
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </SimpleBar>

    <!-- Main Content -->
    <div class="flex-1 h-100">
      <SimpleBar class="h-100">
        <div class="card mb-1">
          <div id="toolbar-config-home" style="padding: 0.5rem"></div>
        </div>

        <router-view />
        <slot />
      </SimpleBar>
    </div>
  </div>
</template>
