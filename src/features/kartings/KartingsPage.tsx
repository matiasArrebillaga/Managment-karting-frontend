import { useEffect, useState } from 'react'
import { Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import { puede } from '../../permisos'
import { getKartings, deleteKarting } from '../../services/kartingService'
import { getTiposKarting } from '../../services/tipoKartingService'
import type { Karting, TipoKarting } from '../../types'
import KartingFormDialog from './KartingFormDialog'
import FilaVacia from '../../components/FilaVacia'
import { useConfirmar } from '../../components/useConfirmar'
import { fecha } from '../../utils/formato'

function KartingsPage() {
    const { persona } = useAuth()
    const { confirmar, dialogo } = useConfirmar()
    const [kartings, setKartings] = useState<Karting[]>([])
    const [tiposKarting, setTiposKarting] = useState<TipoKarting[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [abierto, setAbierto] = useState(false)
    const [kartingEditando, setKartingEditando] = useState<Karting | null>(null)
    const puedeGestionar = puede(persona?.rol.nombre, 'kartings.gestionar')
    const puedeEliminar = puede(persona?.rol.nombre, 'kartings.eliminar')
    const conAcciones = puedeGestionar || puedeEliminar

    function cargarKartings() {
        Promise.all([
            getKartings(),
            getTiposKarting(),
        ])
            .then(([datosKartings, datosTipos]) => {
                setError('')
                setKartings(datosKartings)
                setTiposKarting(datosTipos)
            })
            .catch((motivo: unknown) => {
                setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los kartings')
            })
            .finally(() => setCargando(false))
    }

    function nombreTipoKarting(id: number) {
        return tiposKarting.find((t) => t.idTiposKarting === id)?.nombre ?? `Tipo #${id}`
    }

    useEffect(() => {
        cargarKartings()
    }, [])

    function handleNuevo() {
        setKartingEditando(null)
        setAbierto(true)
    }

    function handleEditar(karting: Karting) {
        setKartingEditando(karting)
        setAbierto(true)
    }

    function handleGuardado() {
        setAbierto(false)
        setKartingEditando(null)
        cargarKartings()
    }

    async function handleEliminar(karting: Karting) {
        if (!(await confirmar(`¿Eliminar el karting ${karting.modelo}?`, 'Eliminar'))) return

        try {
            await deleteKarting(karting.idKartings)
            cargarKartings()
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo eliminar el karting')
        }
    }

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <p className="eyebrow">Pista</p>
                    <h1>Kartings</h1>
                </div>
                {puedeGestionar && <button className="btn" type="button" onClick={handleNuevo}>Nuevo karting</button>}
            </div>
            {error && <Alert severity="error">{error}</Alert>}

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Modelo</TableCell>
                            <TableCell>Categoría</TableCell>
                            <TableCell>Tipo de karting</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Fecha de adquisición</TableCell>
                            {conAcciones && <TableCell>Acciones</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {kartings.map((karting) => (
                            <TableRow key={karting.idKartings}>
                                <TableCell>{karting.modelo}</TableCell>
                                <TableCell>{karting.categoria}</TableCell>
                                <TableCell>{nombreTipoKarting(karting.TiposKarting_idTiposKarting)}</TableCell>
                                <TableCell>
                                    <span className={`tag ${karting.estado.toLowerCase() === 'disponible' ? 'ok' : 'warn'}`}>{karting.estado}</span>
                                </TableCell>
                                <TableCell>{fecha(karting.fechaAdquisicion)}</TableCell>
                                {conAcciones && (
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        {puedeGestionar && (
                                            <Button size="small" onClick={() => handleEditar(karting)}>
                                                Editar
                                            </Button>
                                        )}
                                        {puedeEliminar && (
                                            <Button size="small" color="error" onClick={() => handleEliminar(karting)}>
                                                Eliminar
                                            </Button>
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                        {kartings.length === 0 && !error && (
                            <FilaVacia columnas={conAcciones ? 6 : 5} cargando={cargando} texto="No hay kartings cargados." />
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {abierto && (
                <KartingFormDialog
                    karting={kartingEditando}
                    onCerrar={() => setAbierto(false)}
                    onGuardado={handleGuardado}
                />
            )}
            {dialogo}
        </div>
    )
}

export default KartingsPage
