import type { CreateCarrera, ICarrera, Karting } from '../types'
import { carreras as seed } from '../data/mockData'
import { getKartings } from './kartingService'

let carreras: ICarrera[] = [...seed]
let siguienteId = carreras.length + 1
const CLAVE_INSCRIPCIONES = 'karting_inscripciones_carreras'

type InscripcionCarrera = { idCarrera: number; idPersona: number; idKarting?: number }

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

function comoFecha(valor: Date | string): Date {
    return valor instanceof Date ? valor : new Date(valor)
}

function obtenerInscripciones(): InscripcionCarrera[] {
    try {
        const inscripciones: unknown = JSON.parse(localStorage.getItem(CLAVE_INSCRIPCIONES) ?? '[]')
        return Array.isArray(inscripciones) ? inscripciones as InscripcionCarrera[] : []
    } catch {
        return []
    }
}

export async function getCarreras(): Promise<ICarrera[]> {
    await demora()
    return carreras
}

export async function getCarrera(id: number): Promise<ICarrera> {
    await demora()
    const carrera = carreras.find((c) => c.idCarreras === id)
    if (!carrera) {
        throw new Error(`No existe una carrera con id ${id}`)
    }
    return carrera
}

export async function createCarrera(datos: CreateCarrera): Promise<ICarrera> {
    await demora()
    const nueva: ICarrera = {
        idCarreras: siguienteId,
        ...datos,
        horaInicio: comoFecha(datos.horaInicio),
        horaFin: comoFecha(datos.horaFin),
    }
    siguienteId++
    carreras.push(nueva)
    return nueva
}

export async function updateCarrera(id: number, datos: CreateCarrera): Promise<ICarrera> {
    await demora()
    const indice = carreras.findIndex((c) => c.idCarreras === id)
    if (indice === -1) {
        throw new Error(`No existe una carrera con id ${id}`)
    }
    const actualizada: ICarrera = {
        idCarreras: id,
        ...datos,
        horaInicio: comoFecha(datos.horaInicio),
        horaFin: comoFecha(datos.horaFin),
    }
    carreras[indice] = actualizada
    return actualizada
}

export async function deleteCarrera(id: number): Promise<void> {
    await demora()
    const indice = carreras.findIndex((c) => c.idCarreras === id)
    if (indice === -1) {
        throw new Error(`No existe una carrera con id ${id}`)
    }
    carreras.splice(indice, 1)
    const inscripciones = obtenerInscripciones().filter((inscripcion) => inscripcion.idCarrera !== id)
    localStorage.setItem(CLAVE_INSCRIPCIONES, JSON.stringify(inscripciones))
}

export async function getInscripcionesCarreras(idPersona: number): Promise<number[]> {
    await demora()
    return obtenerInscripciones()
        .filter((inscripcion) => inscripcion.idPersona === idPersona)
        .map((inscripcion) => inscripcion.idCarrera)
}

export async function getKartingsDisponiblesCarrera(idCarrera: number): Promise<Karting[]> {
    await demora()
    const carrera = carreras.find((item) => item.idCarreras === idCarrera)
    if (!carrera) throw new Error('La carrera ya no está disponible')

    const inscripciones = obtenerInscripciones()
    const kartings = await getKartings()
    return kartings.filter((karting) => (
        karting.estado === 'Disponible' && !kartingOcupado(karting.idKartings, carrera, inscripciones)
    ))
}

export async function inscribirseEnCarrera(idCarrera: number, idPersona: number, idKarting: number): Promise<void> {
    await demora()
    const carrera = carreras.find((item) => item.idCarreras === idCarrera)
    if (!carrera) throw new Error('La carrera ya no está disponible')

    const kartings = await getKartings()
    const karting = kartings.find((item) => item.idKartings === idKarting)
    if (!karting || karting.estado !== 'Disponible') {
        throw new Error('El karting seleccionado no está disponible')
    }

    const inscripciones = obtenerInscripciones()
    if (inscripciones.some((inscripcion) => inscripcion.idCarrera === idCarrera && inscripcion.idPersona === idPersona)) {
        throw new Error('Ya estás anotado en esta carrera')
    }
    if (kartingOcupado(idKarting, carrera, inscripciones)) {
        throw new Error('El karting ya está asignado a una carrera en ese horario')
    }

    inscripciones.push({ idCarrera, idPersona, idKarting })
    localStorage.setItem(CLAVE_INSCRIPCIONES, JSON.stringify(inscripciones))
}

export async function desanotarseDeCarrera(idCarrera: number, idPersona: number): Promise<void> {
    await demora()
    const inscripciones = obtenerInscripciones()
    const indice = inscripciones.findIndex((inscripcion) => (
        inscripcion.idCarrera === idCarrera && inscripcion.idPersona === idPersona
    ))
    if (indice === -1) throw new Error('No existe una inscripción para esta carrera')

    inscripciones.splice(indice, 1)
    localStorage.setItem(CLAVE_INSCRIPCIONES, JSON.stringify(inscripciones))
}

function seSuperponen(carreraA: ICarrera, carreraB: ICarrera): boolean {
    return carreraA.horaInicio < carreraB.horaFin && carreraB.horaInicio < carreraA.horaFin
}

function kartingOcupado(idKarting: number, carrera: ICarrera, inscripciones: InscripcionCarrera[]): boolean {
    return inscripciones.some((inscripcion) => {
        if (inscripcion.idKarting !== idKarting) return false
        const otraCarrera = carreras.find((item) => item.idCarreras === inscripcion.idCarrera)
        return otraCarrera ? seSuperponen(carrera, otraCarrera) : false
    })
}