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
import ParticipacionesPage from './features/participaciones/ParticipacionesPage.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import RutaProtegida from './components/RutaProtegida.tsx'

const paletaClara = {
  primary: { main: '#111111', contrastText: '#ffffff' },
  error: { main: '#9f2f2d' },
  success: { main: '#346538' },
  warning: { main: '#956400' },
  info: { main: '#1f6c9f' },
  background: { default: '#fbfbfa', paper: '#ffffff' },
  text: { primary: '#2f3437', secondary: '#787774' },
  divider: '#eaeaea',
}

const paletaOscura = {
  primary: { main: '#e6e6e4', contrastText: '#191919' },
  error: { main: '#f0a19f' },
  success: { main: '#9fd0a3' },
  warning: { main: '#e3c27a' },
  info: { main: '#8cc4ec' },
  background: { default: '#191919', paper: '#202020' },
  text: { primary: '#e6e6e4', secondary: '#9b9a97' },
  divider: '#2f2f2f',
}

// Misma paleta que los tokens de App.css. El modo claro/oscuro sigue al sistema
// (prefers-color-scheme), igual que el CSS. En xs (< 600px) los Dialog van a pantalla completa.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'media' },
  colorSchemes: {
    light: { palette: paletaClara },
    dark: { palette: paletaOscura },
  },
  typography: {
    fontFamily: "'Geist', 'Helvetica Neue', Arial, sans-serif",
    // CssBaseline aplica body1 al <body> después de App.css: tiene que coincidir con el 14px/1.6 del diseño
    body1: { fontSize: 14, lineHeight: 1.6 },
    h4: { fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' },
    h5: { fontSize: 18, fontWeight: 600 },
    h6: { fontSize: 15, fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
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
