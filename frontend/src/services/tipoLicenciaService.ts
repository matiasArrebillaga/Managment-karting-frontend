import type { TipoLicencia } from "../types"
import { tiposLicencia as seed } from "../data/mockData"
import { getTiposKarting } from "./tipoKartingService"
import { getLicencias } from "./licenciaService"

let tiposLicencia: TipoLicencia[] = [...seed]
let siguienteId = tiposLicencia.length + 1

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

export async function getTiposLicencia(): Promise<TipoLicencia[]> {
    await demora()
    return tiposLicencia
}

export async function getTipoLicencia(id: number): Promise<TipoLicencia> {
    await demora()
    const tipo = tiposLicencia.find((t) => t.idTipoLicencia === id)
    if (!tipo) {
        throw new Error(`No existe un tipo de licencia con id ${id}`)
    }
    return tipo
}

export async function createTipoLicencia(datos: Omit<TipoLicencia, 'idTipoLicencia'>) : Promise<TipoLicencia> {
    await demora()
    const nueva: TipoLicencia = {idTipoLicencia: siguienteId, ...datos}
    siguienteId++
    tiposLicencia.push(nueva)
    return nueva
}

export async function updateTipoLicencia(id: number, datos: Omit<TipoLicencia, 'idTipoLicencia'>) : Promise<TipoLicencia> {
    await demora()
    const indice = tiposLicencia.findIndex((t) => t.idTipoLicencia === id)
    if (indice === -1) {
        throw new Error(`No existe un tipo de licencia con id ${id}`)
    }
    const actualizada: TipoLicencia = {idTipoLicencia: id, ...datos}
    tiposLicencia[indice] = actualizada
    return actualizada
}

export async function deleteTipoLicencia(id: number): Promise<void> {
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
