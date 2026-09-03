function AuthPage ({ mode }: { mode: 'login' | 'register' }) {
    const isLogin = mode === 'login'

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
                <form className="auth-form">
                    {!isLogin && <input type="text" placeholder="Nombre completo" />}
                    <input type="email" placeholder="Email" />
                    <input type="password" placeholder="Contraseña" />
                    <button className="primary-button" type="submit">
                        {isLogin ? 'Ingresar' : 'Registrarme'}
                    </button>
                </form>
            </div>
        </main>
    )
}

export default AuthPage