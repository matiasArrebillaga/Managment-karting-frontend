import { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { cargarResultadosCarrera, deleteParticipacion, getClasificacionCarrera, updateParticipacion } from '../../services/participacionService'
import { getInscriptosTorneo } from '../../services/torneoService'
import type { ICarrera } from '../../types'
import { useConfirmar } from '../../components/useConfirmar'
import { useAviso } from '../../context/AvisoContext'

// Una fila sirve para los dos modos: cargar (inscriptos vacíos) o corregir (clasificación guardada)
type Fila = { idPersona: number; piloto: string; posicion: string; tiempo: string; puntos?: number }

const TIEMPO = /^\d{2}:\d{2}:\d{2}$/

// Lo que el backend rechazaría igual, avisado antes de mandar: devuelve '' si está todo bien
function validarFilas (filas: Fila[]): string {
    if (filas.some((fila) => !Number.isInteger(Number(fila.posicion)) || Number(fila.posicion) < 1)) {
        return 'Las posiciones tienen que ser números enteros desde 1'
    }
    const posiciones = filas.map((fila) => fila.posicion)
    if (new Set(posiciones).size !== posiciones.length) return 'Hay dos pilotos con la misma posición'
    if (filas.some((fila) => !TIEMPO.test(fila.tiempo))) return 'Los tiempos van en formato HH:MM:SS (por ejemplo 00:12:34)'
    return ''
}

// La tabla muestra la clasificación si la carrera ya tiene resultados,
// o los inscriptos del torneo (con posición y tiempo vacíos) para cargarlos
async function leerFilas (carrera: ICarrera): Promise<{ yaCargada: boolean; filas: Fila[] }> {
    const clasificacion = await getClasificacionCarrera(carrera)
    if (clasificacion.length > 0) {
        return {
            yaCargada: true,
            filas: clasificacion.map((fila) => ({
                idPersona: fila.idPersona,
                piloto: `${fila.nombre} ${fila.apellido}`,
                posicion: String(fila.posicion),
                tiempo: fila.tiempo,
                puntos: fila.puntos,
            })),
        }
    }
    const inscriptos = await getInscriptosTorneo(carrera.Torneos_idTorneos)
    return {
        yaCargada: false,
        filas: inscriptos.map((persona) => ({
            idPersona: persona.idPersona,
            piloto: `${persona.nombre} ${persona.apellido}`,
            posicion: '',
            tiempo: '',
        })),
    }
}

type Props = {
    carrera: ICarrera
    puedeBorrar: boolean
    onCerrar: () => void
}

function ResultadosCarreraDialog ({ carrera, puedeBorrar, onCerrar }: Props) {
    const [filas, setFilas] = useState<Fila[]>([])
    const [yaCargada, setYaCargada] = useState(false)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [guardando, setGuardando] = useState(false)
    const { confirmar, dialogo } = useConfirmar()
    const avisar = useAviso()

    // también se usa en ejecutar() para recargar después de guardar o borrar
    const cargar = useCallback(() => leerFilas(carrera).then((datos) => {
        setYaCargada(datos.yaCargada)
        setFilas(datos.filas)
    }), [carrera])

    useEffect(() => {
        cargar()
            .catch((motivo: unknown) => {
                setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los resultados')
            })
            .finally(() => setCargando(false))
    }, [cargar])

    function cambiar (idPersona: number, campo: 'posicion' | 'tiempo', valor: string) {
        setFilas((actuales) => actuales.map((fila) => (fila.idPersona === idPersona ? { ...fila, [campo]: valor } : fila)))
    }

    // Corre la acción contra el backend, recarga y avisa; si falla muestra el mensaje del backend
    async function ejecutar (accion: (carreraActual: ICarrera) => Promise<void>, exito: string) {
        setError('')
        setGuardando(true)
        try {
            await accion(carrera)
            await cargar()
            avisar(exito)
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo guardar')
        } finally {
            setGuardando(false)
        }
    }

    // Los pilotos sin posición no corrieron: no se mandan
    function handleCargar () {
        const corrieron = filas.filter((fila) => fila.posicion !== '')
        const problema = corrieron.length === 0 ? 'Cargá la posición de al menos un piloto' : validarFilas(corrieron)
        if (problema) {
            setError(problema)
            return
        }
        ejecutar((carreraActual) => cargarResultadosCarrera(carreraActual, corrieron
            .map((fila) => ({ Personas_idPersona: fila.idPersona, posicion_final: Number(fila.posicion), tiempo: fila.tiempo }))), 'Resultados cargados')
    }

    function handleGuardarFila (fila: Fila) {
        const problema = validarFilas(filas)
        if (problema) {
            setError(problema)
            return
        }
        ejecutar((carreraActual) => updateParticipacion(carreraActual, fila.idPersona, {
            posicion_final: Number(fila.posicion),
            tiempo: fila.tiempo,
        }), `Resultado de ${fila.piloto} actualizado`)
    }

    async function handleBorrarFila (fila: Fila) {
        if (!(await confirmar(`¿Borrar el resultado de ${fila.piloto}?`, 'Borrar'))) return
        ejecutar((carreraActual) => deleteParticipacion(carreraActual, fila.idPersona), `Resultado de ${fila.piloto} borrado`)
    }

    return (
        <Dialog open onClose={onCerrar} maxWidth="md" fullWidth>
            <DialogTitle>{yaCargada ? 'Clasificación' : 'Cargar resultados'}</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {cargando ? (
                    <Typography>Cargando...</Typography>
                ) : filas.length === 0 ? (
                    <Typography>No hay pilotos inscriptos en el torneo de esta carrera.</Typography>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Piloto</TableCell>
                                    <TableCell>Posición</TableCell>
                                    <TableCell>Tiempo (HH:MM:SS)</TableCell>
                                    {yaCargada && <TableCell>Puntos</TableCell>}
                                    {yaCargada && <TableCell>Acciones</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filas.map((fila) => (
                                    <TableRow key={fila.idPersona}>
                                        <TableCell>{fila.piloto}</TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                slotProps={{ htmlInput: { min: 1, step: 1, 'aria-label': `Posición de ${fila.piloto}` } }}
                                                value={fila.posicion}
                                                onChange={(event) => cambiar(fila.idPersona, 'posicion', event.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                placeholder="00:12:34"
                                                slotProps={{ htmlInput: { 'aria-label': `Tiempo de ${fila.piloto}` } }}
                                                value={fila.tiempo}
                                                onChange={(event) => cambiar(fila.idPersona, 'tiempo', event.target.value)}
                                            />
                                        </TableCell>
                                        {yaCargada && <TableCell>{fila.puntos}</TableCell>}
                                        {yaCargada && (
                                            <TableCell>
                                                <Button size="small" onClick={() => handleGuardarFila(fila)} disabled={guardando}>Guardar</Button>
                                                {puedeBorrar && (
                                                    <Button size="small" color="error" onClick={() => handleBorrarFila(fila)} disabled={guardando}>Borrar</Button>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar}>Cerrar</Button>
                {!yaCargada && filas.length > 0 && (
                    <Button variant="contained" onClick={handleCargar} disabled={cargando || guardando}>
                        {guardando ? 'Guardando...' : 'Guardar resultados'}
                    </Button>
                )}
            </DialogActions>
            {dialogo}
        </Dialog>
    )
}

export default ResultadosCarreraDialog
