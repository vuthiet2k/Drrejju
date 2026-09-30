<script setup>
import {
  defineProps,
  defineExpose,
  provide,
  ref,
  useAttrs,
  computed,
  reactive,
} from "vue";
import classManageData from "@/app_manage_dynamic_api/hook/state/manage_data.js";
import Layout from "@/app_manage_dynamic_api/layout/main.vue";
import LayoutDemo from "@/app_manage_dynamic_api/layout/LayoutDemo.vue";
import FormOffcanvas from "./FormOffcanvas.vue";
import { BASE_URL } from "@/helpers/api/axiosHttp.js";
import {
  getPermissionApp,
  hasPermissionGroup,
} from "@/helpers/state/dataUser.js";
import { errorToast } from "@/helpers/api/toastStyle";
const PROXY = BASE_URL + "/api";

const address = {
  title: props.title,
  details: [{ name: "Quản lý " + props.title, to: "#" }],
};
const props = defineProps({
  slug: {
    type: String,
    default: "sipm-base",
  },
  title: {
    type: String,
    default: "Vui lòng nhập tiêu đề trang",
  },
  preloadApi: {
    type: String,
    default: "",
  },
  sourceApi: {
    type: String,
    default: "manage-subject/subject",
  },
  externalFeatures: {
    type: Array,
    default: () => [],
  },
  permission: {
    type: Object,
    default: () => getPermissionApp(),
  },
  pageLayout: {
    type: String,
    default: "vertical",
  },
});
const attrs = useAttrs();

// Check xem có quyền không
const actionKeys = ["add", "view", "edit", "delete"];
const disabledMap = reactive(
  actionKeys.reduce((acc, key) => {
    acc[key] = computed(() => {
      const attrNoName = `no-${key}`;
      // Nếu có thuộc tính can- thì ưu tiên kiểm tra quyền
      // Kiểm tra xem thuộc tính có được cung cấp không
      const isDisabledByAttr = Object.prototype.hasOwnProperty.call(
        attrs,
        attrNoName
      );
      const hasPerm = hasPermissionGroup(`can_${key}`);
      return isDisabledByAttr || !hasPerm;
    });
    return acc;
  }, {})
);

actionKeys.forEach((key) => {
  provide(`no-${key}`, disabledMap[key]);
});

const manage_data = new classManageData(
  `${props.sourceApi}`,
  "",
  props.preloadApi
);
const formUrl = PROXY + "/" + manage_data.CONSTPATH + "/form/";

provide("form-url", formUrl);
provide("manage-data", manage_data);
provide("source-api", props.sourceApi);
provide("permission-app", props.permission);

const handleClickDelete = ($event) => {
  if (!hasPermissionGroup("can_delete")) {
    errorToast("Bạn không có quyền xóa dữ liệu này");
    return;
  }
  const item = getValueItem($event);
  manage_data.handleDelete(item);
};

const handleClickUpToTop = ($event) => {
  if (!hasPermissionGroup("can_uptotop")) {
    errorToast("Bạn không có quyền đưa dữ liệu này lên đầu trang");
    return;
  }
  const item = getValueItem($event);
  manage_data.handleUpToTop(item);
};

const formOffcanvas = ref(null);

const handleClickDetail = ($event, id) => {
  if (id) {
    formOffcanvas.value.handleClickView(id);
    return;
  }
  const item = getValueItem($event);
  if (formOffcanvas.value) {
    formOffcanvas.value.handleClickView(item?.id);
  }
};

const handleClickEdit = ($event, id) => {
  if (id) {
    formOffcanvas.value.handleClickEdit(id);
    return;
  }
  const item = getValueItem($event);
  if (formOffcanvas.value) {
    formOffcanvas.value.handleClickEdit(item?.id);
  }
};

const handleReloadData = () => {
  manage_data.handleCallApi();
};

const getValueItem = ($event) => {
  // Kiểm tra nếu $event không tồn tại
  if (!$event) return null;

  // Kiểm tra nếu $event là Event object (có target property)
  if ($event && $event.target && $event.target.closest) {
    const target = $event.target.closest("ul");
    if (target) {
      const dataTarget = target.getAttribute("item");
      if (dataTarget) {
        try {
          return JSON.parse(dataTarget);
        } catch (error) {
          console.error("Lỗi parse JSON:", error);
          return null;
        }
      }
    }
  }

  // Nếu $event không phải là Event object, có thể nó đã là data
  // Kiểm tra nếu nó là string JSON
  if (typeof $event === "string") {
    try {
      return JSON.parse($event);
    } catch (error) {
      return null;
    }
  }

  // Nếu $event đã là object
  if (typeof $event === "object" && $event !== null) {
    return $event;
  }

  return null;
};

defineExpose({
  handleClickEdit,
  handleReloadData,
  handleClickDetail,
  handleClickDelete,
});
</script>

<template>
  <Layout
    :address="address"
    :items="address.details"
    chooseMenu="ban-do"
    :slug="props.slug"
    :pageLayout="props.pageLayout"
  >
    <LayoutDemo toolbarId="add">
      <template v-slot:toolbar-menu-left>
        <slot name="toolbar-menu-left" />
      </template>
      <template v-slot:toolbar-menu-left-left>
        <slot name="toolbar-menu-left-left" />
      </template>
      <template v-slot:btn-actions-field="{ item }">
        <slot name="btn-actions-field" :item="item" />
      </template>
      <template v-slot:actions-field="{ item }">
        <slot :item="item" />
        <li v-if="'up-to-top' in attrs">
          <div class="dropdown-item" @click="handleClickUpToTop">
            <i class="ri-star-line align-bottom me-2 text-warning"></i>
            Lên đầu trang
          </div>
        </li>
        <li v-if="!disabledMap.view">
          <div
            class="dropdown-item"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasview"
            @click="handleClickDetail"
            aria-controls="offcanvasview"
          >
            <i class="ri-eye-fill align-bottom me-2 text-info"></i>
            Xem chi tiết
          </div>
        </li>
        <li v-if="!disabledMap.edit">
          <div
            class="dropdown-item"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasupdate"
            @click="handleClickEdit"
            aria-controls="offcanvasupdate"
          >
            <i class="ri-pencil-fill align-bottom me-2 text-secondary"></i>
            Chỉnh sửa
          </div>
        </li>
        <li v-if="!disabledMap.delete">
          <div class="dropdown-item text-danger" @click="handleClickDelete">
            <i class="ri-delete-bin-fill align-bottom me-2 text-danger"></i>
            Xóa
          </div>
        </li>
      </template>
    </LayoutDemo>
    <FormOffcanvas ref="formOffcanvas" :externalFeatures="externalFeatures">
    </FormOffcanvas>
  </Layout>
</template>
