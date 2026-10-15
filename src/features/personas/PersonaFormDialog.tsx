import { useEffect, useState, type ChangeEvent } from "react"
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material"
import { createPersona, updatePersona } from "../../services/personaService"
import { getLocalidades } from "../../services/localidadService"
import type { Localidad, Persona } from "../../types"

type Props = {
    persona?: Persona | null
    onCerrar: () => void
    onGuardado: () => void
}

const vacio = { nombre: '', apellido: '', dni: '', fechaNacimiento: '', mail: '', telefono: '', contraseña: '', localidadId: '' }

function PersonaFormDialog({ persona, onCerrar, onGuardado }: Props) {
    const [form, setForm] = useState(persona ? {
        nombre: persona.nombre,
        apellido: persona.apellido,
        dni: persona.dni,
        fechaNacimiento: persona.fechaNacimiento.slice(0, 10),
        mail: persona.mail,
        telefono: persona.telefono,
        contraseña: '',
        localidadId: String(persona.Localidades_idLocalidades),
    } : vacio)
    const [tipo, setTipo] = useState<'CLIENTE' | 'EMPLEADO'>('CLIENTE')
    const [localidades, setLocalidades] = useState<Localidad[]>([])
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    const editando = Boolean(persona)

    useEffect(() => {
        getLocalidades().then(setLocalidades).catch((motivo) => {
            setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar las localidades')
        })
    }, [])

    function campo(nombre: keyof typeof vacio) {
        return {
            value: form[nombre],
            onChange: (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [nombre]: e.target.value }),
            fullWidth: true,
        }
    }

    async function handleGuardar() {
        const obligatorios = [form.nombre, form.apellido, form.dni, form.fechaNacimiento, form.mail, form.telefono, form.localidadId]
        if (obligatorios.some((valor) => !valor.trim()) || (!editando && !form.contraseña)) {
            setError('Completá todos los campos obligatorios')
            return
        }

        setGuardando(true)
        setError('')
        try {
            const { localidadId, ...resto } = form
            const datos = { ...resto, Localidades_idLocalidades: Number(localidadId) }
            if (editando && persona) {
                await updatePersona(persona.idPersona, datos)
            } else {
                await createPersona(datos, tipo)
            }
            onGuardado()
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo guardar la persona')
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open onClose={onCerrar} fullWidth maxWidth="sm">
            <DialogTitle>{editando ? 'Editar persona' : 'Nueva persona'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {!editando && (
                        <ToggleButtonGroup
                            exclusive
                            fullWidth
                            size="small"
                            value={tipo}
                            onChange={(_, valor) => valor && setTipo(valor)}
                            aria-label="Tipo de persona"
                        >
                            <ToggleButton value="CLIENTE">Cliente</ToggleButton>
                            <ToggleButton value="EMPLEADO">Empleado</ToggleButton>
                        </ToggleButtonGroup>
                    )}
                    <TextField label="Nombre" required {...campo('nombre')} />
                    <TextField label="Apellido" required {...campo('apellido')} />
                    <TextField label="DNI" required {...campo('dni')} />
                    <TextField
                        label="Fecha de nacimiento"
                        type="date"
                        required
                        slotProps={{ inputLabel: { shrink: true } }}
                        {...campo('fechaNacimiento')}
                    />
                    <TextField label="Mail" type="email" required {...campo('mail')} />
                    <TextField label="Teléfono" required {...campo('telefono')} />
                    <TextField select label="Localidad" required {...campo('localidadId')}>
                        {localidades.map((l) => (
                            <MenuItem key={l.idLocalidades} value={String(l.idLocalidades)}>{l.nombre}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Contraseña"
                        type="password"
                        autoComplete="new-password"
                        required={!editando}
                        helperText={editando ? 'Dejala vacía para no cambiarla' : 'Mínimo 8 caracteres'}
                        {...campo('contraseña')}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar}>Cancelar</Button>
                <Button variant="contained" onClick={handleGuardar} disabled={guardando}>Guardar</Button>
            </DialogActions>
        </Dialog>
    )
}

export default PersonaFormDialog
