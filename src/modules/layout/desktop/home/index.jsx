import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  Avatar,
  Statistic,
  Space,
  Descriptions,
} from 'antd'
import {
  LogoutOutlined,
  UserOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  BarChartOutlined,
} from '@ant-design/icons'

const { Header, Content } = Layout
const { Title, Text } = Typography

export default function HomeDesktop({ user, onLogout, isLoggingOut }) {
  const getRoleTagColor = (role) => {
    switch (role) {
      case 'STORE_OWNER':
        return 'red'
      case 'CASHIER':
        return 'green'
      case 'INVENTORY_MANAGER':
        return 'blue'
      case 'WAREHOUSE':
        return 'gold'
      default:
        return 'cyan'
    }
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Header thanh điều hướng trên cùng */}
      <Header
        style={{
          background: '#001529',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShopOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 600 }}>
            HỆ THỐNG QUẢN LÝ SIÊU THỊ
          </Title>
        </div>

        <Space size="middle" align="center">
          <Avatar
            style={{ backgroundColor: '#1890ff' }}
            icon={<UserOutlined />}
          />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <Text style={{ color: '#fff', fontWeight: 500 }}>
              {user?.fullName || 'Nhân viên'}
            </Text>
            <Tag
              color={getRoleTagColor(user?.position)}
              style={{
                marginTop: 2,
                fontSize: 11,
                padding: '0 6px',
                borderRadius: 4,
              }}
            >
              {user?.position || 'NHÂN VIÊN'}
            </Tag>
          </div>

          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={onLogout}
            loading={isLoggingOut}
            style={{ borderRadius: 6 }}
          >
            Đăng Xuất
          </Button>
        </Space>
      </Header>

      {/* Nội dung chính của trang chủ */}
      <Content style={{ padding: '24px 32px' }}>
        {/* Banner Chào Mừng */}
        <Card
          style={{
            marginBottom: 24,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            border: 'none',
            color: '#fff',
          }}
        >
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={2} style={{ color: '#fff', margin: '0 0 8px 0' }}>
                Xin chào, {user?.fullName || 'Quý nhân viên'}! 👋
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 16 }}>
                Chào mừng bạn đã đăng nhập vào hệ thống quản lý siêu thị. Chúc bạn một ngày làm việc hiệu quả!
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Thông tin tài khoản nhân viên hiện tại */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={10}>
            <Card
              title="Thông Tin Tài Khoản Đang Đăng Nhập"
              style={{ borderRadius: 12, height: '100%' }}
            >
              <Descriptions column={1} bordered size="middle">
                <Descriptions.Item label="Mã nhân viên (ID)">
                  <Text strong>{user?.employeeId || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tên tài khoản (Username)">
                  <Text code>{user?.username || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Họ và tên">
                  {user?.fullName || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Chức vụ">
                  <Tag color={getRoleTagColor(user?.position)} style={{ fontSize: 13, padding: '2px 8px' }}>
                    {user?.position || 'N/A'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Các chỉ số tổng quan & Module nghiệp vụ */}
          <Col xs={24} lg={14}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card style={{ borderRadius: 12 }}>
                  <Statistic
                    title="Bán hàng / Thu ngân"
                    value={user?.position === 'CASHIER' ? 'Sẵn sàng' : 'Hoạt động'}
                    prefix={<ShoppingCartOutlined style={{ color: '#52c41a' }} />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ borderRadius: 12 }}>
                  <Statistic
                    title="Mặt hàng quản lý"
                    value={1250}
                    suffix="Sản phẩm"
                    prefix={<AppstoreOutlined style={{ color: '#1890ff' }} />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ borderRadius: 12 }}>
                  <Statistic
                    title="Kho hàng"
                    value={98}
                    suffix="Lô hàng"
                    prefix={<DatabaseOutlined style={{ color: '#faad14' }} />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ borderRadius: 12 }}>
                  <Statistic
                    title="Báo cáo & Thống kê"
                    value="Chi tiết"
                    prefix={<BarChartOutlined style={{ color: '#722ed1' }} />}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}
