import { createContext, useContext } from "react"

export type TipoAviso = 'success' | 'error'
type Avisar = (mensaje: string, tipo?: TipoAviso) => void

export const AvisoContext = createContext<Avisar | null>(null)

// Uso: const avisar = useAviso()
//      avisar('Localidad guardada')            -> verde
//      avisar('No se pudo eliminar', 'error')  -> rojo
export function useAviso () {
    const avisar = useContext(AvisoContext)
    if (!avisar) {
        throw new Error('useAviso debe usarse dentro de un AvisoProvider')
    }
    return avisar
}
