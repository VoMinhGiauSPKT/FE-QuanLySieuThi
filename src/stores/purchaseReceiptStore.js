import { create } from 'zustand'
import { message } from 'antd'
import {
  getPurchaseReceipts,
  getPurchaseReceiptById,
  createPurchaseReceipt,
} from '../services/purchaseReceiptService'
import { exportExcelReport } from '../services/reportService'
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

  // Xuất file Excel phiếu nhập kho (cho 1 phiếu lẻ hoặc toàn bộ danh sách)
  exportPurchaseExcel: async (params = {}) => {
    try {
      const response = await exportExcelReport({
        target: 'purchase',
        ...params,
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      let downloadName = params.filename
      if (!downloadName) {
        if (params.receiptId) {
          downloadName = `Phieu_Nhap_Kho_${params.receiptId}.xlsx`
        } else {
          downloadName = `Bao_Cao_Phieu_Nhap_${Date.now()}.xlsx`
        }
      }
      link.setAttribute('download', downloadName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      message.success('Tải file Excel phiếu nhập thành công!')
      return true
    } catch (err) {
      console.error('Lỗi xuất Excel phiếu nhập:', err)
      message.error(err?.message || 'Lỗi khi xuất file Excel phiếu nhập!')
      return false
    }
  },
}))
