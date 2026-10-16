import type { TipoKarting } from "../types"
import { apiFetch, esObjeto } from "./httpClient"

function normalizarTipo(valor: unknown): TipoKarting {
    // precioHora es Decimal en la base: Prisma lo serializa como string
    const precioHora = esObjeto(valor) ? Number(valor.precioHora) : NaN
    if (
        !esObjeto(valor)
        || typeof valor.idTiposKarting !== 'number'
        || typeof valor.nombre !== 'string'
        || typeof valor.descripcion !== 'string'
        || typeof valor.TiposLicencias_idTipoLicenciaMinima !== 'number'
        || !Number.isFinite(precioHora)
    ) {
        throw new Error('La API devolvió un tipo de karting con un formato inválido')
    }
    return {
        idTiposKarting: valor.idTiposKarting,
        nombre: valor.nombre,
        descripcion: valor.descripcion,
        TiposLicencias_idTipoLicenciaMinima: valor.TiposLicencias_idTipoLicenciaMinima,
        precioHora,
    }
}

function validarDatos(datos: Omit<TipoKarting, 'idTiposKarting'>): Omit<TipoKarting, 'idTiposKarting'> {
    const nombre = datos.nombre.trim()
    const descripcion = datos.descripcion.trim()
    if (!nombre || nombre.length > 45) throw new Error('El nombre debe tener entre 1 y 45 caracteres')
    if (!descripcion || descripcion.length > 45) throw new Error('La descripción debe tener entre 1 y 45 caracteres')
    if (!Number.isFinite(datos.precioHora) || datos.precioHora <= 0) throw new Error('El precio por hora debe ser un número mayor que cero')
    if (!datos.TiposLicencias_idTipoLicenciaMinima) throw new Error('Elegí la licencia mínima requerida')
    return { ...datos, nombre, descripcion }
}

export async function getTiposKarting(): Promise<TipoKarting[]> {
    const response = await apiFetch('/tiposKartings')
    const valor: unknown = await response.json()
    if (!Array.isArray(valor)) {
        throw new Error('La API devolvió una lista de tipos de karting inválida')
    }
    return valor.map(normalizarTipo)
}

export async function getTipoKarting(id: number): Promise<TipoKarting> {
    const response = await apiFetch(`/tiposKartings/${id}`)
    return normalizarTipo(await response.json())
}

export async function createTipoKarting(datos: Omit<TipoKarting, 'idTiposKarting'>): Promise<TipoKarting> {
    const limpios = validarDatos(datos)
    const response = await apiFetch('/tiposKartings', {
        method: 'POST',
        body: JSON.stringify(limpios),
    })
    return normalizarTipo(await response.json())
}

export async function updateTipoKarting(id: number, datos: Omit<TipoKarting, 'idTiposKarting'>): Promise<TipoKarting> {
    const limpios = validarDatos(datos)
    const response = await apiFetch(`/tiposKartings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(limpios),
    })
    return normalizarTipo(await response.json())
}

export async function deleteTipoKarting(id: number): Promise<void> {
    // si hay kartings de este tipo, el backend rechaza el borrado
    await apiFetch(`/tiposKartings/${id}`, { method: 'DELETE' })
}
