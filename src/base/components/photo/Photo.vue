<!-- Form photo này mục đích sử dụng là để sử dụng cho việc upload các ảnh như avatar, ảnh chính .... -->

<script>
import Modal from "@/base/components/dtwinUI/Modal.vue";
export default {
  props: {
    currentPhoto: {},
    id: {},
    disable: {},
    dynamic_pick: {},
    gallery: {
      default: () => [],
    },
    label: {
      default: "Ảnh đại diện",
    },
    noDefaultPhoto: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    Modal,
  },
  data() {
    return {
      photo: null,
      photoUrl: "",
      SETNULL_DATAS: [null, undefined],
      showModalDynamicImages: false,
    };
  },
  mounted() {
    // this.setDefaultPhotoUrl()
    // this.handleChangeCurrentPhoto()
  },
  methods: {
    handleChangeImage: function (event) {
      let imgAvatar = event.target.files[0];
      if (imgAvatar == undefined) {
        this.photo == null;
        this.$emit("update:modelValue", null);
        this.setDefaultPhotoUrl();
      } else {
        this.photo = imgAvatar;
        this.photoUrl = window.URL.createObjectURL(this.photo);
        this.$emit("update:modelValue", this.photo);
      }
      this.showModalDynamicImages = false;
    },
    setDefaultPhotoUrl: function () {
      this.photoUrl = require("@/assets/images/default/cardview.jpg");
    },
    handleChangeCurrentPhoto: function () {
      if (typeof this.currentPhoto == typeof "") {
        this.photoUrl = this.currentPhoto;
      } else if (this.currentPhoto in this.SETNULL_DATAS) {
        this.setDefaultPhotoUrl();
        this.photo = null;
      }
    },
    handleChooseImageFromGallery(item) {
      if (this.photo?.id == item.id) return;
      this.photoUrl = item.image;
      this.photo = item;
      this.$emit("update:modelValue", this.photo);
      this.showModalDynamicImages = false;
    },
  },
  watch: {
    // currentPhoto: function () {
    //     this.handleChangeCurrentPhoto()
    // },
  },
  computed: {
    sourceImage: function () {
      if (this.photoUrl) return this.photoUrl;
      if (this.currentPhoto) return this.currentPhoto;
      if (this.noDefaultPhoto) return "";
      if (this.dynamic_pick == "avatar")
        return require("@/assets/images/users/user-dummy-img.jpg");
      return require("@/assets/images/default/cardview.jpg");
    },
  },
};
</script>

<style scoped>
.image-gallery {
  border: 1px solid;
  cursor: pointer;
}
</style>

<template>
  <Modal
    id="modal-view-approval-post"
    v-model="showModalDynamicImages"
    hide-footer
    :title="`Chọn ` + label"
    class="v-modal-custom"
    size="lg"
    hideFooter
    :backdrop="true"
    :no-close-on-backdrop="false"
  >
    <div class="img-upload-slot">
      <div class="img-slot">
        <img class="img-custom" :src="photoUrl" />
      </div>
      <label class="label-upload-img text-center" v-if="!disable">
        <i class="bx bx-camera fs-20"></i>
        <input
          class="form-control"
          type="file"
          @change="($e) => handleChangeImage($e)"
          style="display: none"
          :disabled="disable"
          accept="image/*"
        />
        Tải lên ảnh mới
      </label>
    </div>
    Thư viện ảnh
    <b-row>
      <template v-for="(item, index) in gallery" :key="index">
        <b-col lg="3" md="6" class="mb-2">
          <div
            class="w-100 h-100 image-gallery"
            @click="handleChooseImageFromGallery(item)"
          >
            <img
              :src="item.image"
              alt=""
              height="170px"
              class="img-fluid mx-auto d-block"
            />
          </div>
        </b-col>
      </template>
    </b-row>
  </Modal>
  <div class="img-upload-slot">
    <div v-if="!sourceImage" class="w-100 dropzone dz-clickable py-4">
      <div class="dz-message needsclick text-center">
        <div class="">
          <i class="display-4 text-muted ri-upload-cloud-2-fill"></i>
        </div>

        <h5 class="text-muted">Tải lên hình ảnh</h5>
      </div>
    </div>
    <div v-else class="img-slot">
      <img class="img-custom" :src="sourceImage" />
    </div>
    <label class="label-upload-img" v-if="!disable && !dynamic_pick">
      <input
        class="form-control"
        type="file"
        @change="($e) => handleChangeImage($e)"
        style="display: none"
        :disabled="disable"
        accept="image/*" />
      <i class="bx bx-camera fs-20"></i
    ></label>
    <label
      class="label-upload-img"
      @click="showModalDynamicImages = !showModalDynamicImages"
      v-if="!disable && dynamic_pick"
      ><i class="bx bx-camera fs-20"></i
    ></label>
  </div>
</template>
<style scoped>
.bg-head-title {
  background-color: #dbe4ff;
}

.bg-disabled {
  background-color: var(--vz-input-disabled-bg) !important;
}

.img-upload-slot {
  display: grid;
  place-items: center;
}

.label-upload-img {
  position: absolute;
  display: grid;
  padding: 10px;
  border-radius: 50%;
  /* border: 1px solid #393737; */
  cursor: pointer;
  background: #ebf5ff;
  opacity: 0.9;
  color: #0064d1;
}

.img-slot {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.25rem;
  background-color: var(--vz-body-bg);
  border: 1px solid var(--vz-border-color);
  border-radius: 0.25rem;
}

.img-custom {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.pointer-cursor-custom {
  cursor: pointer;
}
</style>
