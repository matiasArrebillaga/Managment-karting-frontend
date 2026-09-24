import type { Persona } from "../types"
import { personas as seed } from "../data/mockData"

// Version minima: solo lectura, para poblar el desplegable de titular en Licencia.
// El CRUD completo de Persona (con localidad, rol y alta desde /register) queda pendiente.

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

export async function getPersonas(): Promise<Persona[]> {
    await demora()
    return seed
}
