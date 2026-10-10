import type { Karting } from "../types"
import { kartings as seed } from "../data/mockData"
import { apiFetch, usaMocks } from "./httpClient"

let kartings: Karting[] = [...seed]
let siguienteId = kartings.length + 1

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

function esObjeto(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === 'object' && valor !== null
}

function normalizarKarting(valor: unknown): Karting {
    if (
        !esObjeto(valor)
        || typeof valor.idKartings !== 'number'
        || typeof valor.categoria !== 'string'
        || typeof valor.modelo !== 'string'
        || typeof valor.estado !== 'string'
        || typeof valor.fechaAdquisicion !== 'string'
        || typeof valor.TiposKarting_idTiposKarting !== 'number'
    ) {
        throw new Error('La API devolvió un karting con un formato inválido')
    }

    const fechaAdquisicion = valor.fechaAdquisicion.slice(0, 10)
    if (Number.isNaN(new Date(`${fechaAdquisicion}T00:00:00`).getTime())) {
        throw new Error('La API devolvió una fecha de adquisición inválida')
    }

    return {
        idKartings: valor.idKartings,
        categoria: valor.categoria,
        modelo: valor.modelo,
        estado: valor.estado,
        fechaAdquisicion,
        TiposKarting_idTiposKarting: valor.TiposKarting_idTiposKarting,
    }
}

function normalizarLista(valor: unknown): Karting[] {
    if (!Array.isArray(valor)) {
        throw new Error('La API devolvió una lista de kartings inválida')
    }
    return valor.map(normalizarKarting)
}

function validarDatos(datos: Omit<Karting, 'idKartings'>): void {
    if (!datos.categoria.trim() || !datos.modelo.trim() || !datos.estado.trim()) {
        throw new Error('Completá la categoría, el modelo y el estado del karting')
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fechaAdquisicion)) {
        throw new Error('Ingresá una fecha de adquisición válida')
    }
    if (!Number.isInteger(datos.TiposKarting_idTiposKarting) || datos.TiposKarting_idTiposKarting <= 0) {
        throw new Error('Seleccioná un tipo de karting válido')
    }
}

export async function getKartings(): Promise<Karting[]> {
    if (!usaMocks) {
        const response = await apiFetch('/kartings')
        return normalizarLista(await response.json())
    }
    await demora()
    return kartings
}

export async function getKarting(id: number): Promise<Karting> {
    if (!usaMocks) {
        const response = await apiFetch(`/kartings/${id}`)
        return normalizarKarting(await response.json())
    }
    await demora()
    const karting = kartings.find((k) => k.idKartings === id)
    if (!karting) {
        throw new Error(`No existe un karting con id ${id}`)
    }
    return karting
}

export async function createKarting(datos: Omit<Karting, 'idKartings'>): Promise<Karting> {
    validarDatos(datos)
    if (!usaMocks) {
        const response = await apiFetch('/kartings', {
            method: 'POST',
            body: JSON.stringify(datos),
        })
        return normalizarKarting(await response.json())
    }
    await demora()
    const nuevo: Karting = { idKartings: siguienteId, ...datos }
    siguienteId++
    kartings.push(nuevo)
    return nuevo
}

export async function updateKarting(id: number, datos: Omit<Karting, 'idKartings'>): Promise<Karting> {
    validarDatos(datos)
    if (!usaMocks) {
        const response = await apiFetch(`/kartings/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                ...datos,
                fechaAdquisicion: new Date(`${datos.fechaAdquisicion}T00:00:00.000Z`).toISOString(),
            }),
        })
        return normalizarKarting(await response.json())
    }
    await demora()
    const indice = kartings.findIndex((k) => k.idKartings === id)
    if (indice === -1) {
        throw new Error(`No existe un karting con id ${id}`)
    }
    const actualizado: Karting = { idKartings: id, ...datos }
    kartings[indice] = actualizado
    return actualizado
}

export async function deleteKarting(id: number): Promise<void> {
    if (!usaMocks) {
        await apiFetch(`/kartings/${id}`, { method: 'DELETE' })
        return
    }
    await demora()
    const indice = kartings.findIndex((k) => k.idKartings === id)
    if (indice === -1) {
        throw new Error(`No existe un karting con id ${id}`)
    }
    kartings.splice(indice, 1)
}
