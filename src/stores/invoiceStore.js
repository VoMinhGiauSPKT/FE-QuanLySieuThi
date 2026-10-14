import { create } from 'zustand'
import { message } from 'antd'
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  cancelInvoice,
} from '../services/invoiceService'
import { extractArray, extractObject, extractMeta } from '../utils/apiHelper'

export const useInvoiceStore = create((set, get) => ({
  invoices: [],
  loading: false,
  selectedInvoice: null,
  detailLoading: false,
  pagination: { current: 1, pageSize: 8, total: 0 },

  // Lấy danh sách hóa đơn
  fetchInvoices: async (params = {}) => {
    set({ loading: true })
    try {
      const res = await getInvoices(params)
      const list = extractArray(res)
      const meta = extractMeta(res)
      set({
        invoices: list,
        pagination: {
          current: params.page || 1,
          pageSize: params.limit || 8,
          total: meta.totalItems || list.length,
        },
      })
      return list
    } catch (err) {
      console.error('Lỗi khi tải lịch sử hóa đơn:', err)
      return []
    } finally {
      set({ loading: false })
    }
  },

  // Lấy chi tiết hóa đơn
  fetchInvoiceDetail: async (id) => {
    set({ detailLoading: true })
    try {
      const res = await getInvoiceById(id)
      const detail = extractObject(res, null)
      if (detail) {
        set({ selectedInvoice: detail })
      }
      return detail
    } catch (err) {
      console.error('Lỗi khi tải chi tiết hóa đơn:', err)
      return null
    } finally {
      set({ detailLoading: false })
    }
  },

  // Tạo hóa đơn
  createInvoice: async (data) => {
    try {
      const res = await createInvoice(data)
      message.success(res?.data?.message || 'Tạo hóa đơn thành công!')
      await get().fetchInvoices()
      return res?.data?.data || res?.data
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tạo hóa đơn!')
      return null
    }
  },

  // Hủy hóa đơn PENDING
  cancelInvoice: async (id) => {
    try {
      const res = await cancelInvoice(id)
      message.success(res?.data?.message || 'Hủy hóa đơn thành công!')
      await get().fetchInvoices()
      return true
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể hủy hóa đơn!')
      return false
    }
  },
}))
