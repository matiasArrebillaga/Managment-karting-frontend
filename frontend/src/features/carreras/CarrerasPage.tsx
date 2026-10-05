import { useEffect, useState } from 'react'
import Table from '@mui/material/Table'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import Button from '@mui/material/Button'
import { useAuth } from '../../context/AuthContext'
import { getCarreras, deleteCarrera, getInscripcionesCarreras, desanotarseDeCarrera } from '../../services/carreraService'
import { getCircuitos } from '../../services/circuitoService'
import { getTorneos } from '../../services/torneoService'
import type { Circuito, ICarrera, ITorneos } from '../../types'
import CarreraFormDialog from './CarreraFormDialog'
import CarreraInscripcionDialog from './CarreraInscripcionDialog'

function CarrerasPage () {
    const { persona } = useAuth()
    const [carreras, setCarreras] = useState<ICarrera[]>([])
    const [inscripciones, setInscripciones] = useState<number[]>([])
    const [circuitos, setCircuitos] = useState<Circuito[]>([])
    const [torneos, setTorneos] = useState<ITorneos[]>([])
    const [cargando, setCargando] = useState(true)
    const [abierto, setAbierto] = useState(false)
    const [carreraEditando, setCarreraEditando] = useState<ICarrera | null>(null)
    const [carreraInscribiendo, setCarreraInscribiendo] = useState<ICarrera | null>(null)
    const puedeGestionar = persona?.rol.nombre === 'ADMIN' || persona?.rol.nombre === 'EMPLEADO'

    function cargarCarreras () {
        setCargando(true)
        Promise.all([
            getCarreras(),
            getCircuitos(),
            getTorneos(),
            persona ? getInscripcionesCarreras(persona.idPersona) : Promise.resolve([]),
        ])
            .then(([datosCarreras, datosCircuitos, datosTorneos, datosInscripciones]) => {
                setCarreras(datosCarreras)
                setCircuitos(datosCircuitos)
                setTorneos(datosTorneos)
                setInscripciones(datosInscripciones)
            })
            .finally(() => setCargando(false))
    }

    useEffect(() => {
        cargarCarreras()
    }, [])

    function handleNueva () {
        setCarreraEditando(null)
        setAbierto(true)
    }

    function handleEditar (carrera: ICarrera) {
        setCarreraEditando(carrera)
        setAbierto(true)
    }

    function handleGuardado () {
        setAbierto(false)
        setCarreraEditando(null)
        cargarCarreras()
    }

    function nombreCircuito (id: number) {
        const circuito = circuitos.find((item) => item.idCircuitos === id)
        return circuito ? `Circuito ${id} (${circuito.distancia} m)` : `#${id}`
    }

    function nombreTorneo (id: number) {
        return torneos.find((torneo) => torneo.idTorneos === id)?.nombre ?? `#${id}`
    }

    async function handleEliminar (id: number) {
        const confirmar = window.confirm('¿Seguro que querés eliminar esta carrera?')
        if (!confirmar) return

        try {
            await deleteCarrera(id)
            cargarCarreras()
        } catch (error) {
            alert(error instanceof Error ? error.message : 'No se pudo eliminar la carrera')
            console.error(error)
        }
    }

    function handleAnotarse (carrera: ICarrera) {
        setCarreraInscribiendo(carrera)
    }

    function handleInscripto () {
        if (carreraInscribiendo) {
            setInscripciones((actuales) => [...actuales, carreraInscribiendo.idCarreras])
        }
        setCarreraInscribiendo(null)
    }

    async function handleDesanotarse (idCarrera: number) {
        if (!persona) return
        if (!window.confirm('¿Seguro que querés desanotarte de esta carrera?')) return

        try {
            await desanotarseDeCarrera(idCarrera, persona.idPersona)
            setInscripciones((actuales) => actuales.filter((id) => id !== idCarrera))
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
                Carreras
            </Typography>

            {puedeGestionar && (
                <Button variant="contained" onClick={handleNueva} sx={{ mb: 2 }}>
                    Nueva Carrera
                </Button>
            )}

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Inicio</TableCell>
                        <TableCell>Fin</TableCell>
                        <TableCell>Torneo</TableCell>
                        <TableCell>Circuito</TableCell>
                        <TableCell>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {carreras.map((carrera) => (
                        <TableRow key={carrera.idCarreras}>
                            <TableCell>{carrera.fechaCarrera.toLocaleDateString()}</TableCell>
                            <TableCell>{carrera.horaInicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                            <TableCell>{carrera.horaFin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                            <TableCell>{nombreTorneo(carrera.Torneos_idTorneos)}</TableCell>
                            <TableCell>{nombreCircuito(carrera.Circuitos_idCircuitos)}</TableCell>
                            <TableCell>
                                {puedeGestionar && (
                                    <>
                                        <Button size="small" onClick={() => handleEditar(carrera)}>
                                            Editar
                                        </Button>
                                        <Button size="small" color="error" onClick={() => handleEliminar(carrera.idCarreras)}>
                                            Eliminar
                                        </Button>
                                    </>
                                )}
                                {inscripciones.includes(carrera.idCarreras) ? (
                                    <Button size="small" onClick={() => handleDesanotarse(carrera.idCarreras)}>
                                        Desanotarme
                                    </Button>
                                ) : (
                                    <Button size="small" variant="contained" onClick={() => handleAnotarse(carrera)}>
                                        Anotarme
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <CarreraFormDialog
                abierto={abierto}
                carrera={carreraEditando}
                onCerrar={() => setAbierto(false)}
                onGuardado={handleGuardado}
            />
            {persona && (
                <CarreraInscripcionDialog
                    abierto={Boolean(carreraInscribiendo)}
                    carrera={carreraInscribiendo}
                    idPersona={persona.idPersona}
                    onCerrar={() => setCarreraInscribiendo(null)}
                    onInscripto={handleInscripto}
                />
            )}
        </div>
    )
}

export default CarrerasPage