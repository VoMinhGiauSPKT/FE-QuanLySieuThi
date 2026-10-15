import { create } from 'zustand'
import { message } from 'antd'
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  getCustomerInvoices,
} from '../services/customerService'
import { extractArray, extractObject, extractMeta, computePaginationTotal } from '../utils/apiHelper'

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
      const page = params.page || 1
      const pageSize = params.limit || params.pageSize || 8
      const res = await getCustomers({ ...params, page, limit: pageSize })
      const list = extractArray(res)
      const meta = extractMeta(res)
      const total = computePaginationTotal(meta, list.length, page, pageSize)
      set({
        customers: list,
        pagination: {
          current: page,
          pageSize,
          total,
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

  // Tìm kiếm khách hàng theo số điện thoại
  searchCustomerByPhone: async (phone) => {
    try {
      const res = await getCustomers({ keyword: phone })
      const list = extractArray(res)
      if (list && list.length > 0) {
        const found = list.find((c) => c.phoneNumber === phone) || list[0]
        return found
      }
      message.warning('Không tìm thấy khách hàng với số điện thoại này!')
      return null
    } catch (err) {
      console.error('Lỗi khi tìm kiếm khách hàng:', err)
      message.error('Lỗi khi tìm kiếm khách hàng!')
      return null
    }
  },
}))
