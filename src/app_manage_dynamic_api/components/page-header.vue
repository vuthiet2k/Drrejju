<script>
import { useRoute } from 'vue-router';
export default {
  props: {
    items: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  setup: function () {

    const route = useRoute();
    const TITLE = route.meta.name;
    return { TITLE }
  },
  methods: {
    goTo(link) {
      this.$router.push({ name: link })
    }
  }
};
</script>

<template>
  <b-row>
    <b-col cols="12">
      <div class="page-title-box d-sm-flex align-items-center justify-content-between">
        <h4 class="mb-sm-0">{{ TITLE }}</h4>
        <div class="page-title-right">
          <!-- <ol class="breadcrumb m-0">
            <li class="breadcrumb-item" v-for="(item, index) in items" :key="index" :class="{ active: item.active }">
              <b-link @click="goTo(item.to)">{{ item.name }}</b-link>
            </li>
          </ol> -->
        </div>
      </div>
    </b-col>
  </b-row>
</template>
