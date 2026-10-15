import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import './App.css'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import InicioPage from './pages/InicioPage.tsx'
import MiCuentaPage from './pages/MiCuentaPage.tsx'
import HistorialTorneosPage from './features/torneos/HistorialTorneosPage.tsx'
import Dashboard from './components/Dashboard.tsx'
import AuthPage from './components/AuthPage.tsx'
import Layout from './components/Layout.tsx'
import LocalidadesPage from './features/localidades/LocalidadesPage.tsx'
import TiposLicenciaPage from './features/tiposLicencia/TiposLicenciaPage.tsx'
import CircuitosPage from './features/circuitos/CircuitosPage.tsx'
import KartingsPage from './features/kartings/KartingsPage.tsx'
import TiposKartingPage from './features/tiposKarting/TiposKartingPage.tsx'
import LicenciasPage from './features/licencias/LicenciasPage.tsx'
import CarrerasPage from './features/carreras/CarrerasPage.tsx'
import TorneosPage from './features/torneos/TorneosPage.tsx'
import TorneoDetallePage from './features/torneos/TorneosDetallePage.tsx'
import ReservasPage from './features/reservas/ReservasPage.tsx'
import ReservarPage from './features/reservas/ReservarPage.tsx'
import PersonasPage from './features/personas/PersonasPage.tsx'
import ParticipacionesPage from './features/participaciones/ParticipacionesPage.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import RutaProtegida from './components/RutaProtegida.tsx'

// Misma paleta que los tokens de App.css (oscuro fijo).
// primary = rojo para rellenos (botón contained); para texto sobre fondo oscuro se usan las versiones claras.
// secondary = ciruela clara: es el color de foco de los inputs, igual que en el CSS.
const ROJO_CLARO = '#F0857E'

const paleta = {
  mode: 'dark' as const,
  primary: { main: '#9E0505', light: ROJO_CLARO, contrastText: '#ffffff' },
  secondary: { main: '#C99ACD', contrastText: '#0E0B0F' },
  error: { main: ROJO_CLARO },
  success: { main: '#9FD0A3' },
  warning: { main: '#E3C27A' },
  info: { main: '#C99ACD' },
  background: { default: '#0E0B0F', paper: '#161218' },
  text: { primary: '#EEE9EC', secondary: '#9C929A' },
  divider: 'rgba(255, 255, 255, 0.08)',
}

// En xs (< 600px) los Dialog van a pantalla completa.
const theme = createTheme({
  cssVariables: true,
  palette: paleta,
  typography: {
    fontFamily: "'Geist', 'Helvetica Neue', Arial, sans-serif",
    // CssBaseline aplica body1 al <body> después de App.css: tiene que coincidir con el 14px/1.6 del diseño
    body1: { fontSize: 14, lineHeight: 1.6 },
    // títulos de página en serif, igual que .page h1 en App.css
    h4: { fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 34, fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.05 },
    h5: { fontSize: 18, fontWeight: 600 },
    h6: { fontSize: 15, fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 999 } },
      // el rojo #9E0505 como texto sobre fondo oscuro no se lee: los botones sin relleno usan el rojo claro
      variants: [
        { props: { variant: 'text', color: 'primary' }, style: { color: ROJO_CLARO } },
        { props: { variant: 'outlined', color: 'primary' }, style: { color: ROJO_CLARO, borderColor: 'rgba(240, 133, 126, 0.5)' } },
      ],
    },
    MuiTextField: { defaultProps: { color: 'secondary' } },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: ({ theme }) => ({ border: `1px solid ${theme.vars.palette.divider}`, backgroundImage: 'none' }) },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          color: theme.vars.palette.text.secondary,
          fontFamily: "'Geist Mono', Consolas, monospace",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          [theme.breakpoints.down('sm')]: {
            margin: 0,
            width: '100%',
            maxWidth: '100%',
            height: '100%',
            maxHeight: '100%',
            borderRadius: 0,
          },
        }),
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route element={<Layout />}>
            <Route path="/" element={<InicioPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
            <Route path="/carreras" element={<RutaProtegida><CarrerasPage /></RutaProtegida>} />
            <Route path="/torneos" element={<RutaProtegida><TorneosPage /></RutaProtegida>} />
            <Route path="/torneos/:id" element={<RutaProtegida><TorneoDetallePage /></RutaProtegida>} />
            <Route path="/reservas" element={<RutaProtegida><ReservasPage /></RutaProtegida>} />
            <Route path="/reservar" element={<RutaProtegida><ReservarPage /></RutaProtegida>} />
            <Route path="/mi-cuenta" element={<RutaProtegida><MiCuentaPage /></RutaProtegida>} />
            <Route path="/mi-cuenta/reservas" element={<RutaProtegida><ReservasPage key="propias" soloPropias /></RutaProtegida>} />
            <Route path="/mi-cuenta/torneos" element={<RutaProtegida><HistorialTorneosPage /></RutaProtegida>} />
            <Route
              path="/participaciones"
              element={<RutaProtegida permiso="participaciones.ver"><ParticipacionesPage /></RutaProtegida>}
            />
            <Route
              path="/personas"
              element={<RutaProtegida permiso="personas.gestionar"><PersonasPage /></RutaProtegida>}
            />
            <Route path="/localidades" element={<RutaProtegida><LocalidadesPage /></RutaProtegida>} />
            <Route path="/circuitos" element={<RutaProtegida><CircuitosPage /></RutaProtegida>} />
            <Route path="/kartings" element={<RutaProtegida><KartingsPage /></RutaProtegida>} />
            <Route
              path="/tipos-licencia"
              element={<RutaProtegida permiso="catalogos.ver"><TiposLicenciaPage /></RutaProtegida>}
            />
            <Route
              path="/tipos-karting"
              element={<RutaProtegida permiso="catalogos.ver"><TiposKartingPage /></RutaProtegida>}
            />
            <Route
              path="/licencias"
              element={<RutaProtegida permiso="catalogos.ver"><LicenciasPage /></RutaProtegida>}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
