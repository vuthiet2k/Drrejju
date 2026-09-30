<template>
  <div
    @dragenter.prevent="toggleActive"
    @dragleave.prevent="toggleActive"
    @dragover.prevent
    @drop.prevent="toggleActive"
    :class="{ 'active-dropzone': active }"
    class="dropzone position-relative"
  >
    <h5>
      <b
        >Drop your images or
        <label :for="id" style="cursor: pointer"><u>Browse</u></label></b
      >
    </h5>
    <input
      type="file"
      :id="id"
      class="dropzoneFile btn btn-primary"
      accept="image/*"
      @change="($e) => HandleAddFile($e)"
    />
  </div>
</template>

<style scoped>
.dropzone {
  height: 76px !important;
  min-height: 76px !important;
}

.dropzone label {
  all: unset;
}
</style>

<script>
import { ref } from "vue";
export default {
  props: {
    id: {},
  },
  name: "dropzone",
  setup() {
    const active = ref(false);
    const toggleActive = () => {
      active.value = !active.value;
    };
    return { active, toggleActive };
  },
  methods: {
    HandleAddFile: function (event) {
      let file = event.target.files[0];
      this.$emit("changeFile", file);
    },
  },
};
</script>
