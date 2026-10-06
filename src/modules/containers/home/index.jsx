import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, message } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import HomeDesktop from '../../layout/desktop/home'
import { useAuthStore } from '../../../stores/authStore'
import { logoutApi } from '../../../services/authService'

export default function HomeContainer() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    Modal.confirm({
      title: 'Xác nhận đăng xuất',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản lý siêu thị?',
      okText: 'Đăng Xuất',
      okType: 'danger',
      cancelText: 'Hủy bỏ',
      onOk: async () => {
        setIsLoggingOut(true)
        try {
          await logoutApi()
        } catch (error) {
          console.warn('Lỗi khi gọi API đăng xuất backend:', error)
        } finally {
          // Xóa thông tin đăng nhập trong Zustand store & localStorage
          logout()
          message.success('Đăng xuất thành công!')
          navigate('/login', { replace: true })
          setIsLoggingOut(false)
        }
      },
    })
  }

  return (
    <HomeDesktop
      user={user}
      onLogout={handleLogout}
      isLoggingOut={isLoggingOut}
    />
  )
}
