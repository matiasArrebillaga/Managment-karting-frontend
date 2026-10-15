import type { Localidad } from '../types'
import type { TipoLicencia } from '../types'
import type { Circuito } from '../types'
import type { Karting } from '../types'
import type { TipoKarting } from '../types'
import type { Licencia } from '../types'
import type { Persona, RolDetalle } from '../types'
import type { ICarrera } from '../types'
import type { ITorneos } from '../types'
import type { IReserva } from '../types'
import type { IParticipacion } from '../types'

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

// A partir de aca, los datos siguen exactamente la estructura de prisma/schema.prisma del backend real.

export const localidades: Localidad[] = [
  { idLocalidades: 1, nombre: 'Rosario' },
  { idLocalidades: 2, nombre: 'Funes' },
  { idLocalidades: 3, nombre: 'Cordoba' },
]

export const tiposLicencia: TipoLicencia[] = [
  { idTipoLicencia: 1, nombre: 'Principiante', descripcion: 'Para pilotos que recien empiezan', nivel: 1 },
  { idTipoLicencia: 2, nombre: 'Intermedia', descripcion: 'Habilita circuitos de dificultad media', nivel: 2 },
  { idTipoLicencia: 3, nombre: 'Avanzada', descripcion: 'Habilita a correr en circuitos de mayor velocidad', nivel: 3 },
]

export const circuitos: Circuito[] = [
  { idCircuitos: 1, distancia: 850, dificultad: 'Facil', maximo: 12 },
  { idCircuitos: 2, distancia: 1200, dificultad: 'Media', maximo: 15 },
  { idCircuitos: 3, distancia: 1500, dificultad: 'Dificil', maximo: 20 },
]

export const torneos: ITorneos[] = [
  { idTorneos: 1, nombre: 'Torneo Primavera', descripcion: 'Competencia de primavera', cupoMaximo: 30, fechaInicio: new Date(2026, 9, 1), fechaFin: new Date(2026, 9, 31), TiposLicencias_idTipoLicencia: 1 },
  { idTorneos: 2, nombre: 'Copa de Invierno', descripcion: 'Edicion de invierno', cupoMaximo: 24, fechaInicio: new Date(2026, 6, 1), fechaFin: new Date(2026, 6, 20), TiposLicencias_idTipoLicencia: 1 },
  { idTorneos: 3, nombre: 'Gran Premio de Noviembre', descripcion: 'Torneo abierto de noviembre', cupoMaximo: 36, fechaInicio: new Date(2026, 10, 5), fechaFin: new Date(2026, 10, 15), TiposLicencias_idTipoLicencia: 1 },
]

export const carreras: ICarrera[] = [
  {
    idCarreras: 1,
    fechaCarrera: new Date(2026, 9, 4),
    horaInicio: new Date(2026, 9, 4, 10, 0),
    horaFin: new Date(2026, 9, 4, 10, 30),
    Kartings_idKartings: 1,
    Torneos_idTorneos: 1,
    Circuitos_idCircuitos: 1,
  },
  {
    idCarreras: 2,
    fechaCarrera: new Date(2026, 9, 4),
    horaInicio: new Date(2026, 9, 4, 11, 0),
    horaFin: new Date(2026, 9, 4, 11, 30),
    Kartings_idKartings: 3,
    Torneos_idTorneos: 1,
    Circuitos_idCircuitos: 2,
  },
]

export const tiposKarting: TipoKarting[] = [
  { idTiposKarting: 1, nombre: 'Junior', descripcion: 'Para pilotos de menor edad y peso', precioHora: 15000, TiposLicencias_idTipoLicenciaMinima: 1 },
  { idTiposKarting: 2, nombre: 'Senior', descripcion: 'Motor estandar de competicion', precioHora: 20000, TiposLicencias_idTipoLicenciaMinima: 2 },
  { idTiposKarting: 3, nombre: 'Profesional', descripcion: 'Motor de alta cilindrada para competicion', precioHora: 30000, TiposLicencias_idTipoLicenciaMinima: 3 },
]

export const kartings: Karting[] = [
  { idKartings: 1, categoria: 'Junior', modelo: 'Sodikart RT8', estado: 'Disponible', fechaAdquisicion: '2024-03-15', TiposKarting_idTiposKarting: 1 },
  { idKartings: 2, categoria: 'Junior', modelo: 'Sodikart RT8', estado: 'Mantenimiento', fechaAdquisicion: '2024-03-15', TiposKarting_idTiposKarting: 1 },
  { idKartings: 3, categoria: 'Senior', modelo: 'Birel ART', estado: 'Disponible', fechaAdquisicion: '2025-01-20', TiposKarting_idTiposKarting: 2 },
]

export const reservas: IReserva[] = [
  {
    idReservas: 1,
    fechaReserva: new Date(2026, 9, 5),
    horaInicio: new Date(2026, 9, 5, 11, 0),
    horaFin: new Date(2026, 9, 5, 12, 0),
    Personas_idPersona: 1,
    Circuitos_idCircuitos: 1,
    Kartings_idKartings: 1,
  },
]

export const participaciones: IParticipacion[] = [
  {
    Carrera_Torneos_idTorneos: 1,
    Carrera_Circuitos_idCircuitos: 1,
    Carrera_fecha: new Date(2026, 9, 4),
    Personas_idPersona: 1,
    puntos: 25,
    tiempo: '00:18:42.350',
    posicion_final: 1,
  },
  {
    Carrera_Torneos_idTorneos: 1,
    Carrera_Circuitos_idCircuitos: 1,
    Carrera_fecha: new Date(2026, 9, 4),
    Personas_idPersona: 2,
    puntos: 18,
    tiempo: '00:18:51.120',
    posicion_final: 2,
  },
  {
    Carrera_Torneos_idTorneos: 1,
    Carrera_Circuitos_idCircuitos: 1,
    Carrera_fecha: new Date(2026, 9, 4),
    Personas_idPersona: 3,
    puntos: 15,
    tiempo: '00:19:03.870',
    posicion_final: 3,
  },
]

// Personas: version minima solo para poblar el desplegable de Licencia.
export const personas: Persona[] = [
  { idPersona: 1, nombre: 'Maria', apellido: 'Gomez', dni: '30111222', fechaNacimiento: '1990-03-12T00:00:00.000Z', mail: 'maria@mail.com', telefono: '3411111111', Localidades_idLocalidades: 1, idRol: 1 },
  { idPersona: 2, nombre: 'Agustina', apellido: 'Castro', dni: '35222333', fechaNacimiento: '1995-07-21T00:00:00.000Z', mail: 'agustina@mail.com', telefono: '3412222222', Localidades_idLocalidades: 1, idRol: 2 },
  { idPersona: 3, nombre: 'Tomas', apellido: 'Ibarra', dni: '40333444', fechaNacimiento: '2000-11-05T00:00:00.000Z', mail: 'tomas@mail.com', telefono: '3413333333', Localidades_idLocalidades: 1, idRol: 3 },
]

export const licencias: Licencia[] = [
  { idLicencias: 1, fechaEmision: '2025-02-10', fechaVencimiento: '2027-02-10', Personas_idPersona: 1, TiposLicencias_idTipoLicencia: 2 },
  { idLicencias: 2, fechaEmision: '2026-01-05', fechaVencimiento: '2028-01-05', Personas_idPersona: 2, TiposLicencias_idTipoLicencia: 1 },
  { idLicencias: 3, fechaEmision: '2024-11-20', fechaVencimiento: '2026-11-20', Personas_idPersona: 3, TiposLicencias_idTipoLicencia: 3 },
]

export const roles: RolDetalle[] = [
  { idRol: 1, nombre: 'ADMIN' },
  { idRol: 2, nombre: 'EMPLEADO' },
  { idRol: 3, nombre: 'CLIENTE' },
]
