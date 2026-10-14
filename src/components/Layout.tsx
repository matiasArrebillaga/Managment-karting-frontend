import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { CalendarPlus, House, Menu, Trophy, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { puede } from "../permisos";

const ESCRITORIO = "(min-width: 900px)";

function Logo () {
    return (
        <Link to="/" className="brand">
            <svg viewBox="0 0 22 22" aria-hidden="true">
                <rect x="0.5" y="0.5" width="21" height="21" rx="5" fill="none" stroke="currentColor" />
                <g fill="currentColor">
                    <rect x="5" y="5" width="4" height="4" />
                    <rect x="13" y="5" width="4" height="4" />
                    <rect x="9" y="9" width="4" height="4" />
                    <rect x="5" y="13" width="4" height="4" />
                    <rect x="13" y="13" width="4" height="4" />
                </g>
            </svg>
            Kart Control
        </Link>
    );
}

function MenuCuenta () {
    const { persona, logout } = useAuth();
    const navigate = useNavigate();
    const [abierto, setAbierto] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!abierto) return;
        function cerrarAfuera (evento: MouseEvent) {
            if (!ref.current?.contains(evento.target as Node)) setAbierto(false);
        }
        function cerrarConEscape (evento: KeyboardEvent) {
            if (evento.key === "Escape") setAbierto(false);
        }
        document.addEventListener("mousedown", cerrarAfuera);
        document.addEventListener("keydown", cerrarConEscape);
        return () => {
            document.removeEventListener("mousedown", cerrarAfuera);
            document.removeEventListener("keydown", cerrarConEscape);
        };
    }, [abierto]);

    if (!persona) return null;

    return (
        <div className="account" ref={ref}>
            <button
                className="account-btn"
                type="button"
                aria-haspopup="menu"
                aria-expanded={abierto}
                onClick={() => setAbierto(!abierto)}
            >
                <span className="label">Mi cuenta</span>
                <span className="avatar">{persona.nombre[0]}{persona.apellido[0]}</span>
            </button>
            {abierto && (
                <div className="account-menu" role="menu" onClick={() => setAbierto(false)}>
                    <div className="who">
                        {persona.nombre} {persona.apellido}
                        <small>{persona.rol.nombre}</small>
                    </div>
                    <Link to="/mi-cuenta" role="menuitem">Mis reservas y torneos</Link>
                    <button
                        type="button"
                        role="menuitem"
                        className="danger"
                        onClick={() => {
                            logout();
                            navigate("/");
                        }}
                    >
                        Salir
                    </button>
                </div>
            )}
        </div>
    );
}

function Layout () {
    const { persona } = useAuth();
    const rol = persona?.rol.nombre;
    const esStaff = puede(rol, "reservas.verTodas");
    const [asideAbierto, setAsideAbierto] = useState(() => window.matchMedia(ESCRITORIO).matches);

    // en celular el aside se cierra al elegir un link
    function cerrarSiEsCelular (evento: { target: EventTarget }) {
        if ((evento.target as HTMLElement).closest("a") && !window.matchMedia(ESCRITORIO).matches) {
            setAsideAbierto(false);
        }
    }

    useEffect(() => {
        if (!asideAbierto) return;
        function cerrarConEscape (evento: KeyboardEvent) {
            if (evento.key === "Escape" && !window.matchMedia(ESCRITORIO).matches) setAsideAbierto(false);
        }
        document.addEventListener("keydown", cerrarConEscape);
        return () => document.removeEventListener("keydown", cerrarConEscape);
    }, [asideAbierto]);

    return (
        <div className={persona ? "con-barra-inferior" : undefined}>
            <header className="topbar">
                <div className="topbar-in">
                    <div className="topbar-left">
                        {esStaff && (
                            <button
                                className="icon-btn"
                                type="button"
                                aria-label={asideAbierto ? "Ocultar menú de administración" : "Mostrar menú de administración"}
                                aria-expanded={asideAbierto}
                                aria-controls="menu-admin"
                                onClick={() => setAsideAbierto(!asideAbierto)}
                            >
                                <Menu size={16} />
                            </button>
                        )}
                        <Logo />
                    </div>
                    {persona && (
                        <nav className="main-nav" aria-label="Principal">
                            <NavLink to="/" end><House size={22} strokeWidth={1.6} /><span>Inicio</span></NavLink>
                            <NavLink to="/reservar"><CalendarPlus size={22} strokeWidth={1.6} /><span>Reservar</span></NavLink>
                            <NavLink to="/torneos" end><Trophy size={22} strokeWidth={1.6} /><span>Torneos</span></NavLink>
                        </nav>
                    )}
                    <div className="topbar-right">
                        {persona ? (
                            <MenuCuenta />
                        ) : (
                            <>
                                <Link to="/login">Ingresar</Link>
                                <Link to="/register">Crear cuenta</Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <div className="layout">
                {esStaff && asideAbierto && (
                    <>
                        <button
                            className="aside-fondo"
                            type="button"
                            aria-label="Cerrar menú"
                            onClick={() => setAsideAbierto(false)}
                        />
                        <aside className="aside" id="menu-admin" aria-label="Administración" onClick={cerrarSiEsCelular}>
                            <button
                                className="icon-btn aside-cerrar"
                                type="button"
                                aria-label="Cerrar menú"
                                onClick={() => setAsideAbierto(false)}
                            >
                                <X size={16} />
                            </button>
                            <div className="aside-grupo">
                                <NavLink to="/dashboard">Panel del día</NavLink>
                            </div>
                            <div className="aside-grupo">
                                <div className="aside-label">Competencia</div>
                                <NavLink to="/carreras">Carreras y resultados</NavLink>
                                <NavLink to="/torneos" end>Torneos</NavLink>
                                {puede(rol, "participaciones.ver") && <NavLink to="/participaciones">Participaciones</NavLink>}
                            </div>
                            <div className="aside-grupo">
                                <div className="aside-label">Pista</div>
                                <NavLink to="/reservas">Reservas</NavLink>
                                <NavLink to="/circuitos">Circuitos</NavLink>
                                <NavLink to="/kartings">Kartings</NavLink>
                            </div>
                            {puede(rol, "catalogos.ver") && (
                                <div className="aside-grupo">
                                    <details>
                                        <summary>Catálogos</summary>
                                        <NavLink to="/localidades">Localidades</NavLink>
                                        <NavLink to="/licencias">Licencias</NavLink>
                                        <NavLink to="/tipos-licencia">Tipos de licencia</NavLink>
                                        <NavLink to="/tipos-karting">Tipos de karting</NavLink>
                                    </details>
                                </div>
                            )}
                        </aside>
                    </>
                )}
                <main className="main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout;
