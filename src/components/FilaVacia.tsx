import { CircularProgress, TableCell, TableRow } from '@mui/material'

type Props = { columnas: number; cargando: boolean; texto: string }

// Única fila de una tabla sin datos: un spinner mientras llega la respuesta, el texto después.
// Al recargar con datos ya visibles no se usa, así la tabla no parpadea.
function FilaVacia ({ columnas, cargando, texto }: Props) {
    return (
        <TableRow>
            <TableCell colSpan={columnas} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                {cargando ? <CircularProgress size={24} aria-label="Cargando" /> : texto}
            </TableCell>
        </TableRow>
    )
}

export default FilaVacia
