import type {Localidad} from '../types'
import type { TipoLicencia } from '../types'
import type { Circuito } from '../types'

export type Race = {
  id: number
  time: string
  name: string
  circuit: string
  drivers: number
  status: 'En curso' | 'Próxima' | 'Finalizada'
}

export type Kart = {
  id: number
  model: string
  category: string
  status: 'Disponible' | 'Mantenimiento'
}

export const races: Race[] = [
  { id: 1, time: '10:00', name: 'Torneo Primavera', circuit: 'Circuito 01', drivers: 8, status: 'En curso' },
  { id: 2, time: '11:00', name: 'Torneo Primavera', circuit: 'Circuito 02', drivers: 10, status: 'Próxima' },
  { id: 3, time: '12:30', name: 'Copa Rosario', circuit: 'Circuito 04', drivers: 12, status: 'Próxima' },
  { id: 4, time: '14:00', name: 'Gran Premio Santa Fe', circuit: 'Circuito 05', drivers: 15, status: 'Finalizada' },
]

export const karts: Kart[] = [
  { id: 1, model: 'K01', category: 'Junior', status: 'Disponible' },
  { id: 2, model: 'K02', category: 'Junior', status: 'Disponible' },
  { id: 3, model: 'K03', category: 'Junior', status: 'Mantenimiento' },
  { id: 4, model: 'K04', category: 'Senior', status: 'Disponible' },
  { id: 5, model: 'K05', category: 'Senior', status: 'Disponible' },
  { id: 6, model: 'K06', category: 'Senior', status: 'Disponible' },
]

export const activity = [
  { title: 'Nueva reserva confirmada', detail: 'Maria Gomez · Circuito 02', time: 'Hace 12 min', tone: 'lime' },
  { title: 'Karting enviado a mantenimiento', detail: 'K03 · Revisión preventiva', time: 'Hace 38 min', tone: 'orange' },
  { title: 'Piloto registrado', detail: 'Agustina Castro · Rosario', time: 'Hace 1 h', tone: 'blue' },
]

export const localidades: Localidad[] = [
  { id: 1, nombre: 'Rosario', provincia: 'Santa Fe', codigoPostal: 'S2000' },
  { id: 2, nombre: 'Funes', provincia: 'Santa Fe', codigoPostal: 'S2132' },
  { id: 3, nombre: 'Cordoba', provincia: 'Cordoba', codigoPostal: 'X5000' },
]

export const tiposLicencia: TipoLicencia[] = [
  { id: 1, nombre: 'Principiante', edadMinima: 8, descripcion:'Para pilotos que recién empiezan'},
  { id: 2, nombre: 'Intermedia', edadMinima: 12},
  { id: 3, nombre: 'Avanzada', edadMinima: 16, descripcion:'Habilita a correr en circuitos de mayor velocidad'},
]

export const circuitos: Circuito[] = [
  { id: 1, nombre: 'Circuito Rosario', distancia: 850, dificultad: 'Facil', capacidadMaxima: 12 },
  { id: 2, nombre: 'Circuito Funes', distancia: 1200, dificultad: 'Media', capacidadMaxima: 15 },
  { id: 3, nombre: 'Circuito Cordoba', distancia: 1500, dificultad: 'Dificil', capacidadMaxima: 20 },
]
