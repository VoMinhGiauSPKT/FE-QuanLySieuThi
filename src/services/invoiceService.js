import api from './api'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

/**
 * Tạo mới hóa đơn bán lẻ (POS)
 * @param {Object} data - { phoneNumber?, usePoints?, items: [{ productId, quantity }] }
 */
export const createInvoice = async (data) => {
  return await api.post(API_ENDPOINTS.INVOICE.BASE, data)
}

/**
 * Lấy danh sách hóa đơn
 * @param {Object} params - { page, limit, status, fromDate, toDate, customerId, employeeId }
 */
export const getInvoices = async (params = {}) => {
  return await api.get(API_ENDPOINTS.INVOICE.BASE, { params })
}

/**
 * Lấy chi tiết hóa đơn
 * @param {string} id
 */
export const getInvoiceById = async (id) => {
  return await api.get(API_ENDPOINTS.INVOICE.DETAIL(id))
}

/**
 * Hủy hóa đơn (chỉ áp dụng cho hóa đơn PENDING)
 * @param {string} id
 */
export const cancelInvoice = async (id) => {
  return await api.delete(API_ENDPOINTS.INVOICE.DETAIL(id))
}
