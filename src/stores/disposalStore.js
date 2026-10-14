import { create } from 'zustand'
import { message } from 'antd'
import {
  createDisposalReceipt,
  getDisposalReceipts,
  getDisposalReceiptById,
} from '../services/disposalReceiptService'
import { exportExcelReport } from '../services/reportService'
import { extractArray, extractObject, extractMeta } from '../utils/apiHelper'
import { formatDate } from '../utils/formatters'
import { useProductStore } from './productStore'

export const useDisposalStore = create((set, get) => ({
  // Dữ liệu danh sách & phân trang
  receipts: [],
  selectedReceipt: null,
  pagination: { current: 1, pageSize: 8, total: 0 },

  // Trạng thái tải
  loading: false,
  submitting: false,
  detailLoading: false,

  // Tìm kiếm
  searchTerm: '',

  // Trạng thái Modal
  isCreateModalOpen: false,
  isDetailModalOpen: false,

  // Dữ liệu dự thảo phiếu xuất hủy
  commonReason: 'Hàng hết hạn sử dụng',
  disposalItems: [],
  selectedProductId: null,

  // Actions cập nhật bộ lọc & modal
  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedProductId: (id) => set({ selectedProductId: id }),
  setCommonReason: (reason) => set({ commonReason: reason }),

  setIsCreateModalOpen: (isOpen) => {
    set({ isCreateModalOpen: isOpen })
    if (!isOpen) {
      set({ disposalItems: [], selectedProductId: null })
    }
  },

  setIsDetailModalOpen: (isOpen) => set({ isDetailModalOpen: isOpen }),

  // Thêm mặt hàng vào danh sách dự thảo xuất hủy
  addDisposalItem: (product) => {
    if (!product) return
    const { disposalItems, commonReason } = get()
    const currentStock = product.stockQuantity != null ? product.stockQuantity : 0
    if (currentStock <= 0) {
      message.warning('Sản phẩm này hiện đang có số lượng tồn kho = 0, không thể xuất hủy!')
      return
    }

    const existingIndex = disposalItems.findIndex((it) => it.productId === product.productId)
    if (existingIndex >= 0) {
      const existing = disposalItems[existingIndex]
      if (existing.destroyQuantity >= currentStock) {
        message.warning(`Số lượng xuất hủy đã đạt mức tồn kho tối đa (${currentStock})!`)
        return
      }
      const updated = [...disposalItems]
      updated[existingIndex] = {
        ...existing,
        destroyQuantity: existing.destroyQuantity + 1,
      }
      set({ disposalItems: updated, selectedProductId: null })
      message.success(`Đã tăng số lượng hủy cho [${product.productName}]`)
    } else {
      set({
        disposalItems: [
          ...disposalItems,
          {
            productId: product.productId,
            productName: product.productName,
            categoryName: product.category?.categoryName || product.categoryName || 'Chung',
            stockQuantity: currentStock,
            unitPrice: product.unitPrice || product.price || 0,
            destroyQuantity: 1,
            reason: commonReason,
          },
        ],
        selectedProductId: null,
      })
      message.success(`Đã thêm [${product.productName}] vào danh sách xuất hủy!`)
    }
  },

  // Cập nhật số lượng hủy của một mặt hàng
  updateItemQuantity: (productId, qty) => {
    const val = Number(qty) || 1
    const { disposalItems } = get()
    const updated = disposalItems.map((it) => {
      if (it.productId === productId) {
        const clamped = Math.min(Math.max(1, val), it.stockQuantity)
        return { ...it, destroyQuantity: clamped }
      }
      return it
    })
    set({ disposalItems: updated })
  },

  // Cập nhật lý do hủy chi tiết cho một mặt hàng
  updateItemReason: (productId, reason) => {
    const { disposalItems } = get()
    const updated = disposalItems.map((it) =>
      it.productId === productId ? { ...it, reason } : it
    )
    set({ disposalItems: updated })
  },

  // Xóa mặt hàng khỏi danh sách dự thảo
  removeDisposalItem: (productId) => {
    const { disposalItems } = get()
    set({ disposalItems: disposalItems.filter((it) => it.productId !== productId) })
  },

  // Áp dụng lý do chọn nhanh cho toàn bộ mặt hàng chưa sửa riêng
  applyQuickReason: (newReason) => {
    const { disposalItems, commonReason } = get()
    const updated = disposalItems.map((it) => ({
      ...it,
      reason: it.reason === commonReason || !it.reason ? newReason : it.reason,
    }))
    set({ commonReason: newReason, disposalItems: updated })
  },

  // Lấy danh sách phiếu xuất hủy kho từ API GET /api/disposal-receipt
  fetchDisposalReceipts: async (page = 1, pageSize = 10, filters = {}) => {
    set({ loading: true })
    try {
      const res = await getDisposalReceipts({
        page,
        limit: pageSize,
        ...filters,
      })
      const list = extractArray(res)
      const meta = extractMeta(res)

      set({
        receipts: list,
        pagination: {
          current: page,
          pageSize,
          total: meta.totalItems || list.length,
        },
      })
      return list
    } catch (err) {
      console.error('Lỗi khi tải danh sách phiếu hủy kho:', err)
      return []
    } finally {
      set({ loading: false })
    }
  },

  // Lấy chi tiết phiếu xuất hủy từ API GET /api/disposal-receipt/:id
  fetchDisposalDetail: async (id) => {
    set({ detailLoading: true, isDetailModalOpen: true })
    try {
      const res = await getDisposalReceiptById(id)
      const detail = extractObject(res, null)
      if (detail) {
        set({ selectedReceipt: detail })
      }
      return detail
    } catch (err) {
      console.error('Lỗi khi tải chi tiết phiếu hủy kho:', err)
      return null
    } finally {
      set({ detailLoading: false })
    }
  },

  // Tạo phiếu xuất hủy mới qua API POST /api/disposal-receipt
  createDisposalVoucher: async (formData = {}) => {
    const { disposalItems, commonReason } = get()
    if (!disposalItems || disposalItems.length === 0) {
      message.error('Vui lòng thêm ít nhất một sản phẩm vào danh sách xuất hủy!')
      return false
    }

    set({ submitting: true })
    try {
      const fallbackReason = formData.reason?.trim() || commonReason || 'Hàng hư hỏng / hết hạn sử dụng'

      const payload = {
        items: disposalItems.map((item) => ({
          productId: item.productId,
          disposedQuantity: item.destroyQuantity,
          disposalReason: item.reason?.trim() || fallbackReason,
        })),
      }

      const res = await createDisposalReceipt(payload)
      message.success(res?.data?.message || 'Đã tạo phiếu hủy kho và tự động trừ tồn kho thành công!')
      set({ isCreateModalOpen: false, disposalItems: [], selectedProductId: null })

      // Cập nhật lại tồn kho trong productStore để toàn ứng dụng nhận tồn kho mới nhất
      await useProductStore.getState().fetchProducts({ limit: 100 })
      await get().fetchDisposalReceipts(1, 10)
      return true
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo phiếu hủy kho!')
      return false
    } finally {
      set({ submitting: false })
    }
  },

  // Xuất Excel báo cáo phiếu xuất hủy
  exportDisposalExcel: async (params = {}) => {
    try {
      const response = await exportExcelReport({
        target: 'huy',
        ...params,
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      let downloadName = params.filename
      if (!downloadName) {
        if (params.receiptId) {
          downloadName = `Phieu_Xuat_Huy_${params.receiptId}.xlsx`
        } else {
          downloadName = `Bao_Cao_Xuat_Huy_${Date.now()}.xlsx`
        }
      }
      link.setAttribute('download', downloadName)
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
