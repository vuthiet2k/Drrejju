<template>
  <input
    type="file"
    ref="documentFront"
    hidden
    @change="handleFileChange($event, 'Front')"
  />
  <input
    type="file"
    ref="documentBehind"
    hidden
    @change="handleFileChange($event, 'Behind')"
  />

  <div class="row">
    <div class="col-xxl-6">
      <div class="d-flex gap-3 align-items-center">
        <span class="fw-bold">Mặt trước</span>
        <span
          class="fw-bold cursor-pointer text-info"
          @click="triggerdocumentFront"
          ><i class="ri-upload-2-line fs-16"></i
        ></span>
      </div>
      <div class="card-wrapper mt-3 mb-3">
        <div class="mx-auto cursor-pointer position-relative card-container">
          <div class="bg-gradient rounded-3 credit-card">
            <img
              @click="triggerdocumentFront"
              class="object-cover w-100"
              src="./assets/mattruoc-cc.png"
            />
          </div>
          <Image
            :src="createImageLink(front.url || modelValue.cccd_front)"
            v-if="front.url || modelValue?.cccd_front"
            alt="Front Document"
            class="position-absolute card-image"
            style="width: 100%"
            preview
          ></Image>
          <!-- <img
            :src="front.url || modelValue.cccd_front"
            v-if="front.url || modelValue?.cccd_front"
            alt="Front Document"
            class="position-absolute card-image"
          /> -->
          <div
            class="label__camera d-flex justify-content-center align-items-center"
          >
            <i class="ri-camera-fill fs-48 text-black-50"></i>
          </div>
        </div>
      </div>
    </div>
    <div class="col-xxl-6">
      <div class="d-flex gap-3 align-items-center">
        <span class="fw-bold">Mặt sau</span>
        <span
          class="fw-bold cursor-pointer text-info"
          @click="triggerdocumentBehind"
          ><i class="ri-upload-2-line fs-16"></i
        ></span>
      </div>
      <div class="card-wrapper mt-3 mb-3">
        <div class="mx-auto cursor-pointer position-relative card-container">
          <div
            @click="triggerdocumentBehind"
            class="bg-gradient rounded-3 credit-card"
          >
            <img class="object-cover w-100" src="./assets/matsau-cc.png" />
          </div>
          <Image
            :src="createImageLink(behind.url || modelValue?.cccd_behind)"
            v-if="behind.url || modelValue?.cccd_behind"
            alt="Behind Document"
            class="position-absolute card-image"
            style="width: 100%"
            preview
          ></Image>
          <!-- <img
            :src="behind.url || modelValue?.cccd_behind"
            v-if="behind.url || modelValue?.cccd_behind"
            alt="Behind Document"
            class="position-absolute card-image"
          /> -->
          <div
            class="label__camera d-flex justify-content-center align-items-center"
          >
            <i class="ri-camera-fill fs-48 text-black-50"></i>
          </div>
        </div>
      </div>
    </div>
    <div
      class="col-12 text-center d-flex justify-content-center"
      v-if="front.file"
    >
      <button
        class="btn btn-info btn-sm d-flex align-items-center justify-content-center"
        type="button"
        @click="handleScanDocument"
        :disabled="loading"
      >
        <span
          v-if="loading"
          class="spinner-border spinner-border-sm me-2"
        ></span>
        {{ loading ? "Đang đọc thông tin" : "Đọc thông tin" }}
      </button>
    </div>
  </div>
</template>

<script>
// import API from "@/helpers/api/useAxios.js";
import { successToast, errorToast } from "@/helpers/api/toastStyle";
import Image from "primevue/image";
import { API_SERVER_URL } from "@/base/store/api/server_api";

export default {
  props: {
    modelValue: {},
    disabled: {},
  },
  data() {
    return {
      front: { file: null, url: "" },
      behind: { file: null, url: "" },
      loading: false, // Trạng thái loading
      extractionAPI: API_SERVER_URL + "/vnid-extraction/",
    };
  },
  components: { Image },
  methods: {
    createImageLink(img) {
      if (typeof img == typeof "") return img;

      const fileURL = URL.createObjectURL(img);
      return fileURL;
    },
    triggerdocumentFront() {
      if (this.disabled) return;
      this.$refs.documentFront.click();
    },
    triggerdocumentBehind() {
      if (this.disabled) return;
      this.$refs.documentBehind.click();
    },
    handleFileChange(event, type) {
      const file = event.target.files[0];
      if (file) {
        const fileURL = URL.createObjectURL(file);
        if (type == "Front") {
          this.front.file = file;
          this.front.url = fileURL;
        } else {
          this.behind.file = file;
          this.behind.url = fileURL;
        }
        this.$emit("update:modelValue", {
          ...this.modelValue,
          cccd_front: this.front.file ?? this.modelValue.cccd_front,
          cccd_behind: this.behind.file ?? this.modelValue.cccd_behind,
        });
      }
    },
    async handleScanDocument() {
      const _self = this;
      if (!this.front.file && !this.behind.file) {
        return errorToast("Vui lòng tải lên tài liệu trước khi đọc!");
      }

      this.loading = true; // Kích hoạt hiệu ứng loading
      let data_cccd = {};

      try {
        if (this.front.file) {
          const formData = new FormData();
          formData.append("file", this.front.file);
          const resp = await fetch(this.extractionAPI, {
            method: "POST",
            body: formData,
          });
          if (resp?.ok) {
            const resjson = await resp.json();
            const resuls = resjson.results[0];
            data_cccd = { ...data_cccd, ...this.removeNullFields(resuls) };
            this.processBase64Image({
              payload: data_cccd?.crop_image,
              target: _self.front,
              modelKey: "cccd_front",
              fileName: data_cccd?.full_name ?? "front_cccd",
              mimeType: "image/png",
            });
          } else {
            errorToast("Không thể quét được mặt trước!");
          }
        }

        if (this.behind.file) {
          const formData = new FormData();
          formData.append("file", this.behind.file);
          const resp = await fetch(this.extractionAPI, {
            method: "POST",
            body: formData,
          });
          if (resp?.ok) {
            const resjson = await resp.json();
            const resuls = resjson.results[0];
            data_cccd = { ...data_cccd, ...this.removeNullFields(resuls) };
            this.processBase64Image({
              payload: data_cccd?.crop_image,
              target: _self.behind,
              modelKey: "cccd_behind",
              fileName: data_cccd?.full_name ?? "behind_cccd",
              mimeType: "image/png",
            });
          } else {
            errorToast("Không thể quét được mặt sau!");
          }
        }
        const OCRDATA = this.formatModel(data_cccd);
        _self.$emit("read", OCRDATA);
        successToast("Vui lòng kiểm tra dữ liệu");
      } finally {
        this.loading = false; // Kết thúc loading
      }
    },
    processBase64Image({
      payload,
      target,
      modelKey,
      fileName,
      mimeType = "image/png",
    }) {
      if (!payload) return;

      // tạo data URI để <img> có thể render
      target.url = `data:${mimeType};base64,${payload}`;

      // convert Base64 thành File object
      target.file = this.base64ToFile(payload, fileName);

      const newForm = {
        ...this.modelValue,
        [modelKey]: target.file,
      };
      this.$emit("update:modelValue", newForm);

    },
    removeNullFields(obj) {
      return (
        Object.entries(obj)
          // eslint-disable-next-line no-unused-vars
          .filter(([_key, value]) => value !== null && value !== undefined)
          .reduce((cleaned, [key, value]) => {
            cleaned[key] = value;
            return cleaned;
          }, {})
      );
    },
    formatModel(ocrData) {
      // 1. Định nghĩa label cho đủ 10 trường
      const labelFields = {
        identification_number: "Số CMND/CCCD",
        full_name: "Họ và tên",
        birth: "Ngày sinh",
        gender: "Giới tính",
        nationality: "Quốc tịch",
        permanent_residence: "Địa chỉ thường trú",
        current_residence: "Địa chỉ hiện tại",
        issuance_date_id_card: "Ngày cấp CMND/CCCD",
        expiration_date_id_card: "Ngày hết hạn CMND/CCCD",
        features: "Đặc điểm nhận dạng",
        hometown: "Quê quán",
      };

      // 2. Helpers giống trước
      function removeNullFields(obj) {
        return (
          Object.entries(obj)
            // eslint-disable-next-line no-unused-vars
            .filter(([_key, v]) => v != null)
            .reduce((acc, [k, v]) => {
              acc[k] = v;
              return acc;
            }, {})
        );
      }

      function parseVNDate(str) {
        if (!str) return null;
        const [d, m, y] = str.split("/").map(Number);
        return new Date(y, m - 1, d).toISOString().slice(0, 10);
      }

      // 3. Map OCR → payload gốc (object 10 trường)
      function mapOcrToModel(ocr) {
        const c = removeNullFields(ocr);
        return {
          identification_number: c?.id?.text,
          full_name: c?.name?.text,
          birth: parseVNDate(c?.dob?.text),
          gender: c?.sex?.text,
          nationality: c?.nationality?.text,
          hometown: c?.home?.text,
          permanent_residence: c?.address?.text,
          issuance_date_id_card: c?.issue_date
            ? parseVNDate(c?.issue_date?.text)
            : null,
          expiration_date_id_card: parseVNDate(c?.doe?.text),
          features: c?.features?.text || "",
        };
      }

      // 4. Lấy object phẳng key: value để UI dùng
      function getFlatData(payload, labels) {
        return Object.keys(labels).reduce((acc, key) => {
          let v = payload[key];
          acc[key] = v ?? "";
          return acc;
        }, {});
      }

      const payload = mapOcrToModel(ocrData);
      const flatData = getFlatData(payload, labelFields);

      return flatData;
    },
    /**
     * Chuyển Base64 string → File object
     * @param {string} base64String Chuỗi Base64, có thể kèm tiền tố “data:image/...;base64,” hoặc chỉ phần payload
     * @param {string} fileName     Tên file muốn tạo, ví dụ "avatar.png"
     * @returns {File}
     */ base64ToFile(base64String, fileName) {
      // Tách mime và payload
      const parts = base64String.split(",");
      let mime, data;
      if (parts.length === 2) {
        // Có tiền tố data:[mime];base64,
        mime = parts[0].match(/data:(.*);base64/)[1];
        data = parts[1];
      } else {
        // Không có tiền tố, mặc định image/png
        mime = "image/png";
        data = parts[0];
      }

      // Giải mã Base64 thành binary string
      const binary = atob(data);
      const len = binary.length;
      const u8arr = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        u8arr[i] = binary.charCodeAt(i);
      }

      // Tạo file
      return new File([u8arr], fileName, { type: mime });
    },
  },
};
</script>

<style scoped>
.card-container {
  max-height: 220px;
  overflow: hidden;
  max-width: 350px;
}

.card-container .object-cover {
  filter: brightness(80%) blur(2px);
}
.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  top: 0;
  left: 0;
  z-index: 2;
}

.label__camera {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
