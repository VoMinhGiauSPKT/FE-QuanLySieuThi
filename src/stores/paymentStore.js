import { create } from 'zustand'
import { message } from 'antd'
import {
  processPayment,
  getTransactions,
  getPaymentSummary,
  getPaymentHistory,
} from '../services/paymentService'
import { extractArray, extractObject, extractMeta } from '../utils/apiHelper'

export const usePaymentStore = create((set, get) => ({
  summary: null,
  transactions: [],
  paymentHistory: [],
  loading: false,
  processing: false,
  pagination: { current: 1, pageSize: 8, total: 0 },

  // Lấy báo cáo tổng hợp doanh thu thanh toán
  fetchPaymentSummary: async (params = {}) => {
    set({ loading: true })
    try {
      const res = await getPaymentSummary(params)
      const data = extractObject(res, null)
      set({ summary: data })
      return data
    } catch (err) {
      console.error('Lỗi khi tải báo cáo thanh toán:', err)
      return null
    } finally {
      set({ loading: false })
    }
  },

  // Lấy danh sách giao dịch thanh toán
  fetchTransactions: async (params = {}) => {
    set({ loading: true })
    try {
      const res = await getTransactions(params)
      const list = extractArray(res)
      const meta = extractMeta(res)
      set({
        transactions: list,
        pagination: {
          current: params.page || 1,
          pageSize: params.limit || 8,
          total: meta.totalItems || list.length,
        },
      })
      return list
    } catch (err) {
      console.error('Lỗi khi tải danh sách giao dịch:', err)
      return []
    } finally {
      set({ loading: false })
    }
  },

  // Lịch sử thanh toán của hóa đơn
  fetchPaymentHistory: async (invoiceId) => {
    try {
      const res = await getPaymentHistory(invoiceId)
      const list = extractArray(res)
      set({ paymentHistory: list })
      return list
    } catch (err) {
      console.error('Lỗi khi tải lịch sử thanh toán hóa đơn:', err)
      return []
    }
  },

  // Khởi tạo & xử lý thanh toán (CASH / VNPAY)
  processPayment: async (data) => {
    set({ processing: true })
    try {
      const res = await processPayment(data)
      return res?.data?.data || res?.data
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Lỗi khi xử lý thanh toán!')
      return null
    } finally {
      set({ processing: false })
    }
  },
}))
