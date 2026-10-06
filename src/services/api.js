import axios from 'axios'
import { API_BASE_URL, API_ENDPOINTS } from '../constants/apiEndpoints'
import { useAuthStore } from '../stores/authStore'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Tự động gửi và nhận cookie chứa refreshToken (HttpOnly)
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Tự động đính kèm accessToken vào Header Authorization
api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Response Interceptor: Tự động gọi /auth/refresh khi gặp lỗi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Không kích hoạt refresh nếu API bị lỗi chính là Login hoặc chính Endpoint Refresh Token
    const isAuthEndpoint =
      originalRequest.url?.includes(API_ENDPOINTS.AUTH.LOGIN) ||
      originalRequest.url?.includes(API_ENDPOINTS.AUTH.REFRESH)

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Đang có một request khác thực hiện refresh token -> Xếp vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Gọi API POST /api/auth/refresh cấp lại accessToken mới từ cookie refreshToken
        const response = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
          {},
          { withCredentials: true }
        )

        const newAccessToken = response.data?.data?.accessToken

        if (newAccessToken) {
          // Lưu token mới vào Zustand store
          useAuthStore.getState().setAccessToken(newAccessToken)

          // Cập nhật header cho request ban đầu
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

          // Cho phép các request đang xếp hàng tiếp tục
          processQueue(null, newAccessToken)

          // Gửi lại request ban đầu
          return api(originalRequest)
        } else {
          throw new Error('Không nhận được accessToken mới từ máy chủ')
        }
      } catch (refreshError) {
        // Refresh token không có hoặc đã hết hạn (401 / 403) -> Đăng xuất người dùng
        processQueue(refreshError, null)
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
