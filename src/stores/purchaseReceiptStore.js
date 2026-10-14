import { create } from 'zustand'
import { message } from 'antd'
import {
  getPurchaseReceipts,
  getPurchaseReceiptById,
  createPurchaseReceipt,
} from '../services/purchaseReceiptService'
import { extractArray, extractObject, extractMeta } from '../utils/apiHelper'

export const usePurchaseReceiptStore = create((set, get) => ({
  receipts: [],
  loading: false,
  creating: false,
  selectedReceipt: null,
  detailLoading: false,
  pagination: { current: 1, pageSize: 8, total: 0 },

  // Lấy danh sách phiếu nhập hàng
  fetchReceipts: async (params = {}) => {
    set({ loading: true })
    try {
      const res = await getPurchaseReceipts(params)
      const list = extractArray(res)
      const meta = extractMeta(res)
      set({
        receipts: list,
        pagination: {
          current: params.page || 1,
          pageSize: params.limit || 8,
          total: meta.totalItems || list.length,
        },
      })
      return list
    } catch (err) {
      console.error('Lỗi khi tải danh sách phiếu nhập:', err)
      return []
    } finally {
      set({ loading: false })
    }
  },

  // Lấy chi tiết phiếu nhập hàng theo ID
  fetchReceiptDetail: async (id) => {
    set({ detailLoading: true })
    try {
      const res = await getPurchaseReceiptById(id)
      const detail = extractObject(res, null)
      if (detail) {
        set({ selectedReceipt: detail })
      }
      return detail
    } catch (err) {
      console.error('Lỗi khi tải chi tiết phiếu nhập:', err)
      return null
    } finally {
      set({ detailLoading: false })
    }
  },

  setSelectedReceipt: (receipt) => {
    set({ selectedReceipt: receipt })
  },

  // Lập phiếu nhập hàng mới
  createReceipt: async (data) => {
    set({ creating: true })
    try {
      const res = await createPurchaseReceipt(data)
      message.success(res?.data?.message || 'Lập phiếu nhập hàng thành công!')
      await get().fetchReceipts()
      return true
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể lập phiếu nhập hàng!')
      return false
    } finally {
      set({ creating: false })
    }
  },
}))
