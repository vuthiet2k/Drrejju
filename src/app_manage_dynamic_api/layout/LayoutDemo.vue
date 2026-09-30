<script setup>
import { inject, defineProps } from "vue";
import ToolBar from "../components/toolbar/ToolBar.vue";
import PaginationUI from "../components/paging/PaginationUI.vue"

const manage_data = inject("manage-data");
const SOURCEAPI = inject("source-api");

const props = defineProps({
  toolbarId: {
    type: String,
    default: "add-user",
  },
  isCallApi: {
    type: Boolean,
    default: true
  }
});

const { data: dataMain, toolbar } = manage_data.getData();

if (props.isCallApi == true) {
  manage_data.handleCallApi(SOURCEAPI);
}

const handleChangePagination = (page) => {
  dataMain.current_page_number = page;
  manage_data.handleCallApi(SOURCEAPI);
};
const startDrag = (item, index, $e) => {
  $e.dataTransfer.setData("index", index);
};
const handleDrop = (item, index, $e) => {
  const indexDrag = $e.dataTransfer.getData("index");
  manage_data.swapAttribute(index, indexDrag);
};
</script>

<template>
  <div class="chat-wrapper mx-n4 mt-n4 p-3 h-100 d-flex flex-column gap-2">

    <ToolBar :toolbarId="props.toolbarId">
      <template #action>
        <slot name="toolbar-action" />
      </template>
    </ToolBar>

    <div class="card mb-0 flex-grow-1 position-relative" style="overflow-y: auto; overflow-x: hidden">
      <div v-if="dataMain.isLoading" class="d-flex justify-content-center align-items-center w-100 h-100 mt-4">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else class="card-body container-fluid">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>
            <!-- <span>Hiển thị <select>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>/trang</span> -->
          </div>
          <div>
            <div class="h-100 d-flex align-items-center gap-2">
              <button class="btn btn-outline-primary btn-icon waves-effect waves-light" type="button"
                v-for="(item, index) in toolbar.typeView" :key="index" :title="item.type"
                :class="{ 'text-bg-primary': item.active }" @click="manage_data.setViewType(index)">
                <i :class="item.icon" class="fs-18"></i>
              </button>
              <div class="dropdown text-center">
                <button class="btn btn-outline-primary btn-icon waves-effect waves-light" type="button"
                  data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="ri-settings-2-line fs-16"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end" @click.stop>
                  <li v-for="(item, index) in manage_data.attribute" :key="index"
                    @drop="($e) => handleDrop(item, index, $e)" @dragstart="($e) => startDrag(item, index, $e)"
                    @dragover.prevent @dragenter.prevent draggable="true">
                    <div class="d-flex align-items-center gap-2 cursor-pointer dropdown-item form-check form-switch px-2">
                      <input class="form-check-input m-0" role="switch" type="checkbox" v-model="item.show" />
                      <span>{{ item.name }}</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <template v-if="dataMain.results.length">
          <component :is="manage_data.getViewType().component">
            <slot name="actions-feild" />
          </component>
        </template>
        <template v-else>
          <p>Không có dữ liệu!</p>
        </template>
      </div>
    </div>
    <div class="d-flex justify-content-end p-3">
      <PaginationUI @change="handleChangePagination" :current-page="dataMain.current_page_number"
        :page-size="dataMain.total_pages"></PaginationUI>
    </div>
  </div>
</template>
