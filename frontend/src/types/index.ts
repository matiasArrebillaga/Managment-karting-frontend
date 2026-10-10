export interface Localidad {
    idLocalidades: number
    nombre: string
}

export type Rol = 'ADMIN' | 'EMPLEADO' | 'CLIENTE'

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

export interface Circuito {
    idCircuitos: number
    distancia: number
    dificultad: string
    maximo: number
}
 
export interface ITorneos {
    idTorneos: number
    nombre: string
    descripcion: string
    cupoMaximo: number
    fechaInicio: Date
    fechaFin: Date
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
    Torneos_idTorneos: number
    Circuitos_idCircuitos: number
}

export type CreateCarrera = Omit<ICarrera, 'idCarreras' | 'horaInicio' | 'horaFin' | 'Kartings_idKartings'> & {
    horaInicio: Date | string
    horaFin: Date | string
    Kartings_idKartings: number
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
    Carrera_Kartings_idKartings: number
    Carrera_Torneos_idTorneos: number
    Carrera_Circuitos_idCircuitos: number
    Carrera_fecha: Date
    Personas_idPersona: number
    puntos: number
    tiempo: string
    posicion_final: number
}

export interface TipoLicencia {
    idTipoLicencia: number
    nombre: string
    descripcion: string
    nivel: number
}

export interface TipoKarting {
    idTiposKarting: number
    nombre: string
    descripcion: string
    TiposLicencias_idTipoLicenciaMinima: number
}

export interface Karting {
    idKartings: number
    categoria: string
    modelo: string
    estado: string
    fechaAdquisicion: string
    TiposKarting_idTiposKarting: number
}

export interface Licencia {
    idLicencias: number
    fechaEmision: string
    fechaVencimiento: string
    Personas_idPersona: number
    TiposLicencias_idTipoLicencia: number
}

// Version minima, solo para los desplegables de Licencia.
// El CRUD completo de Persona (con localidad, rol, login) no esta hecho todavia.
export interface Persona {
    idPersona: number
    nombre: string
    apellido: string
}
