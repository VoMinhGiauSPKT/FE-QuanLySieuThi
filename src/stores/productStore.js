import { create } from 'zustand'
import { message } from 'antd'
import {
  getProducts,
  getProductById,
  updateProduct,
  getLowStockAlerts,
} from '../services/productService'
import { extractArray, extractObject, extractMeta } from '../utils/apiHelper'

export const useProductStore = create((set, get) => ({
  products: [],
  selectedProduct: null,
  loading: false,
  detailLoading: false,
  pagination: { current: 1, pageSize: 8, total: 0 },
  filters: {},

  // Cảnh báo hết hàng
  lowStockItems: [],
  lowStockCount: 0,
  loadingLowStock: false,
  threshold: 10,

  // Lấy danh sách sản phẩm (hỗ trợ cả fetchProducts(page, pageSize, filters) và fetchProducts({ page, limit, ... }))
  fetchProducts: async (arg1 = 1, arg2 = 8, arg3 = {}) => {
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

    set({ loading: true, filters })
    try {
      const res = await getProducts({
        page,
        limit: pageSize,
        ...filters,
      })
      const list = extractArray(res)
      const meta = extractMeta(res)
      set({
        products: list,
        pagination: {
          current: page,
          pageSize,
          total: meta.totalItems || list.length,
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

  // Lấy chi tiết sản phẩm theo ID
  fetchProductById: async (id) => {
    set({ detailLoading: true })
    try {
      const res = await getProductById(id)
      const detail = extractObject(res, null)
      set({ selectedProduct: detail })
      return detail
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tải chi tiết sản phẩm!')
      return null
    } finally {
      set({ detailLoading: false })
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
