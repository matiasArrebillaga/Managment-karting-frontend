import { useEffect, useState } from 'react'
import { Alert, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import { deleteReserva, getMisReservas, getReservas } from '../../services/reservaService'
import { getCircuitos } from '../../services/circuitoService'
import { getKartings } from '../../services/kartingService'
import { getPersonas } from '../../services/personaService'
import { usaMocks } from '../../services/httpClient'
import type { Circuito, IReserva, Karting, Persona } from '../../types'
import ReservaFormDialog from './ReservaFormDialog'

function ReservasPage () {
    const { persona } = useAuth()
    const [reservas, setReservas] = useState<IReserva[]>([])
    const [circuitos, setCircuitos] = useState<Circuito[]>([])
    const [kartings, setKartings] = useState<Karting[]>([])
    const [personas, setPersonas] = useState<Persona[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [abierto, setAbierto] = useState(false)
    const [reservaEditando, setReservaEditando] = useState<IReserva | null>(null)
    const puedeGestionar = persona?.rol.nombre === 'ADMIN' || persona?.rol.nombre === 'EMPLEADO'
    const puedeCrearReserva = usaMocks || persona?.rol.nombre === 'EMPLEADO'
    const reservasVisibles = reservas.filter((reserva) => (
        puedeGestionar || reserva.Personas_idPersona === persona?.idPersona
    ))

    function cargarReservas () {
        setCargando(true)
        setError('')
        Promise.all([
            puedeGestionar ? getReservas() : getMisReservas(persona?.idPersona),
            getCircuitos(),
            getKartings(),
            puedeGestionar ? getPersonas() : Promise.resolve([]),
        ])
            .then(([datosReservas, datosCircuitos, datosKartings, datosPersonas]) => {
                setReservas(datosReservas)
                setCircuitos(datosCircuitos)
                setKartings(datosKartings)
                setPersonas(datosPersonas)
            })
            .catch((motivo: unknown) => {
                setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar las reservas')
            })
            .finally(() => setCargando(false))
    }

    useEffect(() => {
        if (!persona) return
        cargarReservas()
    }, [persona?.idPersona, puedeGestionar])

    function nombrePersona (id: number) {
        const titular = personas.find((item) => item.idPersona === id)
        if (titular) return `${titular.nombre} ${titular.apellido}`
        if (persona?.idPersona === id) return `${persona.nombre} ${persona.apellido}`
        return `#${id}`
    }

    function nombreCircuito (id: number) {
        const circuito = circuitos.find((item) => item.idCircuitos === id)
        return circuito ? `Circuito ${id} (${circuito.distancia} m)` : `#${id}`
    }

    function nombreKarting (id: number) {
        const karting = kartings.find((item) => item.idKartings === id)
        return karting ? `${karting.modelo} (${karting.categoria})` : `#${id}`
    }

    function mostrarFecha (fecha: Date) {
        return fecha.toLocaleDateString()
    }

    function mostrarHora (hora: Date | string) {
        return typeof hora === 'string'
            ? hora.slice(0, 5)
            : hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    function handleNueva () {
        setReservaEditando(null)
        setAbierto(true)
    }

    function handleEditar (reserva: IReserva) {
        setReservaEditando(reserva)
        setAbierto(true)
    }

    function handleGuardado () {
        setAbierto(false)
        setReservaEditando(null)
        cargarReservas()
    }

    async function handleEliminar (id: number) {
        if (!window.confirm('¿Seguro que querés cancelar esta reserva?')) return

        try {
            await deleteReserva(id)
            cargarReservas()
        } catch (error) {
            alert(error instanceof Error ? error.message : 'No se pudo cancelar la reserva')
            console.error(error)
        }
    }

    if (cargando) {
        return <Typography sx={{ p: 3 }}>Cargando...</Typography>
    }

    return (
        <div style={{ padding: 24 }}>
            <Typography variant="h4" gutterBottom>
                Reservas
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {puedeCrearReserva && (
                <Button variant="contained" onClick={handleNueva} sx={{ mb: 2 }}>
                    Nueva Reserva
                </Button>
            )}

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Inicio</TableCell>
                        <TableCell>Fin</TableCell>
                        <TableCell>Persona</TableCell>
                        <TableCell>Circuito</TableCell>
                        <TableCell>Karting</TableCell>
                        <TableCell>Monto</TableCell>
                        <TableCell>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {reservasVisibles.map((reserva) => {
                        const puedeModificar = puedeGestionar || persona?.idPersona === reserva.Personas_idPersona
                        return (
                            <TableRow key={reserva.idReservas}>
                                <TableCell>{mostrarFecha(reserva.fechaReserva)}</TableCell>
                                <TableCell>{mostrarHora(reserva.horaInicio)}</TableCell>
                                <TableCell>{mostrarHora(reserva.horaFin)}</TableCell>
                                <TableCell>{nombrePersona(reserva.Personas_idPersona)}</TableCell>
                                <TableCell>{nombreCircuito(reserva.Circuitos_idCircuitos)}</TableCell>
                                <TableCell>{nombreKarting(reserva.Kartings_idKartings)}</TableCell>
                                <TableCell>{reserva.monto !== undefined ? `$ ${reserva.monto}` : '—'}</TableCell>
                                <TableCell>
                                    {puedeModificar && (
                                        <>
                                            <Button size="small" onClick={() => handleEditar(reserva)}>
                                                Editar
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => reserva.idReservas !== undefined && handleEliminar(reserva.idReservas)}
                                            >
                                                Cancelar
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                    {reservasVisibles.length === 0 && !error && (
                        <TableRow>
                            <TableCell colSpan={8} align="center">
                                No hay reservas para mostrar.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {persona && (
                <ReservaFormDialog
                    abierto={abierto}
                    reserva={reservaEditando}
                    idPersonaActual={persona.idPersona}
                    nombrePersonaActual={`${persona.nombre} ${persona.apellido}`}
                    puedeGestionar={puedeGestionar}
                    onCerrar={() => setAbierto(false)}
                    onGuardado={handleGuardado}
                />
            )}
        </div>
    )
}

export default ReservasPage
