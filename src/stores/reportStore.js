import { create } from 'zustand'
import { message } from 'antd'
import {
  getStockDiscrepancies,
  getStockDiscrepancyById,
  createStockDiscrepancy,
  getRevenueReport,
  exportExcelReport,
} from '../services/reportService'
import { extractArray, extractObject, extractMeta } from '../utils/apiHelper'

export const useReportStore = create((set, get) => ({
  reports: [],
  revenueData: null,
  loading: false,
  creating: false,
  selectedReport: null,
  detailLoading: false,
  pagination: { current: 1, pageSize: 8, total: 0 },

  // Lấy danh sách biên bản kiểm kê kho (hỗ trợ cả (page, pageSize, filters) và ({ page, limit, ... }))
  fetchReports: async (arg1 = 1, arg2 = 8, arg3 = {}) => {
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
      const res = await getStockDiscrepancies({
        page,
        limit: pageSize,
        ...filters,
      })
      const list = extractArray(res)
      const meta = extractMeta(res)
      set({
        reports: list,
        pagination: {
          current: page,
          pageSize,
          total: meta.totalItems || list.length,
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

  // Alias createReport cho createStockDiscrepancy
  createReport: async (data) => {
    return await get().createStockDiscrepancy(data)
  },

  // Lấy báo cáo doanh thu
  fetchRevenueReport: async (params = {}) => {
    set({ loading: true })
    try {
      const res = await getRevenueReport(params)
      const data = extractObject(res, null)
      set({ revenueData: data })
      return data
    } catch (err) {
      console.error('Lỗi khi tải báo cáo doanh thu:', err)
      return null
    } finally {
      set({ loading: false })
    }
  },

  // Xuất file Excel
  exportExcel: async (params = {}) => {
    try {
      const response = await exportExcelReport(params)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `bao_cao_${Date.now()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      message.success('Tải file Excel thành công!')
      return true
    } catch (err) {
      message.error(err?.message || 'Lỗi khi xuất file Excel!')
      return false
    }
  },
}))

