import { create } from 'zustand'
import { message } from 'antd'
import {
  getCategories,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService'
import { extractArray, extractObject, extractMeta, computePaginationTotal } from '../utils/apiHelper'

export const useCategoryStore = create((set, get) => ({
  categories: [],
  allCategories: [],
  selectedCategory: null,
  loading: false,
  detailLoading: false,
  pagination: { current: 1, pageSize: 8, total: 0 },
  keyword: '',

  // Lấy danh sách loại sản phẩm có phân trang & tìm kiếm từ Backend API
  fetchCategories: async (page = 1, pageSize = 8, keyword = '') => {
    set({ loading: true, keyword })
    try {
      const res = await getCategories({ page, limit: pageSize, keyword })
      const list = extractArray(res)
      const meta = extractMeta(res)
      const total = computePaginationTotal(meta, list.length, page, pageSize)
      set({
        categories: list,
        pagination: {
          current: page,
          pageSize,
          total,
        },
      })
      return list
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tải danh sách loại sản phẩm!')
      set({ categories: [] })
      return []
    } finally {
      set({ loading: false })
    }
  },

  // Lấy chi tiết loại sản phẩm theo ID từ Backend API
  fetchCategoryById: async (id) => {
    set({ detailLoading: true })
    try {
      const res = await getCategoryById(id)
      const detail = extractObject(res, null)
      set({ selectedCategory: detail })
      return detail
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tải chi tiết loại sản phẩm!')
      return null
    } finally {
      set({ detailLoading: false })
    }
  },

  // Lấy toàn bộ loại sản phẩm không phân trang từ Backend API (query ?all=true phục vụ Select dropdown)
  fetchAllCategories: async () => {
    try {
      const res = await getAllCategories()
      const list = extractArray(res)
      set({ allCategories: list })
      return list
    } catch (err) {
      console.error('Lỗi khi tải toàn bộ loại sản phẩm:', err)
      set({ allCategories: [] })
      return []
    }
  },

  // Tạo mới loại sản phẩm qua API Backend (POST /api/category)
  createCategory: async (data) => {
    try {
      const res = await createCategory(data)
      message.success(res?.data?.message || 'Tạo loại sản phẩm thành công!')
      const { pagination, keyword } = get()
      await get().fetchCategories(1, pagination.pageSize, keyword)
      await get().fetchAllCategories()
      return true
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tạo loại sản phẩm!')
      return false
    }
  },

  // Cập nhật loại sản phẩm qua API Backend (PUT /api/category/:id)
  updateCategory: async (id, data) => {
    try {
      const res = await updateCategory(id, data)
      message.success(res?.data?.message || 'Cập nhật loại sản phẩm thành công!')
      const { pagination, keyword } = get()
      await get().fetchCategories(pagination.current, pagination.pageSize, keyword)
      await get().fetchAllCategories()
      return true
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật loại sản phẩm!')
      return false
    }
  },

  // Xóa loại sản phẩm qua API Backend (DELETE /api/category/:id)
  deleteCategory: async (id) => {
    try {
      const res = await deleteCategory(id)
      message.success(res?.data?.message || 'Xóa loại sản phẩm thành công!')
      const { pagination, keyword } = get()
      await get().fetchCategories(pagination.current, pagination.pageSize, keyword)
      await get().fetchAllCategories()
      return true
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể xóa loại sản phẩm!')
      return false
    }
  },
}))
