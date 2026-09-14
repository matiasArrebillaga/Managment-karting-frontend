import type {Localidad} from '../types'
import {localidades as seed} from '../data/mockData'

let localidades: Localidad[] = [...seed]
let siguienteId = localidades.length + 1

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

export async function getLocalidades(): Promise<Localidad[]> {
    await demora()
    return localidades
}

export async function getLocalidad(id: number): Promise<Localidad> {
    await demora()
    const localidad = localidades.find((l) => l.id === id)
    if (!localidad) {
        throw new Error(`No existe una localidad con id ${id}`)
    }
    return localidad
}

export async function createLocalidad(datos: Omit<Localidad, 'id'>) : Promise<Localidad> {
    await demora()
    const nueva: Localidad = {id: siguienteId, ...datos}
    siguienteId++
    localidades.push(nueva)
    return nueva
}

export async function updateLocalidad(id: number, datos: Omit<Localidad, 'id'>) : Promise<Localidad> {
    await demora()
    const indice = localidades.findIndex((l) => l.id === id)
    if (indice === -1) {
        throw new Error(`No existe una localidad con id ${id}`)
    }
    const actualizada: Localidad = {id, ...datos}
    localidades[indice] = actualizada
    return actualizada
}

export async function deleteLocalidad(id:number): Promise<void> {
    await demora()
    const indice = localidades.findIndex((l) => l.id === id)
    if (indice === -1) {
        throw new Error(`No existe una localidad con id ${id}`)
    }
    localidades.splice(indice,1)
} 
