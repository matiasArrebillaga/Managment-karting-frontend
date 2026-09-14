export interface Localidad {
    id: number
    nombre: string
    provincia: string
    codigoPostal: string
}

export interface Circuito {
    id: number
    nombre: string
    distancia: number
    dificultad: string
    capacidadMaxima: number
}

export interface TipoLicencia {
    id: number
    nombre: string
    edadMinima: number
    descripcion?: string
}

export interface Karting {
    id: number
    numero: number
    modelo: string
    categoria: string
    estado: string
    fechaAdquisicion: string
    fechaUltimoMantenimiento?: string
}