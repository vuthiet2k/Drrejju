<template>
  <div class="m-0 editor-container" no-body>
    <!-- Thông báo vượt quá số từ -->
    <div v-if="showWordLimitWarning" class="word-limit-overlay">
      <div class="word-limit-warning">
        <div class="warning-content">
          <i class="ri-alert-fill text-warning me-2 fs-4"></i>
          <div>
            <h6 class="mb-1">Đã vượt quá giới hạn {{ maxWords }} từ!</h6>
            <p class="text-muted mb-0 fs-13">
              Nội dung hiện tại: <strong>{{ currentWordCount }}</strong> từ
              (Giới hạn: {{ maxWords }} từ)
            </p>
          </div>
        </div>
        <button
          v-if="isReadOnly"
          class="btn btn-sm btn-primary"
          @click="enableEditing"
        >
          <i class="ri-edit-line me-1"></i>Chỉnh sửa
        </button>
      </div>
    </div>

    <!-- Lớp phủ chặn tương tác khi vượt quá giới hạn -->
    <div
      v-if="isReadOnly && showWordLimitWarning"
      class="editor-block-overlay"
      @click="
        () => {
          enableEditing();
          focusEditor();
        }
      "
    ></div>

    <div class="ckeditor-classic">
      <ckeditor
        ref="editorRef"
        v-model="editorData"
        :editor="editor"
        :config="editorConfig"
        @ready="onEditorReady"
        @input="onEditorChange"
      ></ckeditor>
    </div>
  </div>
</template>

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
import { BASE_URL } from "@/helpers/api/axiosHttp";
import API from "@/helpers/api/useAxios.js";
// Import CKEditor components
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

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
  maxWords: {
    type: Number,
    default: 0, // 0 = không giới hạn
  },
  height: {
    type: String,
    default: "auto",
  },
});

// Emits
const emit = defineEmits([
  "update:modelValue",
  "wordCountChange",
  "wordLimitExceeded",
]);

// Component registration
const ckeditor = CKEditor.component;

// Refs
const editorRef = ref(null);
const editorData = ref("");
const editorInstance = ref(null);
const currentWordCount = ref(0);
const isReadOnly = ref(false); // Trạng thái chỉ đọc khi vượt quá giới hạn
const hasExceededLimit = ref(false); // Đã vượt quá giới hạn

// Computed
const showWordLimitWarning = computed(() => {
  return props.maxWords > 0 && hasExceededLimit.value;
});

// Constants
const editor = ClassicEditor;

// Editor configuration
const editorConfig = {
  toolbar: {
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
  wordCount: {
    displayWords: false, // Ẩn counter mặc định của CKEditor
  },
};

// Hàm đếm số từ trong HTML
const countWords = (html) => {
  if (!html) return 0;

  // Xóa các tag HTML và các thẻ script/style
  const text = html
    .replace(/<[^>]*>/g, " ") // Thay thẻ HTML bằng khoảng trắng
    .replace(/&nbsp;/g, " ") // Thay &nbsp; bằng khoảng trắng
    .replace(/&[a-z]+;/gi, " ") // Thay các HTML entities khác
    .replace(/\s+/g, " ") // Gộp nhiều khoảng trắng thành 1
    .trim();

  // Đếm từ (tách bằng khoảng trắng)
  return text ? text.split(/\s+/).length : 0;
};

// Hàm cắt nội dung theo số từ (đơn giản)
const trimContentToWordLimit = (content, wordLimit) => {
  if (!content || wordLimit <= 0) return content;

  const wordCount = countWords(content);
  if (wordCount <= wordLimit) return content;

  // Chuyển HTML sang plain text để xử lý
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;
  let plainText = tempDiv.textContent || tempDiv.innerText || "";

  // Cắt theo số từ
  const words = plainText.split(/\s+/);
  const trimmedWords = words.slice(0, wordLimit);

  // Tạo HTML đơn giản với paragraph
  const trimmedText = trimmedWords.join(" ");
  const trimmedHtml = `<p>${trimmedText}...</p>`;

  return trimmedHtml;
};

// Hàm kiểm tra và xử lý paste
const handlePasteAndTrim = () => {
  if (props.maxWords <= 0) return;

  const currentWordCount = countWords(editorData.value);
  if (currentWordCount <= props.maxWords) return;

  // Cắt nội dung
  const trimmedContent = trimContentToWordLimit(
    editorData.value,
    props.maxWords
  );

  // Cập nhật editor
  editorData.value = trimmedContent;

  // Phát sự kiện word count change
  const newWordCount = countWords(trimmedContent);
  emit("wordCountChange", newWordCount);
};

// Hàm setup paste listener
const setupPasteListener = (editor) => {
  // Lắng nghe sự kiện paste
  editor.editing.view.document.on("paste", () => {
    handlePasteAndTrim();
  });
};

// Hàm kiểm tra giới hạn từ
const checkWordLimit = () => {
  if (props.maxWords <= 0) return;

  const wordCount = countWords(editorData.value);
  currentWordCount.value = wordCount;

  // Phát sự kiện cho parent component
  emit("wordCountChange", wordCount);

  // Kiểm tra nếu vượt quá giới hạn
  if (wordCount > props.maxWords) {
    if (!hasExceededLimit.value) {
      hasExceededLimit.value = true;
      emit("wordLimitExceeded", true);
    }

    // Nếu đang không ở chế độ chỉ đọc, chuyển sang chế độ chỉ đọc
    if (!isReadOnly.value) {
      isReadOnly.value = true;
      updateReadOnlyMode(true);
    }
  } else {
    // Nếu đang ở chế độ chỉ đọc và đã về dưới giới hạn
    if (isReadOnly.value) {
      isReadOnly.value = false;
      hasExceededLimit.value = false;
      updateReadOnlyMode(false);
      emit("wordLimitExceeded", false);
    }
  }
};

// Hàm cho phép chỉnh sửa lại (khi user bấm nút "Chỉnh sửa")
const enableEditing = () => {
  isReadOnly.value = false;
  hasExceededLimit.value = false;
  updateReadOnlyMode(false);
  focusEditor();
};

// Hàm focus vào editor
const focusEditor = () => {
  if (editorInstance.value) {
    editorInstance.value.focus();
  }
};

// Hàm cập nhật chế độ chỉ đọc của editor
const updateReadOnlyMode = (isReadOnlyMode) => {
  if (editorInstance.value) {
    if (isReadOnlyMode) {
      editorInstance.value.enableReadOnlyMode("word-limit-exceeded");
    } else {
      editorInstance.value.disableReadOnlyMode("word-limit-exceeded");
    }
  }
};

// Upload Adapter Class (giữ nguyên)
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
                  default: `${result?.file ?? result?.image}`,
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

// Upload Adapter Plugin (giữ nguyên)
function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}

// Event handlers
const onEditorReady = (editor) => {
  editorInstance.value = editor;
  // Setup paste listener
  setupPasteListener(editor);
  updateReadOnlyMode(props.disable || isReadOnly.value);

  // Kiểm tra ngay sau khi editor ready
  nextTick(() => {
    checkWordLimit();
  });
};

const onEditorChange = () => {
  checkWordLimit();
};

// Methods
const forceCheckWordCount = () => {
  checkWordLimit();
};

// Expose methods
defineExpose({
  forceCheckWordCount,
  getCurrentWordCount: () => currentWordCount.value,
  isOverLimit: () => hasExceededLimit.value,
});

// Lifecycle
onMounted(() => {
  editorData.value = props.modelValue;

  // Kiểm tra word count cho content ban đầu
  nextTick(() => {
    if (props.modelValue) {
      checkWordLimit();
    }
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
    // Kiểm tra word count khi content thay đổi từ bên ngoài
    nextTick(() => {
      checkWordLimit();
    });
  }
);

watch(
  () => props.disable,
  (newVal) => {
    if (!hasExceededLimit.value) {
      updateReadOnlyMode(newVal);
    }
  }
);

watch(
  () => props.maxWords,
  () => {
    // Khi maxWords thay đổi, kiểm tra lại
    checkWordLimit();
  }
);
</script>

<style scoped>
.editor-container {
  position: relative;
  min-height: 200px;
}

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
  animation: slideDown 0.3s ease;
}

.word-limit-warning {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.warning-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.editor-block-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.editor-block-overlay::after {
  content: "Nhấn để chỉnh sửa";
  color: #666;
  font-size: 14px;
  font-weight: 500;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ckeditor-classic {
  position: relative;
  z-index: 1;
}

.ckeditor-classic .ck-editor__editable {
  resize: vertical;
  min-height: v-bind(height);
  border-radius: 8px;
}

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

/* Responsive */
@media (max-width: 768px) {
  .word-limit-warning {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .word-limit-warning .btn {
    align-self: flex-end;
  }
}
</style>
