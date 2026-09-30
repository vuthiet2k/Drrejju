<template>
    <div class="position-relative justify-content-center align-items-center text-center d-flex flex-column">
        <p class="w-100">{{ loadingText }}</p>
        <div class="spinner"></div>
    </div>
</template>

<script>
export default {
    name: "loadingComponent",
    props: {
        loadingText: {
            default: "Đang tải dữ liệu..."
        }
    }
};
</script>

<style scoped>

.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid #3498db;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
