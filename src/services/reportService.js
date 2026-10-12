import api from './api'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

/**
 * Lập biên bản kiểm kê kho (báo cáo chênh lệch tồn kho thực tế vs hệ thống)
 * @param {Object} data - { note, items: [{ productId, actualQuantity, discrepancyReason }] }
 */
export const createStockDiscrepancy = async (data) => {
  return await api.post(API_ENDPOINTS.REPORT.STOCK_DISCREPANCY, data)
}

/**
 * Lấy danh sách biên bản kiểm kê kho
 * @param {Object} params - { page, limit, employeeId, fromDate, toDate }
 */
export const getStockDiscrepancies = async (params = {}) => {
  return await api.get(API_ENDPOINTS.REPORT.STOCK_DISCREPANCY, { params })
}

/**
 * Lấy chi tiết biên bản kiểm kê kho
 * @param {string} id
 */
export const getStockDiscrepancyById = async (id) => {
  return await api.get(API_ENDPOINTS.REPORT.STOCK_DISCREPANCY_DETAIL(id))
}
