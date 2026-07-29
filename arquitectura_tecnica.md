# Arquitectura Técnica de la Plataforma

**Versión**: 0.1 — Documento de trabajo, complementario al Reglamento y Estructura de la Plataforma.
**Propósito**: traducir las reglas de negocio ya definidas en un diseño técnico concreto — base de datos, integración con la API deportiva y stack tecnológico — como base para el equipo de desarrollo.

---

## 1. Estrategia de integración con la API deportiva

### 1.1 Principio de diseño: caché propia, no consulta directa

La plataforma **nunca consulta la API deportiva en respuesta a una acción de un usuario**. En su lugar, un proceso automático ("worker") sincroniza los datos según el calendario real de partidos y los guarda en nuestra propia base de datos. Todos los usuarios — sin importar si son 300 o 20.000 — consultan exclusivamente nuestra base de datos.

**Por qué esto importa**: el costo y los límites de la API dependen del número de ligas y partidos que sigamos, no del número de usuarios de la plataforma. Esto hace que el costo de datos deportivos sea predecible y controlado a medida que el negocio escala — a diferencia de un modelo donde cada consulta de usuario golpea la API externa.

### 1.2 Endpoints relevantes de API-Football (v3)

| Endpoint | Uso en la plataforma | Frecuencia recomendada de sincronización |
|---|---|---|
| `/leagues` | Verificar el objeto de "coverage" (qué datos están disponibles) antes de activar una liga nueva en la plataforma | Una vez por liga, al activarla |
| `/players?league={id}&season={year}` | Lista completa de jugadores de la liga (perfil + estadísticas), paginada a 20 por página (~25 llamadas para toda la Premier League) | Una vez por temporada real, o al abrir cada ventana de fichajes |
| `/fixtures?league={id}&season={year}&round={n}` | IDs de los partidos de una jornada específica, usados para calcular el deadline de 24h | Una vez por jornada, al publicar el calendario |
| `/fixtures?live=all` | Estado de partidos en curso | Cada 1-2 minutos, solo durante ventanas de partidos en vivo |
| `/fixtures?ids=ID1-ID2-...` | Calificación (0-10) de **todos los jugadores de hasta 20 partidos en una sola petición** — una jornada completa de Premier League (10 partidos) cabe en una sola llamada | Una vez, inmediatamente después de que finaliza la jornada completa |
| `/injuries` | Alertas de bajas/lesiones para el buzón de notificaciones del usuario | 1-2 veces al día, más frecuente cerca del deadline de jornada |
| `/standings` | Tabla de posiciones real de la liga (contenido informativo para el usuario) | Diario |

### 1.3 Flujo de sincronización de calificaciones por jornada (validado)

1. `GET /fixtures?league=39&season=2026&round=X` → obtiene los IDs de los partidos de esa jornada (1 llamada).
2. `GET /fixtures?ids=ID1-ID2-...-ID10` → trae eventos, alineaciones, estadísticas **y calificaciones de todos los jugadores** de los 10 partidos de la jornada, en una sola respuesta (1 llamada).
3. El backend recorre la respuesta y hace *match* de cada jugador por su **ID externo de la API** (no por nombre, para evitar errores de coincidencia por acentos o formatos) contra la tabla `real_players` ya sincronizada, y guarda el resultado en `player_match_ratings`.

**Costo total por jornada: 2 llamadas a la API**, sin importar el número de usuarios de la plataforma. Este es el mismo principio de caché descrito en el diagrama de arquitectura: el gasto de API depende del calendario real de partidos, no de la base de usuarios.

### 1.4 Consideraciones de límites de uso

Los planes de pago de API-Football incluyen todos los endpoints en todos los niveles; la diferencia entre planes es el número de ligas cubiertas y el límite de solicitudes por día. Con la estrategia de sincronización programada (no por usuario), incluso el plan de entrada es suficiente para cubrir una sola liga en el MVP. Antes de agregar más ligas simultáneas, se debe recalcular el número de solicitudes necesarias por temporada y ajustar el plan contratado en consecuencia.

---

## 2. Esquema de base de datos

A continuación, el modelo de datos relacional que soporta todas las reglas definidas en el documento de reglamento. Se agrupa por dominio funcional.

### 2.1 Usuarios y cumplimiento

```sql
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) UNIQUE NOT NULL,
    phone               VARCHAR(20) UNIQUE NOT NULL,
    password_hash       TEXT NOT NULL,
    kyc_document_photo_url TEXT,
    kyc_verified        BOOLEAN DEFAULT FALSE,
    kyc_verified_at     TIMESTAMP,
    welcome_bonus_claimed BOOLEAN DEFAULT FALSE,
    courtesy_signing_card_used BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT now()
);
```

### 2.2 Créditos (moneda interna)

Se modela como un **libro mayor (ledger)** de transacciones, no como un simple saldo mutable — esto permite auditar en cualquier momento de dónde vino cada crédito y evita inconsistencias.

```sql
CREATE TYPE credit_type AS ENUM ('comprado', 'ganado');
CREATE TYPE credit_source AS ENUM (
    'compra_dinero_real', 'bono_bienvenida', 'premio_torneo',
    'compra_jugador', 'venta_jugador', 'inscripcion_torneo',
    'compra_booster', 'reembolso_torneo_cancelado', 'canje_marketplace'
);

CREATE TABLE credit_transactions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id),
    credit_type   credit_type NOT NULL,
    amount        NUMERIC(10,2) NOT NULL, -- positivo = entra, negativo = sale
    source        credit_source NOT NULL,
    reference_id  UUID, -- ej. id de torneo, id de jugador, id de canje
    created_at    TIMESTAMP DEFAULT now()
);
-- El saldo de cada usuario, por tipo, se calcula como SUM(amount) filtrando por credit_type.
-- Esto es lo que permite aplicar la regla: "transferencias en temporada solo con créditos ganados".
```

### 2.3 Ligas y jugadores reales (datos cacheados de la API)

```sql
CREATE TABLE leagues (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_api_id  INT UNIQUE NOT NULL,
    name             VARCHAR(100) NOT NULL,
    active           BOOLEAN DEFAULT TRUE
);

CREATE TABLE real_players (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_api_id  INT UNIQUE NOT NULL,
    league_id        UUID REFERENCES leagues(id),
    team_name        VARCHAR(100),
    full_name        VARCHAR(150) NOT NULL,
    position         VARCHAR(20) NOT NULL, -- arquero / defensa / mediocampista / delantero
    active           BOOLEAN DEFAULT TRUE
);

CREATE TABLE matchdays (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id        UUID REFERENCES leagues(id),
    round_number     INT NOT NULL,
    deadline_at      TIMESTAMP NOT NULL, -- 24h antes del primer partido de la jornada
    UNIQUE(league_id, round_number)
);

CREATE TABLE fixtures (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_api_id  INT UNIQUE NOT NULL,
    matchday_id      UUID REFERENCES matchdays(id),
    home_team        VARCHAR(100),
    away_team        VARCHAR(100),
    kickoff_at       TIMESTAMP NOT NULL,
    status           VARCHAR(20) DEFAULT 'programado' -- programado / en_curso / finalizado
);

CREATE TABLE player_match_ratings (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    real_player_id   UUID REFERENCES real_players(id),
    fixture_id       UUID REFERENCES fixtures(id),
    rating           NUMERIC(3,1), -- 0.0 a 10.0, tal como lo entrega la API
    synced_at        TIMESTAMP DEFAULT now(),
    UNIQUE(real_player_id, fixture_id)
);

CREATE TABLE player_injury_alerts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    real_player_id   UUID REFERENCES real_players(id),
    status           VARCHAR(50), -- duda, confirmado_fuera, expulsado, etc.
    reported_at      TIMESTAMP DEFAULT now()
);
```

### 2.4 Plantel del usuario (global) y temporadas

```sql
CREATE TABLE seasons (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_number  INT NOT NULL, -- 1 a 6 dentro del año
    start_date     DATE NOT NULL,
    end_date       DATE NOT NULL
);

CREATE TABLE squad_players (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID REFERENCES users(id),
    real_player_id   UUID REFERENCES real_players(id),
    acquired_at      TIMESTAMP DEFAULT now(),
    acquired_via     VARCHAR(30), -- compra_inicial / fichaje_temporada / tarjeta_cortesia
    sold_at          TIMESTAMP,
    status           VARCHAR(20) DEFAULT 'activo' -- activo / vendido
);
-- Regla de negocio (aplicada en backend, no en el esquema): máx. 19 registros "activo" por usuario.

CREATE TABLE season_transfer_usage (
    user_id          UUID REFERENCES users(id),
    season_id        UUID REFERENCES seasons(id),
    transfers_used   INT DEFAULT 0, -- máx. 4 por temporada
    buys_count       INT DEFAULT 0, -- usado para el objetivo del booster Arquero x2
    sells_count      INT DEFAULT 0,
    PRIMARY KEY (user_id, season_id)
);
```

### 2.5 Formaciones

```sql
CREATE TABLE formations (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(10) NOT NULL, -- '4-3-3', '3-5-2', etc.
    def_count      INT NOT NULL,
    mid_count      INT NOT NULL,
    fwd_count      INT NOT NULL,
    def_multiplier NUMERIC(4,2) NOT NULL, -- calculado con la fórmula 4/def_count
    mid_multiplier NUMERIC(4,2) NOT NULL, -- 3/mid_count
    fwd_multiplier NUMERIC(4,2) NOT NULL  -- 3/fwd_count
);
-- El arquero siempre puntúa x1 — no requiere columna, se asume en el motor de cálculo.
```

### 2.6 Torneos

```sql
CREATE TYPE tournament_length AS ENUM ('completo', 'corto_5', 'corto_10');
CREATE TYPE prize_mode AS ENUM ('unico_ganador', 'top_3', 'top_5', 'top_10', 'liga_privada');
CREATE TYPE tournament_status AS ENUM ('abierto', 'cancelado_minimo_no_alcanzado', 'en_curso', 'finalizado');

CREATE TABLE tournaments (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id             UUID REFERENCES leagues(id),
    name                  VARCHAR(150) NOT NULL,
    length                tournament_length NOT NULL,
    prize_mode            prize_mode NOT NULL,
    entry_cost_credits    NUMERIC(10,2) NOT NULL, -- 20 a 60
    min_participants      INT NOT NULL,
    max_participants      INT, -- NULL = sin límite
    registration_opens_at TIMESTAMP NOT NULL,
    registration_closes_at TIMESTAMP NOT NULL,
    first_matchday_id     UUID REFERENCES matchdays(id),
    last_matchday_id      UUID REFERENCES matchdays(id),
    status                tournament_status DEFAULT 'abierto',
    created_at            TIMESTAMP DEFAULT now()
);

CREATE TABLE tournament_entries (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id  UUID REFERENCES tournaments(id),
    user_id        UUID REFERENCES users(id),
    joined_at      TIMESTAMP DEFAULT now(),
    refunded       BOOLEAN DEFAULT FALSE, -- true si el torneo se canceló por no alcanzar el mínimo
    UNIQUE(tournament_id, user_id)
);
```

### 2.7 Alineación por torneo y jornada

Esta es la tabla que materializa la regla más importante del reglamento: **el plantel es global, pero la alineación es independiente por torneo**.

```sql
CREATE TABLE tournament_lineups (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id  UUID REFERENCES tournaments(id),
    user_id        UUID REFERENCES users(id),
    matchday_id    UUID REFERENCES matchdays(id),
    formation_id   UUID REFERENCES formations(id),
    locked_at      TIMESTAMP, -- se completa al pasar el deadline de la jornada
    UNIQUE(tournament_id, user_id, matchday_id)
);

CREATE TABLE tournament_lineup_players (
    lineup_id        UUID REFERENCES tournament_lineups(id),
    real_player_id   UUID REFERENCES real_players(id),
    is_starting      BOOLEAN NOT NULL,
    assigned_position VARCHAR(20), -- posición asignada (relevante para el booster de cambio de posición)
    PRIMARY KEY (lineup_id, real_player_id)
);
```

### 2.8 Boosters

```sql
CREATE TABLE booster_catalog (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code           VARCHAR(40) UNIQUE NOT NULL, -- 'anulador_formacion', 'multiplicador_1_5x', etc.
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    unlock_type    VARCHAR(30) NOT NULL -- 'gratuito_inscripcion' / 'comprable' / 'premio' / 'objetivo_temporada' / 'unico_bienvenida'
);

CREATE TABLE user_booster_inventory (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID REFERENCES users(id),
    booster_id     UUID REFERENCES booster_catalog(id),
    obtained_via   VARCHAR(30) NOT NULL,
    obtained_at    TIMESTAMP DEFAULT now(),
    locked_to_tournament_id UUID REFERENCES tournaments(id), -- NULL hasta que se asigna a un torneo
    used_at        TIMESTAMP,
    used_on_real_player_id UUID REFERENCES real_players(id),
    used_on_matchday_id UUID REFERENCES matchdays(id)
);

CREATE TABLE season_objective_progress (
    user_id            UUID REFERENCES users(id),
    season_id          UUID REFERENCES seasons(id),
    objective_code      VARCHAR(50) NOT NULL, -- 'inscripcion_5_torneos', 'compra_venta_4_jugadores', etc.
    progress_count     INT DEFAULT 0,
    completed          BOOLEAN DEFAULT FALSE,
    completed_at       TIMESTAMP,
    PRIMARY KEY (user_id, season_id, objective_code)
);
```

### 2.9 Puntajes y ranking

```sql
CREATE TABLE tournament_matchday_scores (
    tournament_id   UUID REFERENCES tournaments(id),
    user_id         UUID REFERENCES users(id),
    matchday_id     UUID REFERENCES matchdays(id),
    points          NUMERIC(6,2) NOT NULL, -- calculado: suma de (rating x multiplicador) de titulares + boosters
    calculated_at   TIMESTAMP DEFAULT now(),
    PRIMARY KEY (tournament_id, user_id, matchday_id)
);
-- El ranking del torneo se calcula agregando esta tabla (SUM points GROUP BY user_id),
-- no se almacena como tabla aparte, para evitar inconsistencias de sincronización.
```

### 2.10 Marketplace

```sql
CREATE TABLE marketplace_items (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(150) NOT NULL,
    description    TEXT,
    credit_cost    NUMERIC(10,2) NOT NULL,
    stock          INT NOT NULL DEFAULT 0,
    active         BOOLEAN DEFAULT TRUE
);

CREATE TABLE marketplace_redemptions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID REFERENCES users(id),
    item_id        UUID REFERENCES marketplace_items(id),
    credits_spent  NUMERIC(10,2) NOT NULL,
    status         VARCHAR(30) DEFAULT 'pendiente', -- pendiente / enviado / entregado
    shipping_address TEXT,
    created_at     TIMESTAMP DEFAULT now()
);
```

---

## 3. Stack tecnológico propuesto

> Esta es una propuesta inicial razonable para un MVP; se puede ajustar según el equipo de desarrollo disponible.

| Capa | Propuesta | Justificación |
|---|---|---|
| Base de datos | PostgreSQL | Soporta bien el modelo relacional definido arriba, tipos ENUM, buena para integridad transaccional (créditos, torneos) |
| Backend / API | Node.js (NestJS) o Python (FastAPI/Django) | Cualquiera de las dos es adecuada; NestJS si el equipo prefiere TypeScript de punta a punta con el frontend |
| Frontend | React (Next.js) | Fuerte componente gráfico requerido por el proyecto; ecosistema maduro para dashboards, rankings en vivo y visualización de datos |
| Worker de sincronización | Job programado (cron) + cola de tareas (ej. BullMQ si es Node.js, Celery si es Python) | Permite reintentos automáticos si la API externa falla, y desacopla la sincronización del tráfico de usuarios |
| Actualizaciones en vivo (ranking) | WebSockets o Server-Sent Events | Para que el ranking se actualice sin que el usuario recargue la página |
| Hosting | Proveedor cloud estándar (AWS, DigitalOcean, Railway, etc.) | A definir según presupuesto — no es una decisión que dependa del diseño de datos |

---

## 4. Próximos pasos técnicos sugeridos

- [ ] Validar este esquema con el equipo de desarrollo antes de implementarlo.
- [ ] Definir el motor exacto de cálculo de puntaje (pseudocódigo o función) que combina: rating real × multiplicador de formación × efecto de boosters aplicados.
- [ ] Diseñar wireframes/mockups del entorno gráfico (dashboard de plantel, alineación por torneo, ranking en vivo, marketplace).
- [ ] Definir la API interna (contratos de endpoints) entre frontend y backend.
- [ ] Plan de pruebas para la lógica de deadline y cancelación automática de torneos.
