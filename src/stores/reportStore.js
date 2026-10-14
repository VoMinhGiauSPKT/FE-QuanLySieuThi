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

// Lưu metadata (tiêu đề, ghi chú, lý do lệch) vào localStorage để đảm bảo hiển thị đúng dù BE hoặc mạng có fallback
const saveLocalAuditMeta = (reportId, payload) => {
  if (!reportId || !payload) return
  try {
    const raw = localStorage.getItem('audit_reports_meta')
    const store = raw ? JSON.parse(raw) : {}
    store[reportId] = {
      auditTitle: payload.auditTitle,
      note: payload.note,
      reasons: (payload.items || []).reduce((acc, it) => {
        if (it.productId && it.reason) {
          acc[it.productId] = it.reason
        }
        return acc
      }, {}),
    }
    localStorage.setItem('audit_reports_meta', JSON.stringify(store))
  } catch (e) {
    console.error('Lỗi khi lưu audit metadata vào localStorage:', e)
  }
}

const getLocalAuditMeta = (reportId) => {
  if (!reportId) return null
  try {
    const raw = localStorage.getItem('audit_reports_meta')
    const store = raw ? JSON.parse(raw) : {}
    return store[reportId] || null
  } catch {
    return null
  }
}

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

      // Bổ sung tiêu đề người dùng đã nhập nếu có
      const enrichedList = list.map((item) => {
        const local = getLocalAuditMeta(item.reportId)
        if (local?.auditTitle && (!item.auditTitle || item.auditTitle.startsWith('Kiểm kê kho định kỳ'))) {
          return { ...item, auditTitle: local.auditTitle }
        }
        return item
      })

      set({
        reports: enrichedList,
        pagination: {
          current: page,
          pageSize,
          total: meta.totalItems || enrichedList.length,
        },
      })
      return enrichedList
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
        // Bổ sung tiêu đề, ghi chú và lý do chi tiết từ metadata đã lưu
        const local = getLocalAuditMeta(detail.reportId)
        if (local) {
          if (local.auditTitle && (!detail.auditTitle || detail.auditTitle.startsWith('Kiểm kê kho định kỳ'))) {
            detail.auditTitle = local.auditTitle
          }
          if (local.note && (!detail.note || detail.note === 'Biên bản kiểm kê kho định kỳ')) {
            detail.note = local.note
          }
          if (local.reasons && Array.isArray(detail.items)) {
            detail.items = detail.items.map((it) => {
              if (local.reasons[it.productId]) {
                return { ...it, reason: local.reasons[it.productId] }
              }
              return it
            })
          }
        }
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
      const reportData = extractObject(res, null)
      const reportId = reportData?.reportId || res?.data?.data?.reportId
      if (reportId) {
        saveLocalAuditMeta(reportId, data)
      }
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

