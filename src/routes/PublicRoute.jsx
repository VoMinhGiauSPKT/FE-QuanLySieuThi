import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { getRoleDefaultPath } from '../utils/roleHelper'

export default function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  // Nếu đã đăng nhập: Chuyển hướng thẳng 1 bước đến trang làm việc theo chức vụ (không qua trung gian '/')
  if (isAuthenticated) {
    const targetPath = getRoleDefaultPath(user?.position)
    return <Navigate to={targetPath} replace />
  }

  return children
}
