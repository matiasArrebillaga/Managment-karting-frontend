import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { getCarrerasTorneo } from '../../services/carreraService'
import { getTablaGeneral } from '../../services/participacionService'
import { getTorneos } from '../../services/torneoService'
import type { FilaTablaGeneral, ICarrera, ITorneos } from '../../types'
import { CLASE_ESTADO_TORNEO, estadoTorneo } from './estadoTorneo'
import { fecha, hora } from '../../utils/formato'

function TorneoDetallePage () {
    const id = Number(useParams().id)
    const [torneo, setTorneo] = useState<ITorneos | null>(null)
    const [carreras, setCarreras] = useState<ICarrera[]>([])
    const [tabla, setTabla] = useState<FilaTablaGeneral[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        Promise.all([getTorneos(), getCarrerasTorneo(id), getTablaGeneral(id)])
            .then(([torneos, datosCarreras, datosTabla]) => {
                setTorneo(torneos.find((item) => item.idTorneos === id) ?? null)
                setCarreras(datosCarreras)
                setTabla(datosTabla)
            })
            .catch((motivo: unknown) => {
                setError(motivo instanceof Error ? motivo.message : 'No se pudo cargar el torneo')
            })
            .finally(() => setCargando(false))
    }, [id])

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
                <span className={`tag ${CLASE_ESTADO_TORNEO[estado]}`}>{estado}</span>
            </div>

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
                                    <TableRow key={`${carrera.fechaCarrera.toISOString()}-${carrera.Circuitos_idCircuitos}`}>
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
        </div>
    )
}

export default TorneoDetallePage
