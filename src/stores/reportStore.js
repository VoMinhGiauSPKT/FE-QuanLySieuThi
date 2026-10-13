import { create } from 'zustand'
import { message } from 'antd'
import {
  getStockDiscrepancies,
  getStockDiscrepancyById,
  createStockDiscrepancy,
} from '../services/reportService'
import { extractArray, extractObject } from '../utils/apiHelper'

export const useReportStore = create((set, get) => ({
  reports: [],
  loading: false,
  creating: false,
  selectedReport: null,
  detailLoading: false,
  pagination: { current: 1, pageSize: 8, total: 0 },

  // Lấy danh sách biên bản kiểm kê kho
  fetchReports: async (page = 1, pageSize = 8, filters = {}) => {
    set({ loading: true })
    try {
      const res = await getStockDiscrepancies({
        page,
        limit: pageSize,
        ...filters,
      })
      const list = extractArray(res)
      const meta = res?.data?.meta || res?.data?.data?.meta || {}
      set({
        reports: list,
        pagination: {
          current: page,
          pageSize,
          total: meta.total ?? list.length,
        },
      })
      return list
    } catch (err) {
      console.error('Lỗi khi tải danh sách biên bản kiểm kê:', err)
      return []
    } finally {
      set({ loading: false })
    }
  },

  // Lấy chi tiết biên bản kiểm kê
  fetchReportDetail: async (id) => {
    set({ detailLoading: true })
    try {
      const res = await getStockDiscrepancyById(id)
      const detail = extractObject(res, null)
      if (detail) {
        set({ selectedReport: detail })
      }
      return detail
    } catch (err) {
      console.error('Lỗi khi tải chi tiết biên bản kiểm kê:', err)
      return null
    } finally {
      set({ detailLoading: false })
    }
  },

  setSelectedReport: (report) => {
    set({ selectedReport: report })
  },

  // Lập biên bản kiểm kê lệch tồn mới
  createStockDiscrepancy: async (data) => {
    set({ creating: true })
    try {
      const res = await createStockDiscrepancy(data)
      message.success(
        res?.data?.message || 'Đã gửi biên bản kiểm kê lên Chủ Cửa Hàng xem xét xử lý!'
      )
      const { pagination } = get()
      await get().fetchReports(1, pagination.pageSize)
      return true
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể gửi biên bản kiểm kê!')
      return false
    } finally {
      set({ creating: false })
    }
  },
}))
