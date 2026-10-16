import type { CreateReservaInput, IReserva, UpdateReservaInput } from '../types'
import { apiFetch, esObjeto } from './httpClient'
import { fechaLocal, fechaTexto, horaTexto } from '../utils/fechas'

function normalizarReservaApi(valor: unknown): IReserva {
    if (!esObjeto(valor)) {
        throw new Error('El servidor devolvió una reserva inválida')
    }

    const fecha = valor.fechaReserva
    const horaInicio = valor.horaInicio
    const horaFin = valor.horaFin
    if (
        typeof valor.idReservas !== 'number'
        || typeof fecha !== 'string'
        || typeof valor.Personas_idPersona !== 'number'
        || typeof valor.Circuitos_idCircuitos !== 'number'
        || typeof valor.Kartings_idKartings !== 'number'
    ) {
        throw new Error('La API de reservas no devolvió los campos requeridos por el modelo del backend')
    }

    const fechaReserva = fechaLocal(fecha)
    if (Number.isNaN(fechaReserva.getTime())) {
        throw new Error('La API devolvió una fecha de reserva inválida')
    }

    return {
        idReservas: valor.idReservas,
        fechaReserva,
        horaInicio: typeof horaInicio === 'string' ? horaTexto(horaInicio) : '',
        horaFin: typeof horaFin === 'string' ? horaTexto(horaFin) : '',
        Personas_idPersona: valor.Personas_idPersona,
        Circuitos_idCircuitos: valor.Circuitos_idCircuitos,
        Kartings_idKartings: valor.Kartings_idKartings,
        ...(typeof valor.monto === 'string' || typeof valor.monto === 'number'
            ? { monto: valor.monto }
            : {}),
    }
}

function normalizarListaReservasApi(valor: unknown): IReserva[] {
    if (!Array.isArray(valor)) {
        throw new Error('El servidor devolvió una lista de reservas inválida')
    }
    return valor.map(normalizarReservaApi)
}

function datosApi(
    datos: Partial<CreateReservaInput>,
): Record<string, string | number> {
    const cuerpo: Record<string, string | number> = {}
    if (datos.fechaReserva !== undefined) {
        cuerpo.fechaReserva = `${fechaTexto(datos.fechaReserva)}T00:00:00.000Z`
    }
    if (datos.horaInicio !== undefined && datos.horaInicio !== '') {
        cuerpo.horaInicio = horaTexto(datos.horaInicio)
    }
    if (datos.horaFin !== undefined && datos.horaFin !== '') {
        cuerpo.horaFin = horaTexto(datos.horaFin)
    }
    if (datos.Circuitos_idCircuitos !== undefined) {
        cuerpo.Circuitos_idCircuitos = datos.Circuitos_idCircuitos
    }
    if (datos.Kartings_idKartings !== undefined) {
        cuerpo.Kartings_idKartings = datos.Kartings_idKartings
    }
    if (datos.Personas_idPersona !== undefined) {
        cuerpo.Personas_idPersona = datos.Personas_idPersona
    }
    if (datos.monto !== undefined) cuerpo.monto = datos.monto
    return cuerpo
}

export async function getReservas(): Promise<IReserva[]> {
    const response = await apiFetch('/reservas')
    return normalizarListaReservasApi(await response.json())
}

// el backend saca la persona del token, por eso no recibe id
export async function getMisReservas(): Promise<IReserva[]> {
    const response = await apiFetch('/reservas/mias')
    return normalizarListaReservasApi(await response.json())
}

export async function getReserva(id: number): Promise<IReserva> {
    const response = await apiFetch(`/reservas/${id}`)
    return normalizarReservaApi(await response.json())
}

export async function createReserva(datos: CreateReservaInput): Promise<IReserva> {
    const response = await apiFetch('/reservas', {
        method: 'POST',
        body: JSON.stringify(datosApi(datos)),
    })
    return normalizarReservaApi(await response.json())
}

export async function updateReserva(id: number, datos: UpdateReservaInput): Promise<IReserva> {
    const response = await apiFetch(`/reservas/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(datosApi(datos)),
    })
    return normalizarReservaApi(await response.json())
}

export async function deleteReserva(id: number): Promise<void> {
    await apiFetch(`/reservas/${id}`, { method: 'DELETE' })
}

// desde y hasta en formato YYYY-MM-DD, ambos inclusive
export async function getReservasPorFechas(desde: string, hasta: string): Promise<IReserva[]> {
    if (desde > hasta) throw new Error('La fecha "desde" no puede ser posterior a la fecha "hasta"')
    const response = await apiFetch(`/reservas/fechas?fechaInicio=${desde}&fechaFin=${hasta}`)
    return normalizarListaReservasApi(await response.json())
}

export async function getReservasDelDia(fecha: Date): Promise<IReserva[]> {
    const dia = fechaTexto(fecha)
    return getReservasPorFechas(dia, dia)
}
