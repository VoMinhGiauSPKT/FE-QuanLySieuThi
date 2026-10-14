import api from './api'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

/**
 * Tạo phiếu hủy kho (xuất hủy hàng hóa hư hỏng/hết hạn và trừ tồn kho sản phẩm)
 * @param {Object} data - { items: [{ productId, disposedQuantity, disposalReason }] }
 */
export const createDisposalReceipt = async (data) => {
  return await api.post(API_ENDPOINTS.DISPOSAL_RECEIPT.BASE, data)
}

/**
 * Lấy danh sách phiếu hủy kho (hỗ trợ phân trang, lọc theo khoảng thời gian và nhân viên lập phiếu)
 * @param {Object} params - { page, limit, employeeId, fromDate, toDate }
 */
export const getDisposalReceipts = async (params = {}) => {
  return await api.get(API_ENDPOINTS.DISPOSAL_RECEIPT.BASE, { params })
}

/**
 * Lấy thông tin chi tiết một phiếu hủy kho theo id
 * @param {string} id - voucherId
 */
export const getDisposalReceiptById = async (id) => {
  return await api.get(API_ENDPOINTS.DISPOSAL_RECEIPT.DETAIL(id))
}
