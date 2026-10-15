import type { DatosRegistro, Persona, Rol, RolDetalle } from "../types"
import { personas as seed, roles as rolesSeed } from "../data/mockData"
import { apiFetch, usaMocks } from "./httpClient"

let personas: Persona[] = [...seed]
let siguienteId = personas.length + 1

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

// Sin contraseña: en una edición vacía significa "no cambiarla"
export type DatosPersona = Omit<DatosRegistro, 'contraseña'> & { contraseña?: string }

function limpiar(datos: DatosPersona): DatosPersona {
    return {
        ...datos,
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        dni: datos.dni.trim(),
        mail: datos.mail.trim(),
        telefono: datos.telefono.trim(),
        contraseña: datos.contraseña || undefined,
    }
}

function idRolDe(nombre: Rol): number {
    return rolesSeed.find((rol) => rol.nombre === nombre)!.idRol
}

export async function getPersonas(): Promise<Persona[]> {
    if (!usaMocks) {
        const response = await apiFetch('/personas')
        return response.json() as Promise<Persona[]>
    }
    await demora()
    return personas
}

// GET /roles es solo ADMIN: se usa para mostrar el nombre del rol (GET /personas solo manda idRol)
export async function getRoles(): Promise<RolDetalle[]> {
    if (!usaMocks) {
        const response = await apiFetch('/roles')
        return response.json() as Promise<RolDetalle[]>
    }
    return rolesSeed
}

// CLIENTE -> POST /personas, EMPLEADO -> POST /personas/empleado
export async function createPersona(datos: DatosRegistro, tipo: 'CLIENTE' | 'EMPLEADO'): Promise<Persona> {
    const cuerpo = limpiar(datos)
    if (!usaMocks) {
        const response = await apiFetch(tipo === 'EMPLEADO' ? '/personas/empleado' : '/personas', {
            method: 'POST',
            body: JSON.stringify(cuerpo),
        })
        return response.json() as Promise<Persona>
    }
    await demora()
    if (personas.some((p) => p.mail === cuerpo.mail)) throw new Error('El mail ya está registrado')
    const { contraseña: _, ...resto } = cuerpo
    const nueva: Persona = { ...resto, idPersona: siguienteId++, idRol: idRolDe(tipo) }
    personas.push(nueva)
    return nueva
}

export async function updatePersona(id: number, datos: DatosPersona): Promise<void> {
    const cuerpo = limpiar(datos)
    if (!usaMocks) {
        await apiFetch(`/personas/${id}`, { method: 'PATCH', body: JSON.stringify(cuerpo) })
        return
    }
    await demora()
    const { contraseña: _, ...resto } = cuerpo
    personas = personas.map((p) => (p.idPersona === id ? { ...p, ...resto } : p))
}

export async function asignarRol(id: number, nombreRol: Rol): Promise<void> {
    if (!usaMocks) {
        await apiFetch(`/personas/${id}/rol`, { method: 'POST', body: JSON.stringify({ nombreRol }) })
        return
    }
    await demora()
    personas = personas.map((p) => (p.idPersona === id ? { ...p, idRol: idRolDe(nombreRol) } : p))
}

export async function deletePersona(id: number): Promise<void> {
    if (!usaMocks) {
        await apiFetch(`/personas/${id}`, { method: 'DELETE' })
        return
    }
    await demora()
    personas = personas.filter((p) => p.idPersona !== id)
}
