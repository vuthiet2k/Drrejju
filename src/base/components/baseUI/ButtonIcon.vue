<script setup>
import { defineProps } from "vue";

const props = defineProps({
  name: {
    type: String,
    default: "",
  },
  classIcon: {
    type: String,
    default: "ri-more-fill",
  },
  type: {
    type: String,
    default: "primary",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },
  href: {
    type: String,
    default: "javascript:void(0);",
  },
  target: {
    type: String,
    default: "_self",
  },
  title: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    default: "",
  },
  tabindex: {
    type: [String, Number],
    default: 0,
  },
  ariaLabel: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <a
    v-if="props.name"
    :href="props.disabled ? 'javascript:void(0);' : props.href"
    :target="props.target"
    :title="props.title || props.name"
    :id="props.id"
    :tabindex="props.disabled ? -1 : props.tabindex"
    :aria-label="props.ariaLabel || props.name"
    :aria-disabled="props.disabled"
    class="btn btn-label"
    :class="[
      `btn-${props.type}`,
      `btn-${props.size}`,
      {
        'btn-disabled': props.disabled,
        'opacity-50': props.disabled,
        'pe-none': props.disabled,
        'ps-3': props.size === 'sm',
      },
    ]"
    :disabled="props.disabled"
  >
    <div class="d-flex align-items-center">
      <div class="flex-shrink-0">
        <template v-if="props.loading">
          <i
            class="ri-loader-4-line spin label-icon align-middle"
            :class="{
              'fs-12 px-1 w-auto': props.size === 'sm',
              'fs-16': props.size === 'md',
              'fs-18': props.size === 'lg',
            }"
          ></i>
        </template>
        <i
          v-else
          :class="[
            props.classIcon,
            'label-icon align-middle',
            {
              'fs-12 px-1 w-auto': props.size === 'sm',
              'fs-16': props.size === 'md',
              'fs-18': props.size === 'lg',
            },
            props.loading ? 'ri-loader-4-line spin' : '',
          ]"
        ></i>
      </div>
      <div class="flex-grow-1" :class="{ 'ms-2': props.classIcon }">
        <template v-if="props.loading"> Đang tải... </template>
        <template v-else>
          {{ props.name }}
        </template>
      </div>
    </div>
  </a>
  <button
    v-else
    type="button"
    class="btn btn-icon waves-effect waves-light"
    :class="[`btn-${props.type}`, `btn-${props.size}`]"
  >
    <i
      :class="[
        props.classIcon,
        'label-icon align-middle',
        {
          'fs-12 px-1 w-auto': props.size === 'sm',
          'fs-16': props.size === 'md',
          'fs-18': props.size === 'lg',
        },
        props.loading ? 'ri-loader-4-line spin' : '',
      ]"
    ></i>
  </button>
</template>

<style scoped>
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.btn-disabled {
  cursor: not-allowed;
  pointer-events: none;
}
</style>
