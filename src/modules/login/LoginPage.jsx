import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd'
import { UserOutlined, LockOutlined, ShopOutlined, StarFilled } from '@ant-design/icons'
import { loginApi } from '../../services/authService'
import { useAuthStore } from '../../stores/authStore'
import { getRoleDefaultPath } from '../../utils/roleHelper'
import './LoginPage.scss'

const { Title, Text } = Typography

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const location = useLocation()

  const handleFinish = async (values) => {
    setLoading(true)
    setErrorMsg('')

    try {
      const response = await loginApi(values)
      const resData = response.data

      if (resData?.status === 200 && resData?.data?.accessToken && resData?.data?.employee) {
        const { accessToken, employee } = resData.data

        // Lưu thông tin vào Zustand store & localStorage
        login({ accessToken, employee })

        message.success(resData?.message || 'Đăng nhập thành công!')

        // Điều hướng theo quyền
        const roleDefaultPath = getRoleDefaultPath(employee.position)
        const redirectPath = location.state?.from?.pathname || roleDefaultPath

        navigate(redirectPath, { replace: true })
      } else {
        const failMessage = resData?.message || 'Đăng nhập thất bại, vui lòng kiểm tra lại!'
        setErrorMsg(failMessage)
        message.error(failMessage)
      }
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        'Tên đăng nhập hoặc mật khẩu không chính xác, vui lòng thử lại!'
      setErrorMsg(serverMessage)
      message.error(serverMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <Card className="login-page__card">
        <div className="login-page__brand">
          <div className="brand-avatar">
            <ShopOutlined />
          </div>
          <Title level={3} className="brand-title">
            QUẢN LÝ SIÊU THỊ
          </Title>
          <Text type="secondary" className="brand-subtitle">
            Đăng nhập hệ thống quản lý & bán hàng
          </Text>
        </div>

        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            closable
            className="login-page__error-alert"
          />
        )}

        <Form
          name="login_form"
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
              { min: 3, message: 'Tên đăng nhập tối thiểu 3 ký tự!' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.35)' }} />}
              placeholder="Tên đăng nhập"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 4, message: 'Mật khẩu tối thiểu 4 ký tự!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.35)' }} />}
              placeholder="Mật khẩu"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="login-page__submit-btn"
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>

        <div className="login-page__footer">
          <Link to="/feedback" className="feedback-link">
            <StarFilled style={{ color: '#faad14', marginRight: 6 }} />
            Khách hàng đánh giá chất lượng dịch vụ tại đây
          </Link>
          <div>
            <Text type="secondary" className="version-text">
              Phần mềm Quản Lý Siêu Thị • Phiên bản 1.0.0
            </Text>
          </div>
        </div>
      </Card>
    </div>
  )
}
