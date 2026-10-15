import { create } from 'zustand'
import { message } from 'antd'
import {
  createReturnReceipt,
  getReturnReceipts,
  getReturnReceiptById,
} from '../services/returnReceiptService'
import { extractArray, extractObject, extractMeta, computePaginationTotal } from '../utils/apiHelper'

export const useReturnReceiptStore = create((set, get) => ({
  returnReceipts: [],
  selectedReturnReceipt: null,
  loading: false,
  creating: false,
  detailLoading: false,
  pagination: { current: 1, pageSize: 8, total: 0 },

  // Lấy danh sách phiếu trả hàng (hỗ trợ cả fetchReturnReceipts(page, pageSize, filters) và fetchReturnReceipts({ page, limit, ... }))
  fetchReturnReceipts: async (arg1 = 1, arg2 = 8, arg3 = {}) => {
    let page = 1
    let pageSize = 8
    let filters = {}

    if (typeof arg1 === 'object' && arg1 !== null) {
      page = arg1.page || 1
      pageSize = arg1.limit || arg1.pageSize || 8
      const { page: _p, limit: _l, pageSize: _ps, ...rest } = arg1
      filters = rest
    } else {
      page = Number(arg1) || 1
      pageSize = Number(arg2) || 8
      filters = arg3 || {}
    }

    set({ loading: true })
    try {
      const res = await getReturnReceipts({ page, limit: pageSize, ...filters })
      const list = extractArray(res)
      const meta = extractMeta(res)
      const total = computePaginationTotal(meta, list.length, page, pageSize)
      set({
        returnReceipts: list,
        pagination: {
          current: page,
          pageSize,
          total,
        },
      })
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
