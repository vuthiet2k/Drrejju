<script setup>
import { defineProps, ref, watch } from "vue";
import ApexChart from "vue3-apexcharts";

const props = defineProps({
  labels: {
    type: Array,
    default: () => [],
  },
  viewsData: {
    type: Array,
    default: () => [],
  },
  postsData: {
    type: Array,
    default: () => [],
  },
  height: {
    type: Number,
    default: 300,
  },
});

const chartOptions = ref({
  chart: {
    height: props.height,
    type: "line",
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true,
      },
    },
    zoom: {
      enabled: true,
    },
  },
  colors: ["#405189", "#0ab39c"],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    width: 2,
  },
  grid: {
    borderColor: "#f1f1f1",
  },
  xaxis: {
    categories: props.labels,
    labels: {
      style: {
        colors: "#64748b",
        fontSize: "12px",
      },
    },
  },
  yaxis: [
    {
      title: {
        text: "Lượt xem",
        style: {
          color: "#405189",
          fontSize: "12px",
        },
      },
      labels: {
        style: {
          colors: "#405189",
          fontSize: "11px",
        },
      },
    },
    {
      opposite: true,
      title: {
        text: "Số bài",
        style: {
          color: "#0ab39c",
          fontSize: "12px",
        },
      },
      labels: {
        style: {
          colors: "#0ab39c",
          fontSize: "11px",
        },
      },
    },
  ],
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    fontSize: "12px",
    markers: {
      width: 8,
      height: 8,
      radius: 4,
    },
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: function (value, { seriesIndex }) {
        if (seriesIndex === 0) {
          return value.toLocaleString("vi-VN") + " lượt xem";
        } else {
          return value.toLocaleString("vi-VN") + " bài";
        }
      },
    },
  },
});

const series = ref([
  {
    name: "Lượt xem",
    data: props.viewsData,
    type: "line",
  },
  {
    name: "Số bài đã đọc",
    data: props.postsData,
    type: "line",
  },
]);

// Watch for data changes
watch(
  () => [props.labels, props.viewsData, props.postsData],
  () => {
    // Update categories
    chartOptions.value = {
      ...chartOptions.value,
      xaxis: {
        ...chartOptions.value.xaxis,
        categories: props.labels,
      },
    };

    // Update series data
    series.value = [
      {
        ...series.value[0],
        data: props.viewsData,
      },
      {
        ...series.value[1],
        data: props.postsData,
      },
    ];
  },
  { deep: true }
);

// Watch for height change
watch(
  () => props.height,
  (newHeight) => {
    chartOptions.value = {
      ...chartOptions.value,
      chart: {
        ...chartOptions.value.chart,
        height: newHeight,
      },
    };
  }
);
</script>

<template>
  <div>
    <ApexChart
      :options="chartOptions"
      :series="series"
      :height="height"
      type="line"
    />
  </div>
</template>
