import api from './api'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

/**
 * Gửi đánh giá phản hồi (Public cho khách hàng, Rate limit 5req/min)
 * @param {Object} data - { customerName, phoneNumber, rating, comment }
 */
export const submitFeedback = async (data) => {
  return await api.post(API_ENDPOINTS.FEEDBACK.BASE, data)
}

/**
 * Lấy danh sách đánh giá & thống kê tổng hợp (Chỉ STORE_OWNER)
 * @param {Object} params - { page, limit, rating, fromDate, toDate }
 */
export const getFeedbacks = async (params = {}) => {
  return await api.get(API_ENDPOINTS.FEEDBACK.BASE, { params })
}

/**
 * Lấy chi tiết đánh giá
 * @param {string} id
 */
export const getFeedbackById = async (id) => {
  return await api.get(API_ENDPOINTS.FEEDBACK.DETAIL(id))
}
