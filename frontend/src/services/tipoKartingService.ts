import type { TipoKarting } from "../types"
import { tiposKarting as seed } from "../data/mockData"
import { getKartings } from "./kartingService"
import { apiFetch, usaMocks } from "./httpClient"

let tiposKarting: TipoKarting[] = [...seed]
let siguienteId = tiposKarting.length + 1

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

function esObjeto(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === 'object' && valor !== null
}

function normalizarTipo(valor: unknown): TipoKarting {
    if (
        !esObjeto(valor)
        || typeof valor.idTiposKarting !== 'number'
        || typeof valor.nombre !== 'string'
        || typeof valor.descripcion !== 'string'
        || typeof valor.TiposLicencias_idTipoLicenciaMinima !== 'number'
    ) {
        throw new Error('La API devolvió un tipo de karting con un formato inválido')
    }
    return {
        idTiposKarting: valor.idTiposKarting,
        nombre: valor.nombre,
        descripcion: valor.descripcion,
        TiposLicencias_idTipoLicenciaMinima: valor.TiposLicencias_idTipoLicenciaMinima,
    }
}

export async function getTiposKarting(): Promise<TipoKarting[]> {
    if (!usaMocks) {
        const response = await apiFetch('/tiposKartings')
        const valor: unknown = await response.json()
        if (!Array.isArray(valor)) {
            throw new Error('La API devolvió una lista de tipos de karting inválida')
        }
        return valor.map(normalizarTipo)
    }
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
