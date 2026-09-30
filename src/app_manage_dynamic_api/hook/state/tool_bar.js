// Đối tượng thanh công cụ là 1 thành phần nhỏ của trang quản lý
// Chức năng: tạo ra 1 đối tượng mới lưu trữ dữ liệu reactive cho thanh công cụ quản lý
// Khởi tạo mới trong mange_data và xử lý sự kiệm trong đó
// Không gọi API ở đây. Dữ liệu sẽ được gọi trong mange_data, chỉ có 1 api config cho app

import { reactive, ref } from "vue";
import TableView from "../../components/type_view/TableView.vue";
import CardView from "../../components/type_view/CardView.vue";
import API from "../../helper/api/useAxios.js";
import { createObjectFile } from "../../common/common.js";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { errorToast } from "@/helpers/api/toastStyle";
import Swal from "sweetalert2";

const toastId = ref("");
const notify = (title = "Đang tiến hành kiểm tra") =>
  (toastId.value = toast.loading(title, {
    autoClose: false,
    transition: toast.TRANSITIONS.SLIDE,
    position: toast.POSITION.BOTTOM_RIGHT,
    icon: false,
  }));
const close = () => {
  toast.remove(toastId.value);
};
const setTypeView = (
  title,
  classIcon,
  component,
  active = false,
  props = {}
) => {
  return {
    type: title,
    icon: classIcon,
    component: component,
    active: active,
    props: props,
  };
};

class tool_bar {
  constructor() {
    this.data = reactive({
      filters: {
        search: "",
        params: [],
        body: [],
        paramSelected: "",
      },
      fieldFilter: [],
      typeView: [
        setTypeView("card", "las la-list", CardView),
        setTypeView("table", "las la-th-list", TableView, true),
      ],
      actions: {
        default: [],
        more: [],
      },
      export: [],
      delete: [],
    });
  }

  getData() {
    return { data: { ...this.data } };
  }

  getTypeViewActive() {
    return this.data.typeView.filter((item) => item.active === true)[0];
  }

  setTypeViewActive(_index) {
    this.data.typeView = this.data.typeView.map((item) => {
      item.active = false;
      return item;
    });
    this.data.typeView[_index].active = true;
  }

  setActions(ACTIONS) {
    this.data.actions.default.length = 0;
    if (!ACTIONS.default.length) return;
    const setAction = (name, class_icon, show = true, handle = () => {}) => {
      switch (name) {
        case "Xuất tất cả":
          handle = this.data.export[0].handle;
          break;
        case "Xuất excel tất cả":
          handle = this.data.export[0].handle;
          break;
        case "Xuất theo mục đã chọn":
          handle = this.data.export[1].handle;
          break;
        case "Xuất excel theo mục đã chọn":
          handle = this.data.export[1].handle;
          break;
        case "Xóa theo mục đã chọn":
          handle = this.data.delete[0].handle;
          break;
      }
      return { name: name, icon: class_icon, show: show, handle: handle };
    };
    this.data.actions.default = ACTIONS.default.map((item) => {
      return setAction(item.name, item.icon, item.permission);
    });
  }

  setFilters(FILTERS) {
    this.data.filters.search = "";
    if (!FILTERS.length) return;
    const setFilter = (name, params, selected = false) => {
      return { name: name, params: params, selected: selected };
    };
    this.data.filters.params = FILTERS.map((item) => {
      return setFilter(item.name, item.params);
    });
    this.data.filters.paramSelected = FILTERS[0].params;
  }

  setFieldFilter(FILTERS) {
    if (!FILTERS?.length) return;
    FILTERS.map((field) => {
      this.data.fieldFilter.push({
        field: field["field"],
        name: field["name"],
        params: field["params"][0],
        value: "",
      });
    });
  }

  setHandleAction(path, data, selfManageClass) {
    this.data.export.length = 0;
    this.data.delete.length = 0;
    const setItemExport = (name, icon, handle = () => {}) => {
      return { name: name, icon: icon, handle: handle };
    };

    this.data.export.push(
      setItemExport("Tất cả", "ri-edit-2-line", async () => {
        notify();
        const res = await API().get(`${path}/export-excel/`, "arraybuffer");
        close();
        if (!res) return;
        createObjectFile(
          res,
          `${path}.xlsx`,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;"
        );
      })
    );
    this.data.export.push(
      setItemExport("Đã chọn", "mdi mdi-shape-plus", async () => {
        let arrValue = [];
        if (data.results.length) {
          arrValue = data.results.filter((item) => {
            return item.checked;
          });
        }
        notify();
        const res = await API().get(
          `${path}/export-excel/?user_ids=${arrValue.map((item) => item.id)}`,
          "arraybuffer"
        );
        close();
        if (!res) return;
        createObjectFile(
          res,
          `${path}.xlsx`,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;"
        );
      })
    );
    this.data.delete.push(
      setItemExport("Đã chọn", "mdi mdi-shape-plus", async () => {
        let arrValue = [];
        if (data.results.length) {
          arrValue = data.results.filter((item) => {
            return item.checked;
          });
        }
        if (!arrValue.length) {
          errorToast("Vui lòng chọn những mục bạn muốn xoá");
          return;
        }
        const result = await Swal.fire({
          title: `Bạn có muốn xoá ${arrValue.length} mục không?`,
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
        let _success = 0;
        let _error = 0;
        // Tạo một mảng chứa các promise từ việc gọi API
        const apiPromises = arrValue.map(async (element) => {
          try {
            const res = await API().remove(`/${path}/${element?.id}/`);
            if (res?.instance?.id) {
              _success++;
            } else {
              _error++;
            }
          } catch (error) {
            _error++;
          }
        });

        try {
          // Đợi cho tất cả các promise hoàn thành
          await Promise.all(apiPromises);

          if (_success) {
            Swal.fire("Deleted!", `Bạn đã xoá ${_success} mục`, "success");
          }
          if (_error) {
            errorToast(`Xoá thất bại ${_error} mục`);
          }
          selfManageClass.handleCallApi();
        } catch (error) {
          errorToast("Xoá thất bại");
        }
      })
    );
  }
}
export default tool_bar;
