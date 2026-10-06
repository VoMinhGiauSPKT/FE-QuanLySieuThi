import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { getRoleDefaultPath } from '../utils/roleHelper'

/**
 * Component tự động điều phối khi vào đường dẫn gốc '/' hoặc đường dẫn không xác định '*'
 * - Chưa đăng nhập -> về '/login'
 * - Đã đăng nhập -> chuyển thẳng về trang phân hệ làm việc theo chức vụ (/admin, /cashier, /inventory)
 */
export default function RootRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const targetPath = getRoleDefaultPath(user?.position)
  return <Navigate to={targetPath} replace />
}
