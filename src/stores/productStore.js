import { create } from 'zustand'
import { message } from 'antd'
import {
  getProducts,
  updateProduct,
  getLowStockAlerts,
} from '../services/productService'
import { extractArray } from '../utils/apiHelper'

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  pagination: { current: 1, pageSize: 8, total: 0 },
  filters: {},

  // Cảnh báo hết hàng
  lowStockItems: [],
  lowStockCount: 0,
  loadingLowStock: false,
  threshold: 10,

  // Lấy danh sách sản phẩm
  fetchProducts: async (page = 1, pageSize = 8, filters = {}) => {
    set({ loading: true, filters })
    try {
      const res = await getProducts({
        page,
        limit: pageSize,
        ...filters,
      })
      const list = extractArray(res)
      const meta = res?.data?.meta || res?.data?.data?.meta || {}
      set({
        products: list,
        pagination: {
          current: page,
          pageSize,
          total: meta.total ?? list.length,
        },
      })
      return list
    } catch (err) {
      message.error(err?.message || 'Không thể tải danh sách sản phẩm!')
      return []
    } finally {
      set({ loading: false })
    }
  },

  // Cập nhật thông tin sản phẩm (giá, tên, trạng thái)
  updateProduct: async (id, data) => {
    try {
      const res = await updateProduct(id, data)
      message.success(res?.data?.message || 'Cập nhật sản phẩm thành công!')
      const { pagination, filters } = get()
      await get().fetchProducts(pagination.current, pagination.pageSize, filters)
      return true
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật sản phẩm!')
      return false
    }
  },

  // Lấy danh sách cảnh báo tồn kho thấp
  fetchLowStockAlerts: async (threshold = 10) => {
    set({ loadingLowStock: true, threshold })
    try {
      const res = await getLowStockAlerts({ threshold })
      const list = extractArray(res)
      set({
        lowStockItems: list,
        lowStockCount: list.length,
      })
      return list
    } catch (err) {
      console.error('Lỗi khi tải cảnh báo hết hàng:', err)
      return []
    } finally {
      set({ loadingLowStock: false })
    }
  },

  setThreshold: (threshold) => {
    set({ threshold })
  },
}))
