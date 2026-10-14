import type { components } from './api'

// Generados desde el OpenAPI del backend (npm run gen:api). Required porque los schemas de
// respuesta del backend no marcan campos required y saldrian todos opcionales.
type Schemas = components['schemas']

export type Localidad = Required<Schemas['Localidad']>
export type Circuito = Required<Schemas['Circuito']>
export type TipoLicencia = Required<Schemas['TipoLicencia']>
export type Karting = Required<Schemas['Karting']>
export type Licencia = Required<Schemas['Licencia']>
export type Rol = Schemas['AsignarRolRequest']['nombreRol']

export interface PersonaAuth {
    idPersona: number
    nombre: string
    apellido: string
    mail: string
    rol: { idRol: number; nombre: Rol }
}

export interface Sesion {
    token: string
    persona: PersonaAuth
}

export interface DatosRegistro {
    nombre: string
    apellido: string
    dni: string
    fechaNacimiento: string
    mail: string
    telefono: string
    contraseña: string
    Localidades_idLocalidades: number
    idRol: number
}

export interface ITorneos {
    idTorneos: number
    nombre: string
    descripcion: string
    cupoMaximo: number
    fechaInicio: Date
    fechaFin: Date
    TiposLicencias_idTipoLicencia: number
}

export type CreateTorneos = Omit<ITorneos, 'idTorneos'>
export type UpdateTorneos = Partial<CreateTorneos>

export interface IInscripcion {
    Torneos_idTorneos: number
    Personas_idPersona: number
    fecha_inscripcion: Date
    hora_inscripcion: Date
}

export type CreatePersonaTorneo = Pick<IInscripcion, 'Torneos_idTorneos' | 'Personas_idPersona'>

export interface ICarrera {
    idCarreras?: number
    fechaCarrera: Date
    horaInicio: Date
    horaFin: Date
    Kartings_idKartings?: number
    kartings?: number[]
    Torneos_idTorneos: number
    Circuitos_idCircuitos: number
}

export type CreateCarrera = Omit<ICarrera, 'idCarreras' | 'horaInicio' | 'horaFin' | 'Kartings_idKartings' | 'kartings'> & {
    horaInicio: Date | string
    horaFin: Date | string
    kartings: number[]
}

export type UpdateCarrera = Partial<Omit<ICarrera, 'idCarreras'>> & {
    horaInicio?: Date | string
    horaFin?: Date | string
}

export interface IReserva {
    idReservas?: number
    fechaReserva: Date
    horaInicio: Date | string
    horaFin: Date | string
    monto?: string | number
    Personas_idPersona: number
    Circuitos_idCircuitos: number
    Kartings_idKartings: number
}

export type CreateReserva = Omit<IReserva, 'idReservas'>
export type UpdateReserva = Partial<CreateReserva>

export type CreateReservaInput = Omit<CreateReserva, 'fechaReserva' | 'horaInicio' | 'horaFin'> & {
    fechaReserva: Date | string
    horaInicio: Date | string
    horaFin: Date | string
}

export type UpdateReservaInput = Partial<CreateReservaInput>

export interface IParticipacion {
    Carrera_Torneos_idTorneos: number
    Carrera_Circuitos_idCircuitos: number
    Carrera_fecha: Date
    Personas_idPersona: number
    puntos: number
    tiempo: string
    posicion_final: number
}

// A mano: el backend manda precioHora como Decimal (string) y tipoKartingService lo pasa a number
export interface TipoKarting {
    idTiposKarting: number
    nombre: string
    descripcion: string
    precioHora?: number
    TiposLicencias_idTipoLicenciaMinima: number
}

// Lo que se manda por piloto al cargar una carrera; los puntos los calcula el backend
export type ResultadoCarrera = Pick<IParticipacion, 'Personas_idPersona' | 'posicion_final' | 'tiempo'>

// GET /participaciones/carrera/:fecha/:torneo/:circuito
export interface FilaClasificacion {
    posicion: number
    idPersona: number
    nombre: string
    apellido: string
    tiempo: string
    puntos: number
}

// GET /participaciones/torneo/:id/tabla-general
export interface FilaTablaGeneral {
    posicion: number
    idPersona: number
    nombre?: string
    apellido?: string
    puntosTotales: number
    victorias: number
}

// Version minima, solo para los desplegables de Licencia.
// El CRUD completo de Persona (con localidad, rol, login) no esta hecho todavia.
export type Persona = Pick<Required<Schemas['Persona']>, 'idPersona' | 'nombre' | 'apellido'>
