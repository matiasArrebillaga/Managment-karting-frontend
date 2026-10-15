import { useEffect, useState } from 'react'
import { Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { getLicencias, deleteLicencia } from '../../services/licenciaService'
import { getTiposLicencia } from '../../services/tipoLicenciaService'
import { getPersonas } from '../../services/personaService'
import type { Licencia, TipoLicencia, Persona } from '../../types'
import LicenciaFormDialog from './LicenciaFormDialog'
import { useAuth } from '../../context/AuthContext'
import { puede } from '../../permisos'
import FilaVacia from '../../components/FilaVacia'
import { useConfirmar } from '../../components/useConfirmar'
import { fecha } from '../../utils/formato'

function LicenciasPage() {
    const { persona } = useAuth()
    const { confirmar, dialogo } = useConfirmar()
    const [licencias, setLicencias] = useState<Licencia[]>([])
    const [tiposLicencia, setTiposLicencia] = useState<TipoLicencia[]>([])
    const [personas, setPersonas] = useState<Persona[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [abierto, setAbierto] = useState(false)
    const [licenciaEditando, setLicenciaEditando] = useState<Licencia | null>(null)

    function cargarLicencias() {
        setCargando(true)
        setError('')
        Promise.all([getLicencias(), getTiposLicencia(), getPersonas()])
            .then(([datosLicencias, datosTipos, datosPersonas]) => {
                setLicencias(datosLicencias)
                setTiposLicencia(datosTipos)
                setPersonas(datosPersonas)
            })
            .catch((motivo: unknown) => {
                setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar las licencias')
            })
            .finally(() => setCargando(false))
    }

    function nombreTipoLicencia(id: number) {
        return tiposLicencia.find((t) => t.idTipoLicencia === id)?.nombre ?? '-'
    }

    function nombreTitular(id: number) {
        const titular = personas.find((p) => p.idPersona === id)
        return titular ? `${titular.nombre} ${titular.apellido}` : '-'
    }

    useEffect(() => {
        cargarLicencias()
    }, [])

    function handleNueva() {
        setLicenciaEditando(null)
        setAbierto(true)
    }

    function handleEditar(licencia: Licencia) {
        setLicenciaEditando(licencia)
        setAbierto(true)
    }

    function handleGuardado() {
        setAbierto(false)
        setLicenciaEditando(null)
        cargarLicencias()
    }

    async function handleEliminar(licencia: Licencia) {
        if (!(await confirmar(`¿Eliminar la licencia de ${nombreTitular(licencia.Personas_idPersona)}?`, 'Eliminar'))) return

        try {
            await deleteLicencia(licencia.idLicencias)
            cargarLicencias()
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo eliminar la licencia')
        }
    }

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <p className="eyebrow">Catálogos</p>
                    <h1>Licencias</h1>
                </div>
                <button className="btn" type="button" onClick={handleNueva}>Nueva licencia</button>
            </div>
            {error && <Alert severity="error">{error}</Alert>}

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Titular</TableCell>
                            <TableCell>Tipo de licencia</TableCell>
                            <TableCell>Emisión</TableCell>
                            <TableCell>Vencimiento</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {licencias.map((licencia) => (
                            <TableRow key={licencia.idLicencias}>
                                <TableCell>{nombreTitular(licencia.Personas_idPersona)}</TableCell>
                                <TableCell>{nombreTipoLicencia(licencia.TiposLicencias_idTipoLicencia)}</TableCell>
                                <TableCell>{fecha(licencia.fechaEmision)}</TableCell>
                                <TableCell>{fecha(licencia.fechaVencimiento)}</TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                    <Button size="small" onClick={() => handleEditar(licencia)}>
                                        Editar
                                    </Button>
                                    {puede(persona?.rol.nombre, 'catalogos.eliminar') && (
                                        <Button size="small" color="error" onClick={() => handleEliminar(licencia)}>
                                            Eliminar
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {licencias.length === 0 && !error && (
                            <FilaVacia columnas={5} cargando={cargando} texto="No hay licencias cargadas." />
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <LicenciaFormDialog
                abierto={abierto}
                licencia={licenciaEditando}
                onCerrar={() => setAbierto(false)}
                onGuardado={handleGuardado}
            />
            {dialogo}
        </div>
    )
}

export default LicenciasPage
