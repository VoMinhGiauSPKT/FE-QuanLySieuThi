import api from './api'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

/**
 * Khởi tạo & xử lý thanh toán hóa đơn (CASH / VNPAY)
 * @param {Object} data - { invoiceId, paymentMethod: 'CASH' | 'VNPAY' }
 */
export const processPayment = async (data) => {
  return await api.post(API_ENDPOINTS.PAYMENT.PROCESS, data)
}

/**
 * Lấy danh sách các giao dịch thanh toán
 * @param {Object} params - { page, limit, paymentMethod, status, fromDate, toDate }
 */
export const getTransactions = async (params = {}) => {
  return await api.get(API_ENDPOINTS.PAYMENT.TRANSACTIONS, { params })
}

/**
 * Lấy báo cáo tổng hợp doanh thu theo phương thức thanh toán
 * @param {Object} params - { fromDate, toDate }
 */
export const getPaymentSummary = async (params = {}) => {
  return await api.get(API_ENDPOINTS.PAYMENT.SUMMARY, { params })
}

/**
 * Lấy lịch sử thanh toán của một hóa đơn
 * @param {string} invoiceId
 */
export const getPaymentHistory = async (invoiceId) => {
  return await api.get(API_ENDPOINTS.PAYMENT.HISTORY(invoiceId))
}
