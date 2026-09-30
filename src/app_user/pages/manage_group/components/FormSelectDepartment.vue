<script>
import TreeSelect from '@/base/components/tree-select/TreeSelect.vue';
import { ID_ORGANIZATION } from "@/helpers/utils/config_system";
import { useFetch } from "@/helpers/api/api.js";
import { SERVER_URL } from "@/helpers/utils/config_system.js";
export default ({
    props: {
        defaultData: {
            type: Array,
            default: () => []
        },
        disable: {
            default: false
        }
    },
    data() {
        return {
            dataUrl: `${SERVER_URL}/api/organization/${ID_ORGANIZATION}/department?all`,
            departments: [],
            selectedData: []
        }
    },
    components: {
        TreeSelect
    },
    computed: {
    },
    mounted() {
        useFetch(this.dataUrl).then(data => {
            this.departments = data?.results || []
        })

    },
    methods: {
        handleSelectedTree(data) {
            this.selectedData = data
            this.handleEmitData()
        },
        handleEmitData() {
            const emittedData = this.selectedData?.length > 0
                ? this.selectedData.map(item => ({ id: item.id, name: item.name }))
                : [];
            this.$emit('update:selectedData', emittedData); // Emit the data to the parent
            return emittedData;
        }
    },
    watch: {
    }
})
</script>

<template>
    <TreeSelect :disable="disable" @on-selected="handleSelectedTree" :treeData="departments" :convert="true" :defaultSelected="defaultData" multiSelect="true"></TreeSelect>
</template>
