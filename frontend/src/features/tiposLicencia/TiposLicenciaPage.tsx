import { useEffect, useState } from 'react'
import Table from '@mui/material/Table'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import Button from '@mui/material/Button'
import { getTiposLicencia, deleteTipoLicencia } from '../../services/tipoLicenciaService'
import type { TipoLicencia } from '../../types'
import TipoLicenciaFormDialog from './TipoLicenciaFormDialog'

function TiposLicenciaPage() {
    const [tiposLicencia, setTiposLicencia] = useState<TipoLicencia[]>([])
    const [cargando, setCargando] = useState(true)
    const [abierto, setAbierto] = useState(false)
    const [tipoEditando, setTipoEditando] = useState<TipoLicencia | null>(null)

    function cargarTiposLicencia() {
        setCargando(true)
        getTiposLicencia()
            .then((datos) => setTiposLicencia(datos))
            .finally(() => setCargando(false))
    }

    useEffect(() => {
        cargarTiposLicencia()
    }, [])

    function handleNuevo() {
        setTipoEditando(null)
        setAbierto(true)
    }

    function handleEditar(tipo: TipoLicencia) {
        setTipoEditando(tipo)
        setAbierto(true)
    }

    function handleGuardado() {
        setAbierto(false)
        setTipoEditando(null)
        cargarTiposLicencia()
    }

    async function handleEliminar(id: number) {
        const confirmar = window.confirm('¿Seguro que querés eliminar este tipo de licencia?')
        if (!confirmar) return

        try {
            await deleteTipoLicencia(id)
            cargarTiposLicencia()
        } catch (error) {
            alert('No se pudo eliminar el tipo de licencia')
            console.error(error)
        }
    }

    if (cargando) {
        return <Typography sx={{ p: 3 }}>Cargando...</Typography>
    }

    return (
        <div style={{ padding: 24 }}>
            <Typography variant="h4" gutterBottom>
                Tipos de Licencia
            </Typography>

            <Button variant="contained" onClick={handleNuevo} sx={{ mb: 2 }}>
                Nuevo Tipo de Licencia
            </Button>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Edad Minima</TableCell>
                        <TableCell>Descripcion</TableCell>
                        <TableCell>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tiposLicencia.map((tipo) => (
                        <TableRow key={tipo.id}>
                            <TableCell>{tipo.nombre}</TableCell>
                            <TableCell>{tipo.edadMinima}</TableCell>
                            <TableCell>{tipo.descripcion}</TableCell>
                            <TableCell>
                                <Button size="small" onClick={() => handleEditar(tipo)}>
                                    Editar
                                </Button>
                                <Button size="small" color="error" onClick={() => handleEliminar(tipo.id)}>
                                    Eliminar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <TipoLicenciaFormDialog
                abierto={abierto}
                tipoLicencia={tipoEditando}
                onCerrar={() => setAbierto(false)}
                onGuardado={handleGuardado}
            />
        </div>
    )
}

export default TiposLicenciaPage
