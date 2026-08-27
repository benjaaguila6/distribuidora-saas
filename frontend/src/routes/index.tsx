import { createBrowserRouter } from 'react-router-dom'
import ClientesListPage from '../features/clientes/components/ClientesListPage'
import ProductosListPage from '../features/productos/components/ProductosListPage'
import RepartoDetallePage from '../features/repartos/components/RepartoDetallePage'
import RepartosListPage from '../features/repartos/components/RepartosListPage'
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
          { path: 'repartos', element: <RepartosListPage /> },
          { path: 'repartos/:id', element: <RepartoDetallePage /> },
          { path: 'usuarios', element: <PaginaProximamente titulo="Usuarios" /> },
        ],
      },
    ],
  },
])
