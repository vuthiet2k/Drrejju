<template>
  <div class="row g-3">
    <!-- Sidebar Search -->
    <div class="col-xl-3 d-none d-xl-block">
      <AccordionInfor title="Tìm kiếm thông báo">
        <div class="mb-3">
          <b-form-input
            placeholder="Tìm kiếm thông báo..."
            v-model="searchQuery"
            @input="handleSearch"
          ></b-form-input>
        </div>
        <div class="d-flex flex-column">
          <div class="mb-3">
            <label class="form-label small fw-semibold">Trạng thái</label>
            <div class="form-check mb-1">
              <input
                class="form-check-input"
                type="checkbox"
                id="filter-unread"
                v-model="filters.status.unread"
                @change="applyFilters"
              />
              <label class="form-check-label" for="filter-unread">
                Chưa đọc
              </label>
            </div>
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                id="filter-read"
                v-model="filters.status.read"
                @change="applyFilters"
              />
              <label class="form-check-label" for="filter-read"> Đã đọc </label>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Thời gian</label>
            <select
              class="form-select form-select"
              v-model="filters.timeRange"
              @change="applyFilters"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="custom">Tùy chỉnh...</option>
            </select>

            <!-- Custom date range (ẩn/hiện theo custom) -->
            <div v-if="filters.timeRange === 'custom'" class="mt-2">
              <div class="row g-2">
                <div class="col-6">
                  <input
                    type="date"
                    class="form-control form-control"
                    v-model="filters.customStart"
                    @change="applyFilters"
                  />
                </div>
                <div class="col-6">
                  <input
                    type="date"
                    class="form-control form-control"
                    v-model="filters.customEnd"
                    @change="applyFilters"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end">
            <ButtonIcon type="danger" @click="resetFilters" name="Đặt lại" />
          </div>
        </div>
      </AccordionInfor>
    </div>
    <!-- Main Content -->
    <div class="col-xl-9">
      <AccordionInfor title="Danh sách thông báo">
        <template #icon>
          <!-- Bulk actions -->
          <div class="d-flex gap-2" @click.stop>
            <ButtonIcon
              v-if="hasUnreadNotifications"
              type="outline-primary"
              size="sm"
              @click="markAllAsRead"
              :disabled="isMarkingAll"
              classIcon="ri-check-double-line"
              title="Đánh dấu tất cả đã đọc"
            >
            </ButtonIcon>

            <div
              class="d-flex align-items-center gap-2"
              v-if="selectedNotifications.length > 0"
            >
              <ButtonIcon
                type="outline-success"
                size="sm"
                @click="markSelectedAsRead"
                class="flex-grow-1"
                classIcon="ri-check-line"
                title="Đọc đã chọn"
              >
              </ButtonIcon>
              <ButtonIcon
                type="outline-danger"
                size="sm"
                @click="deleteSelected"
                class="flex-grow-1"
                title="Xóa đã chọn"
                classIcon="ri-delete-bin-line"
              >
              </ButtonIcon>
              <ButtonIcon
                type="light"
                size="sm"
                @click="clearSelection"
                title="Bỏ chọn"
                classIcon="ri-close-line"
              >
              </ButtonIcon>
            </div>
          </div>
        </template>
        <div class="card-body p-0">
          <!-- Empty state -->
          <div
            v-if="filteredNotifications.length === 0"
            class="text-center py-5"
          >
            <notMatchSearch :search-text="searchQuery" />
            <BButton
              v-if="searchQuery || activeFiltersCount > 0"
              variant="outline-primary"
              size="sm"
              class="mt-3"
              @click="resetAll"
            >
              <i class="ri-refresh-line me-1"></i> Xóa bộ lọc
            </BButton>
          </div>

          <!-- Notifications table -->
          <div class="table-responsive" v-else>
            <table class="table table-hover table-nowrap mb-0">
              <thead class="table-light">
                <tr>
                  <th style="width: 40px">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :checked="isAllSelected"
                      @change="toggleSelectAll"
                    />
                  </th>
                  <th style="width: 60px"></th>
                  <th>Nội dung</th>
                  <th class="text-end">Thời gian</th>
                  <th style="width: 80px" class="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="notify in filteredNotifications"
                  :key="notify.id"
                  :class="[
                    'cursor-pointer',
                    { 'table-active': isSelected(notify.id) },
                    { 'opacity-75': notify.is_read },
                  ]"
                  @click="handleNotificationClick(notify)"
                >
                  <!-- Checkbox -->
                  <td @click.stop>
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :checked="isSelected(notify.id)"
                      @change="toggleSelect(notify.id)"
                    />
                  </td>

                  <!-- Status/Type icon -->
                  <td>
                    <div class="position-relative">
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
                      <span
                        v-if="!notify.is_read"
                        class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style="font-size: 6px; padding: 2px 4px"
                      >
                        ●
                      </span>
                    </div>
                  </td>
                  <!-- Content -->
                  <td>
                    <div
                      class="d-flex flex-column"
                      :class="{
                        'border-3 border-warning border-start ps-2':
                          notify.pinned,
                      }"
                    >
                      <!-- Title với badge ghim nhỏ -->
                      <div class="d-flex flex-column align-items-start mb-1">
                        <span
                          v-if="notify.pinned"
                          class="align-items-center badge d-flex gap-1 text-warning p-0 pb-1"
                        >
                          <i class="ri-pushpin-fill fs-10"></i>
                          Đã ghim
                        </span>

                        <div
                          :class="{
                            'fw-semibold': true,
                            'text-muted': notify.is_read && !notify.pinned,
                            'text-dark': !notify.is_read || notify.pinned,
                          }"
                        >
                          {{ notify.title }}
                        </div>
                      </div>

                      <!-- Message/Note -->
                      <small
                        :class="{
                          'text-muted': notify.is_read && !notify.pinned,
                          'text-body-secondary': notify.pinned,
                          'fw-medium': !notify.is_read || notify.pinned,
                        }"
                        v-if="notify.metadata?.note"
                      >
                        {{ notify.metadata.note }}
                      </small>
                      <small
                        :class="{
                          'text-muted': notify.is_read && !notify.pinned,
                          'text-body-secondary': notify.pinned,
                          'fw-medium': !notify.is_read || notify.pinned,
                        }"
                        v-else-if="notify.message"
                      >
                        {{ notify.message }}
                      </small>
                    </div>
                  </td>

                  <!-- Time -->
                  <td class="text-end">
                    <small class="text-muted">
                      {{ timeAgo(notify.created_at) }}
                    </small>
                  </td>

                  <!-- Actions -->
                  <td class="text-center" @click.stop>
                    <div class="btn-group btn-group-sm gap-2" role="group">
                      <ButtonIcon
                        v-if="!notify.is_read"
                        type="outline-primary"
                        size="sm"
                        :title="
                          notify.is_read
                            ? 'Đánh dấu chưa đọc'
                            : 'Đánh dấu đã đọc'
                        "
                        @click="toggleReadStatus(notify)"
                        :classIcon="{
                          'ri-check-line': !notify.is_read,
                          'ri-close-line': notify.is_read,
                        }"
                      />
                      <ButtonIcon
                        size="sm"
                        type="outline-warning"
                        :title="notify.pinned ? 'Bỏ ghim' : 'Ghim'"
                        @click="togglePin(notify)"
                        :classIcon="{
                          'ri-pushpin-line': !notify.pinned,
                          'ri-pushpin-fill text-warning': notify.pinned,
                        }"
                      />
                      <ButtonIcon
                        v-if="false"
                        size="sm"
                        type="outline-danger"
                        title="Xóa"
                        @click="deleteNotification(notify)"
                        classIcon="ri-delete-bin-line"
                      >
                      </ButtonIcon>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div
              class="d-flex justify-content-between align-items-center p-3 border-top"
              v-if="totalPages > 1"
            >
              <div class="text-muted small"></div>
              <PaginationUI
                @change="(page) => (currentPage = page)"
                :current-page="currentPage"
                :page-size="totalPages"
              />
            </div>
          </div>
        </div>
      </AccordionInfor>
    </div>
  </div>

  <b-modal v-model="showModal" title="Chi tiết thông báo" hide-footer size="lg">
    <div v-if="selectedNotify">
      <h5 class="fw-bold mb-2" v-html="selectedNotify.title"></h5>

      <p
        v-if="selectedNotify.metadata?.note"
        v-html="selectedNotify.metadata.note"
      />

      <p v-else-if="selectedNotify.message" v-html="selectedNotify.message" />

      <p class="text-muted fs-12">
        {{ timeAgo(selectedNotify.created_at) }}
      </p>

      <div class="text-end mt-3">
        <b-button
          variant="primary"
          @click="handleReadAndNavigate(selectedNotify)"
        >
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
import { ref, defineProps, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import API from "@/helpers/api/useAxios.js";
import AccordionInfor from "@/base/components/dtwinUI/AccordionInfor.vue";
import ButtonIcon from "@/base/components/baseUI/ButtonIcon.vue";
import PaginationUI from "@/base/components/baseUI/PaginationUI.vue";
import notMatchSearch from "@/base/components/search/notMatchSearch.vue";

const props = defineProps({
  type: {
    type: String,
    default: "all",
  },
});

const router = useRouter();
const route = useRoute();
const { get, post, remove } = API();
// Data
const notifications = ref([]);
const searchQuery = ref("");
const selectedNotifications = ref([]);
const isMarkingAll = ref(false);

/* ===== Modal state ===== */
const showModal = ref(false);
const selectedNotify = ref(null);
// Filter state
const filters = ref({
  status: {
    unread: false,
    read: false,
  },
  timeRange: "all",
  customStart: "",
  customEnd: "",
});

// Pagination
const currentPage = ref(1);
const perPage = ref(10);
const totalPages = ref(1);

// Debounce timer for search
let searchTimer = null;

const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.value.status.unread || filters.value.status.read) count++;
  if (filters.value.timeRange !== "all") count++;
  return count;
});

const hasUnreadNotifications = computed(() => {
  return notifications.value.some((n) => !n.is_read);
});

const filteredNotifications = computed(() => {
  let result = [...notifications.value];

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        (n.metadata?.note || "").toLowerCase().includes(query)
    );
  }

  // Status filter
  if (filters.value.status.unread && !filters.value.status.read) {
    result = result.filter((n) => !n.is_read);
  } else if (!filters.value.status.unread && filters.value.status.read) {
    result = result.filter((n) => n.is_read);
  }

  // Time filter
  if (filters.value.timeRange !== "all") {
    const now = new Date();
    const notificationDate = new Date();

    result = result.filter((n) => {
      notificationDate.setTime(new Date(n.created_at).getTime());

      switch (filters.value.timeRange) {
        case "today":
          return notificationDate.toDateString() === now.toDateString();
        case "week":
          var weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return notificationDate >= weekAgo;
        case "month":
          var monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return notificationDate >= monthAgo;
        case "custom":
          if (!filters.value.customStart || !filters.value.customEnd)
            return true;
          var start = new Date(filters.value.customStart);
          var end = new Date(filters.value.customEnd);
          end.setHours(23, 59, 59, 999);
          return notificationDate >= start && notificationDate <= end;
        default:
          return true;
      }
    });
  }

  // Sort: pinned first, then unread, then by time
  return result.sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
    if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
    return new Date(b.created_at) - new Date(a.created_at);
  });
});

const isAllSelected = computed(() => {
  if (filteredNotifications.value.length === 0) return false;
  return filteredNotifications.value.every((n) => isSelected(n.id));
});

// Methods

/* ===== Click row → mở modal ===== */
const handleNotificationClick = (notify) => {
  selectedNotify.value = notify;
  showModal.value = true;
};

/* ===== Đánh dấu đã đọc + điều hướng ===== */
const handleReadAndNavigate = async (notify) => {
  if (!notify) return;

  // mark read
  if (!notify.is_read) {
    await markAsRead(notify);
    notify.is_read = true;
  }

  // 👉 KHÔNG có metadata → trang chi tiết thông báo
  if (!notify?.metadata?.link || !notify?.metadata?.id) {
    await router.push({
      name: "Notification",
      params: { slug: notify.slug },
    });
    showModal.value = false;
    return;
  }

  // 👉 CÓ metadata → trang quy trình
  await reloadWithId(notify);
  showModal.value = false;
};

/* ===== Ép reload nếu đang ở đúng route ===== */
const reloadWithId = async (notify) => {
  const targetPath = `/${notify.metadata.link}`;
  const targetId = notify.metadata.id;

  const isSameRoute =
    route.path === targetPath &&
    route.query.id == targetId;

  if (isSameRoute) {
    const newQuery = { ...route.query };
    delete newQuery.id;

    await router.replace({
      path: targetPath,
      query: newQuery,
    });

    await new Promise((r) => setTimeout(r, 200));
  }

  await router.push({
    path: targetPath,
    query: { ...route.query, id: targetId },
  });
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

const handleSearch = () => {
  // Debounce search to avoid too many re-renders
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
  }, 300);
};

const applyFilters = () => {
  // Auto-apply when any filter changes
  currentPage.value = 1;
};

const resetFilters = () => {
  filters.value = {
    status: { unread: false, read: false },
    timeRange: "all",
    customStart: "",
    customEnd: "",
  };
  // Reset triggers filter update
  currentPage.value = 1;
};

const resetAll = () => {
  searchQuery.value = "";
  resetFilters();
  currentPage.value = 1;
};

const isSelected = (id) => {
  return selectedNotifications.value.includes(id);
};

const toggleSelect = (id) => {
  const index = selectedNotifications.value.indexOf(id);
  if (index === -1) {
    selectedNotifications.value.push(id);
  } else {
    selectedNotifications.value.splice(index, 1);
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // Deselect all on current page
    filteredNotifications.value.forEach((n) => {
      const index = selectedNotifications.value.indexOf(n.id);
      if (index !== -1) {
        selectedNotifications.value.splice(index, 1);
      }
    });
  } else {
    // Select all on current page
    filteredNotifications.value.forEach((n) => {
      if (!selectedNotifications.value.includes(n.id)) {
        selectedNotifications.value.push(n.id);
      }
    });
  }
};

const clearSelection = () => {
  selectedNotifications.value = [];
};


const markAsRead = async (notify) => {
  try {
    await get(`notify/${notify.id}/read/`);
    notify.is_read = true;
    notify.read_at = new Date().toISOString();
  } catch (error) {
    console.error("Error marking as read:", error);
  }
};

const toggleReadStatus = async (notify) => {
  try {
    if (notify.is_read) {
      return;
      // Mark as unread - Gọi API unread nếu có
      // await get(`notify/${notify.id}/unread/`);
      // notify.is_read = false;
      // notify.read_at = null;
    } else {
      // Mark as read
      await get(`notify/${notify.id}/`);
      notify.is_read = true;
      notify.read_at = new Date().toISOString();
    }
  } catch (error) {
    console.error("Error toggling read status:", error);
  }
};

const markAllAsRead = async () => {
  try {
    isMarkingAll.value = true;
    await post(`notify/mark-all-read/`);

    const now = new Date().toISOString();
    notifications.value.forEach((n) => {
      n.is_read = true;
      n.read_at = now;
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
  } finally {
    isMarkingAll.value = false;
  }
};

const markSelectedAsRead = async () => {
  if (selectedNotifications.value.length === 0) return;

  try {
    const now = new Date().toISOString();
    const promises = selectedNotifications.value.map((id) =>
      get(`notify/${id}/read/`)
    );
    await Promise.all(promises);

    notifications.value.forEach((n) => {
      if (selectedNotifications.value.includes(n.id)) {
        n.is_read = true;
        n.read_at = now;
      }
    });

    selectedNotifications.value = [];
  } catch (error) {
    console.error("Error marking selected as read:", error);
  }
};

const togglePin = async (notify) => {
  try {
    if (notify.pinned) {
      // Unpin
      await post(`notify/${notify.id}/unpin/`, {}, "Đã bỏ ghim");
    } else {
      // Pin
      await post(`notify/${notify.id}/pin/`, {}, "Đã ghim");
    }
    notify.pinned = !notify.pinned;
  } catch (error) {
    console.error("Error toggling pin:", error);
  }
};

const deleteNotification = async (notify) => {
  if (!confirm("Bạn có chắc chắn muốn xóa thông báo này?")) return;

  try {
    await remove(`notify/${notify.id}/`);
    const index = notifications.value.findIndex((n) => n.id === notify.id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
};

const deleteSelected = async () => {
  if (selectedNotifications.value.length === 0) return;
  if (
    !confirm(
      `Bạn có chắc chắn muốn xóa ${selectedNotifications.value.length} thông báo đã chọn?`
    )
  )
    return;

  try {
    const promises = selectedNotifications.value.map((id) =>
      remove(`notify/${id}/`)
    );
    await Promise.all(promises);

    notifications.value = notifications.value.filter(
      (n) => !selectedNotifications.value.includes(n.id)
    );
    selectedNotifications.value = [];
  } catch (error) {
    console.error("Error deleting selected:", error);
  }
};

// Fetch notifications
const fetchNotifications = async () => {
  try {
    const response = await get(
      `notify/?page=${currentPage.value}&page_size=${perPage.value}`
    );
    notifications.value = response.results || response.data || [];
    totalPages.value = response.total_pages || 1;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    notifications.value = [];
  }
};

// Lifecycle
onMounted(() => {
  fetchNotifications();
});

watch(
  () => props.type,
  () => {
    fetchNotifications();
    currentPage.value = 1;
    clearSelection();
  }
);
watch(
  () => currentPage.value,
  () => {
    fetchNotifications();
  }
);
</script>
