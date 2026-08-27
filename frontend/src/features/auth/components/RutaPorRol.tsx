import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface RutaPorRolProps {
  rolesPermitidos: string[]
}

export default function RutaPorRol({ rolesPermitidos }: RutaPorRolProps) {
  const { usuario } = useAuth()

  if (usuario !== null && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/repartos" replace />
  }

  return <Outlet />
}