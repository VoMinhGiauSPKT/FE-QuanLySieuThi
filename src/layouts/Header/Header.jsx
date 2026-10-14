import { Layout, Space, Avatar, Typography, Tag, Button, Flex } from 'antd'
import {
  ShopOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { getRoleTagColor, getRoleDisplayName } from '../../utils/roleHelper'
import { USER_ROLES } from '../../constants/roles'
import './Header.scss'

const { Header: AntHeader } = Layout
const { Title, Text } = Typography

export default function Header({ user: propUser, onLogout, isLoggingOut }) {
  const storeUser = useAuthStore((state) => state.user)
  const user = propUser || storeUser
  const location = useLocation()

  return (
    <AntHeader className="app-header">
      <Flex align="center" justify="space-between" style={{ height: '100%' }}>
        {/* Logo & Siêu thị */}
        <Flex align="center" gap={24} className="app-header__left">
          <Link to="/" className="app-header__brand">
            <ShopOutlined className="brand-icon" />
            <Title level={4} className="brand-title">
              QUẢN LÝ SIÊU THỊ
            </Title>
          </Link>

          {/* Quick Menu cho STORE_OWNER */}
          {user?.position === USER_ROLES.STORE_OWNER && (
            <Space size="small">
              <Link to="/admin">
                <Button
                  type={location.pathname === '/admin' ? 'primary' : 'text'}
                  icon={<DashboardOutlined />}
                  className={`app-header__nav-btn ${location.pathname === '/admin' ? 'app-header__nav-btn--active' : ''}`}
                  size="middle"
                >
                  Quản Trị
                </Button>
              </Link>
              <Link to="/cashier">
                <Button
                  type={location.pathname === '/cashier' ? 'primary' : 'text'}
                  icon={<ShoppingCartOutlined />}
                  className={`app-header__nav-btn ${location.pathname === '/cashier' ? 'app-header__nav-btn--active' : ''}`}
                  size="middle"
                >
                  Thu Ngân (POS)
                </Button>
              </Link>
              <Link to="/inventory">
                <Button
                  type={location.pathname === '/inventory' ? 'primary' : 'text'}
                  icon={<InboxOutlined />}
                  className={`app-header__nav-btn ${location.pathname === '/inventory' ? 'app-header__nav-btn--active' : ''}`}
                  size="middle"
                >
                  Quản Lý Kho
                </Button>
              </Link>
            </Space>
          )}
        </Flex>

        {/* Thông tin tài khoản & Đăng xuất */}
        <Space size="middle" align="center">
          <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
          <div className="app-header__user-info">
            <Text className="user-name">
              {user?.fullName || 'Nhân viên'}
            </Text>
            <Tag color={getRoleTagColor(user?.position)} className="user-role-tag">
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
              className="app-header__logout-btn"
            >
              Đăng Xuất
            </Button>
          )}
        </Space>
      </Flex>
    </AntHeader>
  )
}
