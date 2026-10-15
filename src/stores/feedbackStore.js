import { create } from 'zustand'
import { message } from 'antd'
import {
  getFeedbacks,
  getFeedbackById,
  submitFeedback,
} from '../services/feedbackService'
import { extractObject, extractMeta, computePaginationTotal } from '../utils/apiHelper'

export const useFeedbackStore = create((set, get) => ({
  feedbackData: { summary: {}, feedbacks: [] },
  loading: false,
  detailLoading: false,
  selectedRating: undefined,
  selectedFeedback: null,
  pagination: { current: 1, pageSize: 8, total: 0 },

  // Lấy danh sách đánh giá & thống kê tổng quan
  fetchFeedbacks: async (params = {}) => {
    set({ loading: true })
    try {
      const queryParams = typeof params === 'object' ? params : { rating: params }
      const page = queryParams.page || 1
      const pageSize = queryParams.limit || queryParams.pageSize || 8
      const res = await getFeedbacks({ ...queryParams, page, limit: pageSize })
      const data = extractObject(res, { summary: {}, feedbacks: [] })
      const meta = extractMeta(res)
      const list = Array.isArray(data.feedbacks) ? data.feedbacks : []
      const total = computePaginationTotal(meta, list.length, page, pageSize, data.summary?.totalFeedbacks)

      set({
        feedbackData: data,
        pagination: {
          current: page,
          pageSize,
          total,
        },
      })
      return data
    } catch (err) {
      console.error('Lỗi khi tải danh sách đánh giá:', err)
      return { summary: {}, feedbacks: [] }
    } finally {
      set({ loading: false })
    }
  },

  // Chi tiết đánh giá
  fetchFeedbackById: async (id) => {
    set({ detailLoading: true })
    try {
      const res = await getFeedbackById(id)
      const detail = extractObject(res, null)
      set({ selectedFeedback: detail })
      return detail
    } catch (err) {
      console.error('Lỗi khi tải chi tiết phản hồi:', err)
      return null
    } finally {
      set({ detailLoading: false })
    }
  },

  // Gửi đánh giá phản hồi (Public)
  submitFeedback: async (data) => {
    try {
      const res = await submitFeedback(data)
      message.success(res?.data?.message || 'Cảm ơn bạn đã gửi đánh giá!')
      return true
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Không thể gửi đánh giá!')
      return false
    }
  },

  setSelectedRating: (rating) => {
    set({ selectedRating: rating })
  },
}))
