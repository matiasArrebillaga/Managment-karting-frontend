import type { Circuito } from "../types"
import { circuitos as seed } from "../data/mockData"

let circuitos: Circuito[] = [...seed]
let siguienteId = circuitos.length + 1

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

export async function getCircuitos(): Promise<Circuito[]> {
    await demora()
    return circuitos
}

export async function getCircuito(id: number): Promise<Circuito> {
    await demora()
    const circuito = circuitos.find((c) => c.idCircuitos === id)
    if (!circuito) {
        throw new Error(`No existe un circuito con id ${id}`)
    }
    return circuito
}

export async function createCircuito(datos: Omit<Circuito, 'idCircuitos'>): Promise<Circuito> {
    await demora()
    const nuevo: Circuito = { idCircuitos: siguienteId, ...datos }
    siguienteId++
    circuitos.push(nuevo)
    return nuevo
}

export async function updateCircuito(id: number, datos: Omit<Circuito, 'idCircuitos'>): Promise<Circuito> {
    await demora()
    const indice = circuitos.findIndex((c) => c.idCircuitos === id)
    if (indice === -1) {
        throw new Error(`No existe un circuito con id ${id}`)
    }
    const actualizado: Circuito = { idCircuitos: id, ...datos }
    circuitos[indice] = actualizado
    return actualizado
}

export async function deleteCircuito(id: number): Promise<void> {
    await demora()
    const indice = circuitos.findIndex((c) => c.idCircuitos === id)
    if (indice === -1) {
        throw new Error(`No existe un circuito con id ${id}`)
    }
    circuitos.splice(indice, 1)
}
