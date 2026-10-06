import api from './api'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

/**
 * Gọi API đăng nhập hệ thống
 * @param {Object} credentials - { username, password }
 */
export const loginApi = async (credentials) => {
  return await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
}

/**
 * Gọi API đăng xuất hệ thống và xóa cookie refreshToken
 */
export const logoutApi = async () => {
  return await api.post(API_ENDPOINTS.AUTH.LOGOUT)
}

/**
 * Gọi API làm mới accessToken khi refreshToken chưa hết hạn
 */
export const refreshTokenApi = async () => {
  return await api.post(API_ENDPOINTS.AUTH.REFRESH)
}
