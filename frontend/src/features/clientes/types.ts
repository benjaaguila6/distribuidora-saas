export type EstadoCliente = 'Activo' | 'Inactivo'

export interface ClienteResponse {
  id: string
  nombre: string
  direccion: string
  telefono: string | null
  latitud: number | null
  longitud: number | null
  observaciones: string | null
  saldoDeudaActual: number
  saldoEnvasesActual: number
  estado: EstadoCliente
  fechaCreacion: string
}

export interface CrearClienteInput {
  nombre: string
  direccion: string
  telefono?: string | null
  latitud?: number | null
  longitud?: number | null
  observaciones?: string | null
}

export interface DatosBasicosInput {
  nombre: string
  direccion: string
}

export interface ContactoInput {
  telefono?: string | null
  latitud?: number | null
  longitud?: number | null
  observaciones?: string | null
}

export interface ActualizarClienteVariables {
  id: string
  datosBasicos: DatosBasicosInput
  contacto: ContactoInput
}

export interface ListaPaginada<TItem> {
  total: number
  page: number
  pageSize: number
  items: TItem[]
}
