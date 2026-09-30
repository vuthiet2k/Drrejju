<template>
  <div class="m-0" no-body>
    <div class="ckeditor-classic">
      <ckeditor
        ref="editorRef"
        v-model="editorData"
        :editor="editor"
        :config="editorConfig"
      ></ckeditor>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, defineProps, defineEmits } from "vue";
import CKEditor from "@ckeditor/ckeditor5-vue";
import { BASE_URL } from "@/helpers/api/axiosHttp";
import API from "@/helpers/api/useAxios.js";
// Import CKEditor components
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
// import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
// import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
// import Underline from "@ckeditor/ckeditor5-basic-styles/src/underline";
// import Strikethrough from "@ckeditor/ckeditor5-basic-styles/src/strikethrough";
// import Heading from "@ckeditor/ckeditor5-heading/src/heading";
// import Font from "@ckeditor/ckeditor5-font/src/font";
// import Link from "@ckeditor/ckeditor5-link/src/link";
// import List from "@ckeditor/ckeditor5-list/src/list";
// import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
// import Image from "@ckeditor/ckeditor5-image/src/image";
// import ImageUpload from "@ckeditor/ckeditor5-image/src/imageupload";
// import ImageToolbar from "@ckeditor/ckeditor5-image/src/imagetoolbar";
// import ImageStyle from "@ckeditor/ckeditor5-image/src/imagestyle";
// import ImageResize from "@ckeditor/ckeditor5-image/src/imageresize";
// import Table from "@ckeditor/ckeditor5-table/src/table";
// import TableToolbar from "@ckeditor/ckeditor5-table/src/tabletoolbar";
// import MediaEmbed from "@ckeditor/ckeditor5-media-embed/src/mediaembed";
// import BlockQuote from "@ckeditor/ckeditor5-block-quote/src/blockquote";
// import CodeBlock from "@ckeditor/ckeditor5-code-block/src/codeblock";
// import Alignment from "@ckeditor/ckeditor5-alignment/src/alignment";import { Context } from '@ckeditor/ckeditor5-core';


// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  disable: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "Viết nội dung tại đây...",
  },
  uploadUrl: {
    type: String,
    default: BASE_URL + "/api/img/",
  },
  keyFromData: {
    type: String,
    default: "image",
  },
});

// Emits
const emit = defineEmits(["update:modelValue"]);

// Component registration
const ckeditor = CKEditor.component;

// Refs
const editorRef = ref(null);
const editorData = ref("");
const editorInstance = ref(null);

// Constants
const editor = ClassicEditor;

// Editor configuration
const editorConfig = {
  toolbar: {
    // plugins: [
    //   Essentials,
    //   Bold,
    //   Italic,
    //   Underline,
    //   Strikethrough,
    //   Heading,
    //   Font,
    //   Link,
    //   List,
    //   Paragraph,
    //   Image,
    //   ImageUpload,
    //   ImageToolbar,
    //   ImageStyle,
    //   ImageResize,
    //   Table,
    //   TableToolbar,
    //   MediaEmbed,
    //   BlockQuote,
    //   CodeBlock,
    //   Alignment,
    // ],
    items: [
      "exportPdf",
      "print",
      "heading",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "alignment",
      "fontSize",
      "fontColor",
      "fontBackgroundColor",
      "|",
      "link",
      "uploadImage",
      "uploadVideo",
      "mediaEmbed",
      "insertTable",
      "|",
      "bulletedList",
      "numberedList",
      "outdent",
      "indent",
      "|",
      "specialCharacters",
      "blockQuote",
      "codeBlock",
      "sourceEditing",
      "|",
      "undo",
      "redo",
    ],
    shouldNotGroupWhenFull: true,
  },
  extraPlugins: [MyCustomUploadAdapterPlugin],
  image: {
    toolbar: ["imageTextAlternative", "imageStyle:full", "imageStyle:side"],
  },
  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },
  placeholder: props.placeholder,
};

// Upload Adapter Class
class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
    this.url = props.uploadUrl;
  }

  upload() {
    return this.loader.file.then(
      (file) =>
        new Promise((resolve, reject) => {
          const data = new FormData();
          data.append(`${props.keyFromData}`, file);

          API()
            .post(this.url, data)
            .then((result) => {
              if (result?.file || result?.image || result?.id) {
                resolve({
                  default: `${
                    result?.file ?? result?.image
                  }`,
                });
              } else {
                reject(result.message);
              }
            })
            .catch((error) => {
              reject(error.message);
            });
        })
    );
  }

  abort() {
    // Handle aborting the upload process if necessary
  }
}

// Upload Adapter Plugin
function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}

// Video Upload Adapter Class
// class VideoUploadAdapter {
//   constructor(loader) {
//     this.loader = loader;
//     this.url = props.videoUploadUrl;
//   }

//   upload() {
//     return this.loader.file.then(
//       (file) =>
//         new Promise((resolve, reject) => {
//           // Kiểm tra định dạng file video
//           // const allowedVideoTypes = [
//           //   "video/mp4",
//           //   "video/webm",
//           //   "video/ogg",
//           //   "video/quicktime",
//           // ];
//           // if (!allowedVideoTypes.includes(file.type)) {
//           //   reject(
//           //     "Định dạng video không được hỗ trợ. Vui lòng chọn file MP4, WebM, OGG hoặc MOV."
//           //   );
//           //   return;
//           // }

//           // // Kiểm tra kích thước file video (tối đa 50MB)
//           // const maxSize = 50 * 1024 * 1024; // 50MB
//           // if (file.size > maxSize) {
//           //   reject(
//           //     "Kích thước video quá lớn. Vui lòng chọn file nhỏ hơn 50MB."
//           //   );
//           //   return;
//           // }

//           const data = new FormData();
//           data.append(props.keyFromData, file);

//           API()
//             .post(this.url, data)
//             .then((result) => {
//               if (result?.file || result?.video || result?.id) {
//                 resolve({
//                   default: result?.file ?? result?.video ?? result?.url,
//                 });
//               } else {
//                 reject(result.message || "Upload video thất bại");
//               }
//             })
//             .catch((error) => {
//               reject(error.message || "Lỗi upload video");
//             });
//         })
//     );
//   }

//   abort() {
//     // Handle aborting the upload process if necessary
//   }
// }
// function VideoUploadAdapterPlugin(editor) {
//   // Thêm handler cho video upload
//   editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
//     return new VideoUploadAdapter(loader);
//   };
// }

// Methods
const updateReadOnlyMode = (isReadOnly) => {
  if (editorInstance.value) {
    if (isReadOnly) {
      editorInstance.value.enableReadOnlyMode("my-feature-id");
    } else {
      editorInstance.value.disableReadOnlyMode("my-feature-id");
    }
  }
};

// Lifecycle
onMounted(() => {
  editorData.value = props.modelValue;
  nextTick(() => {
    editorInstance.value = editorRef.value?.instance;
    updateReadOnlyMode(props.disable);
  });
});

// Watchers
watch(
  () => editorData.value,
  (newValue) => {
    emit("update:modelValue", newValue);
  }
);

watch(
  () => props.modelValue,
  (newValue) => {
    editorData.value = newValue;
  }
);

watch(
  () => props.disable,
  (newVal) => {
    updateReadOnlyMode(newVal);
  }
);
</script>

<style>
.ckeditor-classic .ck-editor__editable {
  resize: vertical;
  min-height: 200px;
}
</style>
