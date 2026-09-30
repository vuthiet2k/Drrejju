<template>
  <div class="tab-pane" id="folder" role="tabpanel">
    <b-card no-body>
      <b-card-body>
        <div class="d-flex">
          <h5 class="card-title mb-3">Folder</h5>
          <b-button variant="primary" class="ms-auto" @click="showModal = true">
            <div class="d-flex">
              <i class="ri-add-line"></i>&nbsp; Thêm thư mục
            </div>
          </b-button>
        </div>

      </b-card-body>
    </b-card>
    <Modal id="modal-add-folder" title="Thêm thư mục" v-model="showModal" size="md" hideFooter>
      <div class="mb-3">
        <label class="form-label">Tên thư mục</label>
        <input type="text" class="form-control" placeholder="Nhập tên thư mục" v-model="form.name" />
      </div>
      <div class="mb-3">
        <label class="form-label">Thư mục cha</label>
        <select class="form-select" placeholder="Chọn thư mục cha" v-model="form.parent_id">
          <option value="">Chọn thư mục cha</option>
          <option value="1">Thư mục 1</option>
          <option value="2">Thư mục 2</option>
          <option value="3">Thư mục 3</option>
        </select>
      </div>
      <div class="hstack gap-2 justify-content-end ml-auto mt-3">
        <b-button variant="light" @click="showModal = false">Đóng</b-button>
        <b-button variant="primary" @click="handleSubmit">Lưu</b-button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Modal from "@/base/components/dtwinUI/Modal.vue";
import { useFetch } from "@/helpers/api/api.js";
import { BASE_URL } from "@/helpers/api/axiosHttp";
const PROXY = BASE_URL + "/api";
export default {
  name: "FolderTab",
  data() {
    return {
      showModal: false,
      form: {
        name: "",
        parent_id: "",
      },
    };
  },
  components: {
    Modal,
  },
  mounted() {
    this.getFolders();
  },
  methods: {
    handleSubmit() {
    },
    async getFolders() {
      const response = await useFetch(`${PROXY}/folders`);
    },
  },
};
</script>
