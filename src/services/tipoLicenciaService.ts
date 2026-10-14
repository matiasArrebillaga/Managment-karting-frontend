import type { TipoLicencia } from "../types"
import { tiposLicencia as seed } from "../data/mockData"
import { getTiposKarting } from "./tipoKartingService"
import { getLicencias } from "./licenciaService"
import { apiFetch, usaMocks } from "./httpClient"

let tiposLicencia: TipoLicencia[] = [...seed]
let siguienteId = tiposLicencia.length + 1

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

function esObjeto(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === 'object' && valor !== null
}

function normalizarTipo(valor: unknown): TipoLicencia {
    if (
        !esObjeto(valor)
        || typeof valor.idTipoLicencia !== 'number'
        || typeof valor.nombre !== 'string'
        || typeof valor.descripcion !== 'string'
        || typeof valor.nivel !== 'number'
    ) {
        throw new Error('La API devolvió un tipo de licencia con un formato inválido')
    }
    return {
        idTipoLicencia: valor.idTipoLicencia,
        nombre: valor.nombre,
        descripcion: valor.descripcion,
        nivel: valor.nivel,
    }
}

function validarDatos(datos: Omit<TipoLicencia, 'idTipoLicencia'>): Omit<TipoLicencia, 'idTipoLicencia'> {
    const nombre = datos.nombre.trim()
    const descripcion = datos.descripcion.trim()
    if (!nombre || nombre.length > 45) throw new Error('El nombre debe tener entre 1 y 45 caracteres')
    if (!descripcion || descripcion.length > 45) throw new Error('La descripción debe tener entre 1 y 45 caracteres')
    if (!Number.isInteger(datos.nivel) || datos.nivel <= 0) throw new Error('El nivel debe ser un número entero positivo')
    return { nombre, descripcion, nivel: datos.nivel }
}

export async function getTiposLicencia(): Promise<TipoLicencia[]> {
    if (!usaMocks) {
        const response = await apiFetch('/tiposLicencias')
        const valor: unknown = await response.json()
        if (!Array.isArray(valor)) {
            throw new Error('La API devolvió una lista de tipos de licencia inválida')
        }
        return valor.map(normalizarTipo)
    }
    await demora()
    return tiposLicencia
}

export async function getTipoLicencia(id: number): Promise<TipoLicencia> {
    if (!usaMocks) {
        const response = await apiFetch(`/tiposLicencias/${id}`)
        return normalizarTipo(await response.json())
    }
    await demora()
    const tipo = tiposLicencia.find((t) => t.idTipoLicencia === id)
    if (!tipo) {
        throw new Error(`No existe un tipo de licencia con id ${id}`)
    }
    return tipo
}

export async function createTipoLicencia(datos: Omit<TipoLicencia, 'idTipoLicencia'>) : Promise<TipoLicencia> {
    const limpios = validarDatos(datos)
    if (!usaMocks) {
        const response = await apiFetch('/tiposLicencias', {
            method: 'POST',
            body: JSON.stringify(limpios),
        })
        return normalizarTipo(await response.json())
    }
    await demora()
    const nueva: TipoLicencia = {idTipoLicencia: siguienteId, ...limpios}
    siguienteId++
    tiposLicencia.push(nueva)
    return nueva
}

export async function updateTipoLicencia(id: number, datos: Omit<TipoLicencia, 'idTipoLicencia'>) : Promise<TipoLicencia> {
    const limpios = validarDatos(datos)
    if (!usaMocks) {
        const response = await apiFetch(`/tiposLicencias/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(limpios),
        })
        return normalizarTipo(await response.json())
    }
    await demora()
    const indice = tiposLicencia.findIndex((t) => t.idTipoLicencia === id)
    if (indice === -1) {
        throw new Error(`No existe un tipo de licencia con id ${id}`)
    }
    const actualizada: TipoLicencia = {idTipoLicencia: id, ...limpios}
    tiposLicencia[indice] = actualizada
    return actualizada
}

export async function deleteTipoLicencia(id: number): Promise<void> {
    if (!usaMocks) {
        // si hay tipos de karting, licencias o torneos que lo usan, el backend rechaza el borrado
        await apiFetch(`/tiposLicencias/${id}`, { method: 'DELETE' })
        return
    }
    await demora()
    const indice = tiposLicencia.findIndex((t) => t.idTipoLicencia === id)
    if (indice === -1) {
        throw new Error(`No existe un tipo de licencia con id ${id}`)
    }
    const [tiposKarting, licencias] = await Promise.all([getTiposKarting(), getLicencias()])
    if (tiposKarting.some((t) => t.TiposLicencias_idTipoLicenciaMinima === id)) {
        throw new Error('No se puede eliminar: hay tipos de karting que la requieren como licencia minima')
    }
    if (licencias.some((l) => l.TiposLicencias_idTipoLicencia === id)) {
        throw new Error('No se puede eliminar: hay licencias asociadas a este tipo')
    }
    tiposLicencia.splice(indice,1)
}
