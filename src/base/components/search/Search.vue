<template>
    <div class="position-relative">
        <input type="text" class="form-control" :placeholder="placeholder" autocomplete="off" id="search-options"
            v-model="searchText">
        <span class="mdi mdi-magnify search-widget-icon" id="search-icon-options"></span>
        <span class="mdi mdi-close-circle search-widget-icon search-widget-icon-close cursor-pointer" id="search-close-options"
            v-if="searchText.length" @click="searchText = ''"></span>
    </div>
</template>
<style scoped>
#search-options {
    padding-left: 30px;
    padding-right: 30px;
}

#search-close-options {
    position: absolute;
    top: 0px;
    right: 0px;
    margin: 10px;
}

#search-icon-options {
    position: absolute;
    top: 0px;
    margin: 10px;
}
</style>
<script>
import { debounce } from 'lodash'
export default {
    name: "SearchComponent",
    props: {
        placeholder: {
            type: String,
            default: "Nhập tên người dùng cần tìm kiếm"
        }
    },
    data() {
        const searchText = ""
        return {
            searchText
        }
    },
    methods: {
        emitSearchText() {
            this.$emit('search-text', this.searchText)
        }
    },
    watch: {
        searchText() {
            debounce(this.emitSearchText, 300)()
        }
    }
};
</script>