import { create } from 'zustand'
import { message } from 'antd'
import {
  createReturnReceipt,
  getReturnReceipts,
  getReturnReceiptById,
} from '../services/returnReceiptService'
import { extractArray, extractObject } from '../utils/apiHelper'

export const useReturnReceiptStore = create((set, get) => ({
  returnReceipts: [],
  selectedReturnReceipt: null,
  loading: false,
  creating: false,
  detailLoading: false,

  // Lấy danh sách phiếu trả hàng
  fetchReturnReceipts: async (params = {}) => {
    set({ loading: true })
    try {
      const res = await getReturnReceipts(params)
      const list = extractArray(res)
      set({ returnReceipts: list })
      return list
    } catch (err) {
      console.error('Lỗi khi tải danh sách phiếu trả hàng:', err)
      return []
    } finally {
      set({ loading: false })
    }
  },

  // Lấy chi tiết phiếu trả hàng
  fetchReturnReceiptById: async (id) => {
    set({ detailLoading: true })
    try {
      const res = await getReturnReceiptById(id)
      const detail = extractObject(res, null)
      set({ selectedReturnReceipt: detail })
      return detail
    } catch (err) {
      console.error('Lỗi khi tải chi tiết phiếu trả hàng:', err)
      return null
    } finally {
      set({ detailLoading: false })
    }
  },

  // Tạo phiếu trả hàng tại quầy
  createReturnReceipt: async (data) => {
    set({ creating: true })
    try {
      const res = await createReturnReceipt(data)
      message.success(res?.data?.message || 'Tạo phiếu trả hàng thành công!')
      await get().fetchReturnReceipts()
      return res?.data?.data || res?.data
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tạo phiếu trả hàng!')
      return null
    } finally {
      set({ creating: false })
    }
  },
}))
