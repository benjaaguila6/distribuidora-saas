import { createBrowserRouter } from 'react-router-dom'
import RutaPorRol from '../features/auth/components/RutaPorRol'
import RutaProtegida from '../features/auth/components/RutaProtegida'
import ClientesListPage from '../features/clientes/components/ClientesListPage'
import ProductosListPage from '../features/productos/components/ProductosListPage'
import RecorridoDetallePage from '../features/recorridos/components/RecorridoDetallePage'
import RecorridosListPage from '../features/recorridos/components/RecorridosListPage'
import RepartoDetallePage from '../features/repartos/components/RepartoDetallePage'
import RepartosListPage from '../features/repartos/components/RepartosListPage'
import LoginPage from '../features/auth/components/LoginPage'
import AppLayout from '../shared/components/AppLayout'
import PaginaProximamente from '../shared/components/PaginaProximamente'

const ROL_ADMINISTRADOR = 'Administrador'
const ROL_GERENTE = 'Gerente'

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
              {
                element: <RutaPorRol rolesPermitidos={[ROL_ADMINISTRADOR, ROL_GERENTE]} />,
                children: [
                  { index: true, element: <PaginaProximamente titulo="Inicio" /> },
                  { path: 'clientes', element: <ClientesListPage /> },
                  { path: 'productos', element: <ProductosListPage /> },
                  { path: 'recorridos', element: <RecorridosListPage /> },
                  { path: 'recorridos/:id', element: <RecorridoDetallePage /> },
                  { path: 'usuarios', element: <PaginaProximamente titulo="Usuarios" /> },
                ],
              },
              { path: 'repartos', element: <RepartosListPage /> },
              { path: 'repartos/:id', element: <RepartoDetallePage /> },
            ],
          },
        ],
  },
])
