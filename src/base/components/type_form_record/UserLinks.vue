<script setup>
import { defineProps, defineEmits, onMounted } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      facebook: "",
      tiktok: "",
      zalo: "",
    }),
  },
});

const emit = defineEmits(["update:modelValue"]);

const socialMeta = {
  facebook: {
    label: "Facebook",
    icon: "ri-facebook-fill",
    class: "bg-primary",
  },
  tiktok: {
    label: "Tiktok",
    img: require("@/assets/images/icon/tiktok_icon.png"),
    class: "bg-dark text-light",
  },
  zalo: {
    label: "Zalo",
    img: require("@/assets/images/icon/zalo-logo.png"),
    class: "bg-white",
  },
};

const updateField = (key, value) => {
  emit("update:modelValue", {
    ...props.modelValue,
    [key]: value,
  });
};

onMounted(() => {
  if (!props.modelValue) {
    emit("update:modelValue", {
      facebook: "",
      tiktok: "",
      zalo: "",
    });
  }
});
</script>

<template>
  <b-row>
    <b-col v-for="(value, key) in modelValue" :key="key" md="6">
      <div class="mb-3 d-flex">
        <div class="avatar-xs d-block flex-shrink-0 me-2">
          <span
            class="avatar-title rounded-circle fs-16"
            :class="socialMeta[key]?.class"
          >
            <i v-if="socialMeta[key]?.icon" :class="socialMeta[key].icon"></i>
            <img
              v-else-if="socialMeta[key]?.img"
              :src="socialMeta[key].img"
              height="20"
              width="20"
            />
          </span>
        </div>
        <input
          type="text"
          class="form-control"
          :placeholder="`Link đến ${socialMeta[key]?.label || key}`"
          :value="modelValue[key]"
          @input="(e) => updateField(key, e.target.value)"
        />
      </div>
    </b-col>
  </b-row>
</template>
