import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, MenuItem, TextField } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import {
    deleteTorneo,
    desanotarseDeTorneo,
    getResumenInscripcionesTorneos,
    getTorneos,
    inscribirseATorneo,
} from '../../services/torneoService'
import { getTiposLicencia } from '../../services/tipoLicenciaService'
import type { ITorneos, TipoLicencia } from '../../types'
import TorneoFormDialog from './TorneoFormDialog'
import { puede } from '../../permisos'
import { useConfirmar } from '../../components/useConfirmar'
import { fecha } from '../../utils/formato'

export function estadoTorneo (torneo: ITorneos) {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaInicio = new Date(torneo.fechaInicio)
    const fechaFin = new Date(torneo.fechaFin)
    fechaInicio.setHours(0, 0, 0, 0)
    fechaFin.setHours(0, 0, 0, 0)

    if (fechaFin < hoy) return 'Terminado'
    if (fechaInicio > hoy) return 'Próximo'
    return 'En curso'
}

// color de cada estado: el mismo en la lista, el detalle y el historial
export const CLASE_ESTADO_TORNEO: Record<string, string> = { 'Próximo': 'ok', 'En curso': 'info', 'Terminado': '' }

// etiqueta que ve el usuario -> valor que espera GET /api/torneos?estado=
const ESTADOS = [
    { valor: 'proximo', etiqueta: 'Próximo' },
    { valor: 'en_curso', etiqueta: 'En curso' },
    { valor: 'finalizado', etiqueta: 'Terminado' },
]

function TorneosPage () {
    const { persona } = useAuth()
    const { confirmar, dialogo } = useConfirmar()
    const [torneos, setTorneos] = useState<ITorneos[]>([])
    const [torneosAnotados, setTorneosAnotados] = useState<number[]>([])
    const [inscriptosPorTorneo, setInscriptosPorTorneo] = useState<Record<number, number>>({})
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [inscripcionPendiente, setInscripcionPendiente] = useState<number | null>(null)
    const [abierto, setAbierto] = useState(false)
    const [torneoEditando, setTorneoEditando] = useState<ITorneos | null>(null)
    const [tiposLicencia, setTiposLicencia] = useState<TipoLicencia[]>([])
    const [filtroEstado, setFiltroEstado] = useState('')
    const [filtroLicencia, setFiltroLicencia] = useState('')
    const [busqueda, setBusqueda] = useState('')
    const puedeGestionar = puede(persona?.rol.nombre, 'torneos.gestionar')
    const puedeVerInscriptos = puede(persona?.rol.nombre, 'inscripciones.verTodas')
    const puedeAnotarse = puede(persona?.rol.nombre, 'inscripciones.anotarse')
    const puedeEliminar = puede(persona?.rol.nombre, 'torneos.eliminar')

    function cargarTorneos () {
        setCargando(true)
        setError('')
        Promise.all([
            getTorneos({
                estado: filtroEstado || undefined,
                idTipoLicencia: filtroLicencia ? Number(filtroLicencia) : undefined,
            }),
            persona
                ? getResumenInscripcionesTorneos(persona.idPersona, puedeVerInscriptos)
                : Promise.resolve({ torneosAnotados: [], inscriptosPorTorneo: {} }),
        ])
            .then(([datosTorneos, resumen]) => {
                setTorneos(datosTorneos)
                setTorneosAnotados(resumen.torneosAnotados)
                setInscriptosPorTorneo(resumen.inscriptosPorTorneo)
            })
            .catch((motivo: unknown) => {
                setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los torneos')
            })
            .finally(() => setCargando(false))
    }

    useEffect(() => {
        cargarTorneos()
    }, [filtroEstado, filtroLicencia])

    useEffect(() => {
        getTiposLicencia().then(setTiposLicencia).catch(console.error)
    }, [])

    function nombreLicencia (id: number) {
        return tiposLicencia.find((tipo) => tipo.idTipoLicencia === id)?.nombre ?? '-'
    }

    function handleNuevo () {
        setTorneoEditando(null)
        setAbierto(true)
    }

    function handleEditar (torneo: ITorneos) {
        setTorneoEditando(torneo)
        setAbierto(true)
    }

    function handleGuardado () {
        setAbierto(false)
        setTorneoEditando(null)
        cargarTorneos()
    }

    async function handleEliminar (torneo: ITorneos) {
        if (!(await confirmar(`¿Eliminar el torneo ${torneo.nombre}?`, 'Eliminar'))) return

        try {
            await deleteTorneo(torneo.idTorneos)
            cargarTorneos()
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo eliminar el torneo')
        }
    }

    async function handleAnotarse (idTorneo: number) {
        if (!persona) return

        setInscripcionPendiente(idTorneo)
        setError('')
        try {
            await inscribirseATorneo(idTorneo, persona.idPersona)
            setTorneosAnotados((actuales) => [...actuales, idTorneo])
            setInscriptosPorTorneo((actuales) => ({
                ...actuales,
                [idTorneo]: (actuales[idTorneo] ?? 0) + 1,
            }))
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo completar la inscripción')
        } finally {
            setInscripcionPendiente(null)
        }
    }

    async function handleDesanotarse (idTorneo: number) {
        if (!persona || !(await confirmar('¿Desanotarte de este torneo?', 'Desanotarme'))) return

        setError('')
        try {
            await desanotarseDeTorneo(idTorneo, persona.idPersona)
            setTorneosAnotados((actuales) => actuales.filter((id) => id !== idTorneo))
            setInscriptosPorTorneo((actuales) => ({
                ...actuales,
                [idTorneo]: Math.max(0, (actuales[idTorneo] ?? 0) - 1),
            }))
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo cancelar la inscripción')
        }
    }

    const texto = busqueda.trim().toLowerCase()
    const torneosVisibles = torneos.filter((torneo) => torneo.nombre.toLowerCase().includes(texto))

    function accionInscripcion (torneo: ITorneos, estado: string) {
        const anotado = torneosAnotados.includes(torneo.idTorneos)
        if (anotado && estado === 'Próximo') {
            return <button className="btn-ghost" type="button" onClick={() => handleDesanotarse(torneo.idTorneos)}>Desanotarme</button>
        }
        if (anotado) return <span className="tag ok">Inscripto</span>
        // ADMIN no tiene inscripciones.anotarse en el backend: no se le ofrece
        if (estado !== 'Próximo' || !puedeAnotarse) return null
        if (puedeVerInscriptos && (inscriptosPorTorneo[torneo.idTorneos] ?? 0) >= torneo.cupoMaximo) {
            return <span className="tag bad">Cupo completo</span>
        }
        return (
            <button
                className="btn"
                type="button"
                onClick={() => handleAnotarse(torneo.idTorneos)}
                disabled={inscripcionPendiente === torneo.idTorneos}
            >
                {inscripcionPendiente === torneo.idTorneos ? 'Anotando...' : 'Anotarme'}
            </button>
        )
    }

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <p className="eyebrow">Competencia</p>
                    <h1>Torneos</h1>
                    <p className="sub">Anotate a un torneo para correr sus carreras. Cada torneo tiene cupo y licencia mínima.</p>
                </div>
                {puedeGestionar && (
                    <button className="btn" type="button" onClick={handleNuevo}>Nuevo torneo</button>
                )}
            </div>
            {error && <Alert severity="error">{error}</Alert>}

            <div className="toolbar" role="search">
                <TextField
                    size="small"
                    type="search"
                    label="Buscar por nombre"
                    value={busqueda}
                    onChange={(evento) => setBusqueda(evento.target.value)}
                    sx={{ minWidth: 220 }}
                />
                <TextField
                    select
                    size="small"
                    label="Estado"
                    value={filtroEstado}
                    onChange={(evento) => setFiltroEstado(evento.target.value)}
                    sx={{ minWidth: 180 }}
                >
                    <MenuItem value="">Todos</MenuItem>
                    {ESTADOS.map((estado) => (
                        <MenuItem key={estado.valor} value={estado.valor}>{estado.etiqueta}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    size="small"
                    label="Licencia requerida"
                    value={filtroLicencia}
                    onChange={(evento) => setFiltroLicencia(evento.target.value)}
                    sx={{ minWidth: 220 }}
                >
                    <MenuItem value="">Todas</MenuItem>
                    {tiposLicencia.map((tipo) => (
                        <MenuItem key={tipo.idTipoLicencia} value={String(tipo.idTipoLicencia)}>{tipo.nombre}</MenuItem>
                    ))}
                </TextField>
            </div>

            {cargando ? (
                <p className="empty">Cargando...</p>
            ) : torneosVisibles.length === 0 ? (
                <p className="empty">No hay torneos que coincidan con la búsqueda.</p>
            ) : (
                <div className="cards">
                    {torneosVisibles.map((torneo) => {
                        const estado = estadoTorneo(torneo)
                        const inscriptos = inscriptosPorTorneo[torneo.idTorneos] ?? 0
                        const accion = accionInscripcion(torneo, estado)
                        return (
                            <article className="panel" key={torneo.idTorneos ?? torneo.nombre}>
                                <div className="card-fila">
                                    <h2><Link to={`/torneos/${torneo.idTorneos}`}>{torneo.nombre}</Link></h2>
                                    <span className={`tag ${CLASE_ESTADO_TORNEO[estado]}`}>{estado}</span>
                                </div>
                                <p className="small">
                                    Del {fecha(torneo.fechaInicio)} al {fecha(torneo.fechaFin)}
                                    {/* el cliente no puede leer el catálogo de licencias: si no hay nombre, no se muestra */}
                                    {nombreLicencia(torneo.TiposLicencias_idTipoLicencia) !== '-' && ` · Licencia ${nombreLicencia(torneo.TiposLicencias_idTipoLicencia)}`}
                                </p>
                                {puedeVerInscriptos ? (
                                    <div className="cupo">
                                        <div className="card-fila">
                                            <span className="small">Inscriptos</span>
                                            <span className="mono">{inscriptos} / {torneo.cupoMaximo}</span>
                                        </div>
                                        <div className="bar"><i style={{ width: `${Math.min(100, Math.round(100 * inscriptos / torneo.cupoMaximo))}%` }} /></div>
                                    </div>
                                ) : (
                                    <p className="small">Cupo máximo: {torneo.cupoMaximo}</p>
                                )}
                                {(accion || puedeGestionar) && (
                                    <div className="card-fila">
                                        <div className="card-acciones">
                                            {puedeGestionar && (
                                                <button className="link" type="button" onClick={() => handleEditar(torneo)}>Editar</button>
                                            )}
                                            {puedeGestionar && puedeEliminar && (
                                                <button className="link danger" type="button" onClick={() => handleEliminar(torneo)}>Eliminar</button>
                                            )}
                                        </div>
                                        {accion}
                                    </div>
                                )}
                            </article>
                        )
                    })}
                </div>
            )}

            {puedeGestionar && (
                <TorneoFormDialog
                    abierto={abierto}
                    torneo={torneoEditando}
                    onCerrar={() => setAbierto(false)}
                    onGuardado={handleGuardado}
                />
            )}
            {dialogo}
        </div>
    )
}

export default TorneosPage
