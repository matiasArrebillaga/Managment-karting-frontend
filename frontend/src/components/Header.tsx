import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function Header () {
    const { persona, logout } = useAuth()
    const navigate = useNavigate()

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
            <div className="top-actions">
                {persona ? (
                    <>
                        <Link to="/carreras">Carreras</Link>
                        <Link to="/torneos">Torneos</Link>
                        <Link to="/torneos/listado">Estado de Torneos</Link>
                        <Link to="/reservas">Reservas</Link>
                        <Link to="/circuitos">Circuitos</Link>
                        <Link to="/kartings">Kartings</Link>
                        {persona.rol.nombre !== "CLIENTE" ? (
                            <>
                                <Link to="/localidades">Localidades</Link>
                                <Link to="/tipos-licencia">Tipos de Licencia</Link>
                                <Link to="/tipos-karting">Tipos de Karting</Link>
                                {persona.rol.nombre === "EMPLEADO" && (
                                    <Link to="/participaciones">Participaciones</Link>
                                )}
                                <Link to="/licencias">Licencias</Link></>) : (<></>)
                        }
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
