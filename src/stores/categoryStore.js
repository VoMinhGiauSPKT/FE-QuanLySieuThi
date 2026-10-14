import { create } from 'zustand'
import { message } from 'antd'
import {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService'
import { extractArray } from '../utils/apiHelper'
import { DEFAULT_CATEGORIES } from '../constants/categories'

export const useCategoryStore = create((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  allCategories: DEFAULT_CATEGORIES,
  loading: false,
  pagination: { current: 1, pageSize: 8, total: DEFAULT_CATEGORIES.length },
  keyword: '',

  // Lấy danh sách loại sản phẩm có phân trang & tìm kiếm
  fetchCategories: async (page = 1, pageSize = 8, keyword = '') => {
    set({ loading: true, keyword })
    try {
      const res = await getCategories({ page, limit: pageSize, keyword })
      const list = extractArray(res)
      const meta = res?.data?.meta || res?.data?.data?.meta || {}
      const finalList = list && list.length > 0 ? list : DEFAULT_CATEGORIES
      set({
        categories: finalList,
        pagination: {
          current: page,
          pageSize,
          total: meta.total ?? finalList.length,
        },
      })
      return finalList
    } catch (err) {
      console.warn('Lỗi tải loại sản phẩm (dùng danh mục mặc định):', err?.message)
      set({ categories: DEFAULT_CATEGORIES })
      return DEFAULT_CATEGORIES
    } finally {
      set({ loading: false })
    }
  },

  // Lấy toàn bộ loại sản phẩm không phân trang (dùng cho dropdown Select)
  fetchAllCategories: async () => {
    try {
      const res = await getAllCategories()
      const list = extractArray(res)
      const finalList = list && list.length > 0 ? list : DEFAULT_CATEGORIES
      set({ allCategories: finalList })
      return finalList
    } catch (err) {
      console.warn('Lỗi tải toàn bộ danh mục (dùng danh mục mặc định):', err?.message)
      set({ allCategories: DEFAULT_CATEGORIES })
      return DEFAULT_CATEGORIES
    }
  },

  // Tạo mới loại sản phẩm
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

  // Cập nhật loại sản phẩm
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

  // Xóa loại sản phẩm
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
