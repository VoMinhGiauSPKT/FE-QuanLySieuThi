import { create } from 'zustand'
import { message } from 'antd'
import {
  getCustomers,
  createCustomer,
  getCustomerInvoices,
} from '../services/customerService'
import { extractArray } from '../utils/apiHelper'

export const useCustomerStore = create((set, get) => ({
  customers: [],
  loading: false,

  // Lấy danh sách khách hàng
  fetchCustomers: async (params = {}) => {
    set({ loading: true })
    try {
      const res = await getCustomers(params)
      const list = extractArray(res)
      set({ customers: list })
      return list
    } catch (err) {
      console.error('Lỗi khi tải danh sách khách hàng:', err)
      return []
    } finally {
      set({ loading: false })
    }
  },

  // Tạo khách hàng thành viên mới
  createCustomer: async (data) => {
    try {
      const res = await createCustomer(data)
      message.success(res?.data?.message || 'Đăng ký khách hàng thành viên thành công!')
      await get().fetchCustomers()
      return res?.data?.data || res?.data
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tạo khách hàng!')
      return null
    }
  },

  // Lấy lịch sử hóa đơn của khách hàng
  fetchCustomerInvoices: async (customerId, params = {}) => {
    try {
      const res = await getCustomerInvoices(customerId, params)
      return extractArray(res)
    } catch (err) {
      console.error('Lỗi khi tải lịch sử hóa đơn khách hàng:', err)
      return []
    }
  },
}))
