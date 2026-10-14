import { createBrowserRouter } from 'react-router-dom'
import LoginPage from '../modules/login/LoginPage'
import AdminPage from '../modules/admin/AdminPage'
import CashierPage from '../modules/cashier/CashierPage'
import InventoryPage from '../modules/inventory/InventoryPage'
import FeedbackPage from '../modules/feedback/FeedbackPage'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import RootRedirect from './RootRedirect'
import { USER_ROLES } from '../constants/roles'

const router = createBrowserRouter([
  // Route đánh giá dịch vụ công khai cho khách hàng
  {
    path: '/feedback',
    element: <FeedbackPage />,
  },

  // Route đăng nhập công khai (Public)
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },

  // Route gốc '/' tự động chuyển hướng thông minh về trang của chức vụ
  {
    path: '/',
    element: <RootRedirect />,
  },

  // Phân hệ Quản trị / Chủ cửa hàng (Chỉ STORE_OWNER)
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={[USER_ROLES.STORE_OWNER]}>
        <AdminPage />
      </ProtectedRoute>
    ),
  },

  // Phân hệ Quầy Thu Ngân (CASHIER và STORE_OWNER)
  {
    path: '/cashier',
    element: (
      <ProtectedRoute allowedRoles={[USER_ROLES.CASHIER, USER_ROLES.STORE_OWNER]}>
        <CashierPage />
      </ProtectedRoute>
    ),
  },

  // Phân hệ Quản Lý Kho (INVENTORY_MANAGER và STORE_OWNER)
  {
    path: '/inventory',
    element: (
      <ProtectedRoute allowedRoles={[USER_ROLES.INVENTORY_MANAGER, USER_ROLES.STORE_OWNER]}>
        <InventoryPage />
      </ProtectedRoute>
    ),
  },

  // Wildcard fallback
  {
    path: '*',
    element: <RootRedirect />,
  },
])

export default router
