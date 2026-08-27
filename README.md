# Management Karting

## Frontend

El frontend está en [frontend](frontend). Es una app React + TypeScript + Vite con datos mock, por lo que se puede desarrollar sin instalar MySQL ni bajar la base de datos.

```powershell
cd frontend
npm install
npm run dev
```

Abrir la URL que muestra Vite, normalmente `http://localhost:5173`.

### Modo mock y modo API

Por defecto la interfaz usa `src/data/mockData.ts`. Para configurar el modo local:

```powershell
Copy-Item .env.example .env
```

Cuando el backend esté disponible en `http://localhost:3000`, cambiar `VITE_USE_MOCKS=false` en `.env`. La capa de acceso está en `src/services/api.ts`; allí se pueden agregar los endpoints a medida que backend los publique.

El backend confirmado actualmente expone `GET /api/kartings`, `GET /api/personas`, `GET /api/localidades` y `GET /api/circuitos`. En el esqueleto, carreras, reservas y actividad siguen mockeadas hasta que existan sus rutas.
