import { useEffect, useState } from 'react'
import Table from '@mui/material/Table'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import Button from '@mui/material/Button'
import { getCircuitos, deleteCircuito } from '../../services/circuitoService'
import type { Circuito } from '../../types'
import CircuitoFormDialog from './CircuitoFormDialog'

function CircuitosPage() {
    const [circuitos, setCircuitos] = useState<Circuito[]>([])
    const [cargando, setCargando] = useState(true)
    const [abierto, setAbierto] = useState(false)
    const [circuitoEditando, setCircuitoEditando] = useState<Circuito | null>(null)

    function cargarCircuitos() {
        setCargando(true)
        getCircuitos()
            .then((datos) => setCircuitos(datos))
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
            alert('No se pudo eliminar el circuito')
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

            <Button variant="contained" onClick={handleNuevo} sx={{ mb: 2 }}>
                Nuevo Circuito
            </Button>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Distancia (m)</TableCell>
                        <TableCell>Dificultad</TableCell>
                        <TableCell>Capacidad Maxima</TableCell>
                        <TableCell>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {circuitos.map((circuito) => (
                        <TableRow key={circuito.id}>
                            <TableCell>{circuito.nombre}</TableCell>
                            <TableCell>{circuito.distancia}</TableCell>
                            <TableCell>{circuito.dificultad}</TableCell>
                            <TableCell>{circuito.capacidadMaxima}</TableCell>
                            <TableCell>
                                <Button size="small" onClick={() => handleEditar(circuito)}>
                                    Editar
                                </Button>
                                <Button size="small" color="error" onClick={() => handleEliminar(circuito.id)}>
                                    Eliminar
                                </Button>
                            </TableCell>
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
