import { useEffect, useState } from 'react'
import Table from '@mui/material/Table'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import Button from '@mui/material/Button'
import { getTiposKarting, deleteTipoKarting } from '../../services/tipoKartingService'
import { getTiposLicencia } from '../../services/tipoLicenciaService'
import type { TipoKarting, TipoLicencia } from '../../types'
import TipoKartingFormDialog from './TipoKartingFormDialog'

function TiposKartingPage() {
    const [tiposKarting, setTiposKarting] = useState<TipoKarting[]>([])
    const [tiposLicencia, setTiposLicencia] = useState<TipoLicencia[]>([])
    const [cargando, setCargando] = useState(true)
    const [abierto, setAbierto] = useState(false)
    const [tipoEditando, setTipoEditando] = useState<TipoKarting | null>(null)

    function cargarTiposKarting() {
        setCargando(true)
        Promise.all([getTiposKarting(), getTiposLicencia()])
            .then(([datosTipos, datosLicencia]) => {
                setTiposKarting(datosTipos)
                setTiposLicencia(datosLicencia)
            })
            .finally(() => setCargando(false))
    }

    function nombreTipoLicencia(id: number) {
        return tiposLicencia.find((t) => t.idTipoLicencia === id)?.nombre ?? '-'
    }

    useEffect(() => {
        cargarTiposKarting()
    }, [])

    function handleNuevo() {
        setTipoEditando(null)
        setAbierto(true)
    }

    function handleEditar(tipo: TipoKarting) {
        setTipoEditando(tipo)
        setAbierto(true)
    }

    function handleGuardado() {
        setAbierto(false)
        setTipoEditando(null)
        cargarTiposKarting()
    }

    async function handleEliminar(id: number) {
        const confirmar = window.confirm('¿Seguro que querés eliminar este tipo de karting?')
        if (!confirmar) return

        try {
            await deleteTipoKarting(id)
            cargarTiposKarting()
        } catch (error) {
            alert(error instanceof Error ? error.message : 'No se pudo eliminar el tipo de karting')
            console.error(error)
        }
    }

    if (cargando) {
        return <Typography sx={{ p: 3 }}>Cargando...</Typography>
    }

    return (
        <div style={{ padding: 24 }}>
            <Typography variant="h4" gutterBottom>
                Tipos de Karting
            </Typography>

            <Button variant="contained" onClick={handleNuevo} sx={{ mb: 2 }}>
                Nuevo Tipo de Karting
            </Button>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Licencia Minima</TableCell>
                        <TableCell>Descripcion</TableCell>
                        <TableCell>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tiposKarting.map((tipo) => (
                        <TableRow key={tipo.idTiposKarting}>
                            <TableCell>{tipo.nombre}</TableCell>
                            <TableCell>{nombreTipoLicencia(tipo.TiposLicencias_idTipoLicenciaMinima)}</TableCell>
                            <TableCell>{tipo.descripcion}</TableCell>
                            <TableCell>
                                <Button size="small" onClick={() => handleEditar(tipo)}>
                                    Editar
                                </Button>
                                <Button size="small" color="error" onClick={() => handleEliminar(tipo.idTiposKarting)}>
                                    Eliminar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <TipoKartingFormDialog
                abierto={abierto}
                tipoKarting={tipoEditando}
                onCerrar={() => setAbierto(false)}
                onGuardado={handleGuardado}
            />
        </div>
    )
}

export default TiposKartingPage
