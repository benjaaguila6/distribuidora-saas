import { createBrowserRouter } from 'react-router-dom'
import ClientesListPage from '../features/clientes/components/ClientesListPage'
import ProductosListPage from '../features/productos/components/ProductosListPage'
import LoginPage from '../features/auth/components/LoginPage'
import RutaProtegida from '../features/auth/components/RutaProtegida'
import AppLayout from '../shared/components/AppLayout'
import PaginaProximamente from '../shared/components/PaginaProximamente'

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
        element: <AppLayout />,
        children: [
          { index: true, element: <PaginaProximamente titulo="Inicio" /> },
          { path: 'clientes', element: <ClientesListPage /> },
          { path: 'productos', element: <ProductosListPage /> },
          { path: 'recorridos', element: <PaginaProximamente titulo="Recorridos" /> },
          { path: 'repartos', element: <PaginaProximamente titulo="Repartos" /> },
          { path: 'usuarios', element: <PaginaProximamente titulo="Usuarios" /> },
        ],
      },
    ],
  },
])
