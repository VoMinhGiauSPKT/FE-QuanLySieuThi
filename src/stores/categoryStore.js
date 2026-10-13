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

export const useCategoryStore = create((set, get) => ({
  categories: [],
  allCategories: [],
  loading: false,
  pagination: { current: 1, pageSize: 8, total: 0 },
  keyword: '',

  // Lấy danh sách loại sản phẩm có phân trang & tìm kiếm
  fetchCategories: async (page = 1, pageSize = 8, keyword = '') => {
    set({ loading: true, keyword })
    try {
      const res = await getCategories({ page, limit: pageSize, keyword })
      const list = extractArray(res)
      const meta = res?.data?.meta || res?.data?.data?.meta || {}
      set({
        categories: list,
        pagination: {
          current: page,
          pageSize,
          total: meta.total ?? list.length,
        },
      })
      return list
    } catch (err) {
      message.error(err?.message || 'Không thể tải danh sách loại sản phẩm!')
      return []
    } finally {
      set({ loading: false })
    }
  },

  // Lấy toàn bộ loại sản phẩm không phân trang (dùng cho dropdown Select)
  fetchAllCategories: async () => {
    try {
      const res = await getAllCategories()
      const list = extractArray(res)
      set({ allCategories: list })
      return list
    } catch (err) {
      console.error('Lỗi khi tải toàn bộ danh mục:', err)
      return []
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
