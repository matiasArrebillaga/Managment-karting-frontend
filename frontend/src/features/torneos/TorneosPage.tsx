import { useEffect, useState } from 'react'
import { Button, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import {
    deleteTorneo,
    desanotarseDeTorneo,
    getResumenInscripcionesTorneos,
    getTorneos,
    inscribirseATorneo,
} from '../../services/torneoService'
import type { ITorneos } from '../../types'
import TorneoFormDialog from './TorneoFormDialog'

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

function TorneosPage () {
    const { persona } = useAuth()
    const [torneos, setTorneos] = useState<ITorneos[]>([])
    const [torneosAnotados, setTorneosAnotados] = useState<number[]>([])
    const [inscriptosPorTorneo, setInscriptosPorTorneo] = useState<Record<number, number>>({})
    const [cargando, setCargando] = useState(true)
    const [abierto, setAbierto] = useState(false)
    const [torneoEditando, setTorneoEditando] = useState<ITorneos | null>(null)
    const puedeGestionar = persona?.rol.nombre === 'ADMIN' || persona?.rol.nombre === 'EMPLEADO'

    function cargarTorneos () {
        setCargando(true)
        Promise.all([
            getTorneos(),
            persona ? getResumenInscripcionesTorneos(persona.idPersona) : Promise.resolve({ torneosAnotados: [], inscriptosPorTorneo: {} }),
        ])
            .then(([datosTorneos, resumen]) => {
                setTorneos(datosTorneos)
                setTorneosAnotados(resumen.torneosAnotados)
                setInscriptosPorTorneo(resumen.inscriptosPorTorneo)
            })
            .finally(() => setCargando(false))
    }

    useEffect(() => {
        cargarTorneos()
    }, [])

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

    async function handleEliminar (id: number) {
        if (!window.confirm('¿Seguro que querés eliminar este torneo?')) return

        try {
            await deleteTorneo(id)
            cargarTorneos()
        } catch (error) {
            alert(error instanceof Error ? error.message : 'No se pudo eliminar el torneo')
            console.error(error)
        }
    }

    async function handleAnotarse (idTorneo: number) {
        if (!persona) return

        try {
            await inscribirseATorneo(idTorneo, persona.idPersona)
            setTorneosAnotados((actuales) => [...actuales, idTorneo])
            setInscriptosPorTorneo((actuales) => ({
                ...actuales,
                [idTorneo]: (actuales[idTorneo] ?? 0) + 1,
            }))
        } catch (error) {
            alert(error instanceof Error ? error.message : 'No se pudo completar la inscripción')
            console.error(error)
        }
    }

    async function handleDesanotarse (idTorneo: number) {
        if (!persona || !window.confirm('¿Seguro que querés desanotarte de este torneo?')) return

        try {
            await desanotarseDeTorneo(idTorneo, persona.idPersona)
            setTorneosAnotados((actuales) => actuales.filter((id) => id !== idTorneo))
            setInscriptosPorTorneo((actuales) => ({
                ...actuales,
                [idTorneo]: Math.max(0, (actuales[idTorneo] ?? 0) - 1),
            }))
        } catch (error) {
            alert(error instanceof Error ? error.message : 'No se pudo cancelar la inscripción')
            console.error(error)
        }
    }

    if (cargando) {
        return <Typography sx={{ p: 3 }}>Cargando...</Typography>
    }

    return (
        <div style={{ padding: 24 }}>
            <Typography variant="h4" gutterBottom>
                Torneos
            </Typography>

            {puedeGestionar && (
                <Button variant="contained" onClick={handleNuevo} sx={{ mb: 2 }}>
                    Nuevo Torneo
                </Button>
            )}

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell>Inscriptos / cupo</TableCell>
                        <TableCell>Fecha de inicio</TableCell>
                        <TableCell>Fecha de fin</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Inscripción</TableCell>
                        {puedeGestionar && <TableCell>Acciones</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {torneos.map((torneo) => {
                        const estado = estadoTorneo(torneo)
                        return (
                            <TableRow key={torneo.idTorneos ?? torneo.nombre}>
                                <TableCell>{torneo.nombre}</TableCell>
                                <TableCell>{torneo.descripcion}</TableCell>
                                <TableCell>{inscriptosPorTorneo[torneo.idTorneos] ?? 0} / {torneo.cupoMaximo}</TableCell>
                                <TableCell>{torneo.fechaInicio.toLocaleDateString()}</TableCell>
                                <TableCell>{torneo.fechaFin.toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Chip
                                        size="small"
                                        label={estado}
                                        color={estado === 'Terminado' ? 'default' : estado === 'En curso' ? 'success' : 'primary'}
                                    />
                                </TableCell>
                                <TableCell>
                                    {torneosAnotados.includes(torneo.idTorneos) ? (
                                        <Button size="small" onClick={() => handleDesanotarse(torneo.idTorneos)}>
                                            Desanotarme
                                        </Button>
                                    ) : estado === 'Terminado' ? (
                                        <Button size="small" disabled>Terminado</Button>
                                    ) : (inscriptosPorTorneo[torneo.idTorneos] ?? 0) >= torneo.cupoMaximo ? (
                                        <Button size="small" disabled>Completo</Button>
                                    ) : (
                                        <Button size="small" variant="contained" onClick={() => handleAnotarse(torneo.idTorneos)}>
                                            Anotarme
                                        </Button>
                                    )}
                                </TableCell>
                                {puedeGestionar && torneo.idTorneos !== undefined && (
                                    <TableCell>
                                        <Button size="small" onClick={() => handleEditar(torneo)}>
                                            Editar
                                        </Button>
                                        <Button size="small" color="error" onClick={() => torneo.idTorneos !== undefined && handleEliminar(torneo.idTorneos)}>
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>

            {puedeGestionar && (
                <TorneoFormDialog
                    abierto={abierto}
                    torneo={torneoEditando}
                    onCerrar={() => setAbierto(false)}
                    onGuardado={handleGuardado}
                />
            )}
        </div>
    )
}

export default TorneosPage
