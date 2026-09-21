import type { Karting } from "../types"
import { kartings as seed } from "../data/mockData"

let kartings: Karting[] = [...seed]
let siguienteId = kartings.length + 1

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

export async function getKartings(): Promise<Karting[]> {
    await demora()
    return kartings
}

export async function getKarting(id: number): Promise<Karting> {
    await demora()
    const karting = kartings.find((k) => k.id === id)
    if (!karting) {
        throw new Error(`No existe un karting con id ${id}`)
    }
    return karting
}

export async function createKarting(datos: Omit<Karting, 'id'>): Promise<Karting> {
    await demora()
    const nuevo: Karting = { id: siguienteId, ...datos }
    siguienteId++
    kartings.push(nuevo)
    return nuevo
}

export async function updateKarting(id: number, datos: Omit<Karting, 'id'>): Promise<Karting> {
    await demora()
    const indice = kartings.findIndex((k) => k.id === id)
    if (indice === -1) {
        throw new Error(`No existe un karting con id ${id}`)
    }
    const actualizado: Karting = { id, ...datos }
    kartings[indice] = actualizado
    return actualizado
}

export async function deleteKarting(id: number): Promise<void> {
    await demora()
    const indice = kartings.findIndex((k) => k.id === id)
    if (indice === -1) {
        throw new Error(`No existe un karting con id ${id}`)
    }
    kartings.splice(indice, 1)
}
