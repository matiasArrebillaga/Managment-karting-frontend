import type { Circuito, CreateReserva, CreateReservaInput, IReserva, UpdateReservaInput, Karting } from '../types'
import { getCircuitos } from './circuitoService'
import { getKartings } from './kartingService'
import { reservas as seed } from '../data/mockData'
import { apiFetch, demora, esObjeto, usaMocks } from './httpClient'
import { fechaLocal, fechaTexto, horaTexto } from '../utils/fechas'

let reservas: IReserva[] = [...seed]
let siguienteId = Math.max(0, ...reservas.map((reserva) => reserva.idReservas ?? 0)) + 1

function combinarFechaHora(fecha: Date, hora: Date | string): Date {
    if (hora instanceof Date) {
        return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), hora.getHours(), hora.getMinutes(), hora.getSeconds())
    }

    const [horas, minutos, segundos = '0'] = hora.split(':')
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), Number(horas), Number(minutos), Number(segundos))
}

function normalizarReserva(datos: CreateReservaInput): CreateReserva {
    const fechaReserva = fechaLocal(datos.fechaReserva)
    return {
        ...datos,
        fechaReserva,
        horaInicio: combinarFechaHora(fechaReserva, datos.horaInicio),
        horaFin: combinarFechaHora(fechaReserva, datos.horaFin),
    }
}

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

type RangoReserva = Pick<IReserva, 'horaInicio' | 'horaFin'>

function seSuperponen(reservaA: RangoReserva, reservaB: RangoReserva): boolean {
    return reservaA.horaInicio < reservaB.horaFin && reservaB.horaInicio < reservaA.horaFin
}

async function validarDisponibilidad(reserva: CreateReserva, idIgnorado?: number): Promise<void> {
    if (reserva.horaFin <= reserva.horaInicio) {
        throw new Error('La hora de fin debe ser posterior a la hora de inicio')
    }

    const [kartings, circuitos] = await Promise.all([getKartings(), getCircuitos()])
    const karting = kartings.find((item) => item.idKartings === reserva.Kartings_idKartings)
    if (!karting) throw new Error('No existe el karting seleccionado')
    if (karting.estado !== 'Disponible') throw new Error('El karting seleccionado no está disponible')

    const circuito = circuitos.find((item) => item.idCircuitos === reserva.Circuitos_idCircuitos)
    if (!circuito) throw new Error('No existe el circuito seleccionado')

    const otrasReservas = reservas.filter((item) => item.idReservas !== idIgnorado && seSuperponen(item, reserva))
    if (otrasReservas.some((item) => item.Kartings_idKartings === reserva.Kartings_idKartings)) {
        throw new Error('El karting ya está reservado en ese horario')
    }
    if (otrasReservas.some((item) => item.Personas_idPersona === reserva.Personas_idPersona)) {
        throw new Error('La persona ya tiene una reserva en ese horario')
    }
    const reservasEnCircuito = otrasReservas.filter((item) => item.Circuitos_idCircuitos === reserva.Circuitos_idCircuitos)
    if (reservasEnCircuito.length >= circuito.maximo) {
        throw new Error('El circuito alcanzó su capacidad para ese horario')
    }
}

export async function getReservas(): Promise<IReserva[]> {
    if (!usaMocks) {
        const response = await apiFetch('/reservas')
        return normalizarListaReservasApi(await response.json())
    }
    await demora()
    return reservas
}

export async function getMisReservas(idPersona?: number): Promise<IReserva[]> {
    if (!usaMocks) {
        if (idPersona === undefined) {
            throw new Error('No se pudo identificar la persona para consultar sus reservas')
        }
        const response = await apiFetch('/reservas/mias')
        return normalizarListaReservasApi(await response.json())
    }
    await demora()
    return reservas.filter((reserva) => reserva.Personas_idPersona === idPersona)
}

export async function getReserva(id: number): Promise<IReserva> {
    if (!usaMocks) {
        const response = await apiFetch(`/reservas/${id}`)
        return normalizarReservaApi(await response.json())
    }
    await demora()
    const reserva = reservas.find((item) => item.idReservas === id)
    if (!reserva) throw new Error(`No existe una reserva con id ${id}`)
    return reserva
}

export async function getKartingsDisponiblesReserva(
    fechaReserva: Date | string,
    horaInicio: Date | string,
    horaFin: Date | string,
    idReservaIgnorada?: number,
): Promise<Karting[]> {
    await demora()
    const fecha = fechaLocal(fechaReserva)
    const horario = {
        fechaReserva: fecha,
        horaInicio: combinarFechaHora(fecha, horaInicio),
        horaFin: combinarFechaHora(fecha, horaFin),
    }
    const reservados = reservas.filter((reserva) => (
        reserva.idReservas !== idReservaIgnorada && seSuperponen(reserva, horario)
    ))
    const kartings = await getKartings()
    return kartings.filter((karting) => (
        karting.estado === 'Disponible' && !reservados.some((reserva) => reserva.Kartings_idKartings === karting.idKartings)
    ))
}

export async function getCircuitosDisponiblesReserva(
    fechaReserva: Date | string,
    horaInicio: Date | string,
    horaFin: Date | string,
    idReservaIgnorada?: number,
): Promise<Circuito[]> {
    await demora()
    const fecha = fechaLocal(fechaReserva)
    const horario = {
        horaInicio: combinarFechaHora(fecha, horaInicio),
        horaFin: combinarFechaHora(fecha, horaFin),
    }
    const circuitos = await getCircuitos()
    const otrasReservas = reservas.filter((reserva) => (
        reserva.idReservas !== idReservaIgnorada && seSuperponen(reserva, horario)
    ))

    return circuitos.filter((circuito) => (
        otrasReservas.filter((reserva) => reserva.Circuitos_idCircuitos === circuito.idCircuitos).length < circuito.maximo
    ))
}

export async function createReserva(datos: CreateReservaInput): Promise<IReserva> {
    if (!usaMocks) {
        const response = await apiFetch('/reservas', {
            method: 'POST',
            body: JSON.stringify(datosApi(datos)),
        })
        return normalizarReservaApi(await response.json())
    }
    await demora()
    const normalizada = normalizarReserva(datos)
    await validarDisponibilidad(normalizada)
    const nueva: IReserva = { idReservas: siguienteId, ...normalizada }
    siguienteId++
    reservas.push(nueva)
    return nueva
}

export async function updateReserva(id: number, datos: UpdateReservaInput): Promise<IReserva> {
    if (!usaMocks) {
        const response = await apiFetch(`/reservas/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(datosApi(datos)),
        })
        return normalizarReservaApi(await response.json())
    }
    await demora()
    const indice = reservas.findIndex((item) => item.idReservas === id)
    if (indice === -1) throw new Error(`No existe una reserva con id ${id}`)

    const actual = reservas[indice]
    const fechaReserva = datos.fechaReserva === undefined ? actual.fechaReserva : fechaLocal(datos.fechaReserva)
    const horaInicio = datos.horaInicio === undefined
        ? combinarFechaHora(fechaReserva, actual.horaInicio)
        : combinarFechaHora(fechaReserva, datos.horaInicio)
    const horaFin = datos.horaFin === undefined
        ? combinarFechaHora(fechaReserva, actual.horaFin)
        : combinarFechaHora(fechaReserva, datos.horaFin)
    const actualizada: IReserva = {
        ...actual,
        ...datos,
        fechaReserva,
        horaInicio,
        horaFin,
        idReservas: id,
    }

    const { idReservas: _idReservas, ...datosParaValidar } = actualizada
    await validarDisponibilidad(datosParaValidar, id)
    reservas[indice] = actualizada
    return actualizada
}

export async function deleteReserva(id: number): Promise<void> {
    if (!usaMocks) {
        await apiFetch(`/reservas/${id}`, { method: 'DELETE' })
        return
    }
    await demora()
    const indice = reservas.findIndex((item) => item.idReservas === id)
    if (indice === -1) throw new Error(`No existe una reserva con id ${id}`)
    reservas.splice(indice, 1)
}

// desde y hasta en formato YYYY-MM-DD, ambos inclusive
export async function getReservasPorFechas(desde: string, hasta: string): Promise<IReserva[]> {
    if (desde > hasta) throw new Error('La fecha "desde" no puede ser posterior a la fecha "hasta"')
    if (!usaMocks) {
        const response = await apiFetch(`/reservas/fechas?fechaInicio=${desde}&fechaFin=${hasta}`)
        return normalizarListaReservasApi(await response.json())
    }
    await demora()
    return reservas.filter((reserva) => {
        const dia = fechaTexto(reserva.fechaReserva)
        return dia >= desde && dia <= hasta
    })
}

export async function getReservasDelDia(fecha: Date): Promise<IReserva[]> {
    const dia = fechaTexto(fecha)
    return getReservasPorFechas(dia, dia)
}
