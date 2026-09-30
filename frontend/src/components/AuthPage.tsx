import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function AuthPage ({ mode }: { mode: 'login' | 'register' }) {
    const isLogin = mode === 'login'
    const { login } = useAuth()
    const navigate = useNavigate()

    const [mail, setMail] = useState('')
    const [contraseña, setContraseña] = useState('')
    const [error, setError] = useState('')
    const [enviando, setEnviando] = useState(false)

    async function handleSubmit(evento: FormEvent) {
        evento.preventDefault()
        setError('')

        if (!isLogin) {
            setError('El registro todavia no esta disponible. Iniciá sesión con un usuario de prueba.')
            return
        }

        setEnviando(true)
        try {
            await login(mail, contraseña)
            navigate('/dashboard')
        } catch (error) {
            setError(error instanceof Error ? error.message : 'No se pudo iniciar sesión')
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
                    {!isLogin && <input type="text" placeholder="Nombre completo" />}
                    <input
                        type="email"
                        placeholder="Email"
                        value={mail}
                        onChange={(e) => setMail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={contraseña}
                        onChange={(e) => setContraseña(e.target.value)}
                    />
                    {error && <p style={{ color: '#d32f2f' }}>{error}</p>}
                    <button className="primary-button" type="submit" disabled={enviando}>
                        {isLogin ? (enviando ? 'Ingresando...' : 'Ingresar') : 'Registrarme'}
                    </button>
                </form>
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
