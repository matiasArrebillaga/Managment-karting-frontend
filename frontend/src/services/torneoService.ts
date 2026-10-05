import type { CreatePersonaTorneo, CreateTorneos, IInscripcion, ITorneos, UpdateTorneos } from '../types'
import { torneos as seed } from '../data/mockData'
import { getCarreras } from './carreraService'

let torneos: ITorneos[] = [...seed]
let siguienteId = Math.max(0, ...torneos.map((torneo) => torneo.idTorneos ?? 0)) + 1
const CLAVE_INSCRIPCIONES = 'karting_inscripciones_torneos'

type InscripcionGuardada = {
    Torneos_idTorneos?: number
    Personas_idPersona?: number
    idTorneo?: number
    idPersona?: number
    fecha_inscripcion?: Date | string
    hora_inscripcion?: Date | string
}

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

function comoFecha(valor?: Date | string): Date {
    if (!valor) return new Date()
    return valor instanceof Date ? valor : new Date(valor)
}

function obtenerInscripciones(): IInscripcion[] {
    try {
        const guardadas: unknown = JSON.parse(localStorage.getItem(CLAVE_INSCRIPCIONES) ?? '[]')
        if (!Array.isArray(guardadas)) return []

        return guardadas.flatMap((valor): IInscripcion[] => {
            if (typeof valor !== 'object' || valor === null) return []
            const inscripcion = valor as InscripcionGuardada
            const idTorneo = inscripcion.Torneos_idTorneos ?? inscripcion.idTorneo
            const idPersona = inscripcion.Personas_idPersona ?? inscripcion.idPersona
            if (idTorneo === undefined || idPersona === undefined) return []

            return [{
                Torneos_idTorneos: idTorneo,
                Personas_idPersona: idPersona,
                fecha_inscripcion: comoFecha(inscripcion.fecha_inscripcion),
                hora_inscripcion: comoFecha(inscripcion.hora_inscripcion),
            }]
        })
    } catch {
        return []
    }
}

function crearInscripcion(datos: CreatePersonaTorneo): IInscripcion {
    const ahora = new Date()
    return {
        ...datos,
        fecha_inscripcion: new Date(ahora.getTime()),
        hora_inscripcion: new Date(ahora.getTime()),
    }
}

export async function getTorneos(): Promise<ITorneos[]> {
    await demora()
    return torneos
}

export async function createTorneo(datos: CreateTorneos): Promise<ITorneos> {
    await demora()
    const nuevo: ITorneos = { idTorneos: siguienteId, ...datos }
    siguienteId++
    torneos.push(nuevo)
    return nuevo
}

export async function updateTorneo(id: number, datos: UpdateTorneos): Promise<ITorneos> {
    await demora()
    const indice = torneos.findIndex((torneo) => torneo.idTorneos === id)
    if (indice === -1) throw new Error(`No existe un torneo con id ${id}`)

    const actualizado: ITorneos = { ...torneos[indice], ...datos, idTorneos: id }
    torneos[indice] = actualizado
    return actualizado
}

export async function deleteTorneo(id: number): Promise<void> {
    await demora()
    const indice = torneos.findIndex((torneo) => torneo.idTorneos === id)
    if (indice === -1) throw new Error(`No existe un torneo con id ${id}`)

    const carreras = await getCarreras()
    if (carreras.some((carrera) => carrera.Torneos_idTorneos === id)) {
        throw new Error('No se puede eliminar: hay carreras asociadas a este torneo')
    }
    if (obtenerInscripciones().some((inscripcion) => inscripcion.Torneos_idTorneos === id)) {
        throw new Error('No se puede eliminar: hay personas anotadas a este torneo')
    }
    torneos.splice(indice, 1)
}

export async function getResumenInscripcionesTorneos(idPersona: number): Promise<{
    torneosAnotados: number[]
    inscriptosPorTorneo: Record<number, number>
}> {
    await demora()
    const inscripciones = obtenerInscripciones()
    const inscriptosPorTorneo = inscripciones.reduce<Record<number, number>>((cantidades, inscripcion) => {
        cantidades[inscripcion.Torneos_idTorneos] = (cantidades[inscripcion.Torneos_idTorneos] ?? 0) + 1
        return cantidades
    }, {})

    return {
        torneosAnotados: inscripciones
            .filter((inscripcion) => inscripcion.Personas_idPersona === idPersona)
            .map((inscripcion) => inscripcion.Torneos_idTorneos),
        inscriptosPorTorneo,
    }
}

export async function inscribirseATorneo(idTorneo: number, idPersona: number): Promise<void> {
    await demora()
    const torneo = torneos.find((item) => item.idTorneos === idTorneo)
    if (!torneo) throw new Error('El torneo ya no está disponible')

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaFin = new Date(torneo.fechaFin)
    fechaFin.setHours(0, 0, 0, 0)
    if (fechaFin < hoy) throw new Error('No es posible anotarse a un torneo terminado')

    const inscripciones = obtenerInscripciones()
    if (inscripciones.some((inscripcion) => inscripcion.Torneos_idTorneos === idTorneo && inscripcion.Personas_idPersona === idPersona)) {
        throw new Error('Ya estás anotado en este torneo')
    }

    const cantidad = inscripciones.filter((inscripcion) => inscripcion.Torneos_idTorneos === idTorneo).length
    if (cantidad >= torneo.cupoMaximo) throw new Error('El torneo alcanzó su cupo máximo')

    inscripciones.push(crearInscripcion({
        Torneos_idTorneos: idTorneo,
        Personas_idPersona: idPersona,
    }))
    localStorage.setItem(CLAVE_INSCRIPCIONES, JSON.stringify(inscripciones))
}

export async function desanotarseDeTorneo(idTorneo: number, idPersona: number): Promise<void> {
    await demora()
    const inscripciones = obtenerInscripciones()
    const indice = inscripciones.findIndex((inscripcion) => (
        inscripcion.Torneos_idTorneos === idTorneo && inscripcion.Personas_idPersona === idPersona
    ))
    if (indice === -1) throw new Error('No existe una inscripción para este torneo')

    inscripciones.splice(indice, 1)
    localStorage.setItem(CLAVE_INSCRIPCIONES, JSON.stringify(inscripciones))
}