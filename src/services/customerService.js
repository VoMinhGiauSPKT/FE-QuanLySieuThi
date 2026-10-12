import api from './api'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

/**
 * Lấy danh sách khách hàng
 * @param {Object} params - { page, limit, keyword }
 */
export const getCustomers = async (params = {}) => {
  return await api.get(API_ENDPOINTS.CUSTOMER.BASE, { params })
}

/**
 * Tạo mới khách hàng
 * @param {Object} data - { fullName, phoneNumber, email }
 */
export const createCustomer = async (data) => {
  return await api.post(API_ENDPOINTS.CUSTOMER.BASE, data)
}

/**
 * Lấy lịch sử hóa đơn mua sắm của khách hàng
 * @param {string} customerId
 * @param {Object} params - { page, limit, status, fromDate, toDate }
 */
export const getCustomerInvoices = async (customerId, params = {}) => {
  return await api.get(API_ENDPOINTS.CUSTOMER.INVOICES(customerId), { params })
}
