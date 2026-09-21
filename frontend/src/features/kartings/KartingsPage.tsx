import { useEffect, useState } from 'react'
import Table from '@mui/material/Table'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import Button from '@mui/material/Button'
import { getKartings, deleteKarting } from '../../services/kartingService'
import type { Karting } from '../../types'
import KartingFormDialog from './KartingFormDialog'

function KartingsPage() {
    const [kartings, setKartings] = useState<Karting[]>([])
    const [cargando, setCargando] = useState(true)
    const [abierto, setAbierto] = useState(false)
    const [kartingEditando, setKartingEditando] = useState<Karting | null>(null)

    function cargarKartings() {
        setCargando(true)
        getKartings()
            .then((datos) => setKartings(datos))
            .finally(() => setCargando(false))
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
            alert('No se pudo eliminar el karting')
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

            <Button variant="contained" onClick={handleNuevo} sx={{ mb: 2 }}>
                Nuevo Karting
            </Button>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Numero</TableCell>
                        <TableCell>Modelo</TableCell>
                        <TableCell>Categoria</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Fecha Adquisicion</TableCell>
                        <TableCell>Ultimo Mantenimiento</TableCell>
                        <TableCell>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {kartings.map((karting) => (
                        <TableRow key={karting.id}>
                            <TableCell>{karting.numero}</TableCell>
                            <TableCell>{karting.modelo}</TableCell>
                            <TableCell>{karting.categoria}</TableCell>
                            <TableCell>{karting.estado}</TableCell>
                            <TableCell>{karting.fechaAdquisicion}</TableCell>
                            <TableCell>{karting.fechaUltimoMantenimiento}</TableCell>
                            <TableCell>
                                <Button size="small" onClick={() => handleEditar(karting)}>
                                    Editar
                                </Button>
                                <Button size="small" color="error" onClick={() => handleEliminar(karting.id)}>
                                    Eliminar
                                </Button>
                            </TableCell>
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
