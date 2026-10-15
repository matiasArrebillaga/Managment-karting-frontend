import type { components } from './api'

// Generados desde el OpenAPI del backend (npm run gen:api)
type Schemas = components['schemas']

export type Localidad = Schemas['Localidad']
export type Circuito = Schemas['Circuito']
export type TipoLicencia = Schemas['TipoLicencia']
export type Karting = Schemas['Karting']
export type Licencia = Schemas['Licencia']
export type Rol = Schemas['AsignarRolRequest']['nombreRol']
export type DatosRegistro = Schemas['RegisterRequest']

// Lo que guarda la sesion de la persona logueada (authService se queda solo con estos campos)
export type PersonaAuth = Pick<Schemas['PersonaAuth'], 'idPersona' | 'nombre' | 'apellido' | 'mail' | 'rol'>

export interface Sesion {
    token: string
    persona: PersonaAuth
}

// Desde aca, modelos del frontend: los services convierten las fechas y horas que manda la API
// (strings ISO) a Date, asi que no son los tipos generados sino lo que queda despues de convertir.
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

// La API manda precioHora como string (Decimal) y tipoKartingService lo pasa a number
export interface TipoKarting {
    idTiposKarting: number
    nombre: string
    descripcion: string
    precioHora: number
    TiposLicencias_idTipoLicenciaMinima: number
}

// Lo que se manda por piloto al cargar una carrera; los puntos los calcula el backend
export type ResultadoCarrera = Pick<IParticipacion, 'Personas_idPersona' | 'posicion_final' | 'tiempo'>

// GET /participaciones/carrera/:fecha/:torneo/:circuito
export type FilaClasificacion = Schemas['ClasificacionCarreraItem']

// GET /participaciones/torneo/:id/tabla-general
export type FilaTablaGeneral = Schemas['TablaGeneralItem']

// GET /personas: la API no manda la contraseña ni el nombre del rol (solo idRol)
export type Persona = Schemas['Persona']
export type RolDetalle = Schemas['Rol']
