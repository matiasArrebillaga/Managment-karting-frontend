import type { CreateCarrera, ICarrera, Karting } from '../types'
import { carreras as seed } from '../data/mockData'
import { getKartings } from './kartingService'
import { apiFetch, usaMocks } from './httpClient'

let carreras: ICarrera[] = [...seed]
let siguienteId = Math.max(0, ...carreras.map((carrera) => carrera.idCarreras ?? 0)) + 1
const CLAVE_INSCRIPCIONES = 'karting_inscripciones_carreras'

type InscripcionCarrera = { idCarrera: number; idPersona: number; idKarting?: number }
type CarreraApi = Record<string, unknown>

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

function aFechaLocal(valor: string): Date {
    return new Date(`${valor.slice(0, 10)}T00:00:00`)
}

function fechaApi(fecha: Date): string {
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
}

function horaApi(fecha: Date | string): string {
    if (typeof fecha === 'string') return fecha.slice(0, 5)
    return `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`
}

function horaLocalApi(valor: string, fecha: Date): Date {
    const hora = valor.includes('T') ? valor.slice(valor.indexOf('T') + 1, valor.indexOf('T') + 9) : valor.slice(0, 8)
    return new Date(`${fechaApi(fecha)}T${hora}`)
}

function fechaHoraApi(fecha: Date, hora: Date | string): string {
    return `${fechaApi(fecha)}T${horaApi(hora)}:00.000Z`
}

function esObjeto(valor: unknown): valor is CarreraApi {
    return typeof valor === 'object' && valor !== null
}

function normalizarCarrera(valor: unknown): ICarrera {
    if (
        !esObjeto(valor)
        || typeof valor.fechaCarrera !== 'string'
        || typeof valor.horaInicio !== 'string'
        || typeof valor.horaFin !== 'string'
        || typeof valor.Kartings_idKartings !== 'number'
        || typeof valor.Torneos_idTorneos !== 'number'
        || typeof valor.Circuitos_idCircuitos !== 'number'
    ) {
        throw new Error('La API devolvió una carrera con un formato inválido')
    }

    const fechaCarrera = aFechaLocal(valor.fechaCarrera)
    const horaInicio = horaLocalApi(valor.horaInicio, fechaCarrera)
    const horaFin = horaLocalApi(valor.horaFin, fechaCarrera)
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
        Kartings_idKartings: valor.Kartings_idKartings,
        Torneos_idTorneos: valor.Torneos_idTorneos,
        Circuitos_idCircuitos: valor.Circuitos_idCircuitos,
    }
}

function normalizarLista(valor: unknown): ICarrera[] {
    if (!Array.isArray(valor)) throw new Error('La API devolvió una lista de carreras inválida')
    return valor.map(normalizarCarrera)
}

function rutaCarrera(carrera: ICarrera): string {
    if (carrera.Kartings_idKartings === undefined) {
        throw new Error('La carrera no tiene un karting asociado y no se puede identificar en el backend')
    }
    return `/carreras/${fechaApi(carrera.fechaCarrera)}/${carrera.Kartings_idKartings}/${carrera.Torneos_idTorneos}/${carrera.Circuitos_idCircuitos}`
}

function cuerpoApi(datos: CreateCarrera): Record<string, string | number> {
    return {
        fechaCarrera: fechaApi(datos.fechaCarrera),
        horaInicio: fechaHoraApi(datos.fechaCarrera, datos.horaInicio),
        horaFin: fechaHoraApi(datos.fechaCarrera, datos.horaFin),
        Kartings_idKartings: datos.Kartings_idKartings,
        Torneos_idTorneos: datos.Torneos_idTorneos,
        Circuitos_idCircuitos: datos.Circuitos_idCircuitos,
    }
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
        horaInicio: datos.horaInicio instanceof Date ? datos.horaInicio : new Date(`${fechaApi(datos.fechaCarrera)}T${datos.horaInicio}:00`),
        horaFin: datos.horaFin instanceof Date ? datos.horaFin : new Date(`${fechaApi(datos.fechaCarrera)}T${datos.horaFin}:00`),
    }
    carreras.push(nueva)
    return nueva
}

export async function updateCarrera(carrera: ICarrera, datos: CreateCarrera): Promise<ICarrera> {
    if (!usaMocks) {
        const response = await apiFetch(rutaCarrera(carrera), {
            method: 'PUT',
            body: JSON.stringify({
                horaInicio: fechaHoraApi(carrera.fechaCarrera, datos.horaInicio),
                horaFin: fechaHoraApi(carrera.fechaCarrera, datos.horaFin),
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
        horaInicio: datos.horaInicio instanceof Date ? datos.horaInicio : new Date(`${fechaApi(datos.fechaCarrera)}T${datos.horaInicio}:00`),
        horaFin: datos.horaFin instanceof Date ? datos.horaFin : new Date(`${fechaApi(datos.fechaCarrera)}T${datos.horaFin}:00`),
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
        return otraCarrera ? seSuperponen(carrera, otraCarrera) : false
    })
}
