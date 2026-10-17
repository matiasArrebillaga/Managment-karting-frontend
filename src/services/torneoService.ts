import type { CreateTorneos, IInscripcion, ITorneos, Persona, UpdateTorneos } from '../types'
import { apiFetch, esObjeto } from './httpClient'
import { fechaLocal, fechaTexto } from '../utils/fechas'
import { getPersonas } from './personaService'

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

    const fechaInicio = fechaLocal(valor.fechaInicio)
    const fechaFin = fechaLocal(valor.fechaFin)
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
        fechaInicio: fechaTexto(datos.fechaInicio),
        fechaFin: fechaTexto(datos.fechaFin),
        TiposLicencias_idTipoLicencia: datos.TiposLicencias_idTipoLicencia,
    }
}

// estado usa los valores de la API: proximo | en_curso | finalizado
export type FiltrosTorneos = { estado?: string, idTipoLicencia?: number }

export async function getTorneos(filtros: FiltrosTorneos = {}): Promise<ITorneos[]> {
    const params = new URLSearchParams()
    if (filtros.estado) params.set('estado', filtros.estado)
    if (filtros.idTipoLicencia !== undefined) params.set('idTipoLicencia', String(filtros.idTipoLicencia))
    const query = params.toString()
    const response = await apiFetch(`/torneos${query ? `?${query}` : ''}`)
    const data: unknown = await response.json()
    if (!Array.isArray(data)) throw new Error('La API devolvió una lista de torneos inválida')
    return data.map(normalizarTorneo)
}

export async function createTorneo(datos: CreateTorneos): Promise<ITorneos> {
    const response = await apiFetch('/torneos', {
        method: 'POST',
        body: JSON.stringify(datosTorneoApi(datos)),
    })
    return normalizarTorneo(await response.json())
}

export async function updateTorneo(id: number, datos: UpdateTorneos): Promise<ITorneos> {
    const response = await apiFetch(`/torneos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
            ...datos,
            ...(datos.fechaInicio ? { fechaInicio: fechaTexto(datos.fechaInicio) } : {}),
            ...(datos.fechaFin ? { fechaFin: fechaTexto(datos.fechaFin) } : {}),
        }),
    })
    return normalizarTorneo(await response.json())
}

export async function deleteTorneo(id: number): Promise<void> {
    await apiFetch(`/torneos/${id}`, { method: 'DELETE' })
}

// verTodas: solo ADMIN/EMPLEADO pueden pedir GET /inscripciones (sirve para contar inscriptos por torneo)
export async function getResumenInscripcionesTorneos(verTodas: boolean): Promise<{
    torneosAnotados: number[]
    inscriptosPorTorneo: Record<number, number>
}> {
    const mias = normalizarInscripciones(await (await apiFetch('/inscripciones/mias')).json())
    const todas = verTodas ? normalizarInscripciones(await (await apiFetch('/inscripciones')).json()) : []

    return {
        torneosAnotados: mias.map((inscripcion) => inscripcion.Torneos_idTorneos),
        inscriptosPorTorneo: todas.reduce<Record<number, number>>((cantidades, inscripcion) => {
            cantidades[inscripcion.Torneos_idTorneos] = (cantidades[inscripcion.Torneos_idTorneos] ?? 0) + 1
            return cantidades
        }, {}),
    }
}

export async function inscribirseATorneo(idTorneo: number, idPersona: number): Promise<void> {
    await apiFetch('/inscripciones', {
        method: 'POST',
        body: JSON.stringify({
            Torneos_idTorneos: idTorneo,
            Personas_idPersona: idPersona,
        }),
    })
}

export async function desanotarseDeTorneo(idTorneo: number, idPersona: number): Promise<void> {
    await apiFetch(`/inscripciones/${idTorneo}/${idPersona}`, { method: 'DELETE' })
}

// Inscriptos de un torneo con su nombre (solo ADMIN/EMPLEADO: /inscripciones y /personas son del personal)
export async function getInscriptosTorneo(idTorneo: number): Promise<Persona[]> {
    const [response, personas] = await Promise.all([apiFetch('/inscripciones'), getPersonas()])
    const ids = normalizarInscripciones(await response.json())
        .filter((inscripcion) => inscripcion.Torneos_idTorneos === idTorneo)
        .map((inscripcion) => inscripcion.Personas_idPersona)
    return personas.filter((persona) => ids.includes(persona.idPersona))
}

export type Inscripto = { idPersona: number, nombre: string, apellido: string }

// lista pública de inscriptos (todos los roles): solo id, nombre y apellido
export async function getListaInscriptos(idTorneo: number): Promise<Inscripto[]> {
    const data: unknown = await (await apiFetch(`/inscripciones/torneo/${idTorneo}`)).json()
    if (!Array.isArray(data)) throw new Error('La API devolvió una lista de inscriptos inválida')
    return data.map((item: unknown) => {
        if (!esObjeto(item) || typeof item.idPersona !== 'number' || typeof item.nombre !== 'string' || typeof item.apellido !== 'string') {
            throw new Error('La API devolvió un inscripto con un formato inválido')
        }
        return { idPersona: item.idPersona, nombre: item.nombre, apellido: item.apellido }
    })
}

// GET /inscripciones/mias trae cada inscripción con su torneo incluido
export async function getMisTorneos(): Promise<ITorneos[]> {
    const response = await apiFetch('/inscripciones/mias')
    const inscripciones: unknown = await response.json()
    if (!Array.isArray(inscripciones)) throw new Error('La API devolvió una lista de inscripciones inválida')
    return inscripciones.map((inscripcion: unknown) => normalizarTorneo(esObjeto(inscripcion) ? inscripcion.torneos : null))
}
