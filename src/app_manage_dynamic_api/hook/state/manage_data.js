import { reactive } from "vue";
import Swal from "sweetalert2";
import API from "../../helper/api/useAxios.js";
import { errorToast } from "@/helpers/api/toastStyle";
import tool_bar from "./tool_bar.js";
import { swapArr } from "../../common/common.js";
import { debounce } from "../../common/common.js";

const setTable = (name, key, show = true) => {
  return { name: name, key: key, show: show };
};
var RESTABLE = [];
const ClassToolBar = new tool_bar();

class manage_data {
  constructor(path, param = "") {
    this.PARAM = `${param}`;
    this.CONSTPATH = path;
    // khai báo mặc định cho dữ liệu api
    this.data = reactive({
      results: [],
      total_pages: 1,
      current_page_number: 1,
      total_objects: 0,
      // Các thuộc tính thêm để hoàn thiện trang
      isLoading: true,
      checkedAll: false,
      loadedPreload: false,
    });
    ClassToolBar.setHandleAction(path, this.data, this);

    const { data: toolBar } = ClassToolBar.getData();
    this.toolBar = toolBar;

    API()
      .get(`${path}/preload/${param ? `?${param}` : ""}`)
      .then((res) => {
        if (!res) return;
        this.data.loadedPreload = true;
        RESTABLE = res.attributes.map((item) => {
          return setTable(item.name, item.path);
        });
        this.attribute = reactive(RESTABLE);
        ClassToolBar.setFieldFilter(res.filters);
        ClassToolBar.setActions(res.actions);
        ClassToolBar.setFilters(res.search);
      });
  }

  getData() {
    return {
      data: this.data,
      toolbar: { ...this.toolBar },
      attribute: this.attribute,
    };
  }
  setParam(param) {
    this.PARAM = param;
  }

  async handleCallApi(patch_api = this.CONSTPATH, param = this.PARAM) {
    if (!this.data.loadedPreload) {
      setTimeout(() => {
        this.handleCallApi();
      }, 200);
      return;
    }
    this.data.isLoading = true;
    this.data.checkedAll = false;
    let pramCheck = this.toolBar.filters.paramSelected
      ? this.toolBar.filters.search
        ? `&${this.toolBar.filters.paramSelected}=${this.toolBar.filters.search}`
        : ""
      : "";
    let paramsFiledFilter = "";
    if (this.toolBar.fieldFilter.length) {
      this.toolBar.fieldFilter.forEach((item) => {
        if (item.value) {
          paramsFiledFilter += `&${item.params?.param}=${item.value}`;
        }
      });
    }
    let res = await API().get(
      `${patch_api}/?page=${this.data.current_page_number}${pramCheck}&${param}${paramsFiledFilter}`
    );
    if (res?.message) {
      errorToast(res.message);
      this.data.isLoading = false;
      return;
    }
    if (!res?.results) {
      res = { ...res, results: [] };
    }
    this.data.results = res.results.map((item) => {
      return { ...item, checked: false };
    });
    this.data.total_pages = res.total_pages;
    this.data.isLoading = false;
    return this.data;
  }

  removeTextSearch() {
    this.toolBar.filters.search = "";
    this.handleCallApi();
  }

  async handleDelete(item, patch_api = this.CONSTPATH) {
    const result = await Swal.fire({
      title: "Bạn có muốn xoá không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Không",
    });
    if (!result.isConfirmed) {
      return;
    }
    const res = await API().remove(`/${patch_api}/${item.id}/`);
    if (res?.instance?.id) {
      this.handleCallApi();
      Swal.fire("Deleted!", `Bạn đã xoá ${res.instance.name}`, "success");
      return;
    }
    if (res?.id) {
      this.handleCallApi();
      Swal.fire("Deleted!", `Bạn đã xoá ${res?.name}`, "success");
      return;
    }
    // errorToast(
    //   "Hệ thống đang bảo trì! Thêm mới nhóm lớp dữ liệu không thành công. Vui lòng thử lại sau"
    // );
    try {
      errorToast(res.message);
    } catch (error) {
      errorToast("Xóa thất bại!");
    }
  }

  //Sự kiện cho Toolbar
  //Action-toolbar
  get showActions() {
    if (!this.data.results) {
      return false;
    } else if (this.data.results.some((item) => item.checked === true)) {
      return true;
    }
    return false;
  }

  setCheckedAll() {
    this.data.results = this.data.results.map((item) => {
      item.checked = this.data.checkedAll;
      return item;
    });
  }

  //Action-attribute
  swapAttribute(index1, index2) {
    swapArr(this.attribute, index1, index2);
  }

  //Filter-search
  handleTextSearch() {
    const self = this;
    return debounce(() => {
      self.data.current_page_number = 1;
      self.handleCallApi();
    }, 500);
  }

  getViewType() {
    return ClassToolBar.getTypeViewActive();
  }

  setViewType(_index) {
    ClassToolBar.setTypeViewActive(_index);
  }
}

export default manage_data;
