import api from './api'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

/**
 * Tạo phiếu nhập hàng
 * @param {Object} data - { supplierName, note, items: [{ productId, productName, categoryId, purchasedQuantity, purchasePrice, unitPrice, expirationDate }] }
 */
export const createPurchaseReceipt = async (data) => {
  return await api.post(API_ENDPOINTS.PURCHASE_RECEIPT.BASE, data)
}

/**
 * Lấy danh sách phiếu nhập hàng
 * @param {Object} params - { page, limit, supplierName, employeeId, fromDate, toDate }
 */
export const getPurchaseReceipts = async (params = {}) => {
  return await api.get(API_ENDPOINTS.PURCHASE_RECEIPT.BASE, { params })
}

/**
 * Lấy chi tiết phiếu nhập hàng
 * @param {string} id
 */
export const getPurchaseReceiptById = async (id) => {
  return await api.get(API_ENDPOINTS.PURCHASE_RECEIPT.DETAIL(id))
}
