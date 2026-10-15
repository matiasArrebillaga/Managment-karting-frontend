import type { ITorneos } from '../../types'
import { fechaLocal } from '../../utils/fechas'

export function estadoTorneo (torneo: ITorneos) {
    const hoy = fechaLocal(new Date())
    if (fechaLocal(torneo.fechaFin) < hoy) return 'Terminado'
    if (fechaLocal(torneo.fechaInicio) > hoy) return 'Próximo'
    return 'En curso'
}

// color de cada estado: el mismo en la lista, el detalle y el historial
export const CLASE_ESTADO_TORNEO: Record<string, string> = { 'Próximo': 'ok', 'En curso': 'info', 'Terminado': '' }
