import { useState } from 'react'
import { Form, message } from 'antd'
import FeedbackDesktop from '../../layout/desktop/feedback'
import { submitFeedback } from '../../../services/feedbackService'

export default function FeedbackContainer() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleFinish = async (values) => {
    setLoading(true)
    try {
      const response = await submitFeedback(values)
      if (response.status === 201 || response.status === 200) {
        message.success(response.message || 'Cảm ơn bạn đã gửi đánh giá!')
        setIsSubmitted(true)
        form.resetFields()
      } else {
        message.error(response.message || 'Không thể gửi đánh giá, vui lòng thử lại!')
      }
    } catch (error) {
      if (error?.status === 429) {
        message.warning('Bạn đã gửi quá nhiều yêu cầu, vui lòng đợi ít phút rồi thử lại!')
      } else {
        message.error(error?.message || 'Có lỗi xảy ra khi gửi đánh giá!')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setIsSubmitted(false)
    form.resetFields()
  }

  return (
    <FeedbackDesktop
      form={form}
      onFinish={handleFinish}
      loading={loading}
      isSubmitted={isSubmitted}
      onReset={handleReset}
    />
  )
}
