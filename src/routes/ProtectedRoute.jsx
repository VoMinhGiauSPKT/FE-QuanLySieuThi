import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Result, Button } from 'antd'
import { useAuthStore } from '../stores/authStore'
import { getRoleDefaultPath, getRoleDisplayName } from '../utils/roleHelper'

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  // Nếu chưa đăng nhập, chuyển hướng sang trang Login và lưu lại đường dẫn đang định vào
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Nếu có quy định quyền và quyền của user không phù hợp
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user?.position)
    if (!hasRole) {
      const userHomePath = getRoleDefaultPath(user?.position)

      return (
        <div style={{ padding: '50px 20px', textAlign: 'center' }}>
          <Result
            status="403"
            title="403 - Không Có Quyền Truy Cập"
            subTitle={`Tài khoản của bạn (${user?.fullName} - ${getRoleDisplayName(user?.position)}) không được phép truy cập vào chức năng này.`}
            extra={
              <Button
                type="primary"
                onClick={() => navigate(userHomePath, { replace: true })}
              >
                Về Trang Làm Việc Của Bạn
              </Button>
            }
          />
        </div>
      )
    }
  }

  return children
}
