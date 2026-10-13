import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { puede, type Permiso } from "../permisos"

type Props = {
    children: ReactNode
    // Si no se pasa, alcanza con estar logueado (cualquier rol).
    permiso?: Permiso
}

function RutaProtegida({ children, permiso }: Props) {
    const { persona, cargando } = useAuth()

    if (cargando) {
        return null
    }

    if (!persona) {
        return <Navigate to="/login" replace />
    }

    if (permiso && !puede(persona.rol.nombre, permiso)) {
        return (
            <div style={{ padding: 24 }}>
                <h2>Acceso denegado</h2>
                <p>Tu rol ({persona.rol.nombre}) no tiene permiso para ver esta sección.</p>
            </div>
        )
    }

    return <>{children}</>
}

export default RutaProtegida
