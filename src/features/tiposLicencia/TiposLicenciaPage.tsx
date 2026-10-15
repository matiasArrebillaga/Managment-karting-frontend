import { useEffect, useState } from 'react'
import { Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { getTiposLicencia, deleteTipoLicencia } from '../../services/tipoLicenciaService'
import type { TipoLicencia } from '../../types'
import TipoLicenciaFormDialog from './TipoLicenciaFormDialog'
import { useAuth } from '../../context/AuthContext'
import { puede } from '../../permisos'
import FilaVacia from '../../components/FilaVacia'
import { useConfirmar } from '../../components/useConfirmar'
import { useAviso } from '../../context/AvisoContext'

function TiposLicenciaPage() {
    const { persona } = useAuth()
    const { confirmar, dialogo } = useConfirmar()
    const avisar = useAviso()
    const [tiposLicencia, setTiposLicencia] = useState<TipoLicencia[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [abierto, setAbierto] = useState(false)
    const [tipoEditando, setTipoEditando] = useState<TipoLicencia | null>(null)

    function cargarTiposLicencia() {
        getTiposLicencia()
            .then((datos) => {
                setTiposLicencia(datos)
                setError('')
            })
            .catch((motivo: unknown) => {
                setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los tipos de licencia')
            })
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
        avisar('Tipo de licencia guardado')
    }

    async function handleEliminar(tipo: TipoLicencia) {
        if (!(await confirmar(`¿Eliminar el tipo de licencia ${tipo.nombre}?`, 'Eliminar'))) return

        try {
            await deleteTipoLicencia(tipo.idTipoLicencia)
            cargarTiposLicencia()
            avisar('Tipo de licencia eliminado')
        } catch (motivo) {
            avisar(motivo instanceof Error ? motivo.message : 'No se pudo eliminar el tipo de licencia', 'error')
        }
    }

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <p className="eyebrow">Catálogos</p>
                    <h1>Tipos de licencia</h1>
                </div>
                <button className="btn" type="button" onClick={handleNuevo}>Nuevo tipo de licencia</button>
            </div>
            {error && <Alert severity="error">{error}</Alert>}

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Nivel</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tiposLicencia.map((tipo) => (
                            <TableRow key={tipo.idTipoLicencia}>
                                <TableCell>{tipo.nombre}</TableCell>
                                <TableCell>{tipo.nivel}</TableCell>
                                <TableCell>{tipo.descripcion}</TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                    <Button size="small" onClick={() => handleEditar(tipo)}>
                                        Editar
                                    </Button>
                                    {puede(persona?.rol.nombre, 'catalogos.eliminar') && (
                                        <Button size="small" color="error" onClick={() => handleEliminar(tipo)}>
                                            Eliminar
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {tiposLicencia.length === 0 && !error && (
                            <FilaVacia columnas={4} cargando={cargando} texto="No hay tipos de licencia cargados." />
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {abierto && (
                <TipoLicenciaFormDialog
                    tipoLicencia={tipoEditando}
                    onCerrar={() => setAbierto(false)}
                    onGuardado={handleGuardado}
                />
            )}
            {dialogo}
        </div>
    )
}

export default TiposLicenciaPage
