import { useEffect, useState, type FormEvent } from "react"
import { Navigate, NavLink } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { puede } from "../permisos"
import { getLocalidadesParaRegistro } from "../services/localidadService"
import type { DatosRegistro, Localidad } from "../types"

function AuthPage ({ mode }: { mode: 'login' | 'register' }) {
    const isLogin = mode === 'login'
    const { persona, login, register } = useAuth()

    const [nombre, setNombre] = useState('')
    const [apellido, setApellido] = useState('')
    const [dni, setDni] = useState('')
    const [fechaNacimiento, setFechaNacimiento] = useState('')
    const [mail, setMail] = useState('')
    const [telefono, setTelefono] = useState('')
    const [localidadId, setLocalidadId] = useState('')
    const [localidades, setLocalidades] = useState<Localidad[]>([])
    const [cargandoLocalidades, setCargandoLocalidades] = useState(!isLogin)
    const [contraseña, setContraseña] = useState('')
    const [confirmarContraseña, setConfirmarContraseña] = useState('')
    const [error, setError] = useState('')
    const [enviando, setEnviando] = useState(false)
    // un solo interruptor para los dos campos: si ves una, ves las dos y podés comparar
    const [verContraseña, setVerContraseña] = useState(false)
    const botonOjo = (
        <button
            type="button"
            className="ojo"
            onClick={() => setVerContraseña((actual) => !actual)}
            aria-label={verContraseña ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={verContraseña}
        >
            {verContraseña ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
    )

    useEffect(() => {
        if (isLogin) return

        getLocalidadesParaRegistro()
            .then(setLocalidades)
            .catch((error: unknown) => {
                setError(error instanceof Error ? error.message : 'No se pudieron cargar las localidades')
            })
            .finally(() => setCargandoLocalidades(false))
    }, [isLogin])

    async function handleSubmit (evento: FormEvent) {
        evento.preventDefault()
        setError('')

        setEnviando(true)
        try {
            if (isLogin) {
                await login(mail, contraseña)
            } else {
                if (contraseña !== confirmarContraseña) {
                    setError('Las contraseñas no coinciden')
                    return
                }
                const datos: DatosRegistro = {
                    nombre,
                    apellido,
                    dni,
                    fechaNacimiento,
                    mail,
                    telefono,
                    contraseña,
                    Localidades_idLocalidades: Number(localidadId),
                }
                await register(datos)
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'No se pudo completar la operación')
        } finally {
            setEnviando(false)
        }
    }

    // al iniciar sesión el contexto actualiza persona y esto redirige según el rol
    if (persona) {
        return <Navigate to={puede(persona.rol.nombre, 'reservas.verTodas') ? '/dashboard' : '/'} replace />
    }

    return (
        <div className="auth">
            <div>
                <h1>Bienvenido a Management-Karting Rosario</h1>
                <p className="sub">Ingresá para reservar un karting o anotarte a un torneo.</p>
            </div>
            <nav className="tabs" aria-label="Cuenta">
                <NavLink to="/login">Ingresar</NavLink>
                <NavLink to="/register">Crear cuenta</NavLink>
            </nav>
            <form className="panel" onSubmit={handleSubmit}>
                <div className="campos">
                    {!isLogin && <>
                        <div className="campo">
                            <label htmlFor="nombre">Nombre</label>
                            <input id="nombre" type="text" autoComplete="given-name" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                        </div>
                        <div className="campo">
                            <label htmlFor="apellido">Apellido</label>
                            <input id="apellido" type="text" autoComplete="family-name" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
                        </div>
                        <div className="campo">
                            <label htmlFor="dni">DNI</label>
                            <input id="dni" type="text" inputMode="numeric" autoComplete="off" value={dni} onChange={(e) => setDni(e.target.value)} required />
                        </div>
                        <div className="campo">
                            <label htmlFor="nacimiento">Fecha de nacimiento</label>
                            <input id="nacimiento" type="date" autoComplete="bday" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} required />
                        </div>
                    </>}
                    <div className="campo" style={isLogin ? { gridColumn: '1 / -1' } : undefined}>
                        <label htmlFor="mail">Email</label>
                        <input id="mail" type="email" autoComplete="email" value={mail} onChange={(e) => setMail(e.target.value)} required />
                    </div>
                    {!isLogin && <>
                        <div className="campo">
                            <label htmlFor="telefono">Teléfono</label>
                            <input id="telefono" type="tel" autoComplete="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
                        </div>
                        <div className="campo">
                            <label htmlFor="localidad">Localidad</label>
                            <select
                                id="localidad"
                                autoComplete="address-level2"
                                value={localidadId}
                                onChange={(e) => setLocalidadId(e.target.value)}
                                disabled={cargandoLocalidades || localidades.length === 0}
                                required
                            >
                                <option value="">
                                    {cargandoLocalidades ? 'Cargando localidades...' : 'Seleccioná tu localidad'}
                                </option>
                                {localidades.map((localidad) => (
                                    <option key={localidad.idLocalidades} value={localidad.idLocalidades}>
                                        {localidad.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>}
                    <div className="campo" style={isLogin ? { gridColumn: '1 / -1' } : undefined}>
                        <label htmlFor="contrasena">Contraseña</label>
                        <div className="con-ojo">
                            <input
                                id="contrasena"
                                type={verContraseña ? 'text' : 'password'}
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                                minLength={isLogin ? undefined : 8}
                                value={contraseña}
                                onChange={(e) => setContraseña(e.target.value)}
                                required
                            />
                            {botonOjo}
                        </div>
                    </div>
                    {!isLogin && (
                        <div className="campo">
                            <label htmlFor="confirmar">Confirmar contraseña</label>
                            <div className="con-ojo">
                                <input id="confirmar" type={verContraseña ? 'text' : 'password'} autoComplete="new-password" value={confirmarContraseña} onChange={(e) => setConfirmarContraseña(e.target.value)} required />
                                {botonOjo}
                            </div>
                        </div>
                    )}
                </div>
                {error && <p className="error" role="alert">{error}</p>}
                <button
                    className="btn"
                    type="submit"
                    disabled={enviando || (!isLogin && (cargandoLocalidades || localidades.length === 0))}
                >
                    {isLogin
                        ? (enviando ? 'Ingresando...' : 'Ingresar')
                        : (enviando ? 'Creando cuenta...' : 'Crear cuenta')}
                </button>
            </form>
        </div>
    )
}

export default AuthPage
