<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title mb-0">Thống kê cá nhân</h5>
    </div>
    <div class="card-body">
      <!-- Phần thống kê tổng quan -->
      <BRow class="m-0 p-0 mb-4">
        <template v-for="(item, index) in statWidgets" :key="index">
          <div class="col-6 col-md-3 px-1">
            <div class="card card-animate position-relative mb-2">
              <div class="card-body">
                <!-- Title -->
                <div class="d-flex align-items-center mb-2">
                  <div class="flex-grow-1 overflow-hidden">
                    <p
                      class="text-uppercase fw-medium text-primary text-truncate mb-0"
                    >
                      {{ item.label }}
                    </p>
                  </div>
                </div>

                <!-- Content -->
                <div
                  style="height: 65px"
                  class="row align-items-center justify-content-between"
                >
                  <!-- 🔹 CASE 1: KHÔNG có chart → show icon + số -->
                  <template v-if="!item.chart">
                    <div class="col-12">
                      <h4
                        class="d-flex align-items-center gap-2 fs-3 ff-secondary mb-0"
                      >
                        <i :class="`${item.icon} fs-1`"></i>

                        <count-to
                          :startVal="0"
                          :endVal="item.counter"
                          :duration="300"
                        />
                        <span v-if="item.unit" class="ms-1">{{
                          item.unit
                        }}</span>
                      </h4>
                    </div>
                  </template>

                  <!-- 🔹 CASE 2: CÓ chart → show biểu đồ + số -->
                  <template v-else>
                    <div class="col-12 d-flex align-items-center">
                      <div class="text-center w-100">
                        <h4 class="fs-22 fw-semibold mb-2">
                          <count-to
                            :startVal="0"
                            :endVal="item.counter"
                            :duration="300"
                            :decimals="1"
                          />
                        </h4>
                        <div class="text-muted small">{{ item.unit }}</div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </template>
      </BRow>

      <!-- Biểu đồ thống kê 30 ngày -->
      <div class="card">
        <div class="card-header">
          <h5 class="card-title mb-0">
            <i class="ri-bar-chart-line align-middle me-2"></i>
            Thống kê 30 ngày gần nhất
          </h5>
          <div class="text-muted small">
            Tổng: {{ totalLast30DaysViews }} lượt xem /
            {{ totalLast30DaysPosts }} bài viết
          </div>
        </div>
        <div class="card-body">
          <LineChart
            v-if="lineChartData.labels.length > 0"
            :labels="lineChartData.labels"
            :viewsData="lineChartData.views"
            :postsData="lineChartData.posts"
            height="300"
          />
          <div v-else class="text-center py-5 text-muted">
            <i class="ri-line-chart-line fs-1"></i>
            <p class="mt-2">Không có dữ liệu để hiển thị</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import API from "@/helpers/api/useAxios.js";
import LineChart from "./component/LineChart.vue";
import { CountTo } from "vue3-count-to";

const { get } = API();

function buildWidgetItem({
  key,
  label,
  counter,
  icon,
  chart = false,
  unit = "",
}) {
  return {
    key,
    label,
    counter,
    icon,
    chart,
    unit,
  };
}

/**
 * Widget list cho thống kê
 */
const statWidgets = ref([
  buildWidgetItem({
    key: "total_views",
    label: "Tổng lượt xem",
    counter: 0,
    icon: "ri-eye-line text-primary",
    unit: "",
  }),
  buildWidgetItem({
    key: "unique_posts",
    label: "Số bài đã đọc",
    counter: 0,
    icon: "ri-article-line text-success",
    unit: "bài",
  }),
  buildWidgetItem({
    key: "total_comments",
    label: "Tổng bình luận",
    counter: 0,
    icon: "ri-chat-3-line text-info",
    unit: "",
  }),
  buildWidgetItem({
    key: "total_reactions",
    label: "Tổng tương tác",
    counter: 0,
    icon: "ri-heart-3-line text-danger",
    unit: "",
  }),
]);

const reportData = ref({});

const lineChartData = ref({
  labels: [],
  views: [],
  posts: [],
});

const totalLast30DaysViews = computed(() => {
  const last30Days = reportData.value?.last_30_days || [];
  return last30Days.reduce((sum, day) => sum + (day.total_views || 0), 0);
});

const totalLast30DaysPosts = computed(() => {
  const last30Days = reportData.value?.last_30_days || [];
  return last30Days.reduce((sum, day) => sum + (day.unique_posts || 0), 0);
});

onMounted(() => {
  get("users/me/stats").then((res) => {
    if (res.error) return;
    reportData.value = { ...res };
  });
});

watch(
  () => reportData.value,
  (data) => {
    if (!data || Object.keys(data).length === 0) return;

    const totals = data.my_totals || {};

    // Cập nhật widgets
    statWidgets.value = statWidgets.value.map((item) => {
      return {
        ...item,
        counter: totals[item.key] ?? 0,
      };
    });

    // Chuẩn bị dữ liệu biểu đồ
    const last30Days = data.last_30_days || [];
    const labels = [];
    const views = [];
    const posts = [];

    last30Days.forEach((day, index) => {
      const dateObj = new Date(day.date);
      const dayLabel = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

      if (index % 3 === 0 || index === last30Days.length - 1) {
        labels.push(dayLabel);
      } else {
        labels.push("");
      }

      views.push(day.total_views || 0);
      posts.push(day.unique_posts || 0);
    });

    lineChartData.value = { labels, views, posts };
  },
  { immediate: true, deep: true }
);
</script>
