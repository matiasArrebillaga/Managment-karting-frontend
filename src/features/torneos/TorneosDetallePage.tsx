import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import { useAviso } from '../../context/AvisoContext'
import { useConfirmar } from '../../components/useConfirmar'
import { puede } from '../../permisos'
import { getCarrerasTorneo } from '../../services/carreraService'
import { getClasificacionCarrera, getTablaGeneral } from '../../services/participacionService'
import { desanotarseDeTorneo, getListaInscriptos, getResumenInscripcionesTorneos, getTorneos, inscribirseATorneo, type Inscripto } from '../../services/torneoService'
import type { FilaClasificacion, FilaTablaGeneral, ICarrera, ITorneos } from '../../types'
import { CLASE_ESTADO_TORNEO, estadoTorneo } from './estadoTorneo'
import { fecha, hora } from '../../utils/formato'

function claveCarrera (carrera: ICarrera) {
    return `${carrera.fechaCarrera.toISOString()}-${carrera.Circuitos_idCircuitos}`
}

function TorneoDetallePage () {
    const id = Number(useParams().id)
    const { persona } = useAuth()
    const avisar = useAviso()
    const { confirmar, dialogo } = useConfirmar()
    const [torneo, setTorneo] = useState<ITorneos | null>(null)
    const [carreras, setCarreras] = useState<ICarrera[]>([])
    const [tabla, setTabla] = useState<FilaTablaGeneral[]>([])
    const [inscriptos, setInscriptos] = useState<Inscripto[]>([])
    const [anotado, setAnotado] = useState(false)
    const [sinCupo, setSinCupo] = useState(false)
    const [anotando, setAnotando] = useState(false)
    const [carreraAbierta, setCarreraAbierta] = useState<string | null>(null)
    const [clasificacion, setClasificacion] = useState<FilaClasificacion[] | null>(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const puedeAnotarse = puede(persona?.rol.nombre, 'inscripciones.anotarse')

    useEffect(() => {
        Promise.all([
            getTorneos(),
            getCarrerasTorneo(id),
            getTablaGeneral(id),
            getListaInscriptos(id),
            persona ? getResumenInscripcionesTorneos(false) : Promise.resolve({ torneosAnotados: [] as number[] }),
        ])
            .then(([torneos, datosCarreras, datosTabla, datosInscriptos, resumen]) => {
                setTorneo(torneos.find((item) => item.idTorneos === id) ?? null)
                setCarreras(datosCarreras)
                setTabla(datosTabla)
                setInscriptos(datosInscriptos)
                setAnotado(resumen.torneosAnotados.includes(id))
            })
            .catch((motivo: unknown) => {
                setError(motivo instanceof Error ? motivo.message : 'No se pudo cargar el torneo')
            })
            .finally(() => setCargando(false))
    }, [id, persona])

    // clic en una carrera: abre (o cierra) su clasificación debajo de la tabla
    function handleVerCarrera (carrera: ICarrera) {
        const clave = claveCarrera(carrera)
        if (carreraAbierta === clave) {
            setCarreraAbierta(null)
            return
        }
        setCarreraAbierta(clave)
        setClasificacion(null)
        getClasificacionCarrera(carrera)
            .then(setClasificacion)
            .catch(() => setClasificacion([]))
    }

    async function handleAnotarse () {
        if (!persona) return
        setAnotando(true)
        try {
            await inscribirseATorneo(id, persona.idPersona)
            setAnotado(true)
            getListaInscriptos(id).then(setInscriptos).catch(() => {})
            avisar('Te anotaste en el torneo')
        } catch (motivo) {
            const mensaje = motivo instanceof Error ? motivo.message : 'No se pudo completar la inscripción'
            if (mensaje.toLowerCase().includes('cupo')) setSinCupo(true)
            avisar(mensaje, 'error')
        } finally {
            setAnotando(false)
        }
    }

    async function handleDesanotarse () {
        if (!persona || !(await confirmar('¿Desanotarte de este torneo?', 'Desanotarme'))) return
        try {
            await desanotarseDeTorneo(id, persona.idPersona)
            setAnotado(false)
            getListaInscriptos(id).then(setInscriptos).catch(() => {})
            avisar('Te desanotaste del torneo')
        } catch (motivo) {
            avisar(motivo instanceof Error ? motivo.message : 'No se pudo cancelar la inscripción', 'error')
        }
    }

    if (cargando) {
        return <div className="page"><p className="empty">Cargando...</p></div>
    }

    if (!torneo) {
        return (
            <div className="page">
                <Alert severity="error">{error || 'El torneo no existe'}</Alert>
                <Link className="link" to="/torneos">← Volver a Torneos</Link>
            </div>
        )
    }

    const estado = estadoTorneo(torneo)

    // misma lógica que la tarjeta de la lista: solo se anota/desanota en torneos próximos
    function accionInscripcion () {
        if (anotado && estado === 'Próximo') {
            return <button className="btn-ghost" type="button" onClick={handleDesanotarse}>Desanotarme</button>
        }
        if (anotado) return <span className="tag ok">Inscripto</span>
        if (estado !== 'Próximo' || !puedeAnotarse) return null
        if (sinCupo) return <span className="tag bad">Cupo completo</span>
        return (
            <button className="btn" type="button" onClick={handleAnotarse} disabled={anotando}>
                {anotando ? 'Anotando...' : 'Anotarme'}
            </button>
        )
    }

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <p className="eyebrow"><Link to="/torneos">← Torneos</Link></p>
                    <h1>{torneo.nombre}</h1>
                    {torneo.descripcion && <p className="sub">{torneo.descripcion}</p>}
                    <p className="small">
                        Del {fecha(torneo.fechaInicio)} al {fecha(torneo.fechaFin)} · Cupo: {torneo.cupoMaximo}
                    </p>
                </div>
                <div className="card-acciones">
                    <span className={`tag ${CLASE_ESTADO_TORNEO[estado]}`}>{estado}</span>
                    {accionInscripcion()}
                </div>
            </div>

            <section className="panel">
                <div className="panel-head"><h2>Inscriptos ({inscriptos.length}/{torneo.cupoMaximo})</h2></div>
                {inscriptos.length === 0 ? (
                    <p className="empty">Todavía no hay inscriptos.</p>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Piloto</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {inscriptos.map((inscripto, indice) => (
                                    <TableRow key={inscripto.idPersona}>
                                        <TableCell>{indice + 1}</TableCell>
                                        <TableCell>{inscripto.nombre} {inscripto.apellido}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </section>

            <section className="panel">
                <div className="panel-head"><h2>Carreras</h2></div>
                {carreras.length === 0 ? (
                    <p className="empty">Este torneo todavía no tiene carreras.</p>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Inicio</TableCell>
                                    <TableCell>Fin</TableCell>
                                    <TableCell>Circuito</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {carreras.map((carrera) => (
                                    <TableRow
                                        key={claveCarrera(carrera)}
                                        hover
                                        selected={carreraAbierta === claveCarrera(carrera)}
                                        sx={{ cursor: 'pointer' }}
                                        tabIndex={0}
                                        aria-label={`Ver resultados de la carrera del ${fecha(carrera.fechaCarrera)}`}
                                        onClick={() => handleVerCarrera(carrera)}
                                        onKeyDown={(evento) => {
                                            if (evento.key === 'Enter') handleVerCarrera(carrera)
                                        }}
                                    >
                                        <TableCell>{fecha(carrera.fechaCarrera)}</TableCell>
                                        <TableCell>{hora(carrera.horaInicio)}</TableCell>
                                        <TableCell>{hora(carrera.horaFin)}</TableCell>
                                        <TableCell>Circuito {carrera.Circuitos_idCircuitos}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                {carreraAbierta && (
                    clasificacion === null ? (
                        <p className="empty">Cargando resultados...</p>
                    ) : clasificacion.length === 0 ? (
                        <p className="empty">Esta carrera todavía no tiene resultados.</p>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Pos.</TableCell>
                                        <TableCell>Piloto</TableCell>
                                        <TableCell>Tiempo</TableCell>
                                        <TableCell>Puntos</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {clasificacion.map((fila) => (
                                        <TableRow key={fila.idPersona}>
                                            <TableCell>{fila.posicion}°</TableCell>
                                            <TableCell>{fila.nombre} {fila.apellido}</TableCell>
                                            <TableCell className="mono">{fila.tiempo}</TableCell>
                                            <TableCell>{fila.puntos}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )
                )}
            </section>

            <section className="panel">
                <div className="panel-head"><h2>Tabla general</h2></div>
                {tabla.length === 0 ? (
                    <p className="empty">Todavía no hay resultados cargados.</p>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Pos.</TableCell>
                                    <TableCell>Piloto</TableCell>
                                    <TableCell>Puntos</TableCell>
                                    <TableCell>Victorias</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tabla.map((fila) => (
                                    <TableRow key={fila.idPersona}>
                                        <TableCell>{fila.posicion}°</TableCell>
                                        <TableCell>{fila.nombre} {fila.apellido}</TableCell>
                                        <TableCell>{fila.puntosTotales}</TableCell>
                                        <TableCell>{fila.victorias}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </section>
            {dialogo}
        </div>
    )
}

export default TorneoDetallePage
