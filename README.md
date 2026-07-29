# Fantasy Football — Backend

Backend de la plataforma de fantasy football de habilidad. Este proyecto traduce a código el
[reglamento de la plataforma] y la [arquitectura técnica] ya definidos: base de datos, motor de
cálculo de puntaje y estructura del servidor.

## Stack

- **Node.js + TypeScript + Express** — servidor y lógica de negocio.
- **Prisma** — ORM y migraciones, esquema en `prisma/schema.prisma`.
- **SQLite** en desarrollo local (cero instalación adicional) — en producción se cambia a
  PostgreSQL ajustando solo `DATABASE_URL` y el `provider` del datasource en el schema.

## Cómo correrlo localmente (Visual Studio Code)

**Requisito único**: tener [Node.js](https://nodejs.org) instalado (versión 20 o superior).

1. Abre esta carpeta (`fantasy-backend`) en VS Code: `Archivo → Abrir carpeta...`
2. Abre una terminal integrada (`` Ctrl+` `` o `Terminal → Nueva terminal`) y ejecuta:

   ```bash
   npm install
   cp .env.example .env
   npx prisma migrate dev --name init
   npm run prisma:seed
   npm run dev
   ```

3. El servidor queda corriendo en `http://localhost:3000`. Verifica que todo funciona visitando
   `http://localhost:3000/health` — debería responder `{"status":"ok","database":"conectada"}`.

4. Para ver los datos de la base en una interfaz visual (sin necesidad de un cliente SQL aparte):

   ```bash
   npx prisma studio
   ```

### Ejecutar las pruebas del motor de cálculo de puntaje

```bash
npm test
```

Las pruebas reproducen exactamente el ejemplo numérico del reglamento (sección 8.4, formación
3-5-2 → 76.45 puntos) y verifican que todas las formaciones del catálogo suman 110 puntos cuando
los 11 titulares sacan calificación perfecta de 10 — la propiedad de balance matemático descrita
en la sección 8.2.

## Cómo subirlo a GitHub

Si es la primera vez que subes este proyecto:

```bash
cd fantasy-backend
git init
git add .
git commit -m "Estructura inicial: esquema de base de datos y motor de cálculo de puntaje"
```

Luego, crea un repositorio vacío en [github.com/new](https://github.com/new) (sin marcar
"Add a README", ya tenemos uno) y conecta tu repositorio local:

```bash
git remote add origin https://github.com/TU_USUARIO/NOMBRE_DEL_REPO.git
git branch -M main
git push -u origin main
```

> El archivo `.env` **nunca se sube** (ya está excluido en `.gitignore`) porque en el futuro
> contendrá credenciales reales (API keys, contraseñas de base de datos). Cada persona que clone
> el repositorio debe crear su propio `.env` a partir de `.env.example`.

## Estructura del proyecto

```
fantasy-backend/
├── prisma/
│   ├── schema.prisma       # Esquema completo de base de datos (ver arquitectura_tecnica.md)
│   └── seed.ts             # Siembra formaciones y catálogo de boosters
├── src/
│   ├── db/prisma.ts        # Cliente de base de datos (singleton)
│   ├── modules/scoring/
│   │   ├── formation.ts        # Fórmula de balance de formaciones
│   │   ├── scoringEngine.ts    # Motor de cálculo de puntaje por jornada
│   │   └── scoringEngine.test.ts
│   ├── routes/health.ts    # Verificación de estado del servidor
│   ├── app.ts               # Configuración de Express
│   └── server.ts            # Punto de entrada
├── .env.example
└── package.json
```

## Qué falta por construir (próximos pasos técnicos)

- [ ] Endpoints de autenticación y registro con verificación KYC.
- [ ] Endpoints de gestión de plantel (fichajes, ventas, límite de 4 transferencias/temporada).
- [ ] Endpoints de torneos (inscripción, alineación por torneo, aplicación de boosters).
- [ ] Worker de sincronización con la API deportiva (ver `arquitectura_tecnica.md`, sección 1.3).
- [ ] Autenticación real (JWT o similar) — el esqueleto actual no la incluye todavía.
- [ ] Frontend conectado a esta API (ver mockup del entorno gráfico ya construido).
