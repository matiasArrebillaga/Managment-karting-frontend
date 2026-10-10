import { useEffect, useState } from 'react'
import Table from '@mui/material/Table'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import { useAuth } from '../../context/AuthContext'
import { usaMocks } from '../../services/httpClient'
import { getKartings, deleteKarting } from '../../services/kartingService'
import { getTiposKarting } from '../../services/tipoKartingService'
import type { Karting, TipoKarting } from '../../types'
import KartingFormDialog from './KartingFormDialog'

function KartingsPage() {
    const { persona } = useAuth()
    const [kartings, setKartings] = useState<Karting[]>([])
    const [tiposKarting, setTiposKarting] = useState<TipoKarting[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [abierto, setAbierto] = useState(false)
    const [kartingEditando, setKartingEditando] = useState<Karting | null>(null)
    const puedeGestionar = usaMocks || persona?.rol.nombre === 'ADMIN' || persona?.rol.nombre === 'EMPLEADO'
    const puedeEliminar = usaMocks || persona?.rol.nombre === 'ADMIN' || persona?.rol.nombre === 'EMPLEADO'

    function cargarKartings() {
        setCargando(true)
        setError('')
        Promise.all([
            getKartings(),
            puedeGestionar ? getTiposKarting() : Promise.resolve([]),
        ])
            .then(([datosKartings, datosTipos]) => {
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

    async function handleEliminar(id: number) {
        const confirmar = window.confirm('¿Seguro que querés eliminar este karting?')
        if (!confirmar) return

        try {
            await deleteKarting(id)
            cargarKartings()
        } catch (error) {
            alert(error instanceof Error ? error.message : 'No se pudo eliminar el karting')
            console.error(error)
        }
    }

    if (cargando) {
        return <Typography sx={{ p: 3 }}>Cargando...</Typography>
    }

    return (
        <div style={{ padding: 24 }}>
            <Typography variant="h4" gutterBottom>
                Kartings
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {puedeGestionar && (
                <Button variant="contained" onClick={handleNuevo} sx={{ mb: 2 }}>
                    Nuevo Karting
                </Button>
            )}

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Modelo</TableCell>
                        <TableCell>Categoria</TableCell>
                        <TableCell>Tipo de Karting</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Fecha Adquisicion</TableCell>
                        {(puedeGestionar || puedeEliminar) && <TableCell>Acciones</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {kartings.map((karting) => (
                        <TableRow key={karting.idKartings}>
                            <TableCell>{karting.modelo}</TableCell>
                            <TableCell>{karting.categoria}</TableCell>
                            <TableCell>{nombreTipoKarting(karting.TiposKarting_idTiposKarting)}</TableCell>
                            <TableCell>{karting.estado}</TableCell>
                            <TableCell>{karting.fechaAdquisicion}</TableCell>
                            {(puedeGestionar || puedeEliminar) && (
                                <TableCell>
                                    {puedeGestionar && (
                                        <Button size="small" onClick={() => handleEditar(karting)}>
                                            Editar
                                        </Button>
                                    )}
                                    {puedeEliminar && (
                                        <Button size="small" color="error" onClick={() => handleEliminar(karting.idKartings)}>
                                            Eliminar
                                        </Button>
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <KartingFormDialog
                abierto={abierto}
                karting={kartingEditando}
                onCerrar={() => setAbierto(false)}
                onGuardado={handleGuardado}
            />
        </div>
    )
}

export default KartingsPage
