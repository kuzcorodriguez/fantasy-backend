# Reglamento y Estructura de la Plataforma de Fantasy Football

**Versión**: 0.2 — Documento de trabajo
**Propósito de este documento**: describir de forma completa y autocontenida el modelo de negocio, la mecánica de juego y el fundamento regulatorio de la plataforma, de modo que cualquier lector (equipo interno, asesor legal, inversionista) pueda entenderlo sin contexto previo.

> **Nota legal**: este documento describe el diseño funcional del producto y el razonamiento detrás de sus reglas. No constituye asesoría legal ni garantiza una clasificación regulatoria específica. El proyecto está diseñado desde el inicio para operar dentro del marco legal colombiano de "Juegos de Habilidad y Destreza" en lugar del régimen de "Juegos de Suerte y Azar" (Ley 643 de 2001, supervisado por Coljuegos), pero la validación final de esta clasificación debe hacerla un abogado especializado en  regulación de juegos antes de cualquier lanzamiento comercial.

---

## 1. Resumen ejecutivo

La plataforma es un portal web de **fantasy football de habilidad**: los usuarios arman un equipo con jugadores reales de una liga de fútbol (ejemplo inicial: Premier League), usando un presupuesto de créditos, y compiten entre sí en torneos cuyo puntaje se calcula con el desempeño real de esos jugadores en partidos oficiales.

A diferencia de una apuesta deportiva tradicional (donde el usuario predice un resultado y el azar decide si acierta), aquí el usuario **construye y gestiona activamente un activo** (su equipo), toma decisiones tácticas continuas (formación, titulares, uso de potenciadores) y compite contra el desempeño de otros usuarios, no contra la casa. El resultado depende de una combinación de conocimiento futbolístico, gestión de recursos y estrategia — no de un evento aleatorio único.

La monetización es doble:
1. **Venta de créditos** (moneda interna de la plataforma, con valor de referencia inicial de 1 crédito ≈ 1.500 COP).
2. **Venta de potenciadores premium** ("boosters") pagados con créditos.

Los premios de los torneos se entregan en créditos, canjeables exclusivamente en un **marketplace interno de productos físicos** (electrodomésticos, tecnología, etc.) — no en dinero en efectivo, lo cual refuerza la naturaleza de "juego de habilidad con premio en especie" en lugar de apuesta monetaria directa.

---

## 2. Por qué este modelo se diseña como "juego de habilidad" y no como "juego de azar"

Este es el punto más importante del documento, porque determina el régimen legal bajo el que puede operar la plataforma en Colombia, y por tanto el modelo de negocio viable.

### 2.1 El marco legal en Colombia

La Ley 643 de 2001 establece el monopolio estatal sobre los "juegos de suerte y azar", supervisado por Coljuegos, con procesos de licenciamiento estrictos, costosos y de larga duración. Sin embargo, la normativa tributaria colombiana reconoce una categoría distinta: los **"Juegos de Habilidad y Destreza"**, definidos como aquellos donde el resultado depende principalmente de la inteligencia, la destreza o la capacidad del jugador — y no del azar. Esta categoría tiene un régimen regulatorio y tributario considerablemente más liviano.

La clasificación de los fantasy sports específicamente **no está resuelta de forma explícita en la ley colombiana** a la fecha de este documento. Es una zona en desarrollo, similar a lo que ocurrió en Estados Unidos, donde la industria del fantasy sports argumentó — con éxito en la mayoría de estados — que su producto es un juego de habilidad, no de azar, gracias a mecánicas de gestión de presupuesto, selección de jugadores y toma de decisiones continuas por parte del usuario.

**Implicación práctica**: no existe una garantía automática de que la plataforma será clasificada como "juego de habilidad" solo por decirlo. La clasificación depende de qué tan bien el reglamento *demuestre*, en la práctica, que el resultado depende de las decisiones del usuario y no de un evento de azar puro. Por eso cada regla de este documento fue diseñada intencionalmente para reforzar ese argumento.

### 2.2 Principios de diseño que sostienen la clasificación de habilidad

| # | Principio | Cómo se implementa en la plataforma |
|---|---|---|
| 1 | Presupuesto fijo y gestión de recursos | El usuario arma su equipo con un número limitado de créditos, obligándolo a priorizar y tomar decisiones de asignación — similar a la gestión de un presupuesto real |
| 2 | Reglas conocidas de antemano e inmutables | Los multiplicadores de formación se calculan con una fórmula pública y fija (ver sección 8); no cambian a mitad de una competencia |
| 3 | Decisiones tácticas continuas | El usuario decide formación, titulares, sustituciones y uso de boosters antes de cada jornada, con toda la información pública disponible (calendario, estado de jugadores, rivales) |
| 4 | El poder más alto se gana, no se compra | Los boosters de mayor impacto (multiplicador x2, cambio de posición, Bench Boost, Arquero x2) se obtienen exclusivamente por desempeño o cumplimiento de objetivos — nunca con dinero |
| 5 | Límite al poder que sí se puede comprar | Solo 2 boosters usables por torneo, y solo un tipo de booster (multiplicador x1.5) es comprable — con techo claro, no ilimitado |
| 6 | Las correcciones a mitad de competencia se ganan, no se compran | Las transferencias de jugadores durante una temporada activa solo se pagan con créditos *ganados* en torneos anteriores, nunca con créditos comprados ni promocionales — así se evita "pagar para arreglar errores" |
| 7 | Gestión de riesgo manual, no automática | Si un jugador se lesiona o es expulsado, el usuario debe hacer la sustitución manualmente antes del cierre de mercado; la plataforma no protege automáticamente al usuario de sus decisiones — exige conocimiento activo del deporte |
| 8 | Sin mercado secundario de ventajas | Los boosters no se pueden vender, transferir ni canjear entre usuarios, evitando que el resultado dependa de la capacidad económica de terceros |
| 9 | Verificación de identidad | El registro exige correo, teléfono y documento de identidad, lo cual previene fraude por multicuentas y refuerza el cumplimiento regulatorio general |
| 10 | Premio en especie, no en efectivo | Los créditos ganados se canjean por productos en un marketplace interno, no se retiran como dinero — refuerza la naturaleza de "producto de entretenimiento con premio", distinta de una apuesta con pago directo en efectivo |

Estos diez principios son el "hilo conductor" del reglamento: cada sección posterior de este documento debe leerse a la luz de estos principios.

---

## 3. Registro de usuarios y cumplimiento normativo

### 3.1 Proceso de registro

Para crear una cuenta, el usuario debe proporcionar:
- Correo electrónico.
- Número de teléfono.
- Fotografía de su documento de identidad.

La verificación de identidad es obligatoria **antes** de poder participar en cualquier torneo (aunque el usuario puede explorar la plataforma y armar su equipo sin ella). Este control cumple dos funciones: prevenir fraude (creación de múltiples cuentas para explotar bonos de bienvenida) y adelantarse a un requisito de "Conozca a su Cliente" (KYC) que es habitual en operadores de juego regulados.

### 3.2 Beneficios de bienvenida (solo la primera vez que se crea una cuenta)

- **15 créditos promocionales**: suficientes para comprar 15 de los 19 jugadores posibles del plantel (ver sección 5). Estos créditos se clasifican como **"comprados"** para todos los efectos del reglamento (ver sección 4), es decir, no pueden usarse para transferencias durante una temporada activa.
- **1 tarjeta de fichaje de cortesía**: un booster que otorga un jugador adicional gratuito al plantel (el jugador número 16), sin costo en créditos. El usuario decide libremente cuándo activarla — no está atada a un torneo o temporada específica.

### 3.3 Cumplimiento de datos personales

La recolección de fotografías de documentos de identidad implica el tratamiento de datos personales sensibles, regulado en Colombia por la Ley 1581 de 2012 (Habeas Data). Antes del lanzamiento, la plataforma debe contar con:
- Política de tratamiento de datos personales publicada y aceptada explícitamente por el usuario en el registro.
- Almacenamiento cifrado y con acceso restringido a los documentos de identidad.
- Eventual registro de la base de datos ante la Superintendencia de Industria y Comercio (SIC), si se supera el volumen de usuarios que activa esta obligación.

---

## 4. Sistema de créditos (moneda interna)

Los créditos son la moneda interna de la plataforma. Existen dos tipos, con reglas de uso distintas — esta distinción es una de las piezas centrales del argumento de "juego de habilidad" (principio 6 de la sección 2.2).

### 4.1 Tipos de crédito

| Tipo | Cómo se obtiene | Para qué sirve |
|---|---|---|
| **Comprado** | Compra directa con dinero real (1 crédito ≈ 1.500 COP), o créditos promocionales de bienvenida | Compra inicial de jugadores del plantel, inscripción a torneos, compra de boosters comprables |
| **Ganado** | Premios obtenidos por posición en torneos | Todo lo anterior, **más** transferencias de jugadores durante una temporada activa |

**Por qué esta distinción importa**: si un usuario pudiera comprar créditos y usarlos para corregir errores de alineación a mitad de temporada, el resultado del torneo dependería en parte de cuánto dinero está dispuesto a gastar en tiempo real — un patrón que se parece a un juego de azar (pagar más para mejorar las probabilidades). Al exigir que las correcciones en vivo se paguen únicamente con créditos ya ganados jugando, el sistema obliga a que la ventaja competitiva se derive de resultados anteriores, no de capacidad de gasto.

### 4.2 Precios de referencia

| Concepto | Precio |
|---|---|
| Jugador (compra inicial o fichaje) | 1 crédito |
| Venta de jugador | 0.5 créditos (mitad del precio de compra) |
| Inscripción a torneo | 20 a 60 créditos, según duración/tipo |
| Booster multiplicador x1.5 | 15 créditos (fijo) |

### 4.3 Distribución de premios (ejemplo ilustrativo)

Ejemplo con 100 usuarios inscritos en un torneo corto a 20 créditos cada uno:

- Pool total recaudado: 100 × 20 = **2.000 créditos**.
- 50% para la plataforma (operación, sostenibilidad del negocio): 1.000 créditos.
- 50% repartido entre los 3 primeros lugares: 1.000 créditos, distribuidos por ejemplo como 600 / 300 / 100 para 1°, 2° y 3° lugar respectivamente.

*(La proporción exacta de reparto y el número de posiciones premiadas se ajustará con el modelo financiero — ver sección 15.)*

---

## 5. El plantel de jugadores

### 5.1 Composición

Cada usuario arma un **plantel de hasta 19 jugadores**, compuesto por:
- **11 titulares base**: 1 arquero, 4 defensas, 3 mediocampistas, 3 delanteros (bajo la formación por defecto 4-3-3).
- **Hasta 8 jugadores de banca**, disponibles como suplentes o para activar el booster Bench Boost (ver sección 9).

El plantel se arma **una sola vez, desde el menú principal** de la plataforma — no se rehace por cada torneo. El mismo plantel de 19 jugadores es la base para todos los torneos en los que el usuario decida participar (ver sección 7 para entender cómo se diferencia la alineación entre torneos).

### 5.2 Costos

- Comprar un jugador (fichaje inicial o durante una temporada): 1 crédito.
- Vender un jugador: recibe 0.5 créditos (mitad del valor de compra) — este descuento incentiva a pensar bien la composición inicial del equipo, en vez de comprar y vender jugadores sin costo estratégico.

---

## 6. Temporadas y transferencias del plantel

### 6.1 Estructura de temporadas

El año se divide en **6 temporadas ("seasons") de aproximadamente 2 meses cada una**. Esta estructura cumple dos funciones: (a) da ritmo y renovación constante a la competencia, evitando que un torneo único de 9-10 meses sea la única forma de competir, y (b) sirve como base temporal para reiniciar los objetivos que desbloquean boosters (ver sección 9), manteniendo el incentivo de juego activo durante todo el año.

### 6.2 Límite de transferencias

- Máximo **4 transferencias (venta + compra de jugadores) por temporada**.
- Estas transferencias solo pueden pagarse con **créditos ganados** en torneos anteriores (ver sección 4.1) — nunca con créditos comprados ni promocionales.
- Un usuario en su primera temporada, sin créditos ganados todavía, no podrá hacer transferencias de este tipo salvo que use su tarjeta de fichaje de cortesía (sección 3.2), que no cuenta como transferencia sino como jugador adicional gratuito.

### 6.3 Deadline de mercado

El cierre de fichajes/transferencias del plantel ocurre **24 horas antes del primer partido de cada jornada real** de la liga. Como el plantel es compartido entre todos los torneos del usuario, este deadline aplica de forma global: un cambio de plantel se refleja automáticamente en todos los torneos activos donde el usuario esté inscrito para esa jornada.

---

## 7. Alineación: cómo se diferencia la estrategia entre torneos simultáneos

Aunque el plantel de 19 jugadores es el mismo para todos los torneos, cada torneo tiene su **propia alineación independiente**. Esto significa que, para la misma jornada real de la liga, el usuario puede:

- Usar una **formación distinta** en cada torneo (ej. 4-3-3 en un torneo, 3-5-2 en otro simultáneo).
- Elegir **11 titulares distintos** entre sus 19 jugadores disponibles, dependiendo del torneo.
- Asignar **boosters distintos** a cada torneo (ver sección 9.1 — cada booster, una vez asignado a un torneo, queda bloqueado exclusivamente para ese torneo).

**Ejemplo**: un usuario con 19 jugadores puede, para la misma jornada de Premier League, alinear a un defensa como titular en el "Torneo Corto A" (con formación 3-5-2, aprovechando el multiplicador alto a defensas) y dejarlo en la banca en el "Torneo Largo B" (donde eligió una formación 4-3-3). El resultado de ambos torneos, aunque se basa en los mismos partidos reales, será distinto — porque las decisiones tácticas del usuario fueron distintas en cada uno.

### 7.1 Requisito mínimo para inscribirse a un torneo

El usuario no necesita tener un jugador específico en su plantel antes de inscribirse a un torneo — solo debe cumplir el requisito de composición mínima **al momento del deadline** de cada jornada. El requisito de inscripción es tener, dentro del plantel, **al menos el número de jugadores por posición que exige la formación elegida** para ese torneo (ejemplo: la formación 4-3-3 exige tener disponibles al menos 4 defensas, 3 mediocampistas y 3 delanteros, además del arquero).

---

## 8. Formaciones y multiplicadores: el modelo de balance matemático

### 8.1 El problema que resuelve este modelo

Si los multiplicadores de cada formación se definieran de forma arbitraria, existe el riesgo de que una formación resulte objetivamente superior a las demás (es decir, que sume más puntos en promedio sin importar la decisión del usuario), lo cual reduciría el componente estratégico real: todos los usuarios simplemente elegirían la formación "matemáticamente ganadora". Para evitar esto, la plataforma usa una fórmula que **garantiza el balance entre todas las formaciones**.

### 8.2 La fórmula

> **Multiplicador de una línea (defensas, medio o delanteros) = (jugadores de esa línea en la formación base 4-3-3) ÷ (jugadores de esa línea en la formación elegida)**

El arquero siempre puntúa a **x1**, en cualquier formación (su potenciador específico es la carta "Arquero x2", ver sección 9).

**Por qué esto garantiza balance**: la formación base 4-3-3 reparte a los 10 jugadores de campo en 4 defensas + 3 medios + 3 delanteros = 10. La fórmula anterior asegura matemáticamente que, para cualquier formación válida (donde la suma de defensas + medios + delanteros también sea 10), el resultado ponderado (jugadores × multiplicador) siempre sume 10. En el hipotético de que los 11 titulares saquen calificación perfecta de 10 en un partido, el puntaje total del equipo — sin usar ningún booster — siempre será **110 puntos**, sin importar qué formación se haya elegido. El balance no depende de ajustar números a mano: es una propiedad matemática de la fórmula.

### 8.3 Catálogo de formaciones

| Formación | Defensas | Medio | Delanteros | Verificación (jugadores × multiplicador) |
|---|---|---|---|---|
| 4-3-3 (base) | x1.00 | x1.00 | x1.00 | 4+3+3 = 10 ✓ |
| 4-4-2 | x1.00 | x0.75 | x1.50 | 4+3+3 = 10 ✓ |
| 3-5-2 | x1.33 | x0.60 | x1.50 | 4+3+3 = 10 ✓ |
| 5-3-2 | x0.80 | x1.00 | x1.50 | 4+3+3 = 10 ✓ |
| 3-4-3 | x1.33 | x0.75 | x1.00 | 4+3+3 = 10 ✓ |
| 4-5-1 | x1.00 | x0.60 | x3.00 | 4+3+3 = 10 ✓ |
| 5-4-1 | x0.80 | x0.75 | x3.00 | 4+3+3 = 10 ✓ |

*(Catálogo ampliable a más formaciones usando la misma fórmula.)*

### 8.4 Ejemplo de cálculo de puntaje de una jornada

Supongamos un usuario que juega con formación **3-5-2** (defensas x1.33, medio x0.60, delanteros x1.50, arquero x1) y sus 11 titulares obtienen las siguientes calificaciones reales en la jornada:

| Posición | Calificación real | Multiplicador | Puntos aportados |
|---|---|---|---|
| Arquero | 7.0 | x1.00 | 7.0 |
| Defensa 1 | 6.5 | x1.33 | 8.6 |
| Defensa 2 | 7.2 | x1.33 | 9.6 |
| Defensa 3 | 6.0 | x1.33 | 8.0 |
| Medio 1 | 8.0 | x0.60 | 4.8 |
| Medio 2 | 6.5 | x0.60 | 3.9 |
| Medio 3 | 7.0 | x0.60 | 4.2 |
| Medio 4 | 6.8 | x0.60 | 4.1 |
| Medio 5 | 7.5 | x0.60 | 4.5 |
| Delantero 1 | 9.0 | x1.50 | 13.5 |
| Delantero 2 | 5.5 | x1.50 | 8.25 |
| **Total** | | | **76.50 puntos** |

> **Nota técnica**: el multiplicador de defensas se muestra como "x1.33" para el usuario, pero el sistema calcula internamente con la fracción exacta (4÷3 = 1.3333...), no con el valor redondeado. Esto es necesario para que la garantía de balance de la sección 8.2 (110 puntos siempre, con calificación perfecta) se cumpla de forma exacta y no aproximada — usar el valor redondeado en el cálculo introduciría pequeños errores acumulados. Verificado en el motor de cálculo (`scoringEngine.ts`) con pruebas automatizadas.

Este mismo desempeño real, bajo una formación distinta (por ejemplo 4-3-3), habría dado un resultado diferente — porque los multiplicadores aplicados a cada jugador cambian. Esto demuestra en la práctica cómo la decisión de formación afecta directamente el resultado, más allá del desempeño real de los jugadores.

---

## 9. Sistema de boosters (potenciadores)

### 9.1 Reglas generales

- Cada usuario acumula un **baúl de boosters**, compartido entre todos los torneos en los que participa.
- En cada torneo puede usar un **máximo de 2 boosters**, seleccionados **antes de que inicie el torneo** y sin posibilidad de cambio posterior.
- Al asignar un booster del baúl a un torneo específico, **ese booster queda bloqueado exclusivamente para ese torneo** — no puede usarse simultáneamente en ningún otro, incluso si todavía no se ha aplicado a un jugador.
- Los boosters **no son transferibles ni canjeables entre usuarios**, lo cual previene la formación de un mercado secundario de ventajas y refuerza el control anti-fraude.
- La asignación de un booster a un jugador específico debe hacerse **antes del cierre de mercado de la jornada correspondiente**, es decir, sin conocer aún el resultado del partido — el usuario asume el riesgo de su decisión.

### 9.2 Catálogo completo

> **Regla de reinicio**: todos los objetivos de desbloqueo (constancia, participación, actividad de fichajes, etc.) se **reinician al inicio de cada temporada** (cada ~2 meses). Esto mantiene el incentivo de juego activo durante todo el año y da a cualquier usuario la oportunidad de conseguir cada booster en cualquier temporada, no solo una vez en la vida de su cuenta.

| Booster | Efecto | Cómo se obtiene |
|---|---|---|
| Anulador de debilidad por formación | Regresa a x1 el multiplicador de un jugador afectado negativamente por la formación elegida | Gratuito: 2 unidades otorgadas al inscribirse a cada torneo |
| Multiplicador x1.5 | Aplica x1.5 a la calificación real de un jugador en una jornada | Compra: 15 créditos (precio fijo) · Premio: posiciones 6ª a 10ª en un torneo |
| Multiplicador x2 | Aplica x2 a la calificación real de un jugador en una jornada | Exclusivo por premio: top 5 de un torneo |
| Cambio de posición | Reasigna a un jugador a otra posición dentro de la formación; **adopta el multiplicador de la posición destino** | Objetivo por temporada: inscribirse en 5 torneos distintos |
| Venta a precio completo | Permite vender un jugador sin la penalización de mitad de precio | Objetivo por temporada: participar/completar una temporada |
| Bench Boost | Por una jornada, los puntos de **4 jugadores de banca** (elegidos por el usuario para ese partido específico) también cuentan para el total del equipo | Objetivo por temporada: inscribirse en 3 o más torneos dentro de la misma temporada |
| Arquero x2 | Aplica x2 a la calificación real del arquero en una jornada | Objetivo por temporada: comprar y vender 4 jugadores del plantel |
| Tarjeta de fichaje de cortesía | Agrega un jugador adicional gratuito al plantel, sin costo en créditos | Único: se otorga al crear la cuenta por primera vez |

### 9.3 Por qué la jerarquía de boosters refuerza el argumento de habilidad

Nótese que solo un booster (multiplicador x1.5) es comprable con dinero (vía créditos), y su efecto es el más modesto del catálogo. Todos los boosters de mayor impacto — multiplicador x2, cambio de posición, Bench Boost, Arquero x2 — se obtienen exclusivamente por desempeño competitivo o por cumplimiento de objetivos de actividad (participación, gestión activa del plantel). Esto significa que ningún usuario puede "comprar" una ventaja decisiva; solo puede ganarla jugando bien o jugando de forma constante.

### 9.4 Gestión de bajas (lesiones, expulsiones)

Cuando un jugador titular sufre una baja (lesión, expulsión, no convocatoria) antes de una jornada, **la sustitución es manual** — el usuario debe identificarla y corregir su alineación antes del cierre de mercado. La plataforma envía notificaciones informativas (vía un buzón de alertas) cuando detecta que un jugador titular fue reportado como duda o baja, pero la decisión y sus consecuencias son responsabilidad exclusiva del usuario. Este diseño es intencional: automatizar la sustitución eliminaría un elemento central de habilidad (anticipación y conocimiento del deporte), mientras que dejarlo manual —con la plataforma solo informando, no decidiendo— refuerza que el resultado depende del criterio del usuario.

---

## 10. Torneos

### 10.1 Tipos de torneo (por duración)

- **Torneo completo**: considera todos los partidos de la liga seleccionada durante la temporada real (ej. toda la Premier League).
- **Torneos cortos**: consideran un número limitado de próximos partidos reales (ej. 5 o 10 jornadas).

### 10.2 Modalidades de premiación

El sistema está diseñado para soportar distintas modalidades de premiación, que pueden variar de una temporada a otra sin requerir rediseño técnico:

- **Único ganador** (winner-takes-most): el premio se concentra casi enteramente en el primer lugar.
- **Top 3**: modalidad de lanzamiento inicial (ver distribución de ejemplo en sección 4.3).
- **Top 5 / Top 10**: reparte el pool entre más posiciones, incentivando participación de usuarios con expectativas más conservadoras.
- **Ligas privadas entre amigos**: modalidad social sin premio en créditos, pensada como palanca de crecimiento viral. `[Pendiente evaluar prioridad de desarrollo — no incluida en el MVP inicial]`.

La plataforma puede ofrecer varias modalidades en paralelo, y ajustar cuáles están disponibles de una temporada a otra según desempeño y demanda.

### 10.3 Participantes por torneo

Se ofrecen ambos formatos en paralelo:

- **Con límite fijo** (ej. 20 equipos): pool de premios predecible desde el momento de apertura, útil para torneos con premios ya definidos de antemano.
- **Sin límite**: el pool de premios crece proporcionalmente al número de inscritos, sin techo de participantes.

### 10.4 Apertura y cierre de inscripción

- Los torneos se abren en **fechas fijas**, con cadencia semanal como referencia inicial.
- Una vez iniciado un torneo, **la inscripción queda cerrada** — no se permite unirse a un torneo ya en curso. El usuario debe esperar a la siguiente apertura de un torneo de la misma modalidad.
- Durante el "tiempo muerto" entre inscripción y el inicio real de un torneo, los usuarios pueden consultar estadísticas de jugadores y preparar su plantel/alineación con anticipación.
- **Condición de arranque**: un torneo solo inicia si se alcanza un número mínimo de participantes inscritos antes de su fecha de cierre de inscripción.

### 10.5 Política de cancelación por mínimo no alcanzado

Si un torneo no alcanza el mínimo de participantes requerido antes de su cierre de inscripción, se cancela automáticamente y se aplican las siguientes reglas:

- Se **devuelven íntegramente los créditos de inscripción** a todos los usuarios inscritos.
- Cualquier booster comprado específicamente para ese torneo también se devuelve o se libera de vuelta al baúl del usuario (a definir cuál mecánica es más simple de implementar).
- El usuario puede inscribirse libremente en la siguiente apertura de un torneo de la misma modalidad.

Esta política es importante tanto para la confianza del usuario como desde una perspectiva de protección al consumidor: cobrar por un servicio que finalmente no se presta (un torneo que nunca corre) debe resolverse con devolución automática, no a discreción.

### 10.6 Inscripción y costos

El costo de inscripción varía entre 20 y 60 créditos, dependiendo de la duración y tipo de torneo.

### 10.7 Cálculo de puntaje

El puntaje de un equipo en cada jornada es la suma de las calificaciones reales (obtenidas vía API deportiva) de los 11 titulares definidos por el usuario para esa jornada específica en ese torneo, ajustadas por el multiplicador de formación (sección 8) y por los boosters aplicados (sección 9). El puntaje total del torneo es la suma acumulada de todas las jornadas incluidas.

### 10.8 Ranking y resultado

Todos los usuarios inscritos pueden ver, en tiempo real (o tras el cierre de cada jornada), el ranking del torneo según puntos acumulados. Gana el torneo (o gana un lugar premiado, según la modalidad de premiación) quien tenga el mayor puntaje acumulado al finalizar la última jornada considerada.

---

## 11. Marketplace de canje

Los créditos ganados en torneos (premios) pueden canjearse en un marketplace interno por productos físicos (por ejemplo, televisores, teléfonos, electrodomésticos), publicados con un valor en créditos equivalente. Este mecanismo cumple una función regulatoria importante: al no permitir el retiro de premios en efectivo, la plataforma se posiciona como una experiencia de entretenimiento con premios en especie, en lugar de una apuesta con pago monetario directo — un matiz relevante para la clasificación legal del producto (aunque, como se indica en la sección 2, esto debe validarse con asesoría legal, ya que algunos reguladores tratan los premios en especie de forma equivalente al efectivo si hubo un pago previo para participar).

La operación del marketplace (adquisición de inventario, logística de despacho, garantías) requiere un plan operativo independiente, fuera del alcance de este documento.

---

## 12. Prevención de fraude y cumplimiento

- Verificación de identidad obligatoria (correo, teléfono, documento) antes de participar en torneos.
- Boosters no transferibles ni canjeables entre usuarios.
- Reglas de formación y multiplicadores públicas e inmutables durante cada competencia.
- Separación estricta entre créditos comprados y créditos ganados, con reglas de uso diferenciadas.
- Cumplimiento de la Ley 1581 de 2012 (Habeas Data) para el tratamiento de documentos de identidad.
- Validación legal pendiente con abogado especializado en regulación de juegos (Coljuegos) antes del lanzamiento comercial.

---

## 13. Glosario de términos

| Término | Definición |
|---|---|
| Plantel | Conjunto de hasta 19 jugadores que posee un usuario, gestionado de forma global desde el menú principal |
| Alineación | Selección de formación, 11 titulares y boosters que un usuario define para un torneo específico en una jornada específica |
| Temporada (season) | Periodo de ~2 meses; el año se divide en 6 temporadas; base temporal para reiniciar objetivos de boosters y contar el límite de transferencias |
| Crédito comprado | Crédito adquirido con dinero real o recibido como bono promocional; no sirve para transferencias en temporada |
| Crédito ganado | Crédito obtenido como premio en un torneo; sirve para todos los usos, incluidas transferencias en temporada |
| Booster | Potenciador de un solo uso que modifica el puntaje de un jugador o del equipo en una jornada |
| Deadline / cierre de mercado | Momento (24h antes del primer partido de la jornada) a partir del cual no se permiten más cambios de plantel, alineación ni boosters para esa jornada |

---

## 14. Pendientes abiertos (a resolver antes del lanzamiento)

- [ ] Validar todo el reglamento con abogado especializado en Coljuegos.
- [ ] Definir proveedor de API deportiva (cobertura de ligas, disponibilidad de ratings por jugador, costo).
- [ ] Definir proporción exacta de reparto del pool de premios (actualmente ejemplo ilustrativo 50/50 casa-usuarios, con 60/25/15 entre los 3 primeros lugares).
- [ ] Definir capital inicial y estrategia de inventario del marketplace.
- [ ] Modelo financiero completo de rentabilidad (siguiente fase de este proyecto).

---

## 15. Próximo paso: modelo financiero

Con el reglamento cerrado, la siguiente fase es construir un modelo de rentabilidad que permita evaluar, con distintos escenarios de número de usuarios, precio del crédito y costos operativos (API deportiva, infraestructura, marketplace), la viabilidad financiera de la plataforma antes de comprometer inversión de desarrollo.
