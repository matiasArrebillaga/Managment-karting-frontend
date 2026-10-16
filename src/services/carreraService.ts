import type { CreateCarrera, ICarrera } from '../types'
import { apiFetch, esObjeto } from './httpClient'
import { fechaLocal, fechaTexto, horaLocal, horaTexto } from '../utils/fechas'

function normalizarCarrera(valor: unknown): ICarrera {
    if (
        !esObjeto(valor)
        || typeof valor.fechaCarrera !== 'string'
        || typeof valor.horaInicio !== 'string'
        || typeof valor.horaFin !== 'string'
        || !Array.isArray(valor.kartings)
        || typeof valor.Torneos_idTorneos !== 'number'
        || typeof valor.Circuitos_idCircuitos !== 'number'
    ) {
        throw new Error('La API devolvió una carrera con un formato inválido')
    }
    const kartings = valor.kartings.map((karting: unknown) => {
        if (!esObjeto(karting) || typeof karting.idKartings !== 'number') {
            throw new Error('La API devolvió una carrera con kartings inválidos')
        }
        return karting.idKartings
    })

    const fechaCarrera = fechaLocal(valor.fechaCarrera)
    const horaInicio = horaLocal(valor.horaInicio, fechaCarrera)
    const horaFin = horaLocal(valor.horaFin, fechaCarrera)
    if (
        Number.isNaN(fechaCarrera.getTime())
        || Number.isNaN(horaInicio.getTime())
        || Number.isNaN(horaFin.getTime())
    ) {
        throw new Error('La API devolvió una fecha u horario de carrera inválido')
    }

    return {
        fechaCarrera,
        horaInicio,
        horaFin,
        kartings,
        Torneos_idTorneos: valor.Torneos_idTorneos,
        Circuitos_idCircuitos: valor.Circuitos_idCircuitos,
    }
}

function normalizarLista(valor: unknown): ICarrera[] {
    if (!Array.isArray(valor)) throw new Error('La API devolvió una lista de carreras inválida')
    return valor.map(normalizarCarrera)
}

function rutaCarrera(carrera: ICarrera): string {
    return `/carreras/${fechaTexto(carrera.fechaCarrera)}/${carrera.Torneos_idTorneos}/${carrera.Circuitos_idCircuitos}`
}

function cuerpoApi(datos: CreateCarrera): Record<string, string | number | number[]> {
    return {
        fechaCarrera: fechaTexto(datos.fechaCarrera),
        horaInicio: horaTexto(datos.horaInicio),
        horaFin: horaTexto(datos.horaFin),
        kartings: datos.kartings,
        Torneos_idTorneos: datos.Torneos_idTorneos,
        Circuitos_idCircuitos: datos.Circuitos_idCircuitos,
    }
}

export async function getCarreras(): Promise<ICarrera[]> {
    const response = await apiFetch('/carreras')
    return normalizarLista(await response.json())
}

export async function getCarrerasTorneo(idTorneo: number): Promise<ICarrera[]> {
    const response = await apiFetch(`/carreras/torneo/${idTorneo}`)
    return normalizarLista(await response.json())
}

export async function getCarrera(carrera: ICarrera): Promise<ICarrera> {
    const response = await apiFetch(rutaCarrera(carrera))
    return normalizarCarrera(await response.json())
}

export async function createCarrera(datos: CreateCarrera): Promise<ICarrera> {
    const response = await apiFetch('/carreras', {
        method: 'POST',
        body: JSON.stringify(cuerpoApi(datos)),
    })
    return normalizarCarrera(await response.json())
}

// la clave (fecha, torneo, circuito) no se puede cambiar: solo se mandan horarios y kartings
export async function updateCarrera(carrera: ICarrera, datos: CreateCarrera): Promise<ICarrera> {
    const response = await apiFetch(rutaCarrera(carrera), {
        method: 'PUT',
        body: JSON.stringify({
            horaInicio: horaTexto(datos.horaInicio),
            horaFin: horaTexto(datos.horaFin),
            kartings: datos.kartings,
        }),
    })
    return normalizarCarrera(await response.json())
}

export async function deleteCarrera(carrera: ICarrera): Promise<void> {
    await apiFetch(rutaCarrera(carrera), { method: 'DELETE' })
}
