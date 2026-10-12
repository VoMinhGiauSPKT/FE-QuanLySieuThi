import api from './api'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

/**
 * Tạo phiếu trả hàng tại quầy thu ngân
 * @param {Object} data - { invoiceId, reason, items: [{ productId, returnQuantity }] }
 */
export const createReturnReceipt = async (data) => {
  return await api.post(API_ENDPOINTS.RETURN_RECEIPT.BASE, data)
}

/**
 * Lấy danh sách phiếu trả hàng
 * @param {Object} params - { page, limit, invoiceId, employeeId, fromDate, toDate }
 */
export const getReturnReceipts = async (params = {}) => {
  return await api.get(API_ENDPOINTS.RETURN_RECEIPT.BASE, { params })
}

/**
 * Lấy chi tiết phiếu trả hàng
 * @param {string} id
 */
export const getReturnReceiptById = async (id) => {
  return await api.get(API_ENDPOINTS.RETURN_RECEIPT.DETAIL(id))
}
