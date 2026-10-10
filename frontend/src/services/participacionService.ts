import type { IParticipacion } from '../types'
import { participaciones as seed } from '../data/mockData'
import { apiFetch, usaMocks } from './httpClient'

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

function normalizarParticipacionesApi(valor: unknown): IParticipacion[] {
    if (!Array.isArray(valor)) {
        throw new Error('La API devolvió una lista de participaciones inválida')
    }

    return valor.map((item: unknown) => {
        if (typeof item !== 'object' || item === null) {
            throw new Error('La API devolvió una participación inválida')
        }
        const participacion = item as Record<string, unknown>
        const fecha = participacion.Carrera_fecha
        if (
            typeof fecha !== 'string'
            || typeof participacion.Carrera_Kartings_idKartings !== 'number'
            || typeof participacion.Carrera_Torneos_idTorneos !== 'number'
            || typeof participacion.Carrera_Circuitos_idCircuitos !== 'number'
            || typeof participacion.Personas_idPersona !== 'number'
            || typeof participacion.puntos !== 'number'
            || typeof participacion.tiempo !== 'string'
            || typeof participacion.posicion_final !== 'string'
        ) {
            throw new Error('La API devolvió una participación con campos inválidos')
        }

        return {
            Carrera_Kartings_idKartings: participacion.Carrera_Kartings_idKartings,
            Carrera_Torneos_idTorneos: participacion.Carrera_Torneos_idTorneos,
            Carrera_Circuitos_idCircuitos: participacion.Carrera_Circuitos_idCircuitos,
            Carrera_fecha: new Date(`${fecha.slice(0, 10)}T00:00:00`),
            Personas_idPersona: participacion.Personas_idPersona,
            puntos: participacion.puntos,
            tiempo: participacion.tiempo,
            posicion_final: Number(participacion.posicion_final),
        }
    })
}

export async function getParticipaciones(): Promise<IParticipacion[]> {
    if (!usaMocks) {
        const response = await apiFetch('/participaciones')
        return normalizarParticipacionesApi(await response.json())
    }
    await demora()
    return seed
}
