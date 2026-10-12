import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { getCarrerasTorneo } from '../../services/carreraService'
import { getTablaGeneral } from '../../services/participacionService'
import { getTorneos } from '../../services/torneoService'
import type { FilaTablaGeneral, ICarrera, ITorneos } from '../../types'
import { estadoTorneo } from './TorneosPage'

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
        return <Typography sx={{ p: 3 }}>Cargando...</Typography>
    }

    if (!torneo) {
        return (
            <div style={{ padding: 24 }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error || 'El torneo no existe'}</Alert>
                <Link to="/torneos">Volver a Torneos</Link>
            </div>
        )
    }

    const estado = estadoTorneo(torneo)

    return (
        <div style={{ padding: 24 }}>
            <Link to="/torneos">← Torneos</Link>
            <Typography variant="h4" gutterBottom sx={{ mt: 1 }}>
                {torneo.nombre}{' '}
                <Chip
                    size="small"
                    label={estado}
                    color={estado === 'Terminado' ? 'default' : estado === 'En curso' ? 'success' : 'primary'}
                />
            </Typography>
            <Typography>{torneo.descripcion}</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Del {torneo.fechaInicio.toLocaleDateString()} al {torneo.fechaFin.toLocaleDateString()} · Cupo: {torneo.cupoMaximo}
            </Typography>

            <Typography variant="h5" gutterBottom>Carreras</Typography>
            {carreras.length === 0 ? (
                <Typography sx={{ mb: 3 }}>Este torneo todavía no tiene carreras.</Typography>
            ) : (
                <Table size="small" sx={{ mb: 3 }}>
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
                                <TableCell>{carrera.fechaCarrera.toLocaleDateString()}</TableCell>
                                <TableCell>{carrera.horaInicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                <TableCell>{carrera.horaFin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                <TableCell>Circuito {carrera.Circuitos_idCircuitos}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <Typography variant="h5" gutterBottom>Tabla general</Typography>
            {tabla.length === 0 ? (
                <Typography>Todavía no hay resultados cargados.</Typography>
            ) : (
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
                                <TableCell>{fila.posicion}</TableCell>
                                <TableCell>{fila.nombre} {fila.apellido}</TableCell>
                                <TableCell>{fila.puntosTotales}</TableCell>
                                <TableCell>{fila.victorias}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}

export default TorneoDetallePage
