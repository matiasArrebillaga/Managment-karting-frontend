import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { CalendarPlus, ChevronDown, House, PanelLeft, Trophy, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { puede } from "../permisos";

const ESCRITORIO = "(min-width: 900px)";

function Logo () {
    return (
        <Link to="/" className="brand">
            {/* mismo archivo que el ícono de la pestaña (index.html) */}
            <img src="/logo.svg" alt="" />
            <span>Management-Karting <span className="ciudad">Rosario</span></span>
        </Link>
    );
}

// En escritorio una píldora (.nav-indicador) se desliza bajo el link activo y sigue al mouse.
// En celular el CSS la oculta y queda la barra de abajo.
function NavPrincipal () {
    const { pathname } = useLocation();
    const navRef = useRef<HTMLElement>(null);
    const indicadorRef = useRef<HTMLSpanElement>(null);

    function moverA (link: HTMLElement | null | undefined) {
        const indicador = indicadorRef.current;
        if (!indicador) return;
        // sin link activo (por ejemplo en /dashboard) el indicador se esconde
        indicador.style.opacity = link ? "1" : "0";
        if (!link) return;
        indicador.style.width = `${link.offsetWidth}px`;
        indicador.style.transform = `translateX(${link.offsetLeft}px)`;
    }

    function volverAlActivo () {
        moverA(navRef.current?.querySelector<HTMLElement>("a.active"));
    }

    // useLayoutEffect: mide después de que NavLink marcó el .active y antes de pintar, así no se ve el salto
    useLayoutEffect(() => {
        volverAlActivo();
        // con la fuente de reemplazo los links miden distinto: se vuelve a medir cuando carga Geist
        document.fonts.ready.then(volverAlActivo);
        window.addEventListener("resize", volverAlActivo);
        return () => window.removeEventListener("resize", volverAlActivo);
    }, [pathname]);

    return (
        <nav
            className="main-nav"
            aria-label="Principal"
            ref={navRef}
            onMouseOver={(evento) => {
                const link = (evento.target as HTMLElement).closest("a");
                if (link) moverA(link);
            }}
            onMouseLeave={volverAlActivo}
        >
            <span className="nav-indicador" ref={indicadorRef} aria-hidden="true" />
            <NavLink to="/" end><House size={22} strokeWidth={1.6} /><span>Inicio</span></NavLink>
            <NavLink to="/reservar"><CalendarPlus size={22} strokeWidth={1.6} /><span>Reservar</span></NavLink>
            <NavLink to="/torneos" end><Trophy size={22} strokeWidth={1.6} /><span>Torneos</span></NavLink>
        </nav>
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
                <span className="avatar">{persona.nombre[0]}{persona.apellido[0]}</span>
                <span className="label">
                    {persona.nombre} {persona.apellido}
                    <small>{persona.rol.nombre}</small>
                </span>
                <ChevronDown className="chevron" size={16} aria-hidden="true" />
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
                                className="icon-btn gestion"
                                type="button"
                                aria-label={asideAbierto ? "Ocultar menú de administración" : "Mostrar menú de administración"}
                                aria-expanded={asideAbierto}
                                aria-controls="menu-admin"
                                onClick={() => setAsideAbierto(!asideAbierto)}
                            >
                                <PanelLeft size={16} aria-hidden="true" />
                                <span>Gestión</span>
                            </button>
                        )}
                        <Logo />
                    </div>
                    {persona && <NavPrincipal />}
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
                            {puede(rol, "personas.gestionar") && (
                                <div className="aside-grupo">
                                    <div className="aside-label">Usuarios</div>
                                    <NavLink to="/personas">Personas</NavLink>
                                </div>
                            )}
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
