import { create } from 'zustand'
import { message } from 'antd'
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  getCustomerInvoices,
} from '../services/customerService'
import { extractArray, extractObject, extractMeta } from '../utils/apiHelper'

export const useCustomerStore = create((set, get) => ({
  customers: [],
  selectedCustomer: null,
  loading: false,
  detailLoading: false,
  pagination: { current: 1, pageSize: 8, total: 0 },

  // Lấy danh sách khách hàng
  fetchCustomers: async (params = {}) => {
    set({ loading: true })
    try {
      const res = await getCustomers(params)
      const list = extractArray(res)
      const meta = extractMeta(res)
      set({
        customers: list,
        pagination: {
          current: params.page || 1,
          pageSize: params.limit || 8,
          total: meta.totalItems || list.length,
        },
      })
      return list
    } catch (err) {
      console.error('Lỗi khi tải danh sách khách hàng:', err)
      return []
    } finally {
      set({ loading: false })
    }
  },

  // Lấy chi tiết khách hàng theo ID
  fetchCustomerById: async (id) => {
    set({ detailLoading: true })
    try {
      const res = await getCustomerById(id)
      const detail = extractObject(res, null)
      set({ selectedCustomer: detail })
      return detail
    } catch (err) {
      console.error('Lỗi khi tải chi tiết khách hàng:', err)
      return null
    } finally {
      set({ detailLoading: false })
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
