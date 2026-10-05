import type { Circuito, CreateReserva, CreateReservaInput, IReserva, UpdateReservaInput, Karting } from '../types'
import { getCircuitos } from './circuitoService'
import { getKartings } from './kartingService'
import { reservas as seed } from '../data/mockData'

let reservas: IReserva[] = [...seed]
let siguienteId = Math.max(0, ...reservas.map((reserva) => reserva.idReservas ?? 0)) + 1

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

function convertirFecha(valor: Date | string): Date {
    if (valor instanceof Date) {
        return new Date(valor.getFullYear(), valor.getMonth(), valor.getDate())
    }
    return new Date(`${valor.slice(0, 10)}T00:00:00`)
}

function combinarFechaHora(fecha: Date, hora: Date | string): Date {
    if (hora instanceof Date) {
        return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), hora.getHours(), hora.getMinutes(), hora.getSeconds())
    }

    const [horas, minutos, segundos = '0'] = hora.split(':')
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), Number(horas), Number(minutos), Number(segundos))
}

function normalizarReserva(datos: CreateReservaInput): CreateReserva {
    const fechaReserva = convertirFecha(datos.fechaReserva)
    return {
        ...datos,
        fechaReserva,
        horaInicio: combinarFechaHora(fechaReserva, datos.horaInicio),
        horaFin: combinarFechaHora(fechaReserva, datos.horaFin),
    }
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
    await demora()
    return reservas
}

export async function getReserva(id: number): Promise<IReserva> {
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
    const fecha = convertirFecha(fechaReserva)
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
    const fecha = convertirFecha(fechaReserva)
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
    await demora()
    const normalizada = normalizarReserva(datos)
    await validarDisponibilidad(normalizada)
    const nueva: IReserva = { idReservas: siguienteId, ...normalizada }
    siguienteId++
    reservas.push(nueva)
    return nueva
}

export async function updateReserva(id: number, datos: UpdateReservaInput): Promise<IReserva> {
    await demora()
    const indice = reservas.findIndex((item) => item.idReservas === id)
    if (indice === -1) throw new Error(`No existe una reserva con id ${id}`)

    const actual = reservas[indice]
    const fechaReserva = datos.fechaReserva === undefined ? actual.fechaReserva : convertirFecha(datos.fechaReserva)
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
    await demora()
    const indice = reservas.findIndex((item) => item.idReservas === id)
    if (indice === -1) throw new Error(`No existe una reserva con id ${id}`)
    reservas.splice(indice, 1)
}
