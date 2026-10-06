import { createBrowserRouter } from 'react-router-dom'
import LoginContainer from '../modules/containers/login'
import AdminContainer from '../modules/containers/admin'
import CashierContainer from '../modules/containers/cashier'
import InventoryContainer from '../modules/containers/inventory'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import RootRedirect from './RootRedirect'
import { USER_ROLES } from '../constants/roles'

const router = createBrowserRouter([
  // Route đăng nhập công khai (Public)
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginContainer />
      </PublicRoute>
    ),
  },

  // Route gốc '/' tự động chuyển hướng thẳng về trang làm việc của chức vụ
  {
    path: '/',
    element: <RootRedirect />,
  },

  // Phân hệ Quản trị / Chủ cửa hàng (Chỉ STORE_OWNER)
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={[USER_ROLES.STORE_OWNER]}>
        <AdminContainer />
      </ProtectedRoute>
    ),
  },

  // Phân hệ Quầy Thu Ngân (CASHIER và STORE_OWNER)
  {
    path: '/cashier',
    element: (
      <ProtectedRoute allowedRoles={[USER_ROLES.CASHIER, USER_ROLES.STORE_OWNER]}>
        <CashierContainer />
      </ProtectedRoute>
    ),
  },

  // Phân hệ Quản Lý Kho (INVENTORY_MANAGER và STORE_OWNER)
  {
    path: '/inventory',
    element: (
      <ProtectedRoute allowedRoles={[USER_ROLES.INVENTORY_MANAGER, USER_ROLES.STORE_OWNER]}>
        <InventoryContainer />
      </ProtectedRoute>
    ),
  },

  // Wildcard fallback: Người dùng gõ link lạ bất kỳ -> tự động điều hướng thông minh về trang chức vụ (nếu đã login) hoặc về /login (nếu chưa login)
  {
    path: '*',
    element: <RootRedirect />,
  },
])

export default router
