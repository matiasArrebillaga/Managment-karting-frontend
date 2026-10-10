import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import Button from '@mui/material/Button'
import { useAuth } from '../../context/AuthContext'
import { usaMocks } from '../../services/httpClient'
import { getCircuitos, deleteCircuito } from '../../services/circuitoService'
import type { Circuito } from '../../types'
import CircuitoFormDialog from './CircuitoFormDialog'

function CircuitosPage() {
    const { persona } = useAuth()
    const [circuitos, setCircuitos] = useState<Circuito[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [abierto, setAbierto] = useState(false)
    const [circuitoEditando, setCircuitoEditando] = useState<Circuito | null>(null)
    const puedeCrear = usaMocks || persona?.rol.nombre === 'ADMIN'
    const puedeEditar = usaMocks || persona?.rol.nombre === 'ADMIN' || persona?.rol.nombre === 'EMPLEADO'
    const puedeEliminar = usaMocks || persona?.rol.nombre === 'ADMIN'

    function cargarCircuitos() {
        setCargando(true)
        setError('')
        getCircuitos()
            .then((datos) => setCircuitos(datos))
            .catch((motivo: unknown) => {
                setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los circuitos')
            })
            .finally(() => setCargando(false))
    }

    useEffect(() => {
        cargarCircuitos()
    }, [])

    function handleNuevo() {
        setCircuitoEditando(null)
        setAbierto(true)
    }

    function handleEditar(circuito: Circuito) {
        setCircuitoEditando(circuito)
        setAbierto(true)
    }

    function handleGuardado() {
        setAbierto(false)
        setCircuitoEditando(null)
        cargarCircuitos()
    }

    async function handleEliminar(id: number) {
        const confirmar = window.confirm('¿Seguro que querés eliminar este circuito?')
        if (!confirmar) return

        try {
            await deleteCircuito(id)
            cargarCircuitos()
        } catch (error) {
            alert(error instanceof Error ? error.message : 'No se pudo eliminar el circuito')
            console.error(error)
        }
    }

    if (cargando) {
        return <Typography sx={{ p: 3 }}>Cargando...</Typography>
    }

    return (
        <div style={{ padding: 24 }}>
            <Typography variant="h4" gutterBottom>
                Circuitos
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {puedeCrear && (
                <Button variant="contained" onClick={handleNuevo} sx={{ mb: 2 }}>
                    Nuevo Circuito
                </Button>
            )}

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Distancia (m)</TableCell>
                        <TableCell>Dificultad</TableCell>
                        <TableCell>Capacidad Maxima</TableCell>
                        {(puedeEditar || puedeEliminar) && <TableCell>Acciones</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {circuitos.map((circuito) => (
                        <TableRow key={circuito.idCircuitos}>
                            <TableCell>{circuito.idCircuitos}</TableCell>
                            <TableCell>{circuito.distancia}</TableCell>
                            <TableCell>{circuito.dificultad}</TableCell>
                            <TableCell>{circuito.maximo}</TableCell>
                            {(puedeEditar || puedeEliminar) && (
                                <TableCell>
                                    {puedeEditar && (
                                        <Button size="small" onClick={() => handleEditar(circuito)}>
                                            Editar
                                        </Button>
                                    )}
                                    {puedeEliminar && (
                                        <Button size="small" color="error" onClick={() => handleEliminar(circuito.idCircuitos)}>
                                            Eliminar
                                        </Button>
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <CircuitoFormDialog
                abierto={abierto}
                circuito={circuitoEditando}
                onCerrar={() => setAbierto(false)}
                onGuardado={handleGuardado}
            />
        </div>
    )
}

export default CircuitosPage
