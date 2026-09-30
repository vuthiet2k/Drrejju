<script setup>
import { inject, defineProps, ref } from "vue";
import { getOffcanvas } from "../../common/useBoostrap.js";
import FilterTB from "./FilterTB.vue";

const manage_data = inject("manage-data");

const { toolbar } = manage_data.getData();
const props = defineProps({
  toolbarId: {
    type: String,
    default: "add-user",
  },
});

const setAction = (type) => {
  const setAction = (
    name = [],
    iconClass,
    arrFeatureChild,
    handle,
    component = () => {}
  ) => {
    return {
      name: name,
      icon: iconClass,
      action: arrFeatureChild,
      handle: handle,
      component: component(),
    };
  };
  switch (type) {
    case "right":
      return [
        setAction(
          "Bộ lọc",
          "las la-filter",
          [],
          ($e, _item) => {
            _item.component.props.modelValue.value = true;
          },
          () => {
            const showModelValue = ref(false);
            return {
              component: FilterTB,
              props: {
                modelValue: showModelValue,
                setModelValue: (new_value) => {
                  showModelValue.value = new_value;
                },
              },
            };
          }
        ),
        setAction("Nhóm theo", "las la-object-group", [], () => {}),
        setAction("Yêu thích", "las la-star", [], () => {}),
      ];
    case "left":
      return [
        setAction(
          "In ấn bản",
          "las la-download",
          [...toolbar.export],
          () => {}
        ),
      ];
  }
};
const arrActionRight = setAction("right");
const arrActionLeft = setAction("left");

const arrActionMobile = [
  [
    {
      name: "Thêm",
      icon: "mdi mdi-plus",
      action: [],
      handle: () => {
        const elAddOffcanvas = getOffcanvas(`offcanvas${props.toolbarId}`);
        elAddOffcanvas.show();
      },
    },
    ...arrActionLeft,
  ],
  [...arrActionRight],
];
const handleClickAcitonMobile = ($e, itemActionMB) => {
  if (itemActionMB.action.length) {
    $e.stopPropagation();
  }
  itemActionMB.handle();
};
const handleClickFFeatureActionMobile = (itemActionMB) => {
  switch (itemActionMB.name) {
    case "In ấn bản":
      break;
  }
};
const handleKeySearch = manage_data.handleTextSearch();
</script>

<template>
  <b-row class="">
    <b-col class="d-none d-md-block" xl="6">
      <b-card class="mb-0" no-body>
        <b-card-header>
          <b-row>
            <b-col
              md="6"
              class="mb-0 d-flex justify-content-between align-items-center"
            >
              <a
                href="javascript:void(0);"
                class="btn btn-primary btn-label"
                data-bs-toggle="offcanvas"
                :data-bs-target="'#offcanvas' + props.toolbarId"
                :aria-controls="'#offcanvas' + props.toolbarId"
              >
                <div class="d-flex">
                  <div class="flex-shrink-0">
                    <i class="mdi mdi-plus label-icon align-middle fs-16"></i>
                  </div>
                  <div class="flex-grow-1">Thêm</div>
                </div>
              </a>
            </b-col>
            <b-col
              md="6"
              class="mb-0 d-flex justify-content-between align-items-center mt-3 mt-xl-0"
            >
              <div></div>
              <!-- <template v-if="arrChecked.length">
                <div class="btn btn-info btn-label">
                  <div class="d-flex">
                    <div class="flex-shrink-0">
                      <span class="label-icon align-middle fs-12">{{
                        arrChecked.length
                      }}</span>
                    </div>
                    <div class="flex-grow-1">Đã chọn</div>
                  </div>
                </div>
                <div
                  v-for="(itemArrLeft, indexAL) in arrActionLeft"
                  :key="indexAL"
                >
                  <a
                    href="javascript:void(0);"
                    class="btn btn-info btn-label dropdown p-icon__toolbar"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div class="d-flex">
                      <div class="flex-shrink-0">
                        <i
                          :class="itemArrLeft.icon"
                          class="label-icon align-middle fs-16"
                        ></i>
                      </div>
                      <div
                        class="flex-grow-1 text-nowrap d-none title__name-action"
                      >
                        {{ itemArrLeft.name }}
                      </div>
                      <ul
                        v-if="itemArrLeft.action.length"
                        class="dropdown-menu dropdown-menu-end"
                        @click.stop
                      >
                        <li
                          v-for="(
                            itemExport, indexExport
                          ) in itemArrLeft.action"
                          :key="indexExport"
                          role="presentation"
                          @click="handleClickexport(itemExport)"
                        >
                          <button
                            class="dropdown-item"
                            type="button"
                            target="_self"
                          >
                            <i :class="itemExport.icon" class="me-2"></i>
                            <span>{{ itemExport.name }}</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </a>
                </div>
              </template> -->
              <div class="dropdown">
                <a
                  href="javascript:void(0);"
                  class="btn btn-success btn-label p-icon__toolbar"
                  data-bs-toggle="dropdown"
                  aria-expanded="true"
                >
                  <div class="d-flex">
                    <div class="flex-shrink-0">
                      <i class="las la-bolt label-icon align-middle fs-16"></i>
                    </div>
                    <div
                      class="flex-grow-1 text-nowrap d-none title__name-action"
                    >
                      Hành động
                    </div>
                    <ul class="dropdown-menu dropdown-menu-end">
                      <li
                        v-for="(actionDefault, indexAD) in toolbar.actions
                          .default"
                        :key="indexAD"
                        @click="actionDefault.handle"
                        v-show="actionDefault.show"
                      >
                        <div class="dropdown-item">
                          <i
                            :class="actionDefault.icon"
                            class="align-bottom me-2"
                          ></i>
                          {{ actionDefault.name }}
                        </div>
                      </li>
                      <slot name="action"></slot>
                    </ul>
                  </div>
                </a>
              </div>
            </b-col>
          </b-row>
        </b-card-header>
      </b-card>
    </b-col>
    <b-col xl="6">
      <b-card class="mb-0" no-body>
        <b-card-header>
          <b-row>
            <b-col
              xl="6"
              class="mb-0 d-flex justify-content-between align-items-center"
            >
              <div class="search-box w-100">
                <input
                  type="text"
                  class="form-control"
                  @keyup="handleKeySearch"
                  placeholder="Tìm kiếm"
                  v-model="toolbar.filters.search"
                />
                <i class="ri-search-line search-icon"></i>
                <span
                  v-show="toolbar.filters.search"
                  @click="manage_data.removeTextSearch"
                  class="position-absolute cursor-pointer fs-20 text-muted mdi mdi-close-circle search-widget-icon search-widget-icon-close"
                  style="right: 4px; top: 50%; transform: translateY(-50%)"
                ></span>
              </div>
              <b-col class="d-xl-none">
                <div class="dropdown">
                  <button
                    class="dropdown btn btn-outline-danger btn-icon waves-effect waves-light ms-2"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="true"
                  >
                    <i class="ri-mist-line fs-18"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <div
                      class="border-bottom-inset"
                      v-for="(itemTotalMB, indexTotalMB) in arrActionMobile"
                      :key="indexTotalMB"
                    >
                      <li
                        v-for="(itemActionMB, indexActionMB) in itemTotalMB"
                        :key="indexActionMB"
                        @click="
                          ($e) => handleClickAcitonMobile($e, itemActionMB)
                        "
                      >
                        <div class="dropdown-item dropdown">
                          <div
                            data-bs-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            <i
                              :class="itemActionMB.icon"
                              class="me-2 text-muted"
                            ></i>
                            {{ itemActionMB.name }}
                          </div>
                          <div class="dropdown-menu">
                            <div
                              v-for="(
                                featureMoreAciton, indexFMA
                              ) in itemActionMB.action"
                              :key="indexFMA"
                              class="dropdown-item"
                              @click="
                                handleClickFFeatureActionMobile(
                                  itemActionMB,
                                  featureMoreAciton
                                )
                              "
                            >
                              <i
                                :class="featureMoreAciton.icon"
                                class="me-2 text-muted"
                              ></i>
                              {{ featureMoreAciton.name }}
                            </div>
                          </div>
                        </div>
                      </li>
                    </div>
                  </ul>
                </div>
              </b-col>
            </b-col>
            <b-col
              md="6"
              class="align-items-center col-md-6 d-none d-xl-flex gap-2 justify-content-end mb-0 mt-3 mt-xl-0 toolbar__actions-right"
            >
              <div
                class="dropdown"
                v-for="(actionRight, indexAR) in arrActionRight"
                :key="indexAR"
              >
                <a
                  href="javascript:void(0);"
                  class="btn btn-danger btn-label p-icon__toolbar"
                  :data-bs-toggle="actionRight.action.length ? 'dropdown' : ''"
                  aria-expanded="false"
                  @click="($e) => actionRight.handle($e, actionRight)"
                >
                  <div class="d-flex">
                    <div class="flex-shrink-0">
                      <i
                        :class="actionRight.icon"
                        class="label-icon align-middle fs-16"
                      ></i>
                    </div>
                    <div
                      class="flex-grow-1 text-nowrap d-none title__name-action"
                    >
                      {{ actionRight.name }}
                    </div>
                    <ul
                      v-if="actionRight.action.length"
                      class="dropdown-menu dropdown-menu-end"
                      @click.stop
                    >
                      <li
                        v-for="(itemAction, indexAction) in actionRight.action"
                        :key="indexAction"
                        @click="handleClickexport(itemAction)"
                      >
                        <button class="dropdown-item" type="button">
                          <i :class="itemAction.icon" class="me-2"></i>
                          <span>{{ itemAction.name }}</span>
                        </button>
                      </li>
                    </ul>
                    <component
                      v-else-if="actionRight.component"
                      :key="indexAR"
                      v-bind="actionRight.component.props"
                      :is="actionRight.component.component"
                    >
                    </component>
                  </div>
                </a>
              </div>
            </b-col>
          </b-row>
        </b-card-header>
      </b-card>
    </b-col>
  </b-row>
  <div
    class="row align-items-center py-1 bg-white mt-3 d-none"
    style="border: 1px solid #ccc; margin-left: 0px !important"
  >
    <b-col class="d-none" xl="2" v-if="toolbar.filters.params.length">
      <select class="form-select" v-model="toolbar.filters.paramSelected">
        <option
          v-for="(item, index) in toolbar.filters.params"
          :key="index"
          :value="item.params"
        >
          {{ item.name }}
        </option>
      </select>
    </b-col>
  </div>
  <!-- <DemoRecord v-model="record.show"></DemoRecord> -->
</template>

<style scoped>
@media only screen and (max-width: 1800px) {
  .p-icon__toolbar {
    justify-content: center;
    -webkit-box-align: center;
    align-items: center;
    height: calc(1rem + 1.5em + 2px);
    width: calc(1rem + 1.5em + 2px);
    padding: 0;
  }
}

@media only screen and (min-width: 1802px) {
  .title__name-action {
    display: block !important;
  }

  .toolbar__actions-right {
    justify-content: space-between !important;
  }
}
</style>
