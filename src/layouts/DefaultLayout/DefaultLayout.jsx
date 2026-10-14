import { useState } from 'react'
import { Layout, Modal, message } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Outlet, useNavigate } from 'react-router-dom'
import Header from '../Header/Header'
import { useAuthStore } from '../../stores/authStore'
import { logoutApi } from '../../services/authService'
import './DefaultLayout.scss'

const { Content, Footer } = Layout

export default function DefaultLayout({
  children,
  user: propUser,
  onLogout: propOnLogout,
  isLoggingOut: propIsLoggingOut,
}) {
  const storeUser = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const [internalLoggingOut, setInternalLoggingOut] = useState(false)

  const user = propUser || storeUser
  const isLoggingOut = propIsLoggingOut !== undefined ? propIsLoggingOut : internalLoggingOut

  const defaultLogout = () => {
    Modal.confirm({
      title: 'Xác nhận đăng xuất',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản lý siêu thị?',
      okText: 'Đăng Xuất',
      okType: 'danger',
      cancelText: 'Hủy bỏ',
      onOk: async () => {
        setInternalLoggingOut(true)
        try {
          await logoutApi()
        } catch (error) {
          console.warn('Lỗi khi gọi API đăng xuất backend:', error)
        } finally {
          logout()
          message.success('Đăng xuất thành công!')
          navigate('/login', { replace: true })
          setInternalLoggingOut(false)
        }
      },
    })
  }

  const handleLogout = propOnLogout || defaultLogout

  return (
    <Layout className="default-layout">
      <Header user={user} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
      <Content className="default-layout__content">
        {children || <Outlet />}
      </Content>
      <Footer className="default-layout__footer">
        Hệ Thống Quản Lý Siêu Thị • Phân Hệ Quản Trị © 2026
      </Footer>
    </Layout>
  )
}
