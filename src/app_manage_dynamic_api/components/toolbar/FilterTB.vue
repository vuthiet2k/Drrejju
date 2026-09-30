<script setup>
import { defineProps, inject } from "vue";

const manage_data = inject("manage-data");

const { toolbar } = manage_data.getData();
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  setModelValue: {
    type: Function,
  },
});

const handleUpdateModelValue = (_value) => {
  props.setModelValue(_value);
};

const handleClickFilter = () => {
  manage_data.handleCallApi();
  handleUpdateModelValue(false);
};
</script>

<template>
  <Teleport to="body">
    <b-modal
      :modelValue="props.modelValue"
      @update:modelValue="handleUpdateModelValue"
      hide-footer
      title="Lọc"
      class="v-modal-custom"
      size="xl"
    >
      <form action="javascript:void(0);">
        <b-row class="g-3">
          <b-col xl="12">
            <b-row>
              <b-col
                v-for="(field, indexField) in toolbar.fieldFilter"
                :key="indexField"
                lg="6"
                class="mb-3"
              >
                <label class="form-label">
                  {{ field.name }}
                </label>
                <div v-if="field.params.type == 'text'">
                  <input
                    type="text"
                    class="form-control"
                    v-model="field.value"
                  />
                </div>
                <div v-else-if="field.params.type == 'boolean'">
                  <input
                    type="checkbox"
                    class="form-check"
                    v-model="field.value"
                  />
                </div>
                <div v-else-if="field.params.type == 'datetime'">
                  <input
                    type="date"
                    class="form-control"
                    v-model="field.value"
                  />
                </div>
                <div v-else-if="field.params.type == 'rangetime'">
                  <b-row>
                    <b-col sm="6">
                      <input type="date" class="form-control" />
                    </b-col>
                    <b-col sm="6">
                      <input type="date" class="form-control" />
                    </b-col>
                  </b-row>
                </div>
              </b-col>
            </b-row>
          </b-col>
          <b-col lg="12">
            <div class="hstack gap-2 justify-content-end">
              <b-button
                type="button"
                variant="light"
                @click="handleUpdateModelValue(false)"
              >
                Đóng
              </b-button>
              <b-button
                type="button"
                variant="primary"
                @click="handleClickFilter"
                >Áp dụng</b-button
              >
            </div>
          </b-col>
        </b-row>
      </form>
    </b-modal>
  </Teleport>
</template>
