import { createContext, useContext } from "react"
import type { DatosRegistro } from "../services/authService"
import type { PersonaAuth } from "../types"

// El contexto y el hook viven separados del AuthProvider: un archivo .tsx que exporta
// un componente y además otras cosas rompe el fast refresh de Vite (regla only-export-components).
type AuthContextValue = {
    persona: PersonaAuth | null
    login: (mail: string, contraseña: string) => Promise<void>
    register: (datos: DatosRegistro) => Promise<void>
    logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth () {
    const contexto = useContext(AuthContext)
    if (!contexto) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider')
    }
    return contexto
}
