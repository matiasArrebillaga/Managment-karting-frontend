import type { TipoLicencia } from "../types"
import { tiposLicencia as seed} from "../data/mockData"

let tiposLicencia: TipoLicencia[] = [...seed]
let siguienteId = tiposLicencia.length +1

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

export async function getTiposLicencia(): Promise<TipoLicencia[]> {
    await demora()
    return tiposLicencia
}

export async function getTipoLicencia(id: number): Promise<TipoLicencia> {
    await demora()
    const tipoLicencia = tiposLicencia.find((t) => t.id === id)
    if (!tipoLicencia) {
        throw new Error(`No existe un tipo de licencia con id ${id}`)
    }
    return tipoLicencia
}

export async function createTipoLicencia(datos: Omit<TipoLicencia, 'id'>) : Promise<TipoLicencia> {
    await demora()
    const nueva: TipoLicencia = {id: siguienteId, ...datos}
    siguienteId++
    tiposLicencia.push(nueva)
    return nueva
}

export async function updateTipoLicencia(id: number, datos: Omit<TipoLicencia, 'id'>) : Promise<TipoLicencia> {
    await demora()
    const indice = tiposLicencia.findIndex((t) => t.id === id)
    if (indice === -1) {
        throw new Error(`No existe un tipo de licencia con id ${id}`)
    }
    const actulizada: TipoLicencia = {id, ...datos}
    tiposLicencia[indice] = actulizada
    return actulizada
}

export async function deleteTipoLicencia(id: number): Promise<void> {
    await demora()
    const indice = tiposLicencia.findIndex((t) => t.id === id)
    if (indice === -1) {
        throw new Error(`No existe un tipo de licencia con id ${id}`)
    }
    tiposLicencia.splice(indice,1)
}