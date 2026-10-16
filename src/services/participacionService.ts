import type { FilaClasificacion, FilaTablaGeneral, ICarrera, IParticipacion, ResultadoCarrera } from '../types'
import { apiFetch, esObjeto } from './httpClient'
import { fechaLocal, fechaTexto } from '../utils/fechas'

function normalizarParticipacionesApi(valor: unknown): IParticipacion[] {
    if (!Array.isArray(valor)) {
        throw new Error('La API devolvió una lista de participaciones inválida')
    }

    return valor.map((item: unknown) => {
        if (!esObjeto(item)) {
            throw new Error('La API devolvió una participación inválida')
        }
        const fecha = item.Carrera_fecha
        if (
            typeof fecha !== 'string'
            || typeof item.Carrera_Torneos_idTorneos !== 'number'
            || typeof item.Carrera_Circuitos_idCircuitos !== 'number'
            || typeof item.Personas_idPersona !== 'number'
            || typeof item.puntos !== 'number'
            || typeof item.tiempo !== 'string'
            || typeof item.posicion_final !== 'number'
        ) {
            throw new Error('La API devolvió una participación con campos inválidos')
        }

        return {
            Carrera_Torneos_idTorneos: item.Carrera_Torneos_idTorneos,
            Carrera_Circuitos_idCircuitos: item.Carrera_Circuitos_idCircuitos,
            Carrera_fecha: fechaLocal(fecha),
            Personas_idPersona: item.Personas_idPersona,
            puntos: item.puntos,
            tiempo: item.tiempo,
            posicion_final: item.posicion_final,
        }
    })
}

export async function getParticipaciones(): Promise<IParticipacion[]> {
    const response = await apiFetch('/participaciones')
    return normalizarParticipacionesApi(await response.json())
}

// La clave de la carrera va en la URL: fecha (YYYY-MM-DD) / torneo / circuito
function clavesUrl(carrera: ICarrera): string {
    return `${fechaTexto(carrera.fechaCarrera)}/${carrera.Torneos_idTorneos}/${carrera.Circuitos_idCircuitos}`
}

export async function getClasificacionCarrera(carrera: ICarrera): Promise<FilaClasificacion[]> {
    const response = await apiFetch(`/participaciones/carrera/${clavesUrl(carrera)}`)
    return response.json() as Promise<FilaClasificacion[]>
}

export async function cargarResultadosCarrera(carrera: ICarrera, resultados: ResultadoCarrera[]): Promise<void> {
    await apiFetch('/participaciones/carrera', {
        method: 'POST',
        body: JSON.stringify({
            Carrera_fecha: fechaTexto(carrera.fechaCarrera),
            Carrera_Torneos_idTorneos: carrera.Torneos_idTorneos,
            Carrera_Circuitos_idCircuitos: carrera.Circuitos_idCircuitos,
            resultados,
        }),
    })
}

export async function updateParticipacion(
    carrera: ICarrera,
    idPersona: number,
    datos: Pick<ResultadoCarrera, 'posicion_final' | 'tiempo'>,
): Promise<void> {
    await apiFetch(`/participaciones/${clavesUrl(carrera)}/${idPersona}`, {
        method: 'PUT',
        body: JSON.stringify(datos),
    })
}

export async function deleteParticipacion(carrera: ICarrera, idPersona: number): Promise<void> {
    await apiFetch(`/participaciones/${clavesUrl(carrera)}/${idPersona}`, { method: 'DELETE' })
}

export async function getTablaGeneral(idTorneo: number): Promise<FilaTablaGeneral[]> {
    const response = await apiFetch(`/participaciones/torneo/${idTorneo}/tabla-general`)
    return response.json() as Promise<FilaTablaGeneral[]>
}