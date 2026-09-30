<script setup>
import get from "lodash/get";
import { inject } from "vue";
import TypeTemplateVIew from "./TypeTemplateVIew.vue";

const manage_data = inject("manage-data");

const { data: dataMain, attribute } = manage_data.getData();
</script>

<template>
  <div class="h-100 row row-cols-lg-5 g-2 g-xl-3">
    <div class="col-6 col-md-4 d-flex justify-content-center" v-for="(item, index) in dataMain.results" :key="index">
      <div class="card w-100 d-flex flex-column cursor-pointer">
        <img src="@/assets/images/default/cardview.jpg" class="card-img-top opacity-50" style="max-height: 200px;"
          alt="img" />
        <!-- <div class="card-body flex-grow-0">
          <h5 class="card-title">{{ item.name }}</h5>
        </div> -->
        <ul class="list-group list-group-flush flex-grow-0">
          <template v-for="(attributeItem, attributeIndex) in attribute">
            <li :key="attributeIndex" v-if="attributeItem.show" class="list-group-item d-flex align-items-center"
              :title="get(item, attributeItem.key, '')">
              <b class="text-nowrap">{{ attributeItem.name }}: &nbsp;</b>
              <span class="ellipsis">
                <TypeTemplateVIew :type="attributeItem.key" :value="get(item, attributeItem.key, '')"></TypeTemplateVIew>
              </span>
            </li>
          </template>
          <li class="list-group-item">
            <div class="dropdown text-end">
              <button class="btn btn-soft-secondary btn-sm dropdown" type="button" data-bs-toggle="dropdown"
                aria-expanded="false">
                <i class="mdi mdi-dots-vertical"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end" :item="JSON.stringify(item)">
                <slot></slot>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
