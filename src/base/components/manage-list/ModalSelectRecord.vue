<template>
    <Modal :id="`manage-list` + modalId" v-model="localShowModal" hide-footer size="xl" :title="`Thêm ` + appInfo?.label"
        cancelVariant="light">
        <Search @search-text="onChangeSearchText"
            :placeholder="`Nhập thông tin ` + this.appInfo?.label + ` cần tìm kiếm`"></Search>
        <form action="javascript:void(0);">
            <b-row class="g-0 m-2">
                <b-col lg="12">
                    <!-- Striped Rows -->
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th style="width: 30px;" class="d-flex cursor-pointer no-select"
                                    @click="handleSelectAllCurrentRecord"><input type="checkbox"
                                        :checked="isSelectedAllCurrentRecord()"> &nbsp;&nbsp;Chọn</th>
                                <th v-for="(attr, index) in attributes" :key="index">{{ attr.name }}</th>
                            </tr>
                        </thead>
                        <tbody class="position-relative">
                            <template v-if="isSearching">
                                <div
                                    class="position-absolute w-100 h-100 bg-light d-flex justify-content-center align-items-center">
                                    <Searching></Searching>
                                </div>
                            </template>
                            <template v-if="!dataList?.length && searchText">
                                <tr>
                                    <td :colspan="attributes?.length + 1">
                                        <notMatchSearch :searchText="searchText"></notMatchSearch>
                                    </td>
                                </tr>
                            </template>
                            <template v-if="!dataList?.length && !searchText">
                                <tr>
                                    <td :colspan="attributes?.length + 1">
                                        Không có {{ this.appInfo?.label }} nào!
                                    </td>
                                </tr>
                            </template>
                            <template v-else>
                                <tr v-for="(record, index) in dataList" :key="index" class="cursor-pointer"
                                    @click="handleSelectRecord(record)">
                                    <td><input type="checkbox"
                                            :checked="isSelectedRecord(record) || isAddedRecord(record)"
                                            :disabled="isAddedRecord(record)"></td>
                                    <td v-for="(attr, index) in attributes" :key="index">
                                        {{ record[attr.path] ?? '_' }}
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                    <PaginationUI @change="changeDataListPage" :current-page="dataOptions.current_page_number"
                        :page-size="dataOptions.total_pages"></PaginationUI>
                </b-col>
                <b-col lg="12 mt-3 d-flex justify-content-center align-items-center">
                    <div>Đã chọn {{ selectedList.length }}/{{ dataOptions.total_objects }} </div>
                    <div class="hstack gap-2 justify-content-end ml-auto">
                        <b-button type="button" variant="light" @click="handleCloseModal">
                            Đóng</b-button>
                        <b-button type="button" variant="primary"
                            @click="() => { handleAddSelectedRecord(); }">Thêm</b-button>
                    </div>
                </b-col>
            </b-row>
        </form>
    </Modal>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import PaginationUI from "@/app_manage_dynamic_api/components/paging/PaginationUI.vue";
import Modal from "@/base/components/dtwinUI/Modal.vue";
import Search from '../search/Search.vue';
import notMatchSearch from '../search/notMatchSearch.vue';
import Searching from '../search/searching.vue';
export default {
    props: {
        showModal: {
            type: Boolean,
            default: false
        }
    },
    data: () => {
        return {
            modalId: null,
            localShowModal: false
        };
    },
    components: { PaginationUI, Modal, Search, notMatchSearch, Searching },
    computed: {
    },
    mounted() {
        this.modalId = uuidv4()
    },
    beforeUnmount() {
    },
    methods: {
        handleCloseModal() {
            this.$emit('closeModal')
        }
    },
    watch: {
        showModal () {
            if (this.localShowModal != this.showModal) this.localShowModal = this.showModal
        }
    }
};
</script>

<style scoped>
.ml-auto {
    margin-left: auto;
}

.no-select {
    user-select: none;
    -webkit-user-select: none;
    /* Safari */
    -moz-user-select: none;
    /* Firefox */
    -ms-user-select: none;
    /* Internet Explorer/Edge */
}
</style>