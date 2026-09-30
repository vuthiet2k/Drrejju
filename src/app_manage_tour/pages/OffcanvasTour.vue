<script setup>
import { ref, reactive, inject, defineProps, watch } from "vue";
import { BASE_URL } from "@/helpers/api/axiosHttp";
import API from "@/helpers/api/useAxios";
import Photo from "@/base/components/photo/Photo.vue";
import Select from "@/base/components/select/Select.vue";
import TextEditor from "@/base/components/editor/TextEditor.vue";
import LayoutRecord from "@/app_manage_dynamic_api/layout/record/LayoutRecord.vue";

const btnSaveAdd = ref(null);
const manage_data = inject("manage-data");
const isLoading = ref(false); // Trạng thái loading

const props = defineProps({
  idView: {
    type: String,
    required: true,
  },
  idEdit: {
    type: String,
    required: true,
  },
});
// Dữ liệu Tour
const tourData = reactive({
  name: "",
  photo_maker: "",
  short_description: "",
  description: "",
  price: "",
  time: "",
  place_in_tour: [],
});

const currentViewData = ref(null);

watch(
  () => [props.idEdit, props.idView], // Theo dõi cả hai giá trị
  async ([newIdEdit, newIdView]) => {
    if (!newIdEdit && !newIdView) return; // Nếu cả hai không thay đổi, không làm gì

    isLoading.value = true; // Bắt đầu loading
    try {
      // Xác định ID nào thay đổi và thực hiện hành động tương ứng
      const targetId = newIdEdit || newIdView;
      currentViewData.value = await API().get(`manage-tour/tour/${targetId}/`);

      tourData.photo_maker = currentViewData.value?.photo_maker;
      tourData.name = currentViewData.value?.name;
      tourData.short_description = currentViewData.value?.short_description;
      tourData.description = currentViewData.value?.description;
      tourData.price = currentViewData.value?.price;
      tourData.time = currentViewData.value?.time;
      tourData.place_in_tour = currentViewData.value.place_in_tour ?? [];
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    } finally {
      isLoading.value = false; // Dừng loading
    }
  },
  { immediate: true }
);

// Hàm lưu dữ liệu
const handleSaveAdd = async () => {
  isLoading.value = true; // Bắt đầu loading
  try {
    API().post(
      "manage-tour/tour/",
      createFormData(tourData),
      "Đã lưu lại thông tin của bạn",
      "Vui lòng kiểm tra lại thông tin!"
    );
  } catch (error) {
    console.error("Có lỗi xảy ra:", error);
  } finally {
    manage_data.handleCallApi();
    isLoading.value = false; // Dừng loading
  }
};

const handleSelectAddLocation = (data) => {
  tourData.place_in_tour = [...data];
};

// Hàm reset dữ liệu
const handleReset = () => {
  tourData.photo_maker = "";
  tourData.name = "";
  tourData.short_description = "";
  tourData.description = "";
  tourData.price = "";
  tourData.time = "";
  tourData.place_in_tour = [];
};
// Hàm lưu chỉnh sửa tour
const handleSaveUpdate = async () => {
  isLoading.value = true;
  try {
    await API().patch(
      `manage-tour/tour/${props.idView}/`,
      createFormData(tourData)
    );
  } catch (error) {
    console.error("Lỗi khi cập nhật dữ liệu:", error);
  } finally {
    isLoading.value = false; // Dừng loading
    manage_data.handleCallApi();
  }
};

// Hàm chọn địa điểm
const handleSelectUpdateLocation = (data) => {
  tourData.place_in_tour = [...data];
};

// Hàm reset dữ liệu
const handleResetUpdate = () => {
  Object.keys(tourData).forEach((key) => {
    tourData[key] = Array.isArray(tourData[key]) ? [] : "";
  });
};
const createFormData = (data) => {
  const formData = new FormData();

  // Thêm từng trường vào FormData
  formData.append("name", data.name || "");
  formData.append("photo_maker", data.photo_maker); // File sẽ được thêm trực tiếp
  formData.append("short_description", data.short_description || "");
  formData.append("description", data.description || "");
  formData.append("price", data.price || "");
  formData.append("time", data.time || "");

  // Xử lý mảng `place_in_tour` (nếu có)
  if (Array.isArray(data.place_in_tour)) {
    data.place_in_tour.forEach((place, index) => {
      formData.append(`place_in_tour[${index}]`, place.id || "");
    });
  }

  return formData;
};
</script>

<template>
  <!-- Chức năng Thêm mới tour -->
  <LayoutRecord id="add-tour" @close="handleReset">
    <template #header>
      <button
        type="button"
        class="btn btn-soft-primary waves-effect waves-light"
      >
        Thêm mới
      </button>
      <button
        type="button"
        class="btn btn-warning btn-icon waves-effect waves-light"
        @click="btnSaveAdd.click"
      >
        <i class="ri-save-2-fill"></i>
      </button>
      <button
        type="button"
        class="btn btn-danger btn-icon waves-effect waves-light"
        @click="handleReset"
      >
        <i class="las la-undo-alt"></i>
      </button>
    </template>

    <template #body>
      <div
        v-if="isLoading"
        class="loading-overlay d-flex justify-content-center"
      >
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="loading-message">Vui lòng chờ</p>
      </div>
      <form v-else @submit.prevent="handleSaveAdd">
        <div class="mb-3">
          <label class="form-label">Tên tuyến du lịch</label>
          <input
            type="text"
            class="form-control"
            v-model="tourData.name"
            placeholder="Nhập tên tuyến du lịch"
          />
        </div>
        <div class="row mb-3">
          <div class="col-6">
            <label for="price" class="form-label">Giá Tour</label>
            <input
              type="text"
              class="form-control"
              id="price"
              v-model="tourData.price"
              placeholder="VD: 500.000 VNĐ"
            />
          </div>
          <div class="col-6">
            <label for="time" class="form-label">Thời gian</label>
            <input
              type="text"
              class="form-control"
              id="time"
              v-model="tourData.time"
              placeholder="VD: 3 ngày 2 đêm"
            />
          </div>
        </div>
        <div class="mb-3">
          <label for="photo_maker" class="form-label">Ảnh Tuyến du lịch</label>
          <Photo id="image-add" v-model="tourData.photo_maker" label="Ảnh Tour">
          </Photo>
        </div>
        <div class="mb-3">
          <label class="form-label">Các địa điểm đi qua</label>
          <div class="position-relative">
            <Select
              :api="`${BASE_URL}/api/manage-place/place/`"
              :isCloseOnSelect="true"
              defaultValueLabel="Các địa điểm đi qua"
              labelField="name"
              searchField="name"
              :isLocalSearch="true"
              :multiSelect="true"
              @change-data="handleSelectAddLocation"
            ></Select>
          </div>
        </div>
        <div class="mb-3">
          <label for="short_description" class="form-label">Mô tả ngắn</label>
          <textarea
            class="form-control"
            id="short_description"
            v-model="tourData.short_description"
            rows="3"
            placeholder="Nhập mô tả ngắn"
          ></textarea>
        </div>
        <div class="mb-3">
          <label for="short_description" class="form-label">Mô tả</label>
          <TextEditor
            v-model="tourData.description"
          ></TextEditor>
        </div>
        <div class="d-none">
          <button ref="btnSaveAdd" type="submit" class="btn btn-primary">
            Lưu
          </button>
        </div>
      </form>
    </template>
  </LayoutRecord>

  <!-- Form Chỉnh sửa Tour -->
  <LayoutRecord id="update-tour" @close="handleReset">
    <template #header>
      <button
        type="button"
        class="btn btn-soft-primary waves-effect waves-light"
      >
        Cập nhật
      </button>
      <button
        type="button"
        class="btn btn-warning btn-icon waves-effect waves-light"
        @click="handleSaveUpdate"
      >
        <i class="ri-save-2-fill"></i>
      </button>
      <button
        type="button"
        class="btn btn-danger btn-icon waves-effect waves-light"
        @click="handleResetUpdate"
      >
        <i class="las la-undo-alt"></i>
      </button>
    </template>
    <template #body>
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="loading-message">Đang tải dữ liệu...</p>
      </div>
      <form v-else @submit.prevent="handleSaveUpdate">
        <div class="mb-3">
          <label class="form-label">Tên tuyến du lịch</label>
          <input
            type="text"
            class="form-control"
            v-model="tourData.name"
            placeholder="Nhập tên tuyến du lịch"
          />
        </div>
        <div class="row mb-3">
          <div class="col-6">
            <label for="price" class="form-label">Giá tuyến du lịch</label>
            <input
              type="text"
              class="form-control"
              id="price"
              v-model="tourData.price"
              placeholder="VD: 500.000 VNĐ"
            />
          </div>
          <div class="col-6">
            <label for="time" class="form-label">Thời gian</label>
            <input
              type="text"
              class="form-control"
              id="time"
              v-model="tourData.time"
              placeholder="VD: 3 ngày 2 đêm"
            />
          </div>
        </div>
        <div class="mb-3">
          <label for="photo_maker" class="form-label">Ảnh Tuyến du lịch</label>
          <Photo
            id="image-update"
            v-model="tourData.photo_maker"
            label="Ảnh Tour"
          >
          </Photo>
        </div>
        <div class="mb-3">
          <label class="form-label">Các địa điểm đi qua</label>
          <Select
            :api="`${BASE_URL}/api/manage-place/place/`"
            :isCloseOnSelect="true"
            defaultValueLabel="Các địa điểm đi qua"
            labelField="name"
            searchField="name"
            :isLocalSearch="true"
            :multiSelect="true"
            @change-data="handleSelectUpdateLocation"
            :defaultValue="tourData.place_in_tour"
          ></Select>
        </div>
        <div class="mb-3">
          <label for="short_description" class="form-label">Mô tả ngắn</label>
          <textarea
            class="form-control"
            id="short_description"
            v-model="tourData.short_description"
            rows="3"
            placeholder="Nhập mô tả ngắn"
          ></textarea>
        </div>
        <div class="mb-3">
          <label for="description" class="form-label">Mô tả</label>
          <TextEditor
            v-model="tourData.description"
            :data="tourData.description"
          ></TextEditor>
        </div>
      </form>
    </template>
  </LayoutRecord>

  <!-- Chức năng Xem chi tiết -->
  <LayoutRecord id="view-tour" @close="handleReset">
    <template #header>
      <button
        type="button"
        class="btn btn-soft-primary waves-effect waves-light"
      >
        Xem chi tiết
      </button>
      <button
        type="button"
        class="btn btn-warning btn-icon waves-effect waves-light"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasupdate-tour"
        aria-controls="offcanvasupdate-tour"
      >
        <i class="las la-edit"></i>
      </button>
      <button
        type="button"
        class="btn btn-danger btn-icon waves-effect waves-light"
      >
        <i class="ri-delete-bin-5-line"></i>
      </button>
    </template>
    <template #body>
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="loading-message">Đang tải dữ liệu...</p>
      </div>
      <div v-else>
        <div class="mb-3">
          <label class="form-label">Tên tuyến du lịch</label>
          <div class="form-control" v-html="tourData.name"></div>
        </div>
        <div class="row mb-3">
          <div class="col-6">
            <label class="form-label">Giá tuyến du lịch</label>
            <div class="form-control" v-html="tourData.price"></div>
          </div>
          <div class="col-6">
            <label for="time" class="form-label">Thời gian</label>
            <div class="form-control" v-html="tourData.time"></div>
          </div>
        </div>
        <div class="mb-3">
          <label for="photo_maker" class="form-label">Ảnh Tuyến du lịch</label>
          <Photo
            id="image-update"
            v-model="tourData.photo_maker"
            label="Ảnh Tour"
            :disabled="true"
            :currentPhoto="tourData.photo_maker"
          >
          </Photo>
        </div>
        <div class="mb-3">
          <label class="form-label">Các địa điểm đi qua</label>
          <Select
            :api="`${BASE_URL}/api/manage-place/place/`"
            :isCloseOnSelect="true"
            defaultValueLabel="Các địa điểm đi qua"
            labelField="name"
            searchField="name"
            :isLocalSearch="true"
            :multiSelect="true"
            @change-data="handleSelectUpdateLocation"
            :defaultValue="tourData.place_in_tour"
            :disable="true"
          ></Select>
        </div>
        <div class="mb-3">
          <label for="short_description" class="form-label">Mô tả ngắn</label>
          <textarea
            class="form-control"
            id="short_description"
            v-model="tourData.short_description"
            rows="3"
            placeholder="Nhập mô tả ngắn"
            :disabled="true"
          ></textarea>
        </div>
        <div class="mb-3">
          <label for="description" class="form-label">Mô tả</label>
          <TextEditor
            v-model="tourData.description"
            :disabled="true"
            :data="tourData.description"
          ></TextEditor>
        </div>
      </div>
    </template>
  </LayoutRecord>
</template>
