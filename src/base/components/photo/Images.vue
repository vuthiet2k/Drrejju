<script>
import DropZone from "./components/dropZone";
import { errorToast, successToast } from "@/helpers/api/toastStyle.js";
import useSwal from "@/base/common/useSwal.js";
import { useDelete } from "@/helpers/api/api.js"

export default {
    props: {
        disable: {

        },
        images: {

        },
        id: {

        },
        source: {

        }
    },
    data() {
        return {
            files: [],
        }
    },
    methods: {
        selectedFile: function (dropzoneFile) {
            if (!dropzoneFile) return;
            const dataImage = {
                file: dropzoneFile,
                link: window.URL.createObjectURL(dropzoneFile)
            }
            this.files.push(dataImage);
        },
        drop: function (e) {
            const dropzoneFile = e.dataTransfer.files[0];
            if (dropzoneFile.type.startsWith('image/')) {
                this.selectedFile(dropzoneFile)
            }
            else {
                errorToast("Vui lòng tải lên ảnh!")
            }
        },
          async deleteRecord(index) {
            const { confirmDelete } = useSwal();
            const result = await confirmDelete("Bạn có muốn xoá ảnh này không?");
            if (!result.isConfirmed) return;

            const deleteFile = this.files[index];
            if (deleteFile?.id && this.source) {
                await useDelete(`${this.source}/${deleteFile.id}/`);
            }

            this.files.splice(index, 1);
            successToast("Xóa thành công 1 ảnh!");
            this.$emit("onDeleteImage", true);
        },
        convertByteToKB: function (byte) {
            if (!byte) return;
            const kb = (byte / 1024).toFixed(2);
            const mb = (byte / (1024 * 1024)).toFixed(2);

            if (parseFloat(kb) >= 1) {
                return `${mb} MB`;
            } else {
                return `${kb} KB`;
            }
        }
    },
    mounted() {
        if (this.images?.length) {
            let currentFiles = this.images.map(img => {
                if (img?.id) {
                    return { id: img.id, link: img.image }
                }
            })
            this.files = currentFiles
        }
    },
    components: {
        DropZone,
    },
    watch: {
        files: {
            handler() {
                if (this.files?.length) {
                    let images = this.files.filter(file => file?.file)
                    images = images.map(file => file?.file)
                    this.$emit("update:modelValue", images);
                }
                else {
                    this.$emit("update:modelValue", []);
                }
            },
            deep: true
        }
    }
};
</script>

<template>
    <DropZone v-if="!disable" @drop.prevent="drop" @changeFile="selectedFile" :id="id" />
    <ul class="list-unstyled mb-0" id="dropzone-preview">
        <template v-for="(item, index) in files" :key="index">
            <div class="border rounded">
                <div class="d-flex p-2">
                    <div class="flex-grow-1">
                        <div class="d-flex">
                            <img :src="item.link" alt="" class="rounded avatar-md mr-2">
                            <div class="pt-1">
                                <h5 class="fs-14 mb-1" data-dz-name="">
                                    {{ item?.file?.name }}
                                </h5>
                                <p class="fs-13 text-muted mb-0" data-dz-size="">
                                    <strong>{{ convertByteToKB(item?.file?.size) }}</strong>
                                </p>
                                <strong class="error text-danger" data-dz-errormessage=""></strong>
                            </div>
                        </div>
                    </div>
                    <div class="flex-shrink-0 ms-3" v-if="!disable">
                        <BButton variant="danger" size="sm" data-dz-remove="" @click="deleteRecord(index)">
                            Delete
                        </BButton>
                    </div>
                </div>
            </div>
        </template>

    </ul>
</template>
