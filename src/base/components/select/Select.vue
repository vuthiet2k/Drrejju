<template>
  <div ref="selectContainer" :customID="id" class="position-relative">
    <template v-if="!showIcon">
      <div class="position-relative">
        <input
          type="text"
          class="form-control value__label--input"
          :placeholder="defaultValueLabel"
          autocomplete="off"
          v-model="valueLabel"
          readonly
          v-if="!multiSelect"
          :disabled="disable"
          :customID="id"
          @click="handleClickLabelInput"
          :class="{ 'is-invalid': !valueLabel && required && !disable }"
          style="cursor: default"
        />
        <div
          v-if="!multiSelect"
          class="position-absolute markdown__icon--select"
          style="pointer-events: none"
        >
          <i
            :style="{ 'pointer-events': !isShow ? 'none' : 'visible' }"
            class="ri-arrow-down-s-line"
          ></i>
        </div>
      </div>
    </template>
    <template v-else>
      <!-- Basic example -->
      <div class="input-group">
        <span class="input-group-text" id="basic-addon1"
          ><i :class="selectedData[iconField]"></i
        ></span>
        <input
          type="text"
          class="form-control value__label--input"
          :placeholder="defaultValueLabel"
          autocomplete="off"
          v-model="valueLabel"
          readonly
          v-if="!multiSelect"
          :disabled="disable"
          :customID="id"
          @click="handleClickLabelInput"
          :class="{ 'is-invalid': !valueLabel && required && !disable }"
        />
      </div>
    </template>
    <MultiSelectVisual
      :customID="id"
      :data="multiSelectedData"
      :subLabelField="subLabelField"
      v-if="multiSelect"
      :labelField="labelField"
      @on-remove-node="removeElementMulti"
      @on-click-visual="isShow = true"
      :disable="disable"
      :palaceholder="defaultValueLabel"
    >
    </MultiSelectVisual>
    <div
      v-show="isShow"
      ref="treeSelectArea"
      :customID="id"
      id="treeSelectArea"
      :class="{ 'dropdown-up': isDropUp }"
      :style="dropdownStyle"
      class="shadow"
    >
      <SimpleBar :style="{ 'max-height': dropdownMaxHeight + 'px' }">
        <div class="d-flex p-2 pb-1">
          <div class="search-box w-100">
            <div
              class="form-control py-1 d-flex flex-wrap gap-1"
              style="border-top-right-radius: 0; border-bottom-right-radius: 0"
            >
              <i class="ri-search-line search-icon"></i>
              <!-- Các trường chọn Lọc --><!-- Các trường tìm kiếm theo text -->
              <input
                ref="inputToSearch"
                type="text"
                placeholder="Tìm kiếm ..."
                autocomplete="off"
                v-model="searchValue"
                :customID="id"
                @keydown.enter.prevent="onkeyUpSearchValue"
                class="flex-1 border-0 bg-transparent input__no-border"
              />
              <span
                class="position-absolute cursor-pointer text-muted mdi mdi-close-circle search-widget-icon search-widget-icon-close"
                v-if="searchValue && !disable"
                @click.stop="clearSelection"
                style="right: 4px; top: 50%; transform: translateY(-50%)"
              ></span>
            </div>
          </div>
          <button
            :customID="id"
            @click="searchData()"
            class="btn btn-sm btn-primary"
            type="button"
            style="border-top-left-radius: 0; border-bottom-left-radius: 0"
          >
            <i class="ri-search-line" :customID="id"></i>
          </button>
        </div>
        <div :customID="id" ref="resultDiv">
          <div class="noresult" v-if="isSearching" :customID="id">
            <div class="text-center">
              <p class="mt-2">Đang tải ...</p>
            </div>
          </div>
          <div v-else :customID="id">
            <template v-if="listDataSorted.length">
              <div
                v-for="data in listDataSorted"
                :key="data.id"
                @click="handleClickItem(data)"
                class="w-100 px-2 py-1 d-flex align-items-center gap-1 cursor-pointer hover-bg-light hover-text-primary"
              >
                <div
                  :customID="id"
                  class="w-100 item-data"
                  :class="{ 'active-item': isSelectedItem(data) }"
                >
                  <p :customID="id" style="margin: 0px 2%">
                    <i v-if="showIcon" :class="data[iconField]"></i>
                    {{ data[labelField] ?? data["str"] ?? data["name"] }}
                  </p>
                </div>
              </div>
            </template>
            <template v-else-if="!listDataSorted.length && !isSearchedData">
              <p
                style="margin: 0px 2%"
                v-html="defaultNullData"
                :customID="id"
              ></p>
            </template>
            <template v-else>
              <notMatchSearch
                :customID="id"
              >
              </notMatchSearch>
            </template>
          </div>
        </div>
      </SimpleBar>
    </div>
  </div>
</template>

<script>
import { SimpleBar } from "simplebar-vue3";
import { useFetch } from "@/helpers/api/api.js";
import notMatchSearch from "@/base/components/search/notMatchSearch.vue";
import {
  removeVietnamese,
  removeExtraSpaces,
} from "@/helpers/utils/stringHandle.js";
import { uuidv4 } from "@/helpers/utils/uuid/uuid.js";
import {
  pushOrRemoveItemInList,
  removeItemFromList,
} from "./multiSelectHandler.js";
import MultiSelectVisual from "./MultiSelectVisual.vue";
import {
  isNullOrEmpty,
  areArraysEqual,
  areObjectsEqual,
} from "@/helpers/utils/objectHandle.js";

export default {
  data: () => {
    return {
      id: "",
      isSearching: false,
      // Khi dữ liệu trống mà chưa tìm kiếm sẽ hiển thị
      // TH1 isSearchedData = false; listDataSorted = [] => prop.defaultNullData | Vui lòng chọn Huyện trước khi chọn xã
      // TH2 isSearchedData = true; listDataSorted = [] => Từ khóa tìm kiếm không phù hợp với kết quả nào
      // TH3 isSearching = true => Đang tải || Đang tìm kiếm
      isSearchedData: false,
      // Dữ liệu được chọn hiện tại
      selectedData: {},
      // DS dữ liệu đã chọn
      multiSelectedData: [],
      // Dữ liệu hiển thị hiện tại được chọn là gì && sử dụng single select
      valueLabel: "",
      searchValue: "",
      // Hiển thị block tìm kiếm và chọn
      isShow: false,
      // Sử dụng khi dùng search local không call api
      // TH1: Sử dụng api để call dữ liệu ban đầu, nhưng dữ liệu này ít thay đổi nên dùng search local
      // => listDataSorted = listData.filter()
      // TH2: Sử dụng dữ liệu truyền vào thông qua trường localData và không truyền vào trường api => Search local
      listData: [],
      listDataSorted: [],

      // Xử lý cho croll tới cuối cùng thì load thêm 10 bản ghi | Hiện tại chưa dùng được
      perPage: 10,
      increasePerPage: 10,
      // Khi người dùng click vào searchhbox -> Hiển thị result box
      // Call api get data
      // 1. Nếu searchValue có dữ liệu thì call api + searchValue + perPage
      // Nếu có defaultSelected thì set searchValue = defaultSelected
      //
      isDropUp: false,
      dropdownMaxHeight: 250,
      dropdownStyle: {},
      searchTimeout: null,
    };
  },
  components: {
    notMatchSearch,
    SimpleBar,
    MultiSelectVisual,
  },
  computed: {},
  props: {
    // Giá trị mặc định được chọn là gì
    // Type: Object
    defaultValue: {
      default: null,
    },
    // Khi chưa chọn, chưa có dữ liệu gì thì hiển thị như thế nào
    defaultValueLabel: {
      type: String,
      default: "Chưa xác định",
    },
    // Khi dữ liệu trống thì hiển thị gì?
    defaultNullData: {
      type: String,
      default: "Dữ liệu trống!",
    },
    multiSelect: {
      type: Boolean,
      required: false,
      default: false,
    },
    closeOnSelect: {
      type: Boolean,
      required: false,
      default: false,
    },
    disable: {
      type: Boolean,
      required: false,
      default: false,
    },
    // Có yêu cầu bắt buộc chọn không
    required: {
      type: Boolean,
      default: false,
    },

    // url api https://api-vungnguyenlieu.inoste.vn/api/hoabinh
    api: {
      type: String,
      default: "",
    },
    // Trường để search là trường gì
    searchField: {
      type: String,
      default: "name",
    },
    // Trường hiển thị
    labelField: {
      type: String,
      default: "name",
    },
    subLabelField: {
      type: String,
      default: "name",
    },
    // Khi chọn sẽ đóng lại
    isCloseOnSelect: {
      type: Boolean,
      default: false,
    },
    // Không dùng api thì sẽ có thể nhập dữ liệu vào
    localData: {
      default: null,
    },
    // Không sử dụng API Search
    isLocalSearch: {
      type: Boolean,
      default: false,
    },
    iconField: {
      default: "name",
    },
    showIcon: {
      default: false,
    },
    searchKeyUp: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    this.id = uuidv4();
    window.addEventListener("click", this.handleClickOutside);
    window.addEventListener("resize", this.positionDropdown);
    this.initialComponent();
  },
  beforeUnmount() {
    window.removeEventListener("click", this.handleClickOutside);
    window.removeEventListener("resize", this.positionDropdown);
    clearTimeout(this.searchTimeout);
  },
  methods: {
    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.searchData(true);
      }, 500);
    },
    clearSelection() {
      this.selectedData = {};
      this.multiSelectedData = [];
      this.valueLabel = "";
      this.searchValue = "";
      this.searchData(true);
      this.onChangeData();
      this.isSearching = false;
      this.isSearchedData = false;
    },
    initialComponent() {
      //
      if (this.multiSelect) {
        if (!isNullOrEmpty(this.defaultValue)) {
          // Nếu default ofject == this.multiSelectedData thì có thể đây là trường hợp thay đổi giá trị multi sau đó chủ thể select thay đổi giá trị default truyền vào bằng chính giá trị mà select trả ra do đó để tránh trường hợp đệ quy thì sẽ cần có 1 bước check nếu object bằng sau thì sẽ không gán và không làm thay đổi giá trị mới của multiSelectedData => Không có vòng lặp onChangeMultiSelectedData => Select không return new cho chủ thể select
          if (this.multiSelectedData != this.defaultValue) {
            this.multiSelectedData = this.defaultValue;
          }
        }
      } else {
        if (!isNullOrEmpty(this.defaultValue))
          this.selectedData = { ...this.selectedData, ...this.defaultValue };
      }
      // Nếu khai báo url api thì sẽ lấy dữ liệu từ api
      if (!isNullOrEmpty(this.api)) {
        const query = this.getQuerySearch();
        useFetch(this.api + query).then((data) => {
          this.assignData(data);
        });
      }
      // Nếu khai báo dữ liệu localData
      else if (!isNullOrEmpty(this.localData)) {
        this.listData = [...this.localData];
        this.listDataSorted = [...this.localData];
      }
    },
    resetComponent() {
      this.isSearching = false;
      this.isSearchedData = false;
      this.selectedData = {};
      this.multiSelectedData = [];
      this.valueLabel = "";
      this.searchValue = "";
      this.isShow = false;
      this.listData = [];
      this.listDataSorted = [];
      this.perPage = 10;
      this.increasePerPage = 10;
      return true;
    },
    reloadComponent() {
      this.resetComponent();
      this.initialComponent();
    },
    onChangeDefaultValue() {
      this.reloadComponent();
    },
    onChangeLocalData() {
      this.reloadComponent();
    },
    onChangeSelectedData() {
      if (!isNullOrEmpty(this.selectedData)) {
        this.valueLabel = this.getValueLabel(this.selectedData);
        // this.searchValue = this.getValueLabel(this.selectedData);
        // this.searchData(true);
      }
      this.onChangeData();
    },
    onChangeMultiSelectedData() {
      this.onChangeData();
    },
    onkeyUpSearchValue(e) {
      if (this.searchKeyUp) {
        this.debouncedSearch(true);
        return;
      }

      if (e.key === "Enter" || e.keyCode === 13 || this.searchValue == "") {
        this.searchData(true);
      }
    },
    onChangeData() {
      if (this.multiSelect) {
        this.$emit("change-data", this.multiSelectedData);
      } else {
        this.$emit("change-data", this.selectedData);
      }
    },
    handleClickLabelInput() {
      this.isShow = true;
      this.$nextTick(() => {
        this.positionDropdown();
        setTimeout(() => {
          this.$refs.inputToSearch.focus();
        }, 100);
      });
    },
    handleClickItem(item) {
      if (this.isCloseOnSelect) this.isShow = false;
      let data;
      if (this.multiSelect) {
        this.multiSelectedData = pushOrRemoveItemInList(
          this.multiSelectedData,
          item
        );
        data = this.multiSelectedData;
      } else {
        this.selectedData = item;
        data = this.selectedData;
      }
      this.$emit("change-data", data);
    },
    handleClickOutside(event) {
      const customID = event.target.getAttribute("customID");
      if (customID != this.id) {
        this.isShow = false;
      }
    },
    getValueLabel(data) {
      if (!isNullOrEmpty(data)) {
        const valueLabel = data[this.labelField]
          ? data[this.labelField]
          : data[this.subLabelField];
        return valueLabel;
      } else {
        return "";
      }
    },
    getQuerySearch(useSearchVal) {
      let query = ``;
      const base64Encode = (str) => {
        // For browser environments
        if (typeof window !== "undefined") {
          // Convert string to UTF-8 array and then to base64
          return window.btoa(unescape(encodeURIComponent(str)));
        }
        // For Node.js environments (if your app runs SSR)
        else if (typeof Buffer !== "undefined") {
          return Buffer.from(str).toString("base64");
        }
        // Fallback (less ideal)
        return btoa(unescape(encodeURIComponent(str)));
      };

      const getFilterQuery = (searchValue) => {
        if (searchValue == "") return;
        const filterType = "unaccent_word_icontains";
        if (typeof this.searchField === "string") {
          const filterQuery = [[this.searchField, filterType, searchValue]];
          const filerQueryBase64 = base64Encode(JSON.stringify(filterQuery));
          return `?filter=${filerQueryBase64}`;
        }
        if (Array.isArray(this.searchField)) {
          return `?q=${searchValue}`;
        }
      };

      if (useSearchVal) {
        query = getFilterQuery(this.searchValue);
      } else {
        if (!isNullOrEmpty(this.selectedData)) {
          query = getFilterQuery(this.searchValue);
        }
      }
      if (this.perPage && query) {
        if (!this.api.includes("per_page=")) {
          // Nếu trong api đã có các params query sẵn thì sử dụng &
          query += `&per_page=${this.perPage}`;
        }
        query += `&per_page=${this.perPage}`;
      } else {
        query = `?per_page=${this.perPage}`;
      }
      const fullUrl = new URL(this.api, "https://example.com");
      const queryParams = new URLSearchParams(fullUrl.search);

      const urlTmp = new URL(query, "https://example.com");
      const qParamsTmp = new URLSearchParams(urlTmp.search);
      // Nếu trong api đã có các params query sẵn thì sử dụng &
      if (queryParams.size) query = `&${qParamsTmp}`;
      else query = `?${qParamsTmp}`;
      return query;
    },
    removeElementMulti(item) {
      const isRemoved = removeItemFromList(this.multiSelectedData, item);
      this.multiSelectedData = isRemoved.l;
    },
    isSelectedItem(item) {
      if (!this.multiSelect) {
        return item?.id == this.selectedData?.id;
      } else {
        if (this.multiSelectedData) {
          const finded = this.multiSelectedData.find((d) => {
            return d?.id == item?.id;
          });
          return finded;
        } else {
          return false;
        }
      }
    },
    assignData(data) {
      this.listData = data?.results ?? [];
      this.listDataSorted = data?.results ?? [];
    },
    async searchData(useSearchVal = this.searchValue) {
      // Khi người dùng click vào searchhbox -> Hiển thị result box
      // Call api get data
      // 1. Nếu searchValue có dữ liệu thì call api + searchValue + perPage
      // Nếu có defaultSelected thì set searchValue = defaultSelected
      //
      if (this.listData.length || this.listDataSorted.length || this.api) {
        this.isSearching = true;
        this.isSearchedData = true;
      }
      if (!this.isLocalSearch && this.api) {
        const query = this.getQuerySearch(useSearchVal);
        await useFetch(this.api + query).then((data) => {
          this.assignData(data);
          this.isSearching = false;
        });
      } else {
        let searchVal = removeVietnamese(this.searchValue);
        searchVal = removeExtraSpaces(searchVal);
        this.listDataSorted = this.listData.filter((el) => {
          let searchToSimple = removeVietnamese(el[this.searchField]);
          searchToSimple = removeExtraSpaces(searchToSimple);
          return searchToSimple.includes(searchVal);
        });
        this.isSearching = false;
      }
    },
    positionDropdown() {
      const containerRect = this.$refs.selectContainer.getBoundingClientRect();

      const spaceBelow = window.innerHeight - containerRect.bottom;
      const spaceAbove = containerRect.top;

      const minHeight = 100; // Minimum height for the dropdown

      if (spaceBelow < minHeight && spaceAbove > spaceBelow) {
        this.isDropUp = true;
        this.dropdownMaxHeight = Math.max(
          minHeight,
          Math.min(250, spaceAbove - 10)
        );
        this.dropdownStyle = {
          bottom: `${containerRect.height}px`,
          maxHeight: `${this.dropdownMaxHeight}px`,
        };
      } else {
        this.isDropUp = false;
        this.dropdownMaxHeight = Math.max(
          minHeight,
          Math.min(250, spaceBelow - 10)
        );
        this.dropdownStyle = {
          top: `${containerRect.height}px`,
          maxHeight: `${this.dropdownMaxHeight}px`,
        };
      }
    },
  },
  watch: {
    api: {
      immediate: true, // chạy 1 lần khi mounted
      handler(newApi, oldApi) {
        if (newApi !== oldApi) {
          this.reloadComponent();
        }
      },
    },
    defaultValue() {
      if (this.multiSelect) {
        const isEqual = areArraysEqual(
          this.defaultValue,
          this.multiSelectedData
        );
        if (!isEqual) {
          this.onChangeLocalData();
        }
      } else {
        const isEqual = areObjectsEqual(this.defaultValue, this.selectedData);
        if (!isEqual) {
          this.onChangeLocalData();
        }
      }
    },
    localData() {
      this.onChangeLocalData();
    },
    selectedData: {
      // eslint-disable-next-line
      handler: function (val, olVal) {
        this.onChangeSelectedData();
      },
      deep: true,
    },
    multiSelectedData: {
      // eslint-disable-next-line
      handler: function (val, olVal) {
        this.onChangeMultiSelectedData();
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.clear-button {
  position: absolute;
  right: 40px;
  top: 53%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 16px;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.clear-button:hover {
  color: #495057;
}

.value__label--input {
  padding-right: 44px;
}

.markdown__icon--select {
  font-size: 21px;
  top: 3px;
  right: 0px;
  height: 100%;
  text-align: center;
  justify-content: center;
  width: 43.03px;
}

.item-data {
  padding: 5px 0px;
}

.item-data:hover {
  background-color: #f3f6f9;
  cursor: pointer;
}

.active-item {
  background-color: #f3f6f9;
}

#treeSelectArea {
  background-color: #fff;
  z-index: 1000;
  border: 1px solid #ccc;
  position: absolute;
  left: 0;
  width: 100%;
}
#treeSelectArea.dropdown-up {
  top: auto;
  bottom: 100%;
}
</style>
