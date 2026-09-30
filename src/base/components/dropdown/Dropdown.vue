<template>
    <div style="position: relative; display: inline-block;" ref="wrapper">
        <slot name="trigger" :toggle="toggle" :open="open" :close="close">
            <button @click="toggle" class="btn">Toggle</button>
        </slot>

        <transition name="fade">
            <div v-if="isOpen" class="dropdown-content">
                <div class="dropdown-arrow">
                    <div class="dropdown-arrow-inner"></div>
                </div>
                <slot />
            </div>
        </transition>
    </div>
</template>


<script setup>
import { ref, watch, defineExpose, defineEmits, defineProps, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'open', 'close']);

const isOpen = ref(props.modelValue);
const wrapper = ref(null);

// NEW: Thêm flag để tránh close ngay sau khi open
const justOpened = ref(false);

watch(() => props.modelValue, (newVal) => {
    isOpen.value = newVal;
});

watch(isOpen, (newVal) => {
    emit('update:modelValue', newVal);
    if (newVal) {
        emit('open');
        justOpened.value = true; // Đánh dấu vừa mở
        setTimeout(() => {
            justOpened.value = false; // Sau 1 tick event loop mới cho phép click outside
        }, 0);
    } else {
        emit('close');
    }
});

function open() {
    isOpen.value = true;
}

function close() {
    isOpen.value = false;
}

function toggle() {
    isOpen.value = !isOpen.value;
}

// Handle click outside
function handleClickOutside(event) {
    if (justOpened.value) {
        return; // Bỏ qua lần click ngay sau khi mở
    }
    if (wrapper.value && !wrapper.value.contains(event.target)) {
        close();
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});

// Expose functions so parent can call via ref
defineExpose({ open, close, toggle });
</script>


<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.dropdown-content {
    position: absolute;
    top: 100%;
    right: -124px;
    z-index: 10;
    margin-top: 16px;
}

/* Lớp mũi tên bên ngoài (viền) */
.dropdown-arrow {
    position: absolute;
    top: -8px;
    /* đẩy cao lên xíu */
    z-index: 11;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 9px solid transparent;
    border-right: 9px solid transparent;
    border-bottom: 9px solid #dee2e6;
    /* màu viền */
}

/* Lớp mũi tên bên trong (nền) */
.dropdown-arrow-inner {
    position: absolute;
    top: 2px;
    /* đẩy xuống dưới để lộ viền */
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-bottom: 7px solid white;
    /* màu nền của dropdown */
}

@media screen and (max-width: 1200px) {
    .dropdown-content {
        right: -57px;
        /* Đặt lại vị trí cho mobile */
    }

    .dropdown-arrow {
        left: 74%;
    }

}
</style>
