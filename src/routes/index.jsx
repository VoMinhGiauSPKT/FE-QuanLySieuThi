import { createBrowserRouter, Navigate } from 'react-router-dom'
import HomeContainer from '../modules/containers/home'
import LoginContainer from '../modules/containers/login'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeContainer />,
  },
  {
    path: '/login',
    element: <LoginContainer />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export default router
