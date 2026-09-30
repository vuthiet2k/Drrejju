<script setup>
import {
  ref,
  watch,
  onMounted,
  nextTick,
  defineProps,
  defineEmits,
  defineExpose,
  computed,
} from "vue";

import CKEditor from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import { BASE_URL } from "@/helpers/api/axiosHttp";
import API from "@/helpers/api/useAxios.js";

/* ===================== PROPS ===================== */
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
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
  maxWords: {
    type: Number,
    default: 0, // 0 = không giới hạn
  },
  height: {
    type: String,
    default: "200px",
  },
});

// Component registration
const ckeditor = CKEditor.component;
/* ===================== EMITS ===================== */
const emit = defineEmits([
  "update:modelValue",
  "wordCountChange",
  "wordLimitExceeded",
]);

/* ===================== STATE ===================== */
const editorData = ref("");
const editorInstance = ref(null);
const currentWordCount = ref(0);
const hasExceededLimit = ref(false);

/* ===================== COMPUTED ===================== */
const showWordLimitWarning = computed(() => {
  return props.maxWords > 0 && hasExceededLimit.value;
});

/* ===================== EDITOR ===================== */
const editor = ClassicEditor;

const editorConfig = {
  toolbar: {
    items: [
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
      "mediaEmbed",
      "insertTable",
      "|",
      "bulletedList",
      "numberedList",
      "|",
      "blockQuote",
      "codeBlock",
      "|",
      "undo",
      "redo",
    ],
    shouldNotGroupWhenFull: true,
  },
  extraPlugins: [MyCustomUploadAdapterPlugin],
  placeholder: props.placeholder,
};

/* ===================== WORD COUNT ===================== */
const countWords = (html = "") => {
  const div = document.createElement("div");
  div.innerHTML = html;
  const text = div.textContent || "";
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const checkWordLimit = () => {
  const wordCount = countWords(editorData.value);
  currentWordCount.value = wordCount;

  emit("wordCountChange", wordCount);

  if (props.maxWords > 0 && wordCount > props.maxWords) {
    if (!hasExceededLimit.value) {
      hasExceededLimit.value = true;
      emit("wordLimitExceeded", true);
    }
  } else {
    if (hasExceededLimit.value) {
      hasExceededLimit.value = false;
      emit("wordLimitExceeded", false);
    }
  }
};

/* ===================== UPLOAD ADAPTER ===================== */
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
          data.append(this.keyFromData || "image", file);

          API()
            .post(this.url, data)
            .then((res) => {
              if (res?.file || res?.image) {
                resolve({
                  default: res.file || res.image,
                });
              } else {
                reject("Upload failed");
              }
            })
            .catch((err) => reject(err));
        })
    );
  }

  abort() {}
}

function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}

/* ===================== LIFECYCLE ===================== */
const onEditorReady = (editor) => {
  editorInstance.value = editor;
  nextTick(checkWordLimit);
};

onMounted(() => {
  editorData.value = props.modelValue;
  nextTick(checkWordLimit);
});

/* ===================== WATCHERS ===================== */
watch(editorData, (val) => {
  emit("update:modelValue", val);
  checkWordLimit();
});

watch(
  () => props.modelValue,
  (val) => {
    editorData.value = val;
    nextTick(checkWordLimit);
  }
);

watch(
  () => props.maxWords,
  () => {
    checkWordLimit();
  }
);

/* ===================== EXPOSE ===================== */
defineExpose({
  getCurrentWordCount: () => currentWordCount.value,
  isOverLimit: () => hasExceededLimit.value,
});
</script>
<template>
  <div class="m-0 editor-container" no-body>
    <!-- Cảnh báo vượt quá số từ -->
    <div v-if="showWordLimitWarning" class="word-limit-overlay">
      <div class="word-limit-warning">
        <div class="warning-content">
          <i class="ri-alert-fill text-warning me-2 fs-4"></i>
          <div>
            <h6 class="mb-1">Đã vượt quá {{ maxWords }} từ</h6>
            <p class="text-muted mb-0 fs-13">
              Hiện tại: <strong>{{ currentWordCount }}</strong> từ
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor -->
    <div class="ckeditor-classic">
      <ckeditor
        v-model="editorData"
        :editor="editor"
        :config="editorConfig"
        @ready="onEditorReady"
      />
    </div>

    <!-- Word counter -->
    <div class="word-counter" :class="{ 'over-limit': showWordLimitWarning }">
      {{ currentWordCount }}
      <span v-if="maxWords > 0">/ {{ maxWords }}</span>
      từ
    </div>
  </div>
</template>
<style scoped>
.editor-container {
  position: relative;
  min-height: 200px;
}

/* Overlay cảnh báo */
.word-limit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: linear-gradient(90deg, #fff3cd 0%, #ffeaa7 100%);
  border: 1px solid #ffc107;
  border-radius: 8px 8px 0 0;
  padding: 10px 15px;
  animation: slideDown 0.25s ease;
}

.word-limit-warning {
  display: flex;
  align-items: center;
}

.warning-content {
  display: flex;
  align-items: center;
}

/* Editor */
.ckeditor-classic {
  position: relative;
  z-index: 1;
}

.ckeditor-classic .ck-editor__editable {
  min-height: v-bind(height);
  border-radius: 8px;
}

/* Word counter */
.word-counter {
  position: absolute;
  bottom: 8px;
  right: 12px;
  z-index: 3;

  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;

  background: #f1f3f5;
  color: #495057;

  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  user-select: none;
}

.word-counter.over-limit {
  background: #fff3cd;
  color: #d63384;
  font-weight: 600;
}

/* Animation */
@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
