import api from './api'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

/**
 * Lấy danh sách sản phẩm
 * @param {Object} params - { page, limit, keyword, categoryId, productStatus }
 */
export const getProducts = async (params = {}) => {
  return await api.get(API_ENDPOINTS.PRODUCT.BASE, { params })
}

/**
 * Lấy chi tiết sản phẩm
 * @param {string} id
 */
export const getProductById = async (id) => {
  return await api.get(API_ENDPOINTS.PRODUCT.DETAIL(id))
}

/**
 * Cập nhật thông tin sản phẩm
 * @param {string} id
 * @param {Object} data - { productName, categoryId, unitPrice, productStatus }
 */
export const updateProduct = async (id, data) => {
  return await api.put(API_ENDPOINTS.PRODUCT.DETAIL(id), data)
}

/**
 * Lấy danh sách cảnh báo tồn kho thấp
 * @param {Object} params - { threshold, categoryId, page, limit }
 */
export const getLowStockAlerts = async (params = {}) => {
  return await api.get(API_ENDPOINTS.PRODUCT.LOW_STOCK_ALERTS, { params })
}
