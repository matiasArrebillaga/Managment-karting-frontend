import type { CreateCarrera, ICarrera, Karting } from '../types'
import { carreras as seed } from '../data/mockData'
import { getKartings } from './kartingService'
import { apiFetch, demora, esObjeto, usaMocks } from './httpClient'
import { fechaLocal, fechaTexto, horaLocal, horaTexto } from '../utils/fechas'

let carreras: ICarrera[] = [...seed]
let siguienteId = Math.max(0, ...carreras.map((carrera) => carrera.idCarreras ?? 0)) + 1
const CLAVE_INSCRIPCIONES = 'karting_inscripciones_carreras'

type InscripcionCarrera = { idCarrera: number; idPersona: number; idKarting?: number }

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

function kartingsDeCarrera(carrera: ICarrera): number[] {
    return carrera.kartings ?? (carrera.Kartings_idKartings === undefined ? [] : [carrera.Kartings_idKartings])
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
    if (!usaMocks) {
        const response = await apiFetch('/carreras')
        return normalizarLista(await response.json())
    }
    await demora()
    return carreras
}

export async function getCarrerasTorneo(idTorneo: number): Promise<ICarrera[]> {
    const response = await apiFetch(`/carreras/torneo/${idTorneo}`)
    return normalizarLista(await response.json())
}

export async function getCarrera(carrera: ICarrera | number): Promise<ICarrera> {
    if (!usaMocks) {
        if (typeof carrera === 'number') {
            throw new Error('Para buscar una carrera en el backend se necesita su clave compuesta')
        }
        const response = await apiFetch(rutaCarrera(carrera))
        return normalizarCarrera(await response.json())
    }
    await demora()
    if (typeof carrera !== 'number') {
        throw new Error('En el modo de datos de prueba la carrera se busca por id numérico')
    }
    const encontrada = carreras.find((item) => item.idCarreras === carrera)
    if (!encontrada) throw new Error(`No existe una carrera con id ${carrera}`)
    return encontrada
}

export async function createCarrera(datos: CreateCarrera): Promise<ICarrera> {
    if (!usaMocks) {
        const response = await apiFetch('/carreras', {
            method: 'POST',
            body: JSON.stringify(cuerpoApi(datos)),
        })
        return normalizarCarrera(await response.json())
    }
    await demora()
    const nueva: ICarrera = {
        idCarreras: siguienteId++,
        ...datos,
        horaInicio: datos.horaInicio instanceof Date ? datos.horaInicio : horaLocal(datos.horaInicio, datos.fechaCarrera),
        horaFin: datos.horaFin instanceof Date ? datos.horaFin : horaLocal(datos.horaFin, datos.fechaCarrera),
    }
    carreras.push(nueva)
    return nueva
}

export async function updateCarrera(carrera: ICarrera, datos: CreateCarrera): Promise<ICarrera> {
    if (!usaMocks) {
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
    await demora()
    const indice = carreras.findIndex((item) => item.idCarreras === carrera.idCarreras)
    if (indice === -1) throw new Error(`No existe una carrera con id ${carrera.idCarreras}`)
    const actualizada: ICarrera = {
        ...datos,
        idCarreras: carrera.idCarreras,
        Kartings_idKartings: datos.kartings[0],
        kartings: datos.kartings,
        horaInicio: datos.horaInicio instanceof Date ? datos.horaInicio : horaLocal(datos.horaInicio, datos.fechaCarrera),
        horaFin: datos.horaFin instanceof Date ? datos.horaFin : horaLocal(datos.horaFin, datos.fechaCarrera),
    }
    carreras[indice] = actualizada
    return actualizada
}

export async function deleteCarrera(carrera: ICarrera): Promise<void> {
    if (!usaMocks) {
        await apiFetch(rutaCarrera(carrera), { method: 'DELETE' })
        return
    }
    await demora()
    const indice = carreras.findIndex((item) => item.idCarreras === carrera.idCarreras)
    if (indice === -1) throw new Error(`No existe una carrera con id ${carrera.idCarreras}`)
    carreras.splice(indice, 1)
    const inscripciones = obtenerInscripciones().filter((inscripcion) => inscripcion.idCarrera !== carrera.idCarreras)
    localStorage.setItem(CLAVE_INSCRIPCIONES, JSON.stringify(inscripciones))
}

export async function getInscripcionesCarreras(idPersona: number): Promise<number[]> {
    if (!usaMocks) return []
    await demora()
    return obtenerInscripciones()
        .filter((inscripcion) => inscripcion.idPersona === idPersona)
        .map((inscripcion) => inscripcion.idCarrera)
}

export async function getKartingsDisponiblesCarrera(idCarrera: number): Promise<Karting[]> {
    if (!usaMocks) throw new Error('La API no ofrece una ruta para consultar kartings disponibles por carrera')
    await demora()
    const carrera = carreras.find((item) => item.idCarreras === idCarrera)
    if (!carrera) throw new Error('La carrera ya no está disponible')

    const inscripciones = obtenerInscripciones()
    const kartings = await getKartings()
    return kartings.filter((karting) => (
        karting.estado.toLowerCase() === 'disponible'
        && !kartingOcupado(karting.idKartings, carrera, inscripciones)
    ))
}

export async function inscribirseEnCarrera(idCarrera: number, idPersona: number, idKarting: number): Promise<void> {
    if (!usaMocks) throw new Error('La API no ofrece una ruta para inscribirse a una carrera')
    await demora()
    const carrera = carreras.find((item) => item.idCarreras === idCarrera)
    if (!carrera) throw new Error('La carrera ya no está disponible')

    const kartings = await getKartings()
    const karting = kartings.find((item) => item.idKartings === idKarting)
    if (!karting || karting.estado.toLowerCase() !== 'disponible') {
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
    if (!usaMocks) throw new Error('La API no ofrece una ruta para cancelar una inscripción a una carrera')
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
        return otraCarrera
            ? kartingsDeCarrera(otraCarrera).includes(idKarting) && seSuperponen(carrera, otraCarrera)
            : false
    })
}
