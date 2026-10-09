import type {Localidad} from '../types'
import {localidades as seed} from '../data/mockData'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

let localidades: Localidad[] = [...seed]
let siguienteId = localidades.length + 1

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

export async function getLocalidadesParaRegistro(): Promise<Localidad[]> {
    return [...seed]
}

export async function getLocalidades(): Promise<Localidad[]> {
    if (!USE_MOCKS) {
        const response = await fetch(`${API_URL}/localidades`)
        if (!response.ok) {
            const error = await response.json().catch(() => null)
            throw new Error(error?.message ?? 'No se pudieron cargar las localidades')
        }
        return response.json()
    }

    await demora()
    return localidades
}

export async function getLocalidad(id: number): Promise<Localidad> {
    await demora()
    const localidad = localidades.find((l) => l.idLocalidades === id)
    if (!localidad) {
        throw new Error(`No existe una localidad con id ${id}`)
    }
    return localidad
}

export async function createLocalidad(datos: Omit<Localidad, 'idLocalidades'>) : Promise<Localidad> {
    await demora()
    const nueva: Localidad = {idLocalidades: siguienteId, ...datos}
    siguienteId++
    localidades.push(nueva)
    return nueva
}

export async function updateLocalidad(id: number, datos: Omit<Localidad, 'idLocalidades'>) : Promise<Localidad> {
    await demora()
    const indice = localidades.findIndex((l) => l.idLocalidades === id)
    if (indice === -1) {
        throw new Error(`No existe una localidad con id ${id}`)
    }
    const actualizada: Localidad = {idLocalidades: id, ...datos}
    localidades[indice] = actualizada
    return actualizada
}

export async function deleteLocalidad(id:number): Promise<void> {
    await demora()
    const indice = localidades.findIndex((l) => l.idLocalidades === id)
    if (indice === -1) {
        throw new Error(`No existe una localidad con id ${id}`)
    }
    localidades.splice(indice,1)
}
