import api from './api'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

/**
 * Lấy danh sách nhân viên
 * @param {Object} params - { page, limit, keyword, position, status }
 */
export const getEmployees = async (params = {}) => {
  return await api.get(API_ENDPOINTS.EMPLOYEE.BASE, { params })
}

/**
 * Lấy thông tin chi tiết nhân viên
 * @param {string} id
 */
export const getEmployeeById = async (id) => {
  return await api.get(API_ENDPOINTS.EMPLOYEE.DETAIL(id))
}

/**
 * Tạo tài khoản nhân viên mới
 * @param {Object} data - { username, password, fullName, phoneNumber, email, position, status }
 */
export const createEmployee = async (data) => {
  return await api.post(API_ENDPOINTS.EMPLOYEE.BASE, data)
}

/**
 * Cập nhật thông tin nhân viên
 * @param {string} id
 * @param {Object} data - { fullName, phoneNumber, email, position, status, password? }
 */
export const updateEmployee = async (id, data) => {
  return await api.put(API_ENDPOINTS.EMPLOYEE.DETAIL(id), data)
}

/**
 * Xóa mềm nhân viên (chuyển status thành false)
 * @param {string} id
 */
export const deleteEmployee = async (id) => {
  return await api.delete(API_ENDPOINTS.EMPLOYEE.DETAIL(id))
}
