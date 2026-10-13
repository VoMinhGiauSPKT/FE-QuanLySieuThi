import { create } from 'zustand'
import { message } from 'antd'
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../services/employeeService'
import { extractArray } from '../utils/apiHelper'

export const useEmployeeStore = create((set, get) => ({
  employees: [],
  loading: false,
  pagination: { current: 1, pageSize: 8, total: 0 },
  filters: {},

  // Lấy danh sách nhân viên
  fetchEmployees: async (page = 1, pageSize = 8, filters = {}) => {
    set({ loading: true, filters })
    try {
      const res = await getEmployees({
        page,
        limit: pageSize,
        ...filters,
      })
      const list = extractArray(res)
      const meta = res?.data?.meta || res?.data?.data?.meta || {}
      set({
        employees: list,
        pagination: {
          current: page,
          pageSize,
          total: meta.total ?? list.length,
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
