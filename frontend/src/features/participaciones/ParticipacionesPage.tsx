import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { getParticipaciones } from '../../services/participacionService'
import { getPersonas } from '../../services/personaService'
import { getTorneos } from '../../services/torneoService'
import { getCircuitos } from '../../services/circuitoService'
import { getKartings } from '../../services/kartingService'
import type { Circuito, IParticipacion, ITorneos, Karting, Persona } from '../../types'

function ParticipacionesPage () {
    const [participaciones, setParticipaciones] = useState<IParticipacion[]>([])
    const [personas, setPersonas] = useState<Persona[]>([])
    const [torneos, setTorneos] = useState<ITorneos[]>([])
    const [circuitos, setCircuitos] = useState<Circuito[]>([])
    const [kartings, setKartings] = useState<Karting[]>([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        Promise.all([getParticipaciones(), getPersonas(), getTorneos(), getCircuitos(), getKartings()])
            .then(([datosParticipaciones, datosPersonas, datosTorneos, datosCircuitos, datosKartings]) => {
                setParticipaciones(datosParticipaciones)
                setPersonas(datosPersonas)
                setTorneos(datosTorneos)
                setCircuitos(datosCircuitos)
                setKartings(datosKartings)
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

    function nombreKarting (id: number) {
        const karting = kartings.find((item) => item.idKartings === id)
        return karting ? `${karting.modelo} (${karting.categoria})` : `#${id}`
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

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Torneo</TableCell>
                        <TableCell>Circuito</TableCell>
                        <TableCell>Piloto</TableCell>
                        <TableCell>Karting</TableCell>
                        <TableCell>Tiempo</TableCell>
                        <TableCell>Puntos</TableCell>
                        <TableCell>Posición final</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {ordenadas.map((participacion, indice) => (
                        <TableRow
                            key={`${participacion.Carrera_Torneos_idTorneos}-${participacion.Carrera_Circuitos_idCircuitos}-${participacion.Carrera_Fecha.toISOString()}-${participacion.Personas_idPersona}-${indice}`}
                        >
                            <TableCell>{participacion.Carrera_Fecha.toLocaleDateString()}</TableCell>
                            <TableCell>{nombreTorneo(participacion.Carrera_Torneos_idTorneos)}</TableCell>
                            <TableCell>{nombreCircuito(participacion.Carrera_Circuitos_idCircuitos)}</TableCell>
                            <TableCell>{nombrePersona(participacion.Personas_idPersona)}</TableCell>
                            <TableCell>{nombreKarting(participacion.Carrera_Kartings_idKartings)}</TableCell>
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
