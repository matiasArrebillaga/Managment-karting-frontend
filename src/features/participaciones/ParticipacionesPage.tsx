import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { getParticipaciones } from '../../services/participacionService'
import { getPersonas } from '../../services/personaService'
import { getTorneos } from '../../services/torneoService'
import { getCircuitos } from '../../services/circuitoService'
import type { Circuito, IParticipacion, ITorneos, Persona } from '../../types'

function ParticipacionesPage () {
    const [participaciones, setParticipaciones] = useState<IParticipacion[]>([])
    const [personas, setPersonas] = useState<Persona[]>([])
    const [torneos, setTorneos] = useState<ITorneos[]>([])
    const [circuitos, setCircuitos] = useState<Circuito[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        Promise.all([getParticipaciones(), getPersonas(), getTorneos(), getCircuitos()])
            .then(([datosParticipaciones, datosPersonas, datosTorneos, datosCircuitos]) => {
                setParticipaciones(datosParticipaciones)
                setPersonas(datosPersonas)
                setTorneos(datosTorneos)
                setCircuitos(datosCircuitos)
            })
            .catch((motivo: unknown) => {
                setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar las participaciones')
            })
            .finally(() => setCargando(false))
    }, [])

    function nombrePersona (id: number) {
        const persona = personas.find((item) => item.idPersona === id)
        return persona ? `${persona.nombre} ${persona.apellido}` : `#${id}`
    }

    function nombreTorneo (id: number) {
        return torneos.find((item) => item.idTorneos === id)?.nombre ?? `#${id}`
    }

    function nombreCircuito (id: number) {
        const circuito = circuitos.find((item) => item.idCircuitos === id)
        return circuito ? `Circuito ${id} (${circuito.distancia} m)` : `#${id}`
    }

    if (cargando) {
        return <Typography sx={{ p: 3 }}>Cargando...</Typography>
    }

    const ordenadas = [...participaciones].sort((a, b) => a.posicion_final - b.posicion_final)

    return (
        <div style={{ padding: 24 }}>
            <Typography variant="h4" gutterBottom>
                Participaciones
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Torneo</TableCell>
                        <TableCell>Circuito</TableCell>
                        <TableCell>Piloto</TableCell>
                        <TableCell>Tiempo</TableCell>
                        <TableCell>Puntos</TableCell>
                        <TableCell>Posición final</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {ordenadas.map((participacion, indice) => (
                        <TableRow
                            key={`${participacion.Carrera_Torneos_idTorneos}-${participacion.Carrera_Circuitos_idCircuitos}-${participacion.Carrera_fecha.toISOString()}-${participacion.Personas_idPersona}-${indice}`}
                        >
                            <TableCell>{participacion.Carrera_fecha.toLocaleDateString()}</TableCell>
                            <TableCell>{nombreTorneo(participacion.Carrera_Torneos_idTorneos)}</TableCell>
                            <TableCell>{nombreCircuito(participacion.Carrera_Circuitos_idCircuitos)}</TableCell>
                            <TableCell>{nombrePersona(participacion.Personas_idPersona)}</TableCell>
                            <TableCell>{participacion.tiempo}</TableCell>
                            <TableCell>{participacion.puntos}</TableCell>
                            <TableCell>{participacion.posicion_final}°</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default ParticipacionesPage
