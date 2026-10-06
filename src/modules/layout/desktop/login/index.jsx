import { Form, Input, Button, Card, Typography, Alert } from 'antd'
import { UserOutlined, LockOutlined, ShopOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function LoginDesktop({ onFinish, isLoading, errorMsg }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1890ff 0%, #001529 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 16,
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
          border: 'none',
          padding: '12px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#e6f7ff',
              color: '#1890ff',
              fontSize: 32,
              marginBottom: 12,
            }}
          >
            <ShopOutlined />
          </div>
          <Title level={3} style={{ margin: 0, color: '#001529' }}>
            QUẢN LÝ SIÊU THỊ
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Đăng nhập hệ thống quản lý & bán hàng
          </Text>
        </div>

        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            closable
            style={{ marginBottom: 20, borderRadius: 8 }}
          />
        )}

        <Form
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
              style={{
                height: 46,
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 8,
                backgroundColor: '#1890ff',
              }}
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Phần mềm Công Nghệ Phần Mềm • Phiên bản 1.0.0
          </Text>
        </div>
      </Card>
    </div>
  )
}
