import { ref } from 'vue'

// ✅ Khai báo ở ngoài → dùng chung toàn app
const isLoading = ref(false)
const loadingMessage = ref('')

export function useLoading() {
  const showLoading = (message = 'Đang kiểm tra quyền...') => {
    isLoading.value = true
    loadingMessage.value = message
  }

  const hideLoading = () => {
    isLoading.value = false
  }

  return {
    isLoading,
    loadingMessage,
    showLoading,
    hideLoading,
  }
}
