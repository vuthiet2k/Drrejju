<template>
  <div>
    <ckeditor
      :editor="editor"
      :modelValue="modelValue"
      @update:modelValue="updateModelValue"
    />
  </div>
</template>

<script>
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import CKEditor from "@ckeditor/ckeditor5-vue";

export default {
  components: {
    ckeditor: CKEditor.component,
  },
  props: {
    editor: {
      type: Array,
      default: function () {
        return ClassicEditor;
      },
    },
    modelValue: {
      type: String,
      default: "",
    },
  },
  methods: {
    updateModelValue(value) {
      this.$emit("update:modelValue", value);
    },
  },
};
</script>
