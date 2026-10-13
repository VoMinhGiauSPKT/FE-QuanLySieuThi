import api from './api'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

/**
 * Lấy danh sách loại sản phẩm (hỗ trợ phân trang, tìm kiếm)
 * @param {Object} params - { page, limit, keyword, all }
 */
export const getCategories = async (params = {}) => {
  return await api.get(API_ENDPOINTS.CATEGORY.BASE, { params })
}

/**
 * Lấy toàn bộ danh sách loại sản phẩm (không phân trang, phục vụ dropdown)
 */
export const getAllCategories = async () => {
  return await api.get(API_ENDPOINTS.CATEGORY.BASE, { params: { all: true } })
}

/**
 * Lấy chi tiết loại sản phẩm theo ID
 * @param {string} id
 */
export const getCategoryById = async (id) => {
  return await api.get(API_ENDPOINTS.CATEGORY.DETAIL(id))
}

/**
 * Tạo mới loại sản phẩm
 * @param {Object} data - { categoryName, categoryId }
 */
export const createCategory = async (data) => {
  return await api.post(API_ENDPOINTS.CATEGORY.BASE, data)
}

/**
 * Cập nhật thông tin loại sản phẩm
 * @param {string} id
 * @param {Object} data - { categoryName }
 */
export const updateCategory = async (id, data) => {
  return await api.put(API_ENDPOINTS.CATEGORY.DETAIL(id), data)
}

/**
 * Xóa loại sản phẩm
 * @param {string} id
 */
export const deleteCategory = async (id) => {
  return await api.delete(API_ENDPOINTS.CATEGORY.DETAIL(id))
}
