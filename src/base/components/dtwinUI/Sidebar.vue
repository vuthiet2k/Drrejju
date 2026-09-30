<script setup>
import { defineProps, defineEmits } from "vue";
import InputFileMapGeojs from "./form_type/InputFileMapGeojs.vue";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const updateModelValue = (value) => {
  emit("update:modelValue", value);
};
</script>
<template>
  <Teleport to="body">
    <b-offcanvas :modelValue="props.modelValue" backdrop>
      <template #default>
        <div class="p-3">
          <h4 id="sidebar-no-header-title">Custom header sidebar</h4>
          <p>
            Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
            dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta
            ac consectetur ac, vestibulum at eros.
          </p>
          <InputFileMapGeojs></InputFileMapGeojs>
          <nav class="mb-3">
            <b-nav vertical>
              <b-nav-item active @click="updateModelValue">Active</b-nav-item>
              <b-nav-item href="#link-1" @click="updateModelValue"
                >Link</b-nav-item
              >
              <b-nav-item href="#link-2" @click="updateModelValue"
                >Another Link</b-nav-item
              >
            </b-nav>
          </nav>
          <b-button variant="primary" block @click="updateModelValue"
            >Close Sidebar</b-button
          >
        </div>
      </template>
    </b-offcanvas>
  </Teleport>
</template>
