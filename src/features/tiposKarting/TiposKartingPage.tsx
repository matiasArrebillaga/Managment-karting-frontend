import { useEffect, useState } from 'react'
import { Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { getTiposKarting, deleteTipoKarting } from '../../services/tipoKartingService'
import { getTiposLicencia } from '../../services/tipoLicenciaService'
import type { TipoKarting, TipoLicencia } from '../../types'
import TipoKartingFormDialog from './TipoKartingFormDialog'
import { useAuth } from '../../context/AuthContext'
import { puede } from '../../permisos'
import FilaVacia from '../../components/FilaVacia'
import { useConfirmar } from '../../components/useConfirmar'
import { pesos } from '../../utils/formato'

function TiposKartingPage() {
    const { persona } = useAuth()
    const { confirmar, dialogo } = useConfirmar()
    const [tiposKarting, setTiposKarting] = useState<TipoKarting[]>([])
    const [tiposLicencia, setTiposLicencia] = useState<TipoLicencia[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [abierto, setAbierto] = useState(false)
    const [tipoEditando, setTipoEditando] = useState<TipoKarting | null>(null)

    function cargarTiposKarting() {
        Promise.all([getTiposKarting(), getTiposLicencia()])
            .then(([datosTipos, datosLicencia]) => {
                setError('')
                setTiposKarting(datosTipos)
                setTiposLicencia(datosLicencia)
            })
            .catch((motivo: unknown) => {
                setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los tipos de karting')
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

    async function handleEliminar(tipo: TipoKarting) {
        if (!(await confirmar(`¿Eliminar el tipo de karting ${tipo.nombre}?`, 'Eliminar'))) return

        try {
            await deleteTipoKarting(tipo.idTiposKarting)
            cargarTiposKarting()
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo eliminar el tipo de karting')
        }
    }

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <p className="eyebrow">Catálogos</p>
                    <h1>Tipos de karting</h1>
                </div>
                <button className="btn" type="button" onClick={handleNuevo}>Nuevo tipo de karting</button>
            </div>
            {error && <Alert severity="error">{error}</Alert>}

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Licencia mínima</TableCell>
                            <TableCell>Precio por hora</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tiposKarting.map((tipo) => (
                            <TableRow key={tipo.idTiposKarting}>
                                <TableCell>{tipo.nombre}</TableCell>
                                <TableCell>{nombreTipoLicencia(tipo.TiposLicencias_idTipoLicenciaMinima)}</TableCell>
                                <TableCell>{pesos(tipo.precioHora)}</TableCell>
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
                        {tiposKarting.length === 0 && !error && (
                            <FilaVacia columnas={5} cargando={cargando} texto="No hay tipos de karting cargados." />
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {abierto && (
                <TipoKartingFormDialog
                    tipoKarting={tipoEditando}
                    onCerrar={() => setAbierto(false)}
                    onGuardado={handleGuardado}
                />
            )}
            {dialogo}
        </div>
    )
}

export default TiposKartingPage
