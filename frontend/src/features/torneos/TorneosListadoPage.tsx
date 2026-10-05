import { useEffect, useState } from 'react'
import { Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { getTorneos } from '../../services/torneoService'
import type { ITorneos } from '../../types'

function estadoTorneo (torneo: ITorneos) {
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

function TorneosListadoPage () {
    const [torneos, setTorneos] = useState<ITorneos[]>([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        getTorneos()
            .then(setTorneos)
            .finally(() => setCargando(false))
    }, [])

    if (cargando) {
        return <Typography sx={{ p: 3 }}>Cargando...</Typography>
    }

    return (
        <div style={{ padding: 24 }}>
            <Typography variant="h4" gutterBottom>
                Estado de Torneos
            </Typography>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell>Cupo máximo</TableCell>
                        <TableCell>Fecha de inicio</TableCell>
                        <TableCell>Fecha de fin</TableCell>
                        <TableCell>Estado</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {torneos.map((torneo) => {
                        const estado = estadoTorneo(torneo)
                        return (
                            <TableRow key={torneo.idTorneos}>
                                <TableCell>{torneo.nombre}</TableCell>
                                <TableCell>{torneo.descripcion}</TableCell>
                                <TableCell>{torneo.cupoMaximo}</TableCell>
                                <TableCell>{torneo.fechaInicio.toLocaleDateString()}</TableCell>
                                <TableCell>{torneo.fechaFin.toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Chip
                                        size="small"
                                        label={estado}
                                        color={estado === 'Terminado' ? 'default' : estado === 'En curso' ? 'success' : 'primary'}
                                    />
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

export default TorneosListadoPage
