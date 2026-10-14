import type { CreatePersonaTorneo, CreateTorneos, IInscripcion, ITorneos, Persona, UpdateTorneos } from '../types'
import { torneos as seed } from '../data/mockData'
import { getCarreras } from './carreraService'
import { apiFetch, usaMocks } from './httpClient'
import { getPersonas } from './personaService'

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

function esObjeto(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === 'object' && valor !== null
}

function comoFecha(valor?: Date | string): Date {
    if (!valor) return new Date()
    return valor instanceof Date ? valor : new Date(valor)
}

function normalizarTorneo(valor: unknown): ITorneos {
    if (
        !esObjeto(valor)
        || typeof valor.idTorneos !== 'number'
        || typeof valor.nombre !== 'string'
        || typeof valor.descripcion !== 'string'
        || typeof valor.cupoMaximo !== 'number'
        || typeof valor.fechaInicio !== 'string'
        || typeof valor.fechaFin !== 'string'
        || typeof valor.TiposLicencias_idTipoLicencia !== 'number'
    ) {
        throw new Error('La API devolvió un torneo con un formato inválido')
    }

    const fechaInicio = new Date(`${valor.fechaInicio.slice(0, 10)}T00:00:00`)
    const fechaFin = new Date(`${valor.fechaFin.slice(0, 10)}T00:00:00`)
    if (Number.isNaN(fechaInicio.getTime()) || Number.isNaN(fechaFin.getTime())) {
        throw new Error('La API devolvió fechas de torneo inválidas')
    }

    return {
        idTorneos: valor.idTorneos,
        nombre: valor.nombre,
        descripcion: valor.descripcion,
        cupoMaximo: valor.cupoMaximo,
        fechaInicio,
        fechaFin,
        TiposLicencias_idTipoLicencia: valor.TiposLicencias_idTipoLicencia,
    }
}

function normalizarInscripciones(valor: unknown): IInscripcion[] {
    if (!Array.isArray(valor)) {
        throw new Error('La API devolvió una lista de inscripciones inválida')
    }

    return valor.map((item: unknown) => {
        if (
            !esObjeto(item)
            || typeof item.Torneos_idTorneos !== 'number'
            || typeof item.Personas_idPersona !== 'number'
            || typeof item.fecha_inscripcion !== 'string'
            || typeof item.hora_inscripcion !== 'string'
        ) {
            throw new Error('La API devolvió una inscripción con un formato inválido')
        }

        return {
            Torneos_idTorneos: item.Torneos_idTorneos,
            Personas_idPersona: item.Personas_idPersona,
            fecha_inscripcion: new Date(item.fecha_inscripcion),
            hora_inscripcion: new Date(item.hora_inscripcion),
        }
    })
}

function datosTorneoApi(datos: CreateTorneos): Record<string, string | number> {
    return {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        cupoMaximo: datos.cupoMaximo,
        fechaInicio: fechaApi(datos.fechaInicio),
        fechaFin: fechaApi(datos.fechaFin),
        TiposLicencias_idTipoLicencia: datos.TiposLicencias_idTipoLicencia,
    }
}

function fechaApi(fecha: Date): string {
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
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

// estado usa los valores de la API: proximo | en_curso | finalizado
export type FiltrosTorneos = { estado?: string, idTipoLicencia?: number }

export async function getTorneos(filtros: FiltrosTorneos = {}): Promise<ITorneos[]> {
    if (!usaMocks) {
        const params = new URLSearchParams()
        if (filtros.estado) params.set('estado', filtros.estado)
        if (filtros.idTipoLicencia !== undefined) params.set('idTipoLicencia', String(filtros.idTipoLicencia))
        const query = params.toString()
        const response = await apiFetch(`/torneos${query ? `?${query}` : ''}`)
        const data: unknown = await response.json()
        if (!Array.isArray(data)) throw new Error('La API devolvió una lista de torneos inválida')
        return data.map(normalizarTorneo)
    }
    await demora()
    return torneos.filter((torneo) => filtros.idTipoLicencia === undefined || torneo.TiposLicencias_idTipoLicencia === filtros.idTipoLicencia)
}

export async function createTorneo(datos: CreateTorneos): Promise<ITorneos> {
    if (!usaMocks) {
        const response = await apiFetch('/torneos', {
            method: 'POST',
            body: JSON.stringify(datosTorneoApi(datos)),
        })
        return normalizarTorneo(await response.json())
    }
    await demora()
    const nuevo: ITorneos = { idTorneos: siguienteId, ...datos }
    siguienteId++
    torneos.push(nuevo)
    return nuevo
}

export async function updateTorneo(id: number, datos: UpdateTorneos): Promise<ITorneos> {
    if (!usaMocks) {
        const response = await apiFetch(`/torneos/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                ...datos,
                ...(datos.fechaInicio ? { fechaInicio: fechaApi(datos.fechaInicio) } : {}),
                ...(datos.fechaFin ? { fechaFin: fechaApi(datos.fechaFin) } : {}),
            }),
        })
        return normalizarTorneo(await response.json())
    }
    await demora()
    const indice = torneos.findIndex((torneo) => torneo.idTorneos === id)
    if (indice === -1) throw new Error(`No existe un torneo con id ${id}`)

    const actualizado: ITorneos = { ...torneos[indice], ...datos, idTorneos: id }
    torneos[indice] = actualizado
    return actualizado
}

export async function deleteTorneo(id: number): Promise<void> {
    if (!usaMocks) {
        await apiFetch(`/torneos/${id}`, { method: 'DELETE' })
        return
    }
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

// verTodas: solo ADMIN/EMPLEADO pueden pedir GET /inscripciones (sirve para contar inscriptos por torneo)
export async function getResumenInscripcionesTorneos(idPersona: number, verTodas: boolean): Promise<{
    torneosAnotados: number[]
    inscriptosPorTorneo: Record<number, number>
}> {
    let mias: IInscripcion[]
    let todas: IInscripcion[]
    if (!usaMocks) {
        mias = normalizarInscripciones(await (await apiFetch('/inscripciones/mias')).json())
        todas = verTodas ? normalizarInscripciones(await (await apiFetch('/inscripciones')).json()) : []
    } else {
        await demora()
        todas = obtenerInscripciones()
        mias = todas.filter((inscripcion) => inscripcion.Personas_idPersona === idPersona)
    }

    return {
        torneosAnotados: mias.map((inscripcion) => inscripcion.Torneos_idTorneos),
        inscriptosPorTorneo: todas.reduce<Record<number, number>>((cantidades, inscripcion) => {
            cantidades[inscripcion.Torneos_idTorneos] = (cantidades[inscripcion.Torneos_idTorneos] ?? 0) + 1
            return cantidades
        }, {}),
    }
}

export async function inscribirseATorneo(idTorneo: number, idPersona: number): Promise<void> {
    if (!usaMocks) {
        await apiFetch('/inscripciones', {
            method: 'POST',
            body: JSON.stringify({
                Torneos_idTorneos: idTorneo,
                Personas_idPersona: idPersona,
            }),
        })
        return
    }
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
    if (!usaMocks) {
        await apiFetch(`/inscripciones/${idTorneo}/${idPersona}`, { method: 'DELETE' })
        return
    }
    await demora()
    const inscripciones = obtenerInscripciones()
    const indice = inscripciones.findIndex((inscripcion) => (
        inscripcion.Torneos_idTorneos === idTorneo && inscripcion.Personas_idPersona === idPersona
    ))
    if (indice === -1) throw new Error('No existe una inscripción para este torneo')

    inscripciones.splice(indice, 1)
    localStorage.setItem(CLAVE_INSCRIPCIONES, JSON.stringify(inscripciones))
}

// Inscriptos de un torneo con su nombre (solo ADMIN/EMPLEADO: /inscripciones y /personas son del personal)
export async function getInscriptosTorneo(idTorneo: number): Promise<Persona[]> {
    const [response, personas] = await Promise.all([apiFetch('/inscripciones'), getPersonas()])
    const ids = normalizarInscripciones(await response.json())
        .filter((inscripcion) => inscripcion.Torneos_idTorneos === idTorneo)
        .map((inscripcion) => inscripcion.Personas_idPersona)
    return personas.filter((persona) => ids.includes(persona.idPersona))
}

// GET /inscripciones/mias trae cada inscripción con su torneo incluido
export async function getMisTorneos(): Promise<ITorneos[]> {
    const response = await apiFetch('/inscripciones/mias')
    const inscripciones: unknown = await response.json()
    if (!Array.isArray(inscripciones)) throw new Error('La API devolvió una lista de inscripciones inválida')
    return inscripciones.map((inscripcion: unknown) => normalizarTorneo(esObjeto(inscripcion) ? inscripcion.torneos : null))
}
