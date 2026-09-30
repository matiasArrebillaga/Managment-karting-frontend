import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function AuthPage ({ mode }: { mode: 'login' | 'register' }) {
    const isLogin = mode === 'login'
    const { login, register } = useAuth()
    const navigate = useNavigate()

    const [nombre, setNombre] = useState('')
    const [apellido, setApellido] = useState('')
    const [mail, setMail] = useState('')
    const [contraseña, setContraseña] = useState('')
    const [confirmarContraseña, setConfirmarContraseña] = useState('')
    const [error, setError] = useState('')
    const [enviando, setEnviando] = useState(false)

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
                await register({ nombre, apellido, mail, contraseña })
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
                    <button className="primary-button" type="submit" disabled={enviando}>
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
