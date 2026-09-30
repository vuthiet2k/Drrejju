<script setup>
import { defineProps, defineEmits } from "vue";
import { onMounted, ref, watch, computed } from "vue";
// import dateInput from "@/base/components/date/date.vue";
import Select from "@/base/components/select/Select.vue";
import DateRange from "@/base/components/date/DateRange.vue";
const emit = defineEmits(["closeColumnFilter", "updateSearchValue"]);

const searchConfig = ref(null);
const columnData = ref(null);
const defaultSelect = { id: "", name: "" };

const props = defineProps({
  item: Object,
  searchFields: {}
});
const getSearchConfig = (searchField) => {
  const config = props.searchFields.find((field) => searchField == field.params);
  return config;
};

const showColumnClose = computed(() => {
  let show = false;
  if (
    columnData.value !== null &&
    columnData.value !== "" &&
    columnData.value?.id !== defaultSelect.id
  )
    show = true;
  return show;
});

const handleCloseFilter = () => {
  columnData.value = null;
  if (searchConfig.value?.type == "select") {
    columnData.value = defaultSelect;
  }
  emit("closeColumnFilter", true);
};

const handleChangeSearchValue = (data) => {
  emit("updateSearchValue", data ?? columnData.value);
};

watch(columnData, () => {
  const splitText = " đến ";
  let data = null;

  if (
    ["date", "datetime"].includes(searchConfig.value?.type) &&
    columnData.value != null
  ) {
    if (columnData.value.includes(splitText)) {
      data = columnData.value.split(splitText).join(";");
    } else {
      data = columnData.value;
    }
  }

  handleChangeSearchValue(data);
});

onMounted(() => {
  searchConfig.value = getSearchConfig(props.item.searchField);
});
</script>

<template>
  <div class="d-flex postition-relative w-100">
    <span
      @click="handleCloseFilter"
      class="position-absolute close-search-btn cursor-pointer"
      v-show="showColumnClose"
      >X</span
    >
    <template v-if="searchConfig?.type == 'date'">
      <DateRange
        :placeholder="item.name"
        :isDateTime="false"
        v-model="columnData"
      >
      </DateRange>
    </template>
    <template v-else-if="searchConfig?.type == 'datetime'">
      <DateRange
        :placeholder="item.name"
        :isDateTime="false"
        v-model="columnData"
      >
      </DateRange>
    </template>
    <template v-else-if="searchConfig?.type == 'select'">
      <Select
        :defaultValueLabel="item.name"
        :fakeOptionAll="true"
        :defaultValue="columnData"
        class="p-0 w-100"
        :placeholder="item.name"
        :isLocalSearch="!searchConfig?.source"
        :localData="searchConfig?.select"
        :api="searchConfig?.source"
        :searchField="searchConfig?.search_field ?? 'name'"
        :labelField="searchConfig?.label"
        :isCloseOnSelect="true"
        @change-data="(data) => (columnData = data)"
      >
      </Select>
    </template>
    <template v-else-if="searchConfig?.type == 'checkbox'"> CHECKBOX </template>
    <template v-else>
      <input
        :placeholder="item.name"
        type="text"
        class="form-control w-100 input-cus w-100"
        v-model="columnData"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.input-cus:hover {
  border: 1px solid gray;
}
.close-search-btn {
  z-index: 1;
  top: 21px;
  left: 15px;
}
</style>
