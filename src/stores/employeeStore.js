import { create } from 'zustand'
import { message } from 'antd'
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../services/employeeService'
import { extractArray, extractObject, extractMeta } from '../utils/apiHelper'

export const useEmployeeStore = create((set, get) => ({
  employees: [],
  selectedEmployee: null,
  loading: false,
  detailLoading: false,
  pagination: { current: 1, pageSize: 10, total: 0 },
  filters: {},

  // Lấy danh sách nhân viên (hỗ trợ cả fetchEmployees(page, pageSize, filters) và fetchEmployees({ page, limit, ... }))
  fetchEmployees: async (arg1 = 1, arg2 = 10, arg3 = {}) => {
    let page = 1
    let pageSize = 10
    let filters = {}

    if (typeof arg1 === 'object' && arg1 !== null) {
      page = arg1.page || 1
      pageSize = arg1.limit || arg1.pageSize || 10
      const { page: _p, limit: _l, pageSize: _ps, ...rest } = arg1
      filters = rest
    } else {
      page = Number(arg1) || 1
      pageSize = Number(arg2) || 10
      filters = arg3 || {}
    }

    set({ loading: true, filters })
    try {
      const res = await getEmployees({
        page,
        limit: pageSize,
        ...filters,
      })
      const list = extractArray(res)
      const meta = extractMeta(res)
      set({
        employees: list,
        pagination: {
          current: meta.currentPage || page,
          pageSize: meta.pageSize || pageSize,
          total: meta.totalItems !== undefined ? meta.totalItems : list.length,
        },
      })
      return list
    } catch (err) {
      message.error(err?.message || 'Không thể tải danh sách nhân viên!')
      return []
    } finally {
      set({ loading: false })
    }
  },

  // Lấy chi tiết nhân viên theo ID
  fetchEmployeeById: async (id) => {
    set({ detailLoading: true })
    try {
      const res = await getEmployeeById(id)
      const detail = extractObject(res, null)
      set({ selectedEmployee: detail })
      return detail
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tải chi tiết nhân viên!')
      return null
    } finally {
      set({ detailLoading: false })
    }
  },

  // Thêm mới nhân viên
  createEmployee: async (data) => {
    try {
      const res = await createEmployee(data)
      message.success(res?.data?.message || 'Tạo nhân viên thành công!')
      const { pagination, filters } = get()
      await get().fetchEmployees(1, pagination.pageSize, filters)
      return true
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tạo nhân viên!')
      return false
    }
  },

  // Cập nhật nhân viên
  updateEmployee: async (id, data) => {
    try {
      const res = await updateEmployee(id, data)
      message.success(res?.data?.message || 'Cập nhật nhân viên thành công!')
      const { pagination, filters } = get()
      await get().fetchEmployees(pagination.current, pagination.pageSize, filters)
      return true
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật nhân viên!')
      return false
    }
  },

  // Xóa nhân viên
  deleteEmployee: async (id) => {
    try {
      const res = await deleteEmployee(id)
      message.success(res?.data?.message || 'Xóa nhân viên thành công!')
      const { pagination, filters } = get()
      await get().fetchEmployees(pagination.current, pagination.pageSize, filters)
      return true
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể xóa nhân viên!')
      return false
    }
  },
}))
