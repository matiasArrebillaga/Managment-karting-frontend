import { useEffect, useState } from 'react'
import { Alert, Button, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import { getLicencias, deleteLicencia } from '../../services/licenciaService'
import { getTiposLicencia } from '../../services/tipoLicenciaService'
import { getPersonas } from '../../services/personaService'
import type { Licencia, TipoLicencia, Persona } from '../../types'
import LicenciaFormDialog from './LicenciaFormDialog'
import { useAuth } from '../../context/AuthContext'
import { puede } from '../../permisos'
import FilaVacia from '../../components/FilaVacia'
import { useConfirmar } from '../../components/useConfirmar'
import { useAviso } from '../../context/AvisoContext'
import { coincide, fecha } from '../../utils/formato'
import { fechaTexto } from '../../utils/fechas'

function LicenciasPage() {
    const { persona } = useAuth()
    const { confirmar, dialogo } = useConfirmar()
    const avisar = useAviso()
    const [licencias, setLicencias] = useState<Licencia[]>([])
    const [tiposLicencia, setTiposLicencia] = useState<TipoLicencia[]>([])
    const [personas, setPersonas] = useState<Persona[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [abierto, setAbierto] = useState(false)
    const [licenciaEditando, setLicenciaEditando] = useState<Licencia | null>(null)
    const [busqueda, setBusqueda] = useState('')
    const [filtroTipo, setFiltroTipo] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')

    function cargarLicencias() {
        Promise.all([getLicencias(), getTiposLicencia(), getPersonas()])
            .then(([datosLicencias, datosTipos, datosPersonas]) => {
                setError('')
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

    // vigente si vence hoy o despues (mismo criterio que el backend); se compara como 'YYYY-MM-DD'
    const hoy = fechaTexto(new Date())
    const estaVigente = (licencia: Licencia) => fechaTexto(licencia.fechaVencimiento) >= hoy
    const licenciasVisibles = licencias.filter((licencia) => {
        const titular = personas.find((p) => p.idPersona === licencia.Personas_idPersona)
        return coincide(busqueda, nombreTitular(licencia.Personas_idPersona), titular?.dni)
            && (!filtroTipo || licencia.TiposLicencias_idTipoLicencia === Number(filtroTipo))
            && (!filtroEstado || (filtroEstado === 'vigente') === estaVigente(licencia))
    })
    const hayFiltros = Boolean(busqueda || filtroTipo || filtroEstado)

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
        avisar('Licencia guardada')
    }

    async function handleEliminar(licencia: Licencia) {
        if (!(await confirmar(`¿Eliminar la licencia de ${nombreTitular(licencia.Personas_idPersona)}?`, 'Eliminar'))) return

        try {
            await deleteLicencia(licencia.idLicencias)
            cargarLicencias()
            avisar('Licencia eliminada')
        } catch (motivo) {
            avisar(motivo instanceof Error ? motivo.message : 'No se pudo eliminar la licencia', 'error')
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

            <div className="toolbar" role="search">
                <TextField
                    size="small"
                    type="search"
                    label="Buscar por titular o DNI"
                    value={busqueda}
                    onChange={(evento) => setBusqueda(evento.target.value)}
                    sx={{ minWidth: 240 }}
                />
                <TextField
                    select
                    size="small"
                    label="Tipo de licencia"
                    value={filtroTipo}
                    onChange={(evento) => setFiltroTipo(evento.target.value)}
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">Todos</MenuItem>
                    {tiposLicencia.map((tipo) => (
                        <MenuItem key={tipo.idTipoLicencia} value={String(tipo.idTipoLicencia)}>{tipo.nombre}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    size="small"
                    label="Estado"
                    value={filtroEstado}
                    onChange={(evento) => setFiltroEstado(evento.target.value)}
                    sx={{ minWidth: 160 }}
                >
                    <MenuItem value="">Todas</MenuItem>
                    <MenuItem value="vigente">Vigente</MenuItem>
                    <MenuItem value="vencida">Vencida</MenuItem>
                </TextField>
            </div>

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
                        {licenciasVisibles.map((licencia) => (
                            <TableRow key={licencia.idLicencias}>
                                <TableCell>{nombreTitular(licencia.Personas_idPersona)}</TableCell>
                                <TableCell>{nombreTipoLicencia(licencia.TiposLicencias_idTipoLicencia)}</TableCell>
                                <TableCell>{fecha(licencia.fechaEmision)}</TableCell>
                                <TableCell>
                                    {fecha(licencia.fechaVencimiento)}
                                    {!estaVigente(licencia) && <span className="tag bad" style={{ marginLeft: 8 }}>Vencida</span>}
                                </TableCell>
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
                        {licenciasVisibles.length === 0 && !error && (
                            <FilaVacia columnas={5} cargando={cargando} texto={hayFiltros ? 'Ninguna licencia coincide con los filtros.' : 'No hay licencias cargadas.'} />
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {abierto && (
                <LicenciaFormDialog
                    licencia={licenciaEditando}
                    onCerrar={() => setAbierto(false)}
                    onGuardado={handleGuardado}
                />
            )}
            {dialogo}
        </div>
    )
}

export default LicenciasPage
