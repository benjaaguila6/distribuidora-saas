import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '../shared/components/AppLayout'
import LoginPage from '../features/auth/components/LoginPage'
import RutaProtegida from '../features/auth/components/RutaProtegida'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <RutaProtegida />,
    children: [
      {
        index: true,
        element: <AppLayout />,
      },
    ],
  },
])
