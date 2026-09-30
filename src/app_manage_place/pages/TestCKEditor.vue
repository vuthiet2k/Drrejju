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

<script>
import CKEditor from '@ckeditor/ckeditor5-vue';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { BASE_URL } from '@/helpers/api/axiosHttp';
class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
    this.url = BASE_URL + '/api/img/'; // Your upload URL
  }

  upload() {
    return this.loader.file
      .then(file => new Promise((resolve, reject) => {
        const data = new FormData();
        data.append('image', file);

        fetch(this.url, {
          method: 'POST',
          body: data
        })
          .then(response => response.json())
          .then(result => {
            if (result.image) {
              resolve({
                default: result.image
              });
            } else {
              reject(result.message);
            }
          })
          .catch(error => {
            reject(error.message);
          });
      }));
  }

  abort() {
    // Handle aborting the upload process if necessary
  }
}

function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}

export default {
  components: {
    ckeditor: CKEditor.component
  },
  data() {
    return {
      editor: ClassicEditor,
      editorData: '<p>Hello from CKEditor 5!</p>',
      editorConfig: {
        extraPlugins: [MyCustomUploadAdapterPlugin]
      }
    };
  }
};
</script>