import { useEffect, useState } from 'react'
import Table from '@mui/material/Table'
import TableContainer from '@mui/material/TableContainer'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import { getLocalidades, deleteLocalidad } from '../../services/localidadService'
import type { Localidad } from '../../types'
import LocalidadFormDialog from './LocalidadFormDialog'

function LocalidadesPage() {
    const [localidades, setLocalidades] = useState<Localidad[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [abierto, setAbierto] = useState(false)
    const [localidadEditando, setLocalidadEditando] = useState<Localidad | null>(null)

    async function cargarLocalidades() {
        setCargando(true)
        setError('')
        try {
            setLocalidades(await getLocalidades())
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar las localidades')
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarLocalidades()
    }, [])

    function handleNueva() {
        setLocalidadEditando(null)
        setAbierto(true)
    }

    function handleEditar(localidad: Localidad) {
        setLocalidadEditando(localidad)
        setAbierto(true)
    }

    function handleGuardado() {
        setAbierto(false)
        setLocalidadEditando(null)
        cargarLocalidades()
    }

    async function handleEliminar(id: number) {
        const confirmar = window.confirm('¿Seguro que querés eliminar esta localidad?')
        if (!confirmar) return

        try {
            await deleteLocalidad(id)
            cargarLocalidades()
        } catch (error) {
            alert(error instanceof Error ? error.message : 'No se pudo eliminar la localidad')
            console.error(error)
        }
    }

    if (cargando) {
        return <Typography sx={{ p: 3 }}>Cargando...</Typography>
    }

    return (
        <div style={{ padding: 24 }}>
            <Typography variant="h4" gutterBottom>
                Localidades
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Button variant="contained" onClick={handleNueva} sx={{ mb: 2 }}>
                Nueva Localidad
            </Button>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {localidades.map((localidad) => (
                            <TableRow key={localidad.idLocalidades}>
                                <TableCell>{localidad.nombre}</TableCell>
                                <TableCell>
                                    <Button size="small" onClick={() => handleEditar(localidad)}>
                                        Editar
                                    </Button>
                                    <Button size="small" color="error" onClick={() => handleEliminar(localidad.idLocalidades)}>
                                        Eliminar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {localidades.length === 0 && !error && (
                            <TableRow>
                                <TableCell colSpan={2} align="center">
                                    No hay localidades para mostrar.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <LocalidadFormDialog
                abierto={abierto}
                localidad={localidadEditando}
                onCerrar={() => setAbierto(false)}
                onGuardado={handleGuardado}
            />
        </div>
    )
}

export default LocalidadesPage
