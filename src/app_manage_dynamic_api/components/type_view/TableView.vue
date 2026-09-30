<script setup>
import get from "lodash/get";
import { inject, onMounted, ref, computed } from "vue";
import TypeTemplateVIew from "./TypeTemplateVIew.vue";

const manage_data = inject("manage-data");
const arrHandleCustom = inject("handle-custom-event-table") ?? [];

const { data: dataMain, attribute } = manage_data.getData();
let isResizing = false;

const handleClickAttribute = (att) => {
  if (!att.sort || isResizing) return;

  att.sort.active = true;
  att.sort.desc = !att.sort.desc;
  manage_data.handleCallApi();
};

const handleClickTrView = ($e) => {
  let parentElement = $e.target.parentElement;
  if (parentElement && parentElement.tagName === "TD") {
    parentElement = parentElement.parentElement;
  }
  if (!parentElement && !parentElement.tagName === "TR") return;
  const eyeIcon = parentElement.querySelector(".ri-eye-fill");
  if (eyeIcon) {
    eyeIcon.click();
  }
};
const handleClickTr = ($e, attribute, item) => {
  if (!arrHandleCustom.length) {
    handleClickTrView($e);
    return;
  }
  // Tìm phần tử trong mảng arrHandleCustom với điều kiện name === attribute.key
  const customHandler = arrHandleCustom
    .filter(
      (item) => typeof item.type === "string" && item.type.startsWith("TABLE")
    )
    .find((item) => item.type === `TABLE${attribute.key}`);

  // Nếu tìm thấy, gọi hàm handle từ item đó
  if (customHandler && typeof customHandler.handle == "function") {
    customHandler.handle(item);
    return;
  }
  // Nếu không tìm thấy, trả về handleClickTrView làm mặc định
  handleClickTrView($e);
};

onMounted(() => {
  var tables = document.getElementsByTagName("table");
  for (var i = 0; i < tables.length; i++) {
    resizableGrid(tables[i]);
  }

  function resizableGrid(table) {
    var row = table.getElementsByTagName("tr")[0],
      cols = row ? row.children : undefined;
    if (!cols) return;

    // table.style.overflow = "hidden";

    var tableHeight = table.offsetHeight;

    for (var i = 0; i < cols.length; i++) {
      var div = createDiv(tableHeight);
      cols[i].appendChild(div);
      cols[i].style.position = "relative";
      setListeners(div);
    }

    function setListeners(div) {
      var pageX, curCol, nxtCol, curColWidth, nxtColWidth;

      div.addEventListener("mousedown", function (e) {
        isResizing = true; // Bắt đầu kéo, đặt cờ là true
        curCol = e.target.parentElement;
        nxtCol = curCol.nextElementSibling;
        pageX = e.pageX;

        var padding = paddingDiff(curCol);

        curColWidth = curCol.offsetWidth - padding;
        if (nxtCol) nxtColWidth = nxtCol.offsetWidth - padding;
      });

      div.addEventListener("mouseover", function (e) {
        e.target.style.borderRight = "2px solid #9595af";
      });

      div.addEventListener("mouseout", function (e) {
        e.target.style.borderRight = "";
      });

      document.addEventListener("mousemove", function (e) {
        if (curCol) {
          var diffX = e.pageX - pageX;

          if (nxtCol) nxtCol.style.width = nxtColWidth - diffX + "px";

          curCol.style.width = curColWidth + diffX + "px";
        }
      });

      document.addEventListener("mouseup", function () {
        setTimeout(() => {
          isResizing = false;
        }, 200);
        curCol = undefined;
        nxtCol = undefined;
        pageX = undefined;
        nxtColWidth = undefined;
        curColWidth = undefined;
      });
    }

    function createDiv(height) {
      var div = document.createElement("div");
      div.style.top = 0;
      div.style.right = 0;
      div.style.width = "5px";
      div.style.position = "absolute";
      div.style.cursor = "col-resize";
      div.style.userSelect = "none";
      div.style.height = height + "px";
      return div;
    }

    function paddingDiff(col) {
      if (getStyleVal(col, "box-sizing") == "border-box") {
        return 0;
      }

      var padLeft = getStyleVal(col, "padding-left");
      var padRight = getStyleVal(col, "padding-right");
      return parseInt(padLeft) + parseInt(padRight);
    }

    function getStyleVal(elm, css) {
      return window.getComputedStyle(elm, null).getPropertyValue(css);
    }
  }
});

const screenWidth = ref(window.innerWidth);
const computedClassTable = computed(() => {
  return screenWidth.value < 768 ? "w-auto" : "";
});
</script>

<template>
  <div class="live-preview">
    <div class="table-responsive" style="min-height: 300px">
      <table
        class="table table-bordered align-middle table-nowrap"
        :class="computedClassTable"
      >
        <thead class="table-light">
          <tr>
            <th scope="col" style="width: 46px">
              <div class="form-check text-center">
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="dataMain.checkedAll"
                  @change="manage_data.setCheckedAll()"
                />
              </div>
            </th>
            <template v-for="(item, index) in attribute">
              <th
                class="position-relative cursor-pointer"
                scope="col"
                :key="index"
                v-if="item.show"
                @click="handleClickAttribute(item)"
              >
                <div
                  class="dropdown text-center d-flex justify-content-between align-content-center"
                >
                  <span class="align-self-center ellipsis">
                    {{ item.name }}
                  </span>
                </div>
                <div
                  v-if="item.sort"
                  class="d-flex flex-column position-absolute justify-content-center"
                  style="top: 50%; right: 4px; transform: translateY(-50%)"
                >
                  <i
                    v-if="!item.sort.active"
                    class="mdi mdi-arrow-up-down-bold"
                  ></i>
                  <i v-else-if="!item.sort.desc" class="ri-arrow-up-s-fill"></i>
                  <i
                    v-else-if="item.sort.desc"
                    class="ri-arrow-down-s-fill"
                  ></i>
                </div>
              </th>
            </template>
            <th class="text-center" scope="col" style="max-width: 150px">
              <span class="d-none d-md-block">Hành động</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            class="hover-bg-light cursor-pointer"
            v-for="(item, index) in dataMain.results"
            :key="index"
          >
            <td>
              <div class="form-check text-center">
                <input
                  class="form-check-input"
                  v-model="item.checked"
                  type="checkbox"
                />
              </div>
            </td>
            <template v-for="(attributeItem, attributeIndex) in attribute">
              <td
                class="hover-text-primary ellipsis"
                :key="attributeIndex"
                v-if="attributeItem.show"
                :title="get(item, attributeItem.key, '')"
                @click="($e) => handleClickTr($e, attributeItem, item)"
              >
                <TypeTemplateVIew
                  :type="attributeItem.key"
                  :value="get(item, attributeItem.key, '')"
                ></TypeTemplateVIew>
              </td>
            </template>
            <td>
              <div class="dropdown text-center">
                <button
                  class="btn btn-soft-secondary btn-sm dropdown"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i class="mdi mdi-dots-vertical"></i>
                </button>
                <ul
                  class="dropdown-menu dropdown-menu-end"
                  :item="JSON.stringify(item)"
                >
                  <slot></slot>
                </ul>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
table {
  table-layout: fixed;
}

.ellipsis {
  max-width: 350px; /* Độ rộng cố định */
  white-space: nowrap; /* Không xuống dòng */
  overflow: hidden; /* Ẩn phần vượt quá khung */
  text-overflow: ellipsis; /* Hiển thị dấu "..." */
}
</style>
