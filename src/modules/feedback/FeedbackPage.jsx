import { useState } from 'react'
import { Card, Form, Input, Button, Rate, Typography, Result, Space, message } from 'antd'
import {
  HeartFilled,
  MessageOutlined,
  UserOutlined,
  PhoneOutlined,
  ShopOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { submitFeedback } from '../../services/feedbackService'
import './FeedbackPage.scss'

const { Title, Text } = Typography
const { TextArea } = Input

const desc = ['Rất không hài lòng', 'Chưa hài lòng', 'Bình thường', 'Hài lòng', 'Rất hài lòng & Tuyệt vời']

export default function FeedbackPage() {
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
    <div className="feedback-page">
      <Card className="feedback-page__card">
        <div className="feedback-page__header">
          <div className="brand-icon-box">
            <ShopOutlined />
          </div>
          <Title level={3} className="brand-title">
            ĐÁNH GIÁ CHẤT LƯỢNG DỊCH VỤ
          </Title>
          <Text type="secondary">
            Ý kiến đóng góp của bạn là động lực giúp siêu thị hoàn thiện mỗi ngày!
          </Text>
        </div>

        {isSubmitted ? (
          <Result
            status="success"
            title="Gửi Đánh Giá Thành Công!"
            subTitle="Cảm ơn bạn đã dành thời gian quý báu chia sẻ cảm nhận với chúng tôi. Ban quản lý siêu thị sẽ luôn nỗ lực nâng cao trải nghiệm mua sắm của bạn!"
            extra={[
              <Button type="primary" key="again" onClick={handleReset} style={{ borderRadius: 8 }}>
                Gửi Đánh Giá Khác
              </Button>,
              <Link to="/login" key="login">
                <Button key="back" style={{ borderRadius: 8 }}>
                  Trang Đăng Nhập Nội Bộ
                </Button>
              </Link>,
            ]}
          />
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            requiredMark="optional"
            initialValues={{ rating: 5 }}
          >
            <Form.Item
              name="rating"
              label={<Text strong>Mức độ hài lòng của bạn</Text>}
              rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá!' }]}
              style={{ textAlign: 'center', marginBottom: 20 }}
            >
              <div className="feedback-page__rate-box">
                <Rate
                  tooltips={desc}
                  character={<HeartFilled />}
                />
              </div>
            </Form.Item>

            <Form.Item
              name="customerName"
              label="Họ và tên của bạn"
              rules={[
                { required: true, message: 'Vui lòng nhập họ và tên!' },
                { min: 2, message: 'Tên tối thiểu 2 ký tự!' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.35)' }} />}
                placeholder="Ví dụ: Nguyễn Văn A"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label="Số điện thoại (tùy chọn)"
              rules={[
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: 'Số điện thoại phải từ 10-11 chữ số hợp lệ!',
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: 'rgba(0,0,0,.35)' }} />}
                placeholder="Ví dụ: 0909123456"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="comment"
              label="Nội dung đánh giá & góp ý"
              rules={[
                { required: true, message: 'Vui lòng nhập nội dung đánh giá!' },
                { min: 5, message: 'Nội dung tối thiểu 5 ký tự!' },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Chia sẻ trải nghiệm của bạn về thái độ phục vụ, chất lượng hàng hóa, tốc độ thanh toán..."
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                icon={<MessageOutlined />}
                className="feedback-page__submit-btn"
              >
                Gửi Đánh Giá Ngay
              </Button>
            </Form.Item>

            <div className="feedback-page__login-link">
              <Link to="/login">
                <Space>
                  <ArrowLeftOutlined />
                  <span>Dành cho nhân viên: Đăng nhập hệ thống nội bộ</span>
                </Space>
              </Link>
            </div>
          </Form>
        )}
      </Card>
    </div>
  )
}
