import type { ReactNode } from "react"
import { Link, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { puede, type Permiso } from "../permisos"

type Props = {
    children: ReactNode
    // Si no se pasa, alcanza con estar logueado (cualquier rol).
    permiso?: Permiso
}

function RutaProtegida({ children, permiso }: Props) {
    const { persona, cargando } = useAuth()

    // mientras se valida la sesión se muestra un aviso en vez de una pantalla vacía
    if (cargando) {
        return <div className="page"><p className="empty">Cargando...</p></div>
    }

    if (!persona) {
        return <Navigate to="/login" replace />
    }

    if (permiso && !puede(persona.rol.nombre, permiso)) {
        return (
            <div className="page">
                <div className="page-head">
                    <div>
                        <p className="eyebrow">Acceso denegado</p>
                        <h1>No podés ver esta sección</h1>
                        <p className="sub">Tu rol ({persona.rol.nombre}) no tiene permiso para entrar acá.</p>
                    </div>
                    <Link className="btn" to="/">Volver al inicio</Link>
                </div>
            </div>
        )
    }

    return <>{children}</>
}

export default RutaProtegida
