import { create } from 'zustand'
import { message } from 'antd'
import {
  getFeedbacks,
  getFeedbackById,
  submitFeedback,
} from '../services/feedbackService'
import { extractObject } from '../utils/apiHelper'

export const useFeedbackStore = create((set, get) => ({
  feedbackData: { summary: {}, feedbacks: [] },
  loading: false,
  selectedRating: undefined,
  selectedFeedback: null,

  // Lấy danh sách đánh giá & thống kê tổng quan
  fetchFeedbacks: async (params = {}) => {
    set({ loading: true })
    try {
      const queryParams = typeof params === 'object' ? params : { rating: params }
      const res = await getFeedbacks(queryParams)
      const data = extractObject(res, { summary: {}, feedbacks: [] })
      set({ feedbackData: data })
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
    try {
      const res = await getFeedbackById(id)
      const detail = extractObject(res, null)
      set({ selectedFeedback: detail })
      return detail
    } catch (err) {
      console.error('Lỗi khi tải chi tiết phản hồi:', err)
      return null
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
