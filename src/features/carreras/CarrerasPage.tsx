import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import FilaVacia from '../../components/FilaVacia'
import { useConfirmar } from '../../components/useConfirmar'
import { useAviso } from '../../context/AvisoContext'
import { fecha, hora, nombreCircuito } from '../../utils/formato'
import { getCarreras, deleteCarrera } from '../../services/carreraService'
import { fechaTexto } from '../../utils/fechas'
import { getCircuitos } from '../../services/circuitoService'
import { getTorneos } from '../../services/torneoService'
import { getKartings } from '../../services/kartingService'
import type { Circuito, ICarrera, ITorneos, Karting } from '../../types'
import CarreraFormDialog from './CarreraFormDialog'
import { getParticipaciones } from '../../services/participacionService'
import ResultadosCarreraDialog from './ResultadosCarreraDialog'
import { puede } from '../../permisos'

// Una carrera se identifica por fecha + torneo + circuito (su clave compuesta)
function claveCarrera (fecha: Date, idTorneo: number, idCircuito: number) {
    return `${fechaTexto(fecha)}-${idTorneo}-${idCircuito}`
}

function CarrerasPage () {
    const { persona } = useAuth()
    const { confirmar, dialogo } = useConfirmar()
    const avisar = useAviso()
    const [carreras, setCarreras] = useState<ICarrera[]>([])
    const [circuitos, setCircuitos] = useState<Circuito[]>([])
    const [torneos, setTorneos] = useState<ITorneos[]>([])
    const [kartings, setKartings] = useState<Karting[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [abierto, setAbierto] = useState(false)
    const [carreraEditando, setCarreraEditando] = useState<ICarrera | null>(null)
    const [conResultados, setConResultados] = useState<string[]>([])
    const [carreraResultados, setCarreraResultados] = useState<ICarrera | null>(null)
    const puedeGestionar = puede(persona?.rol.nombre, 'carreras.gestionar')
    const puedeEliminar = puede(persona?.rol.nombre, 'carreras.eliminar')

    // useCallback: la función cambia solo si cambian los permisos, y el efecto de abajo
    // la usa como dependencia para recargar exactamente en ese caso
    const cargarCarreras = useCallback(() => {
        Promise.all([
            getCarreras(),
            getCircuitos(),
            getTorneos(),
            puedeGestionar ? getParticipaciones() : Promise.resolve([]),
            getKartings(),
        ])
            .then(([datosCarreras, datosCircuitos, datosTorneos, datosParticipaciones, datosKartings]) => {
                setCarreras(datosCarreras)
                setCircuitos(datosCircuitos)
                setTorneos(datosTorneos)
                setKartings(datosKartings)
                setConResultados(datosParticipaciones.map((p) => claveCarrera(p.Carrera_fecha, p.Carrera_Torneos_idTorneos, p.Carrera_Circuitos_idCircuitos)))
                setError('')
            })
            .catch((motivo: unknown) => {
                setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar las carreras')
            })
            .finally(() => setCargando(false))
    }, [puedeGestionar])

    useEffect(() => {
        cargarCarreras()
    }, [cargarCarreras])

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
        avisar('Carrera guardada')
    }

    function nombreTorneo (id: number) {
        return torneos.find((torneo) => torneo.idTorneos === id)?.nombre ?? `#${id}`
    }

    function nombreKarting (id: number) {
        const karting = kartings.find((item) => item.idKartings === id)
        return karting ? karting.modelo : `#${id}`
    }

    async function handleEliminar (carrera: ICarrera) {
        if (!(await confirmar(`¿Eliminar la carrera del ${fecha(carrera.fechaCarrera)}?`, 'Eliminar'))) return

        try {
            await deleteCarrera(carrera)
            cargarCarreras()
            avisar('Carrera eliminada')
        } catch (motivo) {
            avisar(motivo instanceof Error ? motivo.message : 'No se pudo eliminar la carrera', 'error')
        }
    }

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <p className="eyebrow">Competencia</p>
                    <h1>Carreras y resultados</h1>
                    <p className="sub">Para correr una carrera, anotate al torneo desde <Link to="/torneos">Torneos</Link>.</p>
                </div>
                {puedeGestionar && <button className="btn" type="button" onClick={handleNueva}>Nueva carrera</button>}
            </div>
            {error && <Alert severity="error">{error}</Alert>}

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Inicio</TableCell>
                            <TableCell>Fin</TableCell>
                            <TableCell>Torneo</TableCell>
                            <TableCell>Circuito</TableCell>
                            <TableCell>Kartings</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {carreras.map((carrera) => (
                            <TableRow key={`${carrera.fechaCarrera.toISOString()}-${carrera.Torneos_idTorneos}-${carrera.Circuitos_idCircuitos}`}>
                                <TableCell>{fecha(carrera.fechaCarrera)}</TableCell>
                                <TableCell>{hora(carrera.horaInicio)}</TableCell>
                                <TableCell>{hora(carrera.horaFin)}</TableCell>
                                <TableCell>{nombreTorneo(carrera.Torneos_idTorneos)}</TableCell>
                                <TableCell>{nombreCircuito(circuitos, carrera.Circuitos_idCircuitos)}</TableCell>
                                <TableCell>{carrera.kartings.map(nombreKarting).join(', ') || '—'}</TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                    {puedeGestionar && (
                                        <>
                                            <Button size="small" onClick={() => handleEditar(carrera)}>
                                                Editar
                                            </Button>
                                            <Button size="small" onClick={() => setCarreraResultados(carrera)}>
                                                {conResultados.includes(claveCarrera(carrera.fechaCarrera, carrera.Torneos_idTorneos, carrera.Circuitos_idCircuitos))
                                                    ? 'Ver clasificación'
                                                    : 'Cargar resultados'}
                                            </Button>
                                            {puedeEliminar && (
                                                <Button size="small" color="error" onClick={() => handleEliminar(carrera)}>
                                                    Eliminar
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {carreras.length === 0 && !error && (
                            <FilaVacia columnas={7} cargando={cargando} texto="No hay carreras cargadas." />
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {abierto && (
                <CarreraFormDialog
                    carrera={carreraEditando}
                    onCerrar={() => setAbierto(false)}
                    onGuardado={handleGuardado}
                />
            )}
            {carreraResultados && (
                <ResultadosCarreraDialog
                    carrera={carreraResultados}
                    puedeBorrar={puede(persona?.rol.nombre, 'resultados.eliminar')}
                    onCerrar={() => {
                        setCarreraResultados(null)
                        cargarCarreras()
                    }}
                />
            )}
            {dialogo}
        </div>
    )
}

export default CarrerasPage