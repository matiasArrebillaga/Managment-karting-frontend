import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { puede } from '../../permisos'
import { useAviso } from '../../context/AvisoContext'
import ReservaForm from './ReservaForm'

function ReservarPage () {
    const { persona } = useAuth()
    const navigate = useNavigate()
    const avisar = useAviso()
    if (!persona) return null

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <p className="eyebrow">Reservas</p>
                    <h1>Reservar karting</h1>
                    <p className="sub">Elegí día, horario, circuito y karting. El monto se calcula según el precio por hora del tipo de karting.</p>
                </div>
            </div>
            <section className="panel form-panel">
                <ReservaForm
                    reserva={null}
                    idPersonaActual={persona.idPersona}
                    nombrePersonaActual={`${persona.nombre} ${persona.apellido}`}
                    puedeGestionar={puede(persona.rol.nombre, 'reservas.verTodas')}
                    // el aviso es global (AvisoProvider): se ve en la página nueva y no queda pegado en el historial
                    onGuardado={() => { avisar('Reserva confirmada'); navigate('/mi-cuenta/reservas') }}
                />
            </section>
        </div>
    )
}

export default ReservarPage
