<script setup>
import { defineProps } from 'vue';
import { getTime } from '../../common/common';

const props = defineProps({
    type: {
        type: String,
        default: 'text'
    },
    value: {
        type: String,
        default: '_'
    }
})

const bages = ['badge badge-soft-warning', 'badge badge-soft-success', 'badge badge-soft-danger']

const isReportStatus = (type, value) => {
    return type == 'status' && value?.title
}

const formatReportStatus = (value) => {
    const format = {
        class: bages[value.status],
        title: value?.title
    }
    return format
}

</script>



<template>
    <div v-if="props.type == 'is_baned'">
        <span
            :class="props.value?.boolean ? 'bg-danger-subtle text-danger bg-soft-danger' : 'bg-success-subtle text-success bg-soft-success'"
            class="badge">
            {{ props.value?.title }}
        </span>
    </div>
    <div v-else-if="props.type == 'last_login'">
        {{ props.value ? getTime(props.value) : 'Chưa hoạt động' }}
    </div>
    <div v-else-if="props.type == 'action_time'">
        {{ props.value ? getTime(props.value) : 'Chưa có thông tin' }}
    </div>
    <div v-else-if="props.type == 'updated_date'">
        {{ props.value ? getTime(props.value) : 'Chưa có thông tin' }}
    </div>
    <div v-else-if="props.type == 'created_date'">
        {{ props.value ? getTime(props.value) : 'Chưa có thông tin' }}
    </div>
    <div v-else-if="isReportStatus(props.type, props.value)">
        <span :class="formatReportStatus(props.value).class">
            {{ formatReportStatus(props.value).title }}
        </span>
    </div>
    <div v-else-if="props.type == image" class="d-flex gap-2 align-items-center">
        <div class="flex-shrink-0">
            <img :src="props.value ?? '@/assets/images/default/cardview.jpg'" alt="" class="avatar-xs rounded-circle">
        </div>
        <div class="flex-grow-1">
            Jordan Kennedy
        </div>
    </div>
    <span v-else>
        {{ props.value ? props.value : '_' }}
    </span>
</template>