import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import { getCarrerasTorneo } from '../../services/carreraService'
import { getTablaGeneral } from '../../services/participacionService'
import { getMisTorneos } from '../../services/torneoService'
import type { FilaTablaGeneral, ITorneos } from '../../types'
import { CLASE_ESTADO_TORNEO, estadoTorneo } from './TorneosPage'
import { fecha } from '../../utils/formato'

type FilaHistorial = {
    torneo: ITorneos
    carreras: number
    fila: FilaTablaGeneral | undefined
}

function HistorialTorneosPage () {
    const { persona } = useAuth()
    const [filas, setFilas] = useState<FilaHistorial[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!persona) return
        // una llamada por torneo: el backend no tiene "mis resultados"
        getMisTorneos()
            .then((torneos) => Promise.all(torneos.map(async (torneo) => {
                const [tabla, carreras] = await Promise.all([getTablaGeneral(torneo.idTorneos), getCarrerasTorneo(torneo.idTorneos)])
                return { torneo, carreras: carreras.length, fila: tabla.find((item) => item.idPersona === persona.idPersona) }
            })))
            .then((datos) => setFilas(datos.sort((a, b) => b.torneo.fechaInicio.getTime() - a.torneo.fechaInicio.getTime())))
            .catch((motivo: unknown) => setError(motivo instanceof Error ? motivo.message : 'No se pudo cargar el historial'))
            .finally(() => setCargando(false))
    }, [persona])

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <p className="eyebrow">Mi cuenta</p>
                    <h1>Historial de torneos</h1>
                    <p className="sub">Los torneos en los que te anotaste, con tu posición en la tabla general.</p>
                </div>
                <Link className="btn" to="/torneos">Ver torneos</Link>
            </div>
            {error && <Alert severity="error">{error}</Alert>}
            {cargando ? (
                <p className="empty">Cargando...</p>
            ) : filas.length === 0 ? (
                <p className="empty">Todavía no te anotaste en ningún torneo.</p>
            ) : (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Torneo</TableCell>
                                <TableCell>Fechas</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Carreras</TableCell>
                                <TableCell>Posición</TableCell>
                                <TableCell>Puntos</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filas.map(({ torneo, carreras, fila }) => {
                                const estado = estadoTorneo(torneo)
                                return (
                                    <TableRow key={torneo.idTorneos}>
                                        <TableCell><Link to={`/torneos/${torneo.idTorneos}`}>{torneo.nombre}</Link></TableCell>
                                        <TableCell>
                                            {fecha(torneo.fechaInicio)} al {fecha(torneo.fechaFin)}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`tag ${CLASE_ESTADO_TORNEO[estado]}`}>{estado}</span>
                                        </TableCell>
                                        <TableCell>{carreras}</TableCell>
                                        <TableCell>{fila ? `${fila.posicion}°` : 'Sin resultados'}</TableCell>
                                        <TableCell>{fila ? fila.puntosTotales : '-'}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    )
}

export default HistorialTorneosPage
