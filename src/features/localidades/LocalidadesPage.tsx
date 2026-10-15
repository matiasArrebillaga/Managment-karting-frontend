import { useEffect, useState } from 'react'
import { Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { getLocalidades, deleteLocalidad } from '../../services/localidadService'
import type { Localidad } from '../../types'
import LocalidadFormDialog from './LocalidadFormDialog'
import FilaVacia from '../../components/FilaVacia'
import { useConfirmar } from '../../components/useConfirmar'

function LocalidadesPage() {
    const { confirmar, dialogo } = useConfirmar()
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

    async function handleEliminar(localidad: Localidad) {
        if (!(await confirmar(`¿Eliminar la localidad ${localidad.nombre}?`, 'Eliminar'))) return

        try {
            await deleteLocalidad(localidad.idLocalidades)
            cargarLocalidades()
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo eliminar la localidad')
        }
    }

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <p className="eyebrow">Catálogos</p>
                    <h1>Localidades</h1>
                </div>
                <button className="btn" type="button" onClick={handleNueva}>Nueva localidad</button>
            </div>
            {error && <Alert severity="error">{error}</Alert>}

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
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                    <Button size="small" onClick={() => handleEditar(localidad)}>
                                        Editar
                                    </Button>
                                    <Button size="small" color="error" onClick={() => handleEliminar(localidad)}>
                                        Eliminar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {localidades.length === 0 && !error && (
                            <FilaVacia columnas={2} cargando={cargando} texto="No hay localidades para mostrar." />
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
            {dialogo}
        </div>
    )
}

export default LocalidadesPage
