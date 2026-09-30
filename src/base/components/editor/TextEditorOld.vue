<script>
import { reactive } from "vue";
import CKEditor from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default {
  setup() {
    const state = reactive({
      content:
        "<h3><span class='ql-size-large;'>Hello World!</span></h3><p><br></p><h3>This is an simple editable area.</h3><p><br></p><ul><li>Select a text to reveal the toolbar.</li><li>Edit rich document on-the-fly, so elastic!</li></ul><p><br></p><p>End of simple area</p>",
      _content: "",
      disabled: false,
    });
    return {
      state
    };
  },
  data() {
    return {
      editor: ClassicEditor,
      editorData: "",
      content: "",
      editorConfig: {
        simpleUpload: {
          uploadUrl: 'https://example.com/upload', // URL mà hình ảnh sẽ được tải lên
          headers: {
            'X-CSRF-TOKEN': 'CSRF-Token',
            Authorization: 'Bearer <JSON Web Token>'
          }
        }
      }
    };
  },
  components: {
    ckeditor: CKEditor.component
  }
};
</script>

<template>
  <BRow>
    <BCol lg="12">
      <BCard no-body>
        <div class="ckeditor-classic">
          <ckeditor v-model="editorData" :editor="editor" :config="editorConfig"></ckeditor>
        </div>
      </BCard>
    </BCol>
  </BRow>
</template>
