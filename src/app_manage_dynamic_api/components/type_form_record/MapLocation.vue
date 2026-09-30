<script setup>
/* eslint-disable */
import { reactive, defineProps, defineEmits } from "vue";
import UseMap from "../common/useMap.vue";
import InputSearch from "../common/InputSearch.vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["update:modelValue"]);
const handleUpdateModelValue = ($e) => {
  emit("update:modelValue", $e.target.value);
};

const dataMap = reactive({
  show: false,
  marker: null,
  map: null,
  modelValue: props.modelValue,
});

const setMarker = (args) => {
  if (dataMap.marker) {
    dataMap.marker.setMap(null);
  }
  // Tạo đối tượng marker từ MarkerOption
  dataMap.marker = new map4d.Marker({
    position: args.location,
    draggable: true,
  });
  // Thêm marker vào bản đồ
  dataMap.marker.setMap(dataMap.map);
  dataMap.map.panTo(args.location);
};
const mapMounted = (map) => {
  dataMap.map = map;
  dataMap.map.addListener(
    "click",
    (args) => {
      setMarker(args);
    },
    {}
  );
};
const handleShowMap = () => {
  dataMap.show = true;
};
const handleClose = () => {
  dataMap.show = false;
};
const handleChoseLocation = (location) => {
  setMarker(location);
};

const handleSubmit = () => {
  dataMap.show = false;
  dataMap.modelValue = dataMap.marker.getPosition();
  emit("update:modelValue", dataMap.marker.getPosition());
};
</script>

<template>
  <input
    class="form-control"
    @change="handleUpdateModelValue"
    v-model="dataMap.modelValue"
    type="text"
  />
  <div class="d-flex justify-content-between align-items-center">
    <span></span>
    <p
      class="cursor-pointer text-primary p-0 m-0"
      style="text-decoration: underline"
      @click="handleShowMap"
    >
      Chọn từ bản đồ
    </p>
  </div>
  <b-modal
    v-model="dataMap.show"
    hide-footer
    body-class="p-0"
    header-class="p-3"
    modal-class="zoomIn"
    centered
    title="Thông tin thông báo"
    size="xl"
  >
    <div class="modal-body">
      <div class="mb-3">
        <div class="position-fixed" style="inset: 0">
          <div class="position-relative">
            <div
              class="position-absolute"
              style="z-index: 10; top: 0; right: 0; left: 0"
            >
              <InputSearch @change="handleChoseLocation"></InputSearch>
            </div>
            <UseMap @map-mounted="mapMounted" />
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-light" @click="handleClose">
        Đóng
      </button>
      <button type="button" class="btn btn-primary" @click="handleSubmit">
        Lưu
      </button>
    </div>
  </b-modal>
</template>
