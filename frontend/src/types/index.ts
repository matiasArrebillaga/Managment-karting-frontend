export interface Localidad {
    idLocalidades: number
    nombre: string
}

export interface Circuito {
    idCircuitos: number
    distancia: number
    dificultad: string
    maximo: number
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
