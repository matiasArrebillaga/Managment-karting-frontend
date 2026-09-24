import type { TipoKarting } from "../types"
import { tiposKarting as seed } from "../data/mockData"
import { getKartings } from "./kartingService"

let tiposKarting: TipoKarting[] = [...seed]
let siguienteId = tiposKarting.length + 1

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

export async function getTiposKarting(): Promise<TipoKarting[]> {
    await demora()
    return tiposKarting
}

export async function getTipoKarting(id: number): Promise<TipoKarting> {
    await demora()
    const tipo = tiposKarting.find((t) => t.idTiposKarting === id)
    if (!tipo) {
        throw new Error(`No existe un tipo de karting con id ${id}`)
    }
    return tipo
}

export async function createTipoKarting(datos: Omit<TipoKarting, 'idTiposKarting'>): Promise<TipoKarting> {
    await demora()
    const nuevo: TipoKarting = { idTiposKarting: siguienteId, ...datos }
    siguienteId++
    tiposKarting.push(nuevo)
    return nuevo
}

export async function updateTipoKarting(id: number, datos: Omit<TipoKarting, 'idTiposKarting'>): Promise<TipoKarting> {
    await demora()
    const indice = tiposKarting.findIndex((t) => t.idTiposKarting === id)
    if (indice === -1) {
        throw new Error(`No existe un tipo de karting con id ${id}`)
    }
    const actualizado: TipoKarting = { idTiposKarting: id, ...datos }
    tiposKarting[indice] = actualizado
    return actualizado
}

export async function deleteTipoKarting(id: number): Promise<void> {
    await demora()
    const indice = tiposKarting.findIndex((t) => t.idTiposKarting === id)
    if (indice === -1) {
        throw new Error(`No existe un tipo de karting con id ${id}`)
    }
    const kartings = await getKartings()
    if (kartings.some((k) => k.TiposKarting_idTiposKarting === id)) {
        throw new Error('No se puede eliminar: hay kartings asociados a este tipo')
    }
    tiposKarting.splice(indice, 1)
}
