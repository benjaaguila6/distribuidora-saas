export type DiaSemana =
  | 'Lunes'
  | 'Martes'
  | 'Miercoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sabado'
  | 'Domingo'

export interface RecorridoCliente {
  clienteId: string
  nombre: string
  orden: number
}

export interface RecorridoEnLista {
  id: string
  nombre: string
  diaSemana: DiaSemana
  activo: boolean
}

export interface RecorridoDetalle {
  id: string
  nombre: string
  diaSemana: DiaSemana
  activo: boolean
  fechaCreacion: string
  clientes: RecorridoCliente[]
}

export interface CrearRecorridoInput {
  nombre: string
  diaSemana: DiaSemana
}

export interface ListaPaginada<TItem> {
  total: number
  page: number
  pageSize: number
  items: TItem[]
}

/**
 * El backend serializa `DiaSemana` como número (1=Lunes … 7=Domingo) al recibir
 * el body de creación (System.Text.Json no usa strings de enums por defecto).
 */
export const VALOR_DIA_SEMANA: Record<DiaSemana, number> = {
  Lunes: 1,
  Martes: 2,
  Miercoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sabado: 6,
  Domingo: 7,
}

export const DIAS_SEMANA_ORDEN: DiaSemana[] = [
  'Lunes',
  'Martes',
  'Miercoles',
  'Jueves',
  'Viernes',
  'Sabado',
  'Domingo',
]
