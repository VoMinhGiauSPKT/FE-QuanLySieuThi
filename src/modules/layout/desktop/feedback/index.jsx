import { Card, Form, Input, Button, Rate, Typography, Result, Space } from 'antd'
import {
  HeartFilled,
  MessageOutlined,
  UserOutlined,
  PhoneOutlined,
  ShopOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'

const { Title, Text } = Typography
const { TextArea } = Input

const desc = ['Rất không hài lòng', 'Chưa hài lòng', 'Bình thường', 'Hài lòng', 'Rất hài lòng & Tuyệt vời']

export default function FeedbackDesktop({
  form,
  onFinish,
  loading,
  isSubmitted,
  onReset,
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1890ff 0%, #001529 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 540,
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: 'none',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#e6f7ff',
              color: '#1890ff',
              fontSize: 28,
              marginBottom: 10,
            }}
          >
            <ShopOutlined />
          </div>
          <Title level={3} style={{ margin: 0, color: '#001529' }}>
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
              <Button type="primary" key="again" onClick={onReset} style={{ borderRadius: 8 }}>
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
            onFinish={onFinish}
            requiredMark="optional"
            initialValues={{ rating: 5 }}
          >
            <Form.Item
              name="rating"
              label={<Text strong>Mức độ hài lòng của bạn</Text>}
              rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá!' }]}
              style={{ textAlign: 'center', marginBottom: 20 }}
            >
              <div style={{ padding: '8px 0' }}>
                <Rate
                  tooltips={desc}
                  style={{ fontSize: 32, color: '#faad14' }}
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
                style={{
                  height: 48,
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 8,
                  backgroundColor: '#1890ff',
                }}
              >
                Gửi Đánh Giá Ngay
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Link to="/login" style={{ fontSize: 13, color: '#595959' }}>
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
