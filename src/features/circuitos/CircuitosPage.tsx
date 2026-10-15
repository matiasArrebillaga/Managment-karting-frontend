import { useEffect, useState } from 'react'
import { Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import { puede } from '../../permisos'
import { getCircuitos, deleteCircuito } from '../../services/circuitoService'
import type { Circuito } from '../../types'
import CircuitoFormDialog from './CircuitoFormDialog'
import FilaVacia from '../../components/FilaVacia'
import { useConfirmar } from '../../components/useConfirmar'

function CircuitosPage() {
    const { persona } = useAuth()
    const { confirmar, dialogo } = useConfirmar()
    const [circuitos, setCircuitos] = useState<Circuito[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [abierto, setAbierto] = useState(false)
    const [circuitoEditando, setCircuitoEditando] = useState<Circuito | null>(null)
    const puedeCrear = puede(persona?.rol.nombre, 'circuitos.crear')
    const puedeEditar = puede(persona?.rol.nombre, 'circuitos.editar')
    const puedeEliminar = puede(persona?.rol.nombre, 'circuitos.eliminar')
    const conAcciones = puedeEditar || puedeEliminar

    function cargarCircuitos() {
        getCircuitos()
            .then((datos) => {
                setCircuitos(datos)
                setError('')
            })
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
        if (!(await confirmar('¿Eliminar este circuito?', 'Eliminar'))) return

        try {
            await deleteCircuito(id)
            cargarCircuitos()
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo eliminar el circuito')
        }
    }

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <p className="eyebrow">Pista</p>
                    <h1>Circuitos</h1>
                </div>
                {puedeCrear && <button className="btn" type="button" onClick={handleNuevo}>Nuevo circuito</button>}
            </div>
            {error && <Alert severity="error">{error}</Alert>}

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Circuito</TableCell>
                            <TableCell>Distancia (m)</TableCell>
                            <TableCell>Dificultad</TableCell>
                            <TableCell>Capacidad máxima</TableCell>
                            {conAcciones && <TableCell>Acciones</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {circuitos.map((circuito) => (
                            <TableRow key={circuito.idCircuitos}>
                                <TableCell>{circuito.idCircuitos}</TableCell>
                                <TableCell>{circuito.distancia}</TableCell>
                                <TableCell>{circuito.dificultad}</TableCell>
                                <TableCell>{circuito.maximo}</TableCell>
                                {conAcciones && (
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
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
                        {circuitos.length === 0 && !error && (
                            <FilaVacia columnas={conAcciones ? 5 : 4} cargando={cargando} texto="No hay circuitos cargados." />
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {abierto && (
                <CircuitoFormDialog
                    circuito={circuitoEditando}
                    onCerrar={() => setAbierto(false)}
                    onGuardado={handleGuardado}
                />
            )}
            {dialogo}
        </div>
    )
}

export default CircuitosPage
