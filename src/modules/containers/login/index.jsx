import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { message } from 'antd'
import LoginDesktop from '../../layout/desktop/login'
import { loginApi } from '../../../services/authService'
import { useAuthStore } from '../../../stores/authStore'

export default function LoginContainer() {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const location = useLocation()

  const redirectPath = location.state?.from?.pathname || '/'

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
    <LoginDesktop
      onFinish={handleFinish}
      isLoading={loading}
      errorMsg={errorMsg}
    />
  )
}
