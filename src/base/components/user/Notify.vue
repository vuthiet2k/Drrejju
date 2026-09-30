<template>
  <div :class="['dropdown topbar-head-dropdown', { '': isMobile }]">
    <button
      type="button"
      class="btn btn-icon btn-topbar rounded-circle"
      :class="classIcon"
      id="page-header-notifications-dropdown"
      data-bs-toggle="dropdown"
      data-bs-auto-close="outsize"
      aria-expanded="true"
      :title="
        unreadedNotificationCount
          ? `Có ${unreadedNotificationCount} thông báo mới`
          : 'Thông báo'
      "
    >
      <div class="position-relative">
        <i class="bx bx-bell fs-22"> </i>
        <span
          class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          v-if="notifications?.length > 0"
          :class="notifications?.length < 10 ? 'px-2' : 'px-1'"
        >
          {{ unreadedNotificationCount }}
        </span>
      </div>
    </button>
    <div
      class="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0 m-0"
      :class="{ fullscreen__menu: isMobile }"
      aria-labelledby="page-header-notifications-dropdown"
    >
      <div class="dropdown-head rounded-top bg-ccc">
        <div class="p-3">
          <b-row class="align-items-center">
            <b-col
              class="d-none d-md-flex justify-content-between align-items-center"
            >
              <h6 class="m-0 text-uppercase fw-bold">Thông báo</h6>
              <router-link :to="'/notifications'" class="text-decoration-none">
                Xem tất cả
              </router-link>
            </b-col>
            <b-col class="d-md-none">
              <div
                class="card-header d-md-none"
                style="background-color: #d9e9f5"
              >
                <div class="align-items-center d-flex justify-content-between">
                  <div></div>
                  <h6 class="m-0 fs-4 text-uppercase">Thông báo</h6>
                  <i class="d-md-none ri-close-line fs-3" @click="hide"></i>
                </div>
              </div>
            </b-col>
          </b-row>
        </div>
        <div class="">
          <BTabs
            nav-class="nav nav-tabs dropdown-tabs nav-primary"
            content-class="tab-content"
            v-model="activeTab"
          >
            <BTab
              v-for="(tab, index) in tabs"
              :key="index"
              :title="tab.label"
              :active="tab.active"
            >
              <template #title>
                <span :class="tab.active ? '' : 'text-dark'">
                  {{ tab.label }}
                </span>
                <span
                  class="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-danger"
                  v-if="getUnReadNotifications(tab.belong_to).length"
                >
                  {{ getUnReadNotifications(tab.belong_to).length }}
                </span>
              </template>
            </BTab>
          </BTabs>
        </div>
      </div>

      <div class="position-relative">
        <div class="tab-content" id="notificationItemsTabContent">
          <div
            class="tab-pane py-2 ps-2 px-2"
            :class="{ active: activeTab === index }"
            v-for="(tab, index) in tabs"
            :key="index"
          >
            <SimpleBar
              data-simplebar
              :style="{ maxHeight: isMobile ? '100vh' : '300px' }"
              class="pe-2"
            >
              <!-- Hiển thị thông báo nếu có -->
              <template v-if="getNumberOfNotifications(tab.belong_to) > 0">
                <div
                  class="p-2 border-bottom"
                  v-for="(notify, notifyIndex) in getNotificationsByTab(
                    tab.belong_to
                  )"
                  :key="notifyIndex"
                >
                  <div class="d-flex">
                    <div class="avatar-sm">
                      <span
                        :class="{
                          'avatar-title rounded-circle d-flex align-items-center justify-content-center': true,
                          'bg-soft-primary text-primary': notify.is_read,
                          'bg-soft-danger text-danger': !notify.is_read,
                          'fs-16': true,
                        }"
                        style="width: 32px; height: 32px"
                      >
                        <i
                          :class="{
                            'ri-notification-line': !notify.is_read,
                            'ri-notification-off-line': notify.is_read,
                          }"
                        ></i>
                      </span>
                    </div>
                    <div class="flex-1 d-flex flex-column">
                      <div
                        :class="{
                          'notification-content': true,
                          'text-muted': notify.is_read,
                        }"
                        @click.stop="openModal(notify)"
                      >
                        <h6
                          :class="{
                            'fs-13': true,
                            'text-muted': notify.is_read,
                          }"
                          v-html="notify.title"
                        ></h6>
                        <span v-html="notify.metadata?.note"></span>
                        <p class="mb-0 fs-11 fw-medium text-muted">
                          <i class="mdi mdi-clock-outline"></i>
                          {{ timeAgo(notify.created_at) }}
                        </p>
                      </div>

                      <!-- Nút xem chi tiết ngay trong item -->
                      <div class="text-end">
                        <b-button
                          size="sm"
                          variant="link"
                          class="p-0 fs-12"
                          @click.stop="handleReadNotify(notify)"
                        >
                          Xem chi tiết
                        </b-button>
                      </div>
                    </div>

                    <div class="px-2 fs-15">
                      <span
                        style="
                          width: 10px;
                          height: 10px;
                          background-color: blue;
                          border-radius: 50%;
                        "
                        class="d-flex"
                        v-if="!notify.is_read"
                      ></span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Hiển thị khi không có thông báo -->
              <div
                v-else
                class="p-4 d-flex justify-content-center align-items-center"
              >
                <div class="empty-notification-elem">
                  <div class="w-25 pt-3 mx-auto">
                    <img
                      src="@/assets/images/bell.svg"
                      class="img-fluid"
                      height="48"
                      width="48"
                      alt="user-pic"
                    />
                  </div>
                  <div class="text-center mt-2">
                    <h6 class="fs-13 lh-base opacity-75">
                      Không có thông báo mới
                      <span
                        v-show="
                          tab.id != 'systems-tab' && tab.id != 'personals-tab'
                        "
                        >nào</span
                      >
                      !
                    </h6>
                  </div>
                </div>
              </div>
            </SimpleBar>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <b-modal
    v-model="showModal"
    title="Chi tiết thông báo"
    hide-footer
    size="lg"
    :backdrop="true"
  >
    <div v-if="selectedNotify">
      <h5 class="fw-bold mb-2" v-html="selectedNotify.title"></h5>
      <p v-html="selectedNotify.metadata?.note"></p>
      <p v-html="selectedNotify.message"></p>
      <p class="text-muted fs-12">
        <i class="mdi mdi-clock-outline"></i>
        {{ timeAgo(selectedNotify.created_at) }}
      </p>
      <div class="text-end mt-3">
        <b-button variant="primary" @click="handleViewDetail">
          Xem chi tiết
        </b-button>
        <b-button variant="secondary" class="ms-2" @click="showModal = false">
          Đóng
        </b-button>
      </div>
    </div>
  </b-modal>
</template>

<script setup>
import {
  ref,
  inject,
  defineProps,
  computed,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { getAccessToken } from "@/helpers/api/token";
import SimpleBar from "simplebar-vue";
import { WS } from "@/helpers/utils/config_system";
import { useFetch } from "@/helpers/api/api.js";
import { API_SERVER_URL } from "@/base/store/api/server_api";
import { useRouter, useRoute } from "vue-router";

const isMobile = inject("is-mobile");
defineProps({
  classIcon: {
    type: String,
    default: "btn-ghost-light",
  },
});
// Reactive data
const tabs = [
  {
    id: "systems-tab",
    label: "Hệ thống",
    active: true,
    belong_to: "system",
  },
  {
    id: "departments-tab",
    label: "Công việc",
    active: false,
    belong_to: "tasks",
  },
  {
    id: "personals-tab",
    label: "Cá nhân",
    active: false,
    belong_to: "personal",
  },
];
const router = useRouter();
const route = useRoute();
const notifications = ref([]);
const socket = ref(null);
const socketOpen = ref(false);
const timer = ref(null);
const activeTab = ref(0);

const showModal = ref(false);
const selectedNotify = ref(null);

const openModal = (notify) => {
  selectedNotify.value = notify;
  showModal.value = true;
};

const handleViewDetail = async () => {
  if (!selectedNotify.value) return;
  await handleReadNotify(selectedNotify.value);
  showModal.value = false;
};

// Computed properties
const filteredNotifications = computed(() => {
  return [...notifications.value].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
});

const getNotificationsByTab = (belong_to) => {
  return filteredNotifications.value.filter(
    (notify) => notify.belong_to === belong_to
  );
};
const unreadedNotificationCount = computed(() => {
  const n = notifications.value.filter((notify) => !notify.is_read);
  return n.length;
});

const handleReadNotify = async (notify) => {
  useFetch(API_SERVER_URL + "/notify/" + notify.id);
  notify.is_read = true;

  if (!notify?.metadata?.id || !notify?.metadata?.link) {
    // Bước 3: push lại route với slug đúng
    await router.push({
      name: "Notification",
      params: { slug: notify.slug },
    });
  } else {
    // // Step 1: Remove `id` from query
    // await router.push({
    //   path: `/${notify.metadata.link}`,
    //   query: { id: undefined },
    // });

    // // Step 2: Wait 1 second
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // // Step 3: Add `id` back
    // await router.push({
    //   path: `/${notify.metadata.link}`,
    //   query: { id: notify.metadata.id },
    // });
    reloadWithId(notify);
  }
};

const reloadWithId = async (notify) => {
  const targetPath = `/${notify.metadata.link}`;
  const targetId = notify.metadata.id;

  const currentPath = route.path;
  const currentId = route.query.id;

  // Nếu đang ở đúng path và id giống nhau
  const isSameRoute = currentPath === targetPath && currentId === targetId;

  if (isSameRoute) {
    // Step 1: Xóa id khỏi query
    const newQuery = { ...route.query };
    delete newQuery.id;

    await router.replace({
      path: targetPath,
      query: newQuery,
    });

    // Step 2: Đợi 1 giây
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Step 3: Thêm lại id
  await router.push({
    path: targetPath,
    query: { ...route.query, id: targetId },
  });
};

// // Methods
// const setStatusFilter = (status) => {
//   statusFilter.value = status;
// };

// const setTypeFilter = (type) => {
//   typeFilter.value = type;
// };

let reconnectTimer = null;

const connectWebSocket = async () => {
  const token = await getAccessToken();
  if (!token) return;
  socket.value = new WebSocket(
    `${WS}/ws/notify/?token=${token.replace("Bearer ", "")}`
  );

  socket.value.onopen = () => {
    socketOpen.value = true;
  };

  socket.value.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleMessage(data);
  };

  // socket.value.onerror = (event) => {
  //   console.error("WebSocket error: ", event);
  // };

  socket.value.onclose = async () => {
    // console.warn("WS closed:", event.code, event.reason);
    socketOpen.value = false;

    // Auto reconnect
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(async () => {
        reconnectTimer = null;
        await connectWebSocket(); // <-- Lấy token mới rồi connect lại
      }, 2000);
    }
  };
};

const handleMessage = (data) => {
  if (data.type === "init") {
    const combined = [...(data.personalized || []), ...(data.global || [])];
    notifications.value.splice(0, notifications.value.length, ...combined);
    return;
  }

  if (data.type === "del_notify" || data.del) {
    const index = notifications.value.findIndex((n) => n.id === data.id);
    if (index !== -1) notifications.value.splice(index, 1);
    return;
  }

  const idx = notifications.value.findIndex((n) => n.id === data.id);
  if (idx === -1) notifications.value.unshift(data);
  else notifications.value[idx] = data;
  console.log(notifications);
};

const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: "năm", seconds: 31536000 },
    { label: "tháng", seconds: 2592000 },
    { label: "ngày", seconds: 86400 },
    { label: "giờ", seconds: 3600 },
    { label: "phút", seconds: 60 },
    { label: "giây", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label} trước`;
    }
  }
  return "Vừa xong";
};

const getNumberOfNotifications = (belong_to) => {
  const arr_temp = notifications.value.filter((notify) => {
    return notify.belong_to == belong_to;
  });

  return arr_temp.length;
};

const getUnReadNotifications = (belong_to) => {
  if (belong_to) {
    return notifications.value.filter((notify) => {
      return notify.belong_to == belong_to && notify.is_read == false;
    });
  } else {
    return notifications.value.filter((notify) => {
      return notify.is_read == false;
    });
  }
};

const startTimer = () => {
  timer.value = setInterval(() => {
    // Force re-render to update time ago
  }, 60000);
};

// Lifecycle
onMounted(() => {
  if (!socketOpen.value) {
    connectWebSocket();
  }
  startTimer();
});

onBeforeUnmount(() => {
  if (socket.value) {
    socket.value.close();
  }
  if (timer.value) {
    clearInterval(timer.value);
  }
});
</script>

<style scoped>
.dot-new-notifications {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  top: 0px;
  right: -7px;
}
.topbar-badge {
  z-index: 10;
  right: -15px !important;
  top: 3px !important;
}

.bg-ccc {
  background-color: #d9e9f5;
}
.dropdown-menu-lg {
  width: calc(100vw - 65px);
}
@media (min-width: 600px) {
  .dropdown-menu-lg {
    width: 380px;
  }
}

.fullscreen__menu {
  width: 100vw !important;
  position: fixed !important;
  inset: 0 !important;
  transform: translate(0) !important;
  height: 100% !important;
}
</style>
