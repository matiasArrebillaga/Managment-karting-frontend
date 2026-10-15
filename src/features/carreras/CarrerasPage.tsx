import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import FilaVacia from '../../components/FilaVacia'
import { useConfirmar } from '../../components/useConfirmar'
import { fecha, hora } from '../../utils/formato'
import { getCarreras, deleteCarrera, getInscripcionesCarreras, desanotarseDeCarrera, fechaApi } from '../../services/carreraService'
import { getCircuitos } from '../../services/circuitoService'
import { getTorneos } from '../../services/torneoService'
import { getKartings } from '../../services/kartingService'
import type { Circuito, ICarrera, ITorneos, Karting } from '../../types'
import CarreraFormDialog from './CarreraFormDialog'
import CarreraInscripcionDialog from './CarreraInscripcionDialog'
import { usaMocks } from '../../services/httpClient'
import { getParticipaciones } from '../../services/participacionService'
import ResultadosCarreraDialog from './ResultadosCarreraDialog'
import { puede } from '../../permisos'

function CarrerasPage () {
    const { persona } = useAuth()
    const { confirmar, dialogo } = useConfirmar()
    const [carreras, setCarreras] = useState<ICarrera[]>([])
    const [inscripciones, setInscripciones] = useState<number[]>([])
    const [circuitos, setCircuitos] = useState<Circuito[]>([])
    const [torneos, setTorneos] = useState<ITorneos[]>([])
    const [kartings, setKartings] = useState<Karting[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [abierto, setAbierto] = useState(false)
    const [carreraEditando, setCarreraEditando] = useState<ICarrera | null>(null)
    const [carreraInscribiendo, setCarreraInscribiendo] = useState<ICarrera | null>(null)
    const [conResultados, setConResultados] = useState<string[]>([])
    const [carreraResultados, setCarreraResultados] = useState<ICarrera | null>(null)
    const puedeGestionar = puede(persona?.rol.nombre, 'carreras.gestionar')
    const puedeEliminar = puede(persona?.rol.nombre, 'carreras.eliminar')

    function cargarCarreras () {
        setCargando(true)
        setError('')
        Promise.all([
            getCarreras(),
            getCircuitos(),
            getTorneos(),
            persona && usaMocks ? getInscripcionesCarreras(persona.idPersona) : Promise.resolve([]),
            puedeGestionar ? getParticipaciones() : Promise.resolve([]),
            getKartings(),
        ])
            .then(([datosCarreras, datosCircuitos, datosTorneos, datosInscripciones, datosParticipaciones, datosKartings]) => {
                setCarreras(datosCarreras)
                setCircuitos(datosCircuitos)
                setTorneos(datosTorneos)
                setKartings(datosKartings)
                setInscripciones(datosInscripciones)
                setConResultados(datosParticipaciones.map((p) => claveCarrera(p.Carrera_fecha, p.Carrera_Torneos_idTorneos, p.Carrera_Circuitos_idCircuitos)))
            })
            .catch((motivo: unknown) => {
                setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar las carreras')
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

    function nombreKarting (id: number) {
        const karting = kartings.find((item) => item.idKartings === id)
        return karting ? karting.modelo : `#${id}`
    }

    // Una carrera se identifica por fecha + torneo + circuito (su clave compuesta)
    function claveCarrera (fecha: Date, idTorneo: number, idCircuito: number) {
        return `${fechaApi(fecha)}-${idTorneo}-${idCircuito}`
    }

    async function handleEliminar (carrera: ICarrera) {
        if (!(await confirmar(`¿Eliminar la carrera del ${fecha(carrera.fechaCarrera)}?`, 'Eliminar'))) return

        try {
            await deleteCarrera(carrera)
            cargarCarreras()
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo eliminar la carrera')
        }
    }

    function handleAnotarse (carrera: ICarrera) {
        setCarreraInscribiendo(carrera)
    }

    function handleInscripto () {
        const idCarrera = carreraInscribiendo?.idCarreras
        if (idCarrera !== undefined) setInscripciones((actuales) => [...actuales, idCarrera])
        setCarreraInscribiendo(null)
    }

    async function handleDesanotarse (idCarrera?: number) {
        if (!persona || idCarrera === undefined) return
        if (!(await confirmar('¿Desanotarte de esta carrera?', 'Desanotarme'))) return

        try {
            await desanotarseDeCarrera(idCarrera, persona.idPersona)
            setInscripciones((actuales) => actuales.filter((id) => id !== idCarrera))
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo cancelar la inscripción')
        }
    }

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <p className="eyebrow">Competencia</p>
                    <h1>Carreras y resultados</h1>
                    {!usaMocks && (
                        <p className="sub">Para correr una carrera, anotate al torneo desde <Link to="/torneos">Torneos</Link>.</p>
                    )}
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
                                <TableCell>{nombreCircuito(carrera.Circuitos_idCircuitos)}</TableCell>
                                <TableCell>{(carrera.kartings ?? (carrera.Kartings_idKartings === undefined ? [] : [carrera.Kartings_idKartings])).map(nombreKarting).join(', ') || '—'}</TableCell>
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
                                    {usaMocks && carrera.idCarreras !== undefined && inscripciones.includes(carrera.idCarreras) ? (
                                        <Button size="small" onClick={() => handleDesanotarse(carrera.idCarreras)}>
                                            Desanotarme
                                        </Button>
                                    ) : usaMocks ? (
                                        <Button size="small" variant="contained" onClick={() => handleAnotarse(carrera)}>
                                            Anotarme
                                        </Button>
                                    ) : null}
                                </TableCell>
                            </TableRow>
                        ))}
                        {carreras.length === 0 && !error && (
                            <FilaVacia columnas={7} cargando={cargando} texto="No hay carreras cargadas." />
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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
            <ResultadosCarreraDialog
                carrera={carreraResultados}
                puedeBorrar={puede(persona?.rol.nombre, 'resultados.eliminar')}
                onCerrar={() => {
                    setCarreraResultados(null)
                    cargarCarreras()
                }}
            />
            {dialogo}
        </div>
    )
}

export default CarrerasPage