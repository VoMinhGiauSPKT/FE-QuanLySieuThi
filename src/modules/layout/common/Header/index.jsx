import { Layout, Space, Avatar, Typography, Tag, Button } from 'antd'
import {
  ShopOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../../../stores/authStore'
import { getRoleTagColor, getRoleDisplayName } from '../../../../utils/roleHelper'
import { USER_ROLES } from '../../../../constants/roles'

const { Header: AntHeader } = Layout
const { Title, Text } = Typography

export default function Header({ user: propUser, onLogout, isLoggingOut }) {
  const storeUser = useAuthStore((state) => state.user)
  const user = propUser || storeUser
  const location = useLocation()

  return (
    <AntHeader
      style={{
        background: '#001529',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo & Tên siêu thị */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <ShopOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 600 }}>
            QUẢN LÝ SIÊU THỊ
          </Title>
        </Link>

        {/* Menu chuyển nhanh phân hệ cho Chủ Cửa Hàng (STORE_OWNER) */}
        {user?.position === USER_ROLES.STORE_OWNER && (
          <Space size="small">
            <Link to="/admin">
              <Button
                type={location.pathname === '/admin' ? 'primary' : 'text'}
                icon={<DashboardOutlined />}
                style={{ color: location.pathname === '/admin' ? '#fff' : '#rgba(255,255,255,0.75)' }}
                size="small"
              >
                Quản Trị
              </Button>
            </Link>
            <Link to="/cashier">
              <Button
                type={location.pathname === '/cashier' ? 'primary' : 'text'}
                icon={<ShoppingCartOutlined />}
                style={{ color: location.pathname === '/cashier' ? '#fff' : '#rgba(255,255,255,0.75)' }}
                size="small"
              >
                Thu Ngân (POS)
              </Button>
            </Link>
            <Link to="/inventory">
              <Button
                type={location.pathname === '/inventory' ? 'primary' : 'text'}
                icon={<InboxOutlined />}
                style={{ color: location.pathname === '/inventory' ? '#fff' : '#rgba(255,255,255,0.75)' }}
                size="small"
              >
                Quản Lý Kho
              </Button>
            </Link>
          </Space>
        )}
      </div>

      {/* Thông tin tài khoản & Đăng xuất */}
      <Space size="middle" align="center">
        <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
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
            {getRoleDisplayName(user?.position)}
          </Tag>
        </div>

        {onLogout && (
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
        )}
      </Space>
    </AntHeader>
  )
}
