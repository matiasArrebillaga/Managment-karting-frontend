import type { Persona } from "../types"
import { personas as seed } from "../data/mockData"
import { apiFetch, usaMocks } from "./httpClient"

// Version minima: solo lectura, para poblar el desplegable de titular en Licencia.
// El CRUD completo de Persona (con localidad, rol y alta desde /register) queda pendiente.

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

export async function getPersonas(): Promise<Persona[]> {
    if (!usaMocks) {
        const response = await apiFetch('/personas')
        return response.json() as Promise<Persona[]>
    }
    await demora()
    return seed
}
