import { Navigate, useLocation } from 'react-router-dom'
import { Result, Button } from 'antd'
import { useAuthStore } from '../stores/authStore'

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  // Nếu chưa đăng nhập, chuyển hướng sang trang Login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Nếu có quy định quyền và quyền của user không phù hợp
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user?.position)
    if (!hasRole) {
      return (
        <div style={{ padding: '50px 20px', textAlign: 'center' }}>
          <Result
            status="403"
            title="403 - Không Có Quyền Truy Cập"
            subTitle={`Tài khoản của bạn (${user?.fullName} - ${user?.position || 'Chưa phân quyền'}) không được phép truy cập vào chức năng này.`}
            extra={
              <Button type="primary" onClick={() => window.location.href = '/'}>
                Quay Về Trang Chủ
              </Button>
            }
          />
        </div>
      )
    }
  }

  return children
}
