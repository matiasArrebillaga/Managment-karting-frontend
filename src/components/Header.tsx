import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { puede } from "../permisos";


function Header () {
    const { persona, logout } = useAuth()
    const navigate = useNavigate()
    const [menuAbierto, setMenuAbierto] = useState(false)

    function handleLogout () {
        logout()
        navigate('/')
    }

    return (
        <header className="topbar">
            <Link to="/">
                <div className="brand brand-header">
                    <span className="brand-mark">K</span>
                    <span>
                        KART<span className="brand-accent">/</span>CONTROL
                    </span>
                </div>
            </Link>
            <button
                className="mobile-menu"
                aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={menuAbierto}
                onClick={() => setMenuAbierto(!menuAbierto)}
            >
                {menuAbierto ? <X size={22} /> : <Menu size={22} />}
            </button>
            {/* Cualquier click adentro (un link o Salir) cierra el menú en celular */}
            <div className={menuAbierto ? "top-actions open" : "top-actions"} onClick={() => setMenuAbierto(false)}>
                {persona ? (
                    <>
                        <Link to="/carreras">Carreras</Link>
                        <Link to="/torneos">Torneos</Link>
                        <Link to="/reservas">Reservas</Link>
                        <Link to="/circuitos">Circuitos</Link>
                        <Link to="/kartings">Kartings</Link>
                        {puede(persona.rol.nombre, "catalogos.ver") && (
                            <>
                                <Link to="/localidades">Localidades</Link>
                                <Link to="/tipos-licencia">Tipos de Licencia</Link>
                                <Link to="/tipos-karting">Tipos de Karting</Link>
                                <Link to="/licencias">Licencias</Link>
                            </>
                        )}
                        {puede(persona.rol.nombre, "participaciones.ver") && (
                            <Link to="/participaciones">Participaciones</Link>
                        )}
                        <span>Hola, {persona.nombre} ({persona.rol.nombre})</span>
                        <button onClick={handleLogout}>Salir</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </header >
    )
}

export default Header
