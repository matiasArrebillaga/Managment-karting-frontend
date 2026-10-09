import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getLocalidadesParaRegistro } from "../services/localidadService"
import type { DatosRegistro, Localidad } from "../types"

function AuthPage ({ mode }: { mode: 'login' | 'register' }) {
    const isLogin = mode === 'login'
    const { login, register } = useAuth()
    const navigate = useNavigate()

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
                    idRol: 3,
                }
                await register(datos)
            }
            navigate('/dashboard')
        } catch (error) {
            setError(error instanceof Error ? error.message : 'No se pudo completar la operación')
        } finally {
            setEnviando(false)
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-panel">
                <p className="eyebrow">KART/CONTROL</p>
                <h1>{isLogin ? 'Iniciar sesión' : 'Crear una cuenta'}</h1>
                <p className="subtitle">
                    {isLogin
                        ? 'Ingresá para gestionar tus reservas y carreras.'
                        : 'Registrate para reservar una pista con tu grupo.'}
                </p>
                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLogin && <>
                        <input
                            type="text"
                            placeholder="Nombre"
                            aria-label="Nombre"
                            autoComplete="given-name"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Apellido"
                            aria-label="Apellido"
                            autoComplete="family-name"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="DNI"
                            aria-label="DNI"
                            autoComplete="off"
                            value={dni}
                            onChange={(e) => setDni(e.target.value)}
                            required
                        />
                        <input
                            type="date"
                            aria-label="Fecha de nacimiento"
                            autoComplete="bday"
                            value={fechaNacimiento}
                            onChange={(e) => setFechaNacimiento(e.target.value)}
                            required
                        />
                    </>}
                    <input
                        type="email"
                        placeholder="Email"
                        aria-label="Email"
                        autoComplete="email"
                        value={mail}
                        onChange={(e) => setMail(e.target.value)}
                        required
                    />
                    {!isLogin && <>
                        <input
                            type="tel"
                            placeholder="Teléfono"
                            aria-label="Teléfono"
                            autoComplete="tel"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            required
                        />
                        <select
                            aria-label="Localidad"
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
                    </>}
                    <input
                        type="password"
                        placeholder="Contraseña"
                        aria-label="Contraseña"
                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                        minLength={isLogin ? undefined : 8}
                        value={contraseña}
                        onChange={(e) => setContraseña(e.target.value)}
                        required
                    />
                    {!isLogin && <input
                        type="password"
                        placeholder="Confirmar contraseña"
                        aria-label="Confirmar contraseña"
                        autoComplete="new-password"
                        value={confirmarContraseña}
                        onChange={(e) => setConfirmarContraseña(e.target.value)}
                        required
                    />}
                    {error && <p style={{ color: '#d32f2f' }}>{error}</p>}
                    <button
                        className="primary-button"
                        type="submit"
                        disabled={enviando || (!isLogin && (cargandoLocalidades || localidades.length === 0))}
                    >
                        {isLogin
                            ? (enviando ? 'Ingresando...' : 'Ingresar')
                            : (enviando ? 'Creando cuenta...' : 'Registrarme')}
                    </button>
                </form>
                <p className="subtitle" style={{ marginTop: 16, fontSize: 13 }}>
                    {isLogin ? '¿Todavía no tenés cuenta? ' : '¿Ya tenés cuenta? '}
                    <Link to={isLogin ? '/register' : '/login'}>
                        {isLogin ? 'Registrate' : 'Iniciá sesión'}
                    </Link>
                </p>
                {isLogin && (
                    <p className="subtitle" style={{ marginTop: 16, fontSize: 13 }}>
                        Usuarios de prueba (contraseña: 1234):<br />
                        admin@karting.com · empleado@karting.com · cliente@karting.com
                    </p>
                )}
            </div>
        </main>
    )
}

export default AuthPage
