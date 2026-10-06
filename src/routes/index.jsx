import { createBrowserRouter, Navigate } from 'react-router-dom'
import HomeContainer from '../modules/containers/home'
import LoginContainer from '../modules/containers/login'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <HomeContainer />
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginContainer />
      </PublicRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export default router
