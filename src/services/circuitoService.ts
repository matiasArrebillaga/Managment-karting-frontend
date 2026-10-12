import type { Circuito } from "../types"
import { circuitos as seed } from "../data/mockData"
import { apiFetch, usaMocks } from "./httpClient"

let circuitos: Circuito[] = [...seed]
let siguienteId = circuitos.length + 1

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

function esObjeto(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === 'object' && valor !== null
}

function normalizarCircuito(valor: unknown): Circuito {
    if (
        !esObjeto(valor)
        || typeof valor.idCircuitos !== 'number'
        || typeof valor.distancia !== 'number'
        || typeof valor.dificultad !== 'string'
        || typeof valor.maximo !== 'number'
    ) {
        throw new Error('La API devolvió un circuito con un formato inválido')
    }
    return {
        idCircuitos: valor.idCircuitos,
        distancia: valor.distancia,
        dificultad: valor.dificultad,
        maximo: valor.maximo,
    }
}

function normalizarLista(valor: unknown): Circuito[] {
    if (!Array.isArray(valor)) {
        throw new Error('La API devolvió una lista de circuitos inválida')
    }
    return valor.map(normalizarCircuito)
}

function validarDatos(datos: Omit<Circuito, 'idCircuitos'>): void {
    if (!Number.isInteger(datos.distancia) || datos.distancia <= 0) {
        throw new Error('La distancia debe ser un número entero mayor que cero')
    }
    if (!datos.dificultad.trim()) {
        throw new Error('Seleccioná la dificultad del circuito')
    }
    if (!Number.isInteger(datos.maximo) || datos.maximo <= 0) {
        throw new Error('La capacidad máxima debe ser un número entero mayor que cero')
    }
}

export async function getCircuitos(): Promise<Circuito[]> {
    if (!usaMocks) {
        const response = await apiFetch('/circuitos')
        return normalizarLista(await response.json())
    }
    await demora()
    return circuitos
}

export async function getCircuito(id: number): Promise<Circuito> {
    if (!usaMocks) {
        const response = await apiFetch(`/circuitos/${id}`)
        return normalizarCircuito(await response.json())
    }
    await demora()
    const circuito = circuitos.find((c) => c.idCircuitos === id)
    if (!circuito) {
        throw new Error(`No existe un circuito con id ${id}`)
    }
    return circuito
}

export async function createCircuito(datos: Omit<Circuito, 'idCircuitos'>): Promise<Circuito> {
    validarDatos(datos)
    if (!usaMocks) {
        const response = await apiFetch('/circuitos', {
            method: 'POST',
            body: JSON.stringify(datos),
        })
        return normalizarCircuito(await response.json())
    }
    await demora()
    const nuevo: Circuito = { idCircuitos: siguienteId, ...datos }
    siguienteId++
    circuitos.push(nuevo)
    return nuevo
}

export async function updateCircuito(id: number, datos: Omit<Circuito, 'idCircuitos'>): Promise<Circuito> {
    validarDatos(datos)
    if (!usaMocks) {
        const response = await apiFetch(`/circuitos/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(datos),
        })
        return normalizarCircuito(await response.json())
    }
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
    if (!usaMocks) {
        await apiFetch(`/circuitos/${id}`, { method: 'DELETE' })
        return
    }
    await demora()
    const indice = circuitos.findIndex((c) => c.idCircuitos === id)
    if (indice === -1) {
        throw new Error(`No existe un circuito con id ${id}`)
    }
    circuitos.splice(indice, 1)
}
