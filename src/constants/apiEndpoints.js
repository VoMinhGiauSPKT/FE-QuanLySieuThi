// Lấy Base URL từ biến môi trường .env hoặc mặc định tới backend đang chạy
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/QuanLySieuThi/api'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh', // Chuẩn theo thiết kế backend: /auth/refresh
  },
}
