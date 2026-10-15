import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Alert, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import { deleteReserva, getMisReservas, getReservas, getReservasPorFechas } from '../../services/reservaService'
import { getCircuitos } from '../../services/circuitoService'
import { getKartings } from '../../services/kartingService'
import { getPersonas } from '../../services/personaService'
import type { Circuito, IReserva, Karting, Persona } from '../../types'
import ReservaFormDialog from './ReservaFormDialog'
import ReservaDetalleDialog from './ReservaDetalleDialog'
import { puede } from '../../permisos'
import FilaVacia from '../../components/FilaVacia'
import { useConfirmar } from '../../components/useConfirmar'
import { fecha, hora, pesos } from '../../utils/formato'

// soloPropias: historial de la persona logueada (Mi cuenta), aunque sea staff
function ReservasPage ({ soloPropias = false }: { soloPropias?: boolean }) {
    const { persona } = useAuth()
    const { confirmar, dialogo } = useConfirmar()
    const mensaje = (useLocation().state as { mensaje?: string } | null)?.mensaje
    const [reservas, setReservas] = useState<IReserva[]>([])
    const [circuitos, setCircuitos] = useState<Circuito[]>([])
    const [kartings, setKartings] = useState<Karting[]>([])
    const [personas, setPersonas] = useState<Persona[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [abierto, setAbierto] = useState(false)
    const [reservaEditando, setReservaEditando] = useState<IReserva | null>(null)
    const [reservaDetalle, setReservaDetalle] = useState<IReserva | null>(null)
    const [desde, setDesde] = useState('')
    const [hasta, setHasta] = useState('')
    const [filtro, setFiltro] = useState<{ desde: string; hasta: string } | null>(null)
    const [errorFiltro, setErrorFiltro] = useState('')
    const puedeGestionar = !soloPropias && puede(persona?.rol.nombre, 'reservas.verTodas')
    const reservasVisibles = reservas.filter((reserva) => (
        puedeGestionar || reserva.Personas_idPersona === persona?.idPersona
    ))

    // /reservas/fechas es solo para ADMIN y EMPLEADO: al cliente se le filtran sus propias reservas
    async function buscarReservas (rango: typeof filtro) {
        if (puedeGestionar) return rango ? getReservasPorFechas(rango.desde, rango.hasta) : getReservas()
        const propias = await getMisReservas(persona?.idPersona)
        if (!rango) return propias
        const inicio = new Date(`${rango.desde}T00:00:00`)
        const fin = new Date(`${rango.hasta}T00:00:00`)
        return propias.filter((reserva) => reserva.fechaReserva >= inicio && reserva.fechaReserva <= fin)
    }

    function cargarReservas (rango = filtro) {
        setCargando(true)
        setError('')
        Promise.all([
            buscarReservas(rango),
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

    function handleFiltrar () {
        if (!desde || !hasta) {
            setErrorFiltro('Completá las dos fechas para filtrar')
            return
        }
        if (desde > hasta) {
            setErrorFiltro('La fecha "desde" no puede ser posterior a la fecha "hasta"')
            return
        }
        setErrorFiltro('')
        setFiltro({ desde, hasta })
        cargarReservas({ desde, hasta })
    }

    function handleLimpiarFiltro () {
        setDesde('')
        setHasta('')
        setErrorFiltro('')
        setFiltro(null)
        cargarReservas(null)
    }

    function personaDe (id: number) {
        return personas.find((item) => item.idPersona === id) ?? (persona?.idPersona === id ? persona : undefined)
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
        if (!(await confirmar('¿Cancelar esta reserva?', 'Cancelar reserva'))) return

        try {
            await deleteReserva(id)
            cargarReservas()
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo cancelar la reserva')
        }
    }

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <p className="eyebrow">{soloPropias ? 'Mi cuenta' : 'Pista'}</p>
                    <h1>{soloPropias ? 'Historial de reservas' : 'Reservas'}</h1>
                </div>
                <button className="btn" type="button" onClick={handleNueva}>Nueva reserva</button>
            </div>
            {mensaje && <Alert severity="success">{mensaje}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'center' }} useFlexGap>
                <TextField
                    label="Desde"
                    type="date"
                    size="small"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                    label="Hasta"
                    type="date"
                    size="small"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
                <Button variant="outlined" onClick={handleFiltrar} disabled={cargando}>{cargando && filtro ? 'Filtrando...' : 'Filtrar'}</Button>
                {filtro && <Button onClick={handleLimpiarFiltro}>Ver todas</Button>}
            </Stack>
            {errorFiltro && <Alert severity="warning">{errorFiltro}</Alert>}

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Inicio</TableCell>
                            <TableCell>Fin</TableCell>
                            {!soloPropias && <TableCell>Persona</TableCell>}
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
                                <TableRow
                                    key={reserva.idReservas}
                                    hover
                                    sx={{ cursor: 'pointer' }}
                                    // la fila entera abre el detalle: con tabIndex y Enter también se abre desde el teclado
                                    tabIndex={0}
                                    aria-label={`Ver reserva del ${fecha(reserva.fechaReserva)} a las ${hora(reserva.horaInicio)}`}
                                    onClick={() => setReservaDetalle(reserva)}
                                    onKeyDown={(evento) => {
                                        if (evento.key === 'Enter' && evento.target === evento.currentTarget) setReservaDetalle(reserva)
                                    }}
                                >
                                    <TableCell>{fecha(reserva.fechaReserva)}</TableCell>
                                    <TableCell>{hora(reserva.horaInicio)}</TableCell>
                                    <TableCell>{hora(reserva.horaFin)}</TableCell>
                                    {!soloPropias && <TableCell>{nombrePersona(reserva.Personas_idPersona)}</TableCell>}
                                    <TableCell>{nombreCircuito(reserva.Circuitos_idCircuitos)}</TableCell>
                                    <TableCell>{nombreKarting(reserva.Kartings_idKartings)}</TableCell>
                                    <TableCell>{reserva.monto !== undefined ? pesos(reserva.monto) : '—'}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
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
                            <FilaVacia
                                columnas={soloPropias ? 7 : 8}
                                cargando={cargando}
                                texto={filtro ? 'No hay reservas en ese rango de fechas.' : 'No hay reservas para mostrar.'}
                            />
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <ReservaDetalleDialog
                reserva={reservaDetalle}
                persona={reservaDetalle ? personaDe(reservaDetalle.Personas_idPersona) : undefined}
                karting={kartings.find((item) => item.idKartings === reservaDetalle?.Kartings_idKartings)}
                circuito={circuitos.find((item) => item.idCircuitos === reservaDetalle?.Circuitos_idCircuitos)}
                onCerrar={() => setReservaDetalle(null)}
            />

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
            {dialogo}
        </div>
    )
}

export default ReservasPage
