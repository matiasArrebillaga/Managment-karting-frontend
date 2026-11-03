import dayjs from 'dayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

type Props = {
    // sin label cuando el formulario ya tiene su propio <label htmlFor={id}> (registro)
    label?: string
    id?: string
    // 'YYYY-MM-DD' (o '' si está vacío): el mismo texto que usaban los <input type="date">, así el resto no cambia
    value: string
    onChange: (valor: string) => void
    min?: string
    max?: string
    required?: boolean
    disabled?: boolean
    error?: boolean
    helperText?: string
    size?: 'small' | 'medium'
    fullWidth?: boolean
}

// Selector de fecha igual en computadora y celular (reemplaza al calendario nativo de cada navegador).
// En compu abre un desplegable; con pantalla táctil, un diálogo con Cancelar/Aceptar (lo decide DatePicker).
function CampoFecha ({ label, id, value, onChange, min, max, required, disabled, error, helperText, size, fullWidth }: Props) {
    return (
        <DatePicker
            label={label}
            value={value ? dayjs(value) : null}
            // mientras se escribe a mano la fecha puede estar incompleta: hasta que sea válida se manda ''
            onChange={(fecha) => onChange(fecha?.isValid() ? fecha.format('YYYY-MM-DD') : '')}
            minDate={min ? dayjs(min) : undefined}
            maxDate={max ? dayjs(max) : undefined}
            disabled={disabled}
            slotProps={{ textField: { id, required, error, helperText, size, fullWidth } }}
        />
    )
}

export default CampoFecha
