<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: true,
    },
    title: {
        type: String,
        default: 'Accordion'
    }
})

const show = ref(props.modelValue);
const handleClickHiden = () => {
    show.value = !show.value;
    emit('update:modelValue', show.value)
}
</script>

<template>
    <div class="w-100">
        <div class="mb-3 pe-2 bg-head-title" @click="handleClickHiden">
            <button class="w-100 accordion-button p-2 fw-bold" type="button">
                {{ props.title }}
            </button>
            <i :class="show ? 'rotage' : ''" class="fs-18 cursor-pointer ri-arrow-down-s-line"
                style="transition: all 0.3s linear 0s;"></i>
        </div>
        <div v-show="show">
            <slot></slot>
        </div>
    </div>
</template>


<style scoped>
.bg-head-title {
    background-color: #DBE4FF;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.rotage {
    transform: rotate(180deg);
}
</style>