import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // Nếu đã đăng nhập rồi thì không cho vào lại trang login, tự động chuyển về trang chủ
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}
