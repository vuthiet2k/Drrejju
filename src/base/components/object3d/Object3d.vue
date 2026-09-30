<!-- Form photo này mục đích sử dụng là để sử dụng cho việc upload các ảnh như avatar, ảnh chính .... -->

<script>
export default ({
    props: {
        currentObject: {

        },
        id: {

        },
        disable: {

        },
    },
    data() {
        return {

            file: null,
            filePath: ""
        }
    },
    mounted() {
        if (this.currentObject) {
            this.filePath = this.currentObject
            if (typeof (this.currentObject) == typeof ("")) {
                this.filePath = this.currentObject
            }
        }
    },
    methods: {
        handleChangeFile: function (event) {
            let file = event.target.files[0];
            if (file == undefined) {
                this.file == null
                this.$emit("update:modelValue", null);
            }
            else {
                this.file = file
                this.filePath = this.file?.name
                this.$emit("update:modelValue", this.file);
            }
        },
    },
    watch: {
    }
})
</script>

<style scoped>
.image-gallery {
    border: 1px solid;
    cursor: pointer
}
</style>

<template>
    <!-- Default File Input Example -->
    <div v-if="filePath">
        Hiện tại: {{ filePath }}
    </div>
    <div>
        <input class="form-control" :disabled="disable" type="file" @change="($e) => handleChangeFile($e)" :id="id">
    </div>
</template>
<style scoped>
.bg-head-title {
    background-color: #DBE4FF;
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
    background: #EBF5FF;
    opacity: 0.9;
    color: #0064D1;
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