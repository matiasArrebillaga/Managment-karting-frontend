# Management-Karting Rosario · Frontend

Interfaz web del sistema de gestión del karting: reservas, torneos, carreras y resultados para clientes, y la administración de personas, licencias, kartings y circuitos para el personal.

## Tecnologías

- React 19 + TypeScript
- Vite
- MUI (Material UI) para los componentes
- React Router para la navegación
- oxlint como linter

## Cómo correrlo

El frontend necesita el backend (`Managment-karting-backend`) corriendo, con la base cargada con el seed. Las instrucciones para levantarlo están en el README del backend.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Abrir `http://localhost:5173`.

### Variables de entorno

| Variable | Para qué sirve | Valor local |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:3000/api` |

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Chequea los tipos con `tsc` y genera la versión de producción en `dist/` |
| `npm run lint` | Corre oxlint |
| `npm run gen:api` | Regenera `src/types/api.ts` desde la especificación OpenAPI del backend (necesita el backend corriendo) |

## Estructura

```
src/
  components/   piezas compartidas: layout, rutas protegidas, login/registro, fila vacía de tablas
  context/      sesión (AuthProvider) y avisos (AvisoProvider)
  features/     una carpeta por entidad, con su página y sus diálogos de formulario
  pages/        inicio y mi cuenta
  services/     llamadas a la API, una por entidad; httpClient.ts agrega el token y maneja los errores
  types/        tipos del dominio (index.ts) y los generados desde OpenAPI (api.ts)
  utils/        fechas y formatos que ve el usuario (siempre en es-AR)
  permisos.ts   qué puede hacer cada rol en la interfaz
```

Los permisos de `permisos.ts` solo esconden botones y pantallas: quien decide de verdad es el backend, que valida el rol en cada ruta.
