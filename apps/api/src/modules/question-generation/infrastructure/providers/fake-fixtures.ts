import type { GeneratedItem } from '../../domain/generated-item.js';

// Fixtures for the FakeQuestionGenerationProvider (docs/architecture/10 §4): deterministic,
// offline items in the same structured shape a real provider must return, grouped by context.
// They are public, so they only serve development, tests and CI; production pools come from a
// real provider (slice S6). One item is deliberately invalid to exercise the pipeline's rules.

type Texts = [question: string, options: [string, string, string, string], explanation: string];

function item(
  topic: string,
  difficulty: number,
  seniority: GeneratedItem['seniority'],
  technology: string | null,
  correctOption: GeneratedItem['correctOption'],
  en: Texts,
  es: Texts,
): GeneratedItem {
  const translate = ([question, [A, B, C, D], explanation]: Texts) => ({
    question,
    options: { A, B, C, D },
    explanation,
  });
  return {
    topic,
    difficulty,
    seniority,
    role: 'any',
    technology,
    correctOption,
    translations: { en: translate(en), es: translate(es) },
  };
}

export const FAKE_FIXTURES: Record<string, GeneratedItem[]> = {
  'tech:nodejs:3': [
    item(
      'nodejs.worker-threads',
      3,
      'senior',
      'nodejs',
      'B',
      [
        'Which Node.js API runs CPU-heavy work without blocking the event loop?',
        ['process.nextTick', 'worker_threads', 'setImmediate', 'EventEmitter'],
        'worker_threads runs JavaScript in parallel threads; the others schedule work on the same event loop.',
      ],
      [
        '¿Qué API de Node.js ejecuta trabajo intensivo en CPU sin bloquear el event loop?',
        ['process.nextTick', 'worker_threads', 'setImmediate', 'EventEmitter'],
        'worker_threads ejecuta JavaScript en hilos paralelos; las demás programan trabajo en el mismo event loop.',
      ],
    ),
    item(
      'nodejs.blocking-crypto',
      3,
      'senior',
      'nodejs',
      'A',
      [
        'Your Node.js API slows down while hashing passwords with the sync API. Best fix?',
        [
          'Use the async hashing API',
          'Raise the HTTP timeout',
          'Add more Express middleware',
          'Call process.nextTick first',
        ],
        'The async API runs the hash in the libuv thread pool, so the event loop keeps serving requests.',
      ],
      [
        'Tu API en Node.js se ralentiza al hashear contraseñas con la API síncrona. ¿Mejor solución?',
        [
          'Usar la API asíncrona de hash',
          'Subir el timeout HTTP',
          'Añadir más middleware de Express',
          'Llamar antes a process.nextTick',
        ],
        'La API asíncrona ejecuta el hash en el thread pool de libuv y el event loop sigue atendiendo peticiones.',
      ],
    ),
    item(
      'nodejs.unhandled-rejection',
      3,
      'senior',
      'nodejs',
      'C',
      [
        'By default, what does current Node.js do with an unhandled promise rejection?',
        [
          'Ignores it silently',
          'Retries the promise',
          'Terminates the process',
          'Logs it once a day',
        ],
        'Since Node.js 15 the default mode is "throw": an unhandled rejection crashes the process.',
      ],
      [
        'Por defecto, ¿qué hace Node.js actual con una promesa rechazada sin manejar?',
        [
          'La ignora en silencio',
          'Reintenta la promesa',
          'Termina el proceso',
          'La registra una vez al día',
        ],
        'Desde Node.js 15 el modo por defecto es "throw": un rechazo sin manejar hace caer el proceso.',
      ],
    ),
  ],
  'tech:php:3': [
    item(
      'php.pdo.prepared-statements',
      3,
      'senior',
      'php',
      'A',
      [
        'Which PHP feature prevents SQL injection when querying with PDO?',
        ['Prepared statements', 'addslashes()', 'htmlspecialchars()', 'Turning off errors'],
        'Prepared statements send the query and the values separately, so user input is never parsed as SQL.',
      ],
      [
        '¿Qué funcionalidad de PHP evita la inyección SQL al consultar con PDO?',
        ['Sentencias preparadas', 'addslashes()', 'htmlspecialchars()', 'Desactivar los errores'],
        'Las sentencias preparadas envían la consulta y los valores por separado, así la entrada nunca se interpreta como SQL.',
      ],
    ),
    item(
      'php.opcache',
      3,
      'senior',
      'php',
      'D',
      [
        'A PHP-FPM app compiles the same scripts on every request. Which setting helps most?',
        [
          'display_errors = On',
          'A higher memory_limit',
          'A longer max_execution_time',
          'Enabling OPcache',
        ],
        'OPcache keeps compiled bytecode in shared memory, so PHP skips parsing and compiling on each request.',
      ],
      [
        'Una app PHP-FPM compila los mismos scripts en cada petición. ¿Qué ajuste ayuda más?',
        [
          'display_errors = On',
          'Un memory_limit mayor',
          'Un max_execution_time mayor',
          'Activar OPcache',
        ],
        'OPcache guarda el bytecode compilado en memoria compartida y PHP evita parsear y compilar en cada petición.',
      ],
    ),
    item(
      'php.nullsafe',
      3,
      'senior',
      'php',
      'B',
      [
        'In PHP 8, what does the ?-> operator do?',
        [
          'Casts a value to nullable',
          'Returns null on a null object',
          'Calls a static method',
          'Suppresses warnings',
        ],
        'The nullsafe operator short-circuits the chain and returns null when the object is null.',
      ],
      [
        'En PHP 8, ¿qué hace el operador ?->?',
        [
          'Convierte un valor en nullable',
          'Devuelve null si el objeto es null',
          'Llama a un método estático',
          'Oculta los warnings',
        ],
        'El operador nullsafe corta la cadena y devuelve null cuando el objeto es null.',
      ],
    ),
  ],
  'tech:react:3': [
    item(
      'react.effects.infinite-loop',
      3,
      'senior',
      'react',
      'C',
      [
        'An effect fetches data, sets state and then runs forever. Most likely cause?',
        [
          'A missing key prop',
          'Using StrictMode',
          'A dependency recreated each render',
          'Fetching inside an effect',
        ],
        'An object or function created during render is a new value every time, so the effect re-runs after each update.',
      ],
      [
        'Un effect pide datos, actualiza el estado y se ejecuta sin fin. ¿Causa más probable?',
        [
          'Falta la prop key',
          'Usar StrictMode',
          'Una dependencia recreada cada render',
          'Pedir datos dentro de un effect',
        ],
        'Un objeto o función creados en el render son un valor nuevo cada vez, así que el effect se vuelve a ejecutar tras cada actualización.',
      ],
    ),
    item(
      'react.memo.expensive',
      3,
      'senior',
      'react',
      'A',
      [
        'A component recalculates an expensive value on every render. Which hook helps?',
        ['useMemo', 'useRef', 'useId', 'useLayoutEffect'],
        'useMemo caches the computed value until its dependencies change.',
      ],
      [
        'Un componente recalcula un valor costoso en cada render. ¿Qué hook ayuda?',
        ['useMemo', 'useRef', 'useId', 'useLayoutEffect'],
        'useMemo guarda el valor calculado hasta que cambian sus dependencias.',
      ],
    ),
    item(
      'react.keys.reorder',
      3,
      'senior',
      'react',
      'D',
      [
        'Why avoid array indexes as keys in a list that can be reordered?',
        [
          'Indexes are not allowed',
          'Keys improve SEO',
          'Indexes slow down CSS',
          'State can stick to wrong items',
        ],
        'React matches elements by key; with indexes, reordering makes component state follow the position instead of the item.',
      ],
      [
        '¿Por qué evitar índices como key en una lista que se puede reordenar?',
        [
          'Los índices no están permitidos',
          'Las keys mejoran el SEO',
          'Los índices ralentizan el CSS',
          'El estado se pega a otro elemento',
        ],
        'React empareja elementos por key; con índices, al reordenar el estado sigue a la posición y no al elemento.',
      ],
    ),
  ],
  'tech:postgresql:3': [
    item(
      'postgresql.indexing.explain',
      3,
      'senior',
      'postgresql',
      'B',
      [
        'A query filtering by email on a 10M-row table is slow. First step?',
        ['Add more CPU', 'Run EXPLAIN, then index it', 'Use SELECT *', 'Run VACUUM FULL hourly'],
        'EXPLAIN shows whether the query scans the whole table; an index on the filtered column usually fixes it.',
      ],
      [
        'Una consulta que filtra por email en una tabla de 10M filas es lenta. ¿Primer paso?',
        [
          'Añadir más CPU',
          'Usar EXPLAIN e indexar',
          'Usar SELECT *',
          'Ejecutar VACUUM FULL cada hora',
        ],
        'EXPLAIN muestra si la consulta recorre toda la tabla; un índice en la columna filtrada suele resolverlo.',
      ],
    ),
    item(
      'postgresql.locking.for-update',
      3,
      'senior',
      'postgresql',
      'A',
      [
        'Two transactions update the same row. Which clause makes the second wait for the first?',
        ['SELECT … FOR UPDATE', 'ORDER BY id', 'SELECT DISTINCT', 'LIMIT 1'],
        'FOR UPDATE locks the selected rows until the transaction ends, so a concurrent writer waits.',
      ],
      [
        'Dos transacciones actualizan la misma fila. ¿Qué cláusula hace que la segunda espere?',
        ['SELECT … FOR UPDATE', 'ORDER BY id', 'SELECT DISTINCT', 'LIMIT 1'],
        'FOR UPDATE bloquea las filas seleccionadas hasta que termina la transacción, así que el otro escritor espera.',
      ],
    ),
    item(
      'postgresql.gin',
      3,
      'senior',
      'postgresql',
      'C',
      [
        'Which index type fits searching inside a JSONB or array column?',
        ['B-tree', 'Hash', 'GIN', 'BRIN'],
        'GIN indexes the elements inside composite values, which suits containment queries on JSONB and arrays.',
      ],
      [
        '¿Qué tipo de índice sirve para buscar dentro de una columna JSONB o array?',
        ['B-tree', 'Hash', 'GIN', 'BRIN'],
        'GIN indexa los elementos de valores compuestos, ideal para consultas de contención sobre JSONB y arrays.',
      ],
    ),
  ],
  'tech:redis:3': [
    item(
      'redis.sorted-set.leaderboard',
      3,
      'senior',
      'redis',
      'D',
      [
        'Which Redis structure fits a real-time leaderboard?',
        ['List', 'Set', 'String', 'Sorted set'],
        'A sorted set keeps members ordered by score and answers rank queries in logarithmic time.',
      ],
      [
        '¿Qué estructura de Redis encaja con un ranking en tiempo real?',
        ['List', 'Set', 'String', 'Sorted set'],
        'Un sorted set mantiene los miembros ordenados por puntuación y resuelve consultas de rango en tiempo logarítmico.',
      ],
    ),
    item(
      'redis.cache.stampede',
      3,
      'senior',
      'redis',
      'B',
      [
        'Many requests rebuild the same expired cache key at once. What mitigates it?',
        [
          'Shorter TTLs',
          'A lock or early refresh',
          'Disabling persistence',
          'Calling KEYS * first',
        ],
        'Letting one request rebuild (a lock) or refreshing before expiry avoids a stampede on the database.',
      ],
      [
        'Muchas peticiones regeneran a la vez la misma clave de caché expirada. ¿Qué lo mitiga?',
        [
          'TTLs más cortos',
          'Un lock o refresco anticipado',
          'Desactivar la persistencia',
          'Llamar antes a KEYS *',
        ],
        'Dejar que una sola petición regenere (lock) o refrescar antes de expirar evita la avalancha sobre la base de datos.',
      ],
    ),
    item(
      'redis.lock.ttl',
      3,
      'senior',
      'redis',
      'A',
      [
        'Why should a Redis-based lock have a TTL?',
        [
          "So a crashed holder can't block",
          'TTLs make Redis faster',
          'Locks are invisible without it',
          'To replicate the lock',
        ],
        'If the process holding the lock dies, the TTL releases it; without it the lock would be held forever.',
      ],
      [
        '¿Por qué un lock en Redis debe tener TTL?',
        [
          'Para que un caído no bloquee',
          'El TTL acelera Redis',
          'Sin TTL el lock es invisible',
          'Para replicar el lock',
        ],
        'Si el proceso que tiene el lock muere, el TTL lo libera; sin él, el lock quedaría tomado para siempre.',
      ],
    ),
  ],
  'track:fullstack:3': [
    item(
      'web.cors',
      3,
      'senior',
      null,
      'C',
      [
        'A web app calls an API on another domain and the browser blocks it. What must the API send?',
        ['A CSP header', 'An ETag', 'The right CORS headers', 'A 302 redirect'],
        'Browsers allow cross-origin calls only when the API answers with matching Access-Control-Allow-* headers.',
      ],
      [
        'Una web llama a una API en otro dominio y el navegador lo bloquea. ¿Qué debe enviar la API?',
        ['Una cabecera CSP', 'Un ETag', 'Las cabeceras CORS correctas', 'Una redirección 302'],
        'El navegador solo permite llamadas entre orígenes si la API responde con las cabeceras Access-Control-Allow-* adecuadas.',
      ],
    ),
    item(
      'web.session-token-storage',
      3,
      'senior',
      null,
      'A',
      [
        'Where should a session token live to be safest from XSS?',
        [
          'An HttpOnly, Secure cookie',
          'localStorage',
          'The URL query string',
          'A global JS variable',
        ],
        'JavaScript cannot read HttpOnly cookies, so an injected script cannot steal the token.',
      ],
      [
        '¿Dónde debe guardarse un token de sesión para protegerlo mejor del XSS?',
        [
          'Una cookie HttpOnly y Secure',
          'localStorage',
          'La query string de la URL',
          'Una variable global de JS',
        ],
        'JavaScript no puede leer cookies HttpOnly, así que un script inyectado no puede robar el token.',
      ],
    ),
    item(
      'api.pagination.cursor',
      3,
      'senior',
      null,
      'B',
      [
        'Paging a feed that changes constantly. Which approach avoids duplicates and gaps?',
        [
          'OFFSET/LIMIT pages',
          'Cursor (keyset) pagination',
          'Random sampling',
          'Loading everything at once',
        ],
        'A cursor continues from the last item seen, so inserts and deletes between pages do not shift the results.',
      ],
      [
        'Paginar un feed que cambia sin parar. ¿Qué enfoque evita duplicados y huecos?',
        [
          'Páginas con OFFSET/LIMIT',
          'Paginación por cursor (keyset)',
          'Muestreo aleatorio',
          'Cargar todo de una vez',
        ],
        'Un cursor continúa desde el último elemento visto, así las altas y bajas entre páginas no desplazan los resultados.',
      ],
    ),
    item(
      'api.idempotency-key',
      3,
      'senior',
      null,
      'D',
      [
        'Double-clicking "Pay" creates duplicate orders. Best server-side fix?',
        [
          'A longer timeout',
          'Retrying on the client',
          'Hiding the button',
          'An idempotency key per request',
        ],
        'With an idempotency key the server recognises the repeated request and returns the first result instead of acting twice.',
      ],
      [
        'Hacer doble clic en "Pagar" crea pedidos duplicados. ¿Mejor solución en el servidor?',
        [
          'Un timeout más largo',
          'Reintentar en el cliente',
          'Ocultar el botón',
          'Una clave de idempotencia',
        ],
        'Con una clave de idempotencia el servidor reconoce la petición repetida y devuelve el primer resultado en vez de actuar dos veces.',
      ],
    ),
    item(
      'http.status.business-rule',
      3,
      'senior',
      null,
      'A',
      [
        'A valid request breaks a business rule (not enough stock). Which status fits?',
        [
          '422 Unprocessable Content',
          '500 Internal Server Error',
          '301 Moved Permanently',
          '204 No Content',
        ],
        'The request is well-formed but cannot be processed because of the data: a 4xx client-side status, not a server error.',
      ],
      [
        'Una petición válida incumple una regla de negocio (no hay stock). ¿Qué estado encaja?',
        [
          '422 Unprocessable Content',
          '500 Internal Server Error',
          '301 Moved Permanently',
          '204 No Content',
        ],
        'La petición está bien formada pero no puede procesarse por los datos: es un 4xx del cliente, no un error del servidor.',
      ],
    ),
  ],
  'band:senior_plus:4': [
    item(
      'ops.incident.rollback',
      4,
      'senior',
      null,
      'A',
      [
        'A deploy breaks checkout in production. What do you do first?',
        [
          'Roll back, then investigate',
          'Debug live in production',
          'Wait for more reports',
          'Hotfix without review',
        ],
        'Restoring service comes first; rolling back is fast and safe, and the cause can be studied afterwards.',
      ],
      [
        'Un despliegue rompe el checkout en producción. ¿Qué haces primero?',
        [
          'Revertir y luego investigar',
          'Depurar en vivo en producción',
          'Esperar más reportes',
          'Un hotfix sin revisión',
        ],
        'Primero se restaura el servicio; revertir es rápido y seguro, y la causa se estudia después.',
      ],
    ),
    item(
      'architecture.events.replay',
      4,
      'senior',
      null,
      'C',
      [
        'Three services must react to the same event, and you must replay events after a bug. Which fits?',
        [
          'Sync HTTP calls to each',
          'A cron polling the table',
          'A durable log + consumer groups',
          'Fire-and-forget Pub/Sub',
        ],
        'A durable log keeps events, and each service reads at its own pace with its own consumer group, so replays are possible.',
      ],
      [
        'Tres servicios deben reaccionar al mismo evento y debes reprocesar tras un bug. ¿Qué encaja?',
        [
          'HTTP síncrono a cada uno',
          'Un cron que consulta la tabla',
          'Un log durable con consumer groups',
          'Pub/Sub sin persistencia',
        ],
        'Un log durable conserva los eventos y cada servicio los lee a su ritmo con su consumer group, así se pueden reprocesar.',
      ],
    ),
    item(
      'resilience.circuit-breaker',
      4,
      'senior',
      null,
      'B',
      [
        'A flaky dependency makes requests pile up and time out. Which pattern limits the damage?',
        [
          'Unlimited retries',
          'Timeouts + a circuit breaker',
          'A bigger thread pool',
          'Logging every failure',
        ],
        'Short timeouts free resources and a circuit breaker stops calling the failing dependency until it recovers.',
      ],
      [
        'Una dependencia inestable hace que las peticiones se acumulen y expiren. ¿Qué patrón limita el daño?',
        [
          'Reintentos ilimitados',
          'Timeouts + circuit breaker',
          'Un thread pool más grande',
          'Registrar cada fallo',
        ],
        'Los timeouts cortos liberan recursos y el circuit breaker deja de llamar a la dependencia hasta que se recupere.',
      ],
    ),
    item(
      'databases.zero-downtime-migration',
      4,
      'senior',
      null,
      'D',
      [
        'You must rename a column used by the running app, with no downtime. Safest approach?',
        [
          'Rename it in one migration',
          'Stop traffic for an hour',
          'Edit rows by hand',
          'Expand, migrate, then contract',
        ],
        'Add the new column, write to both and backfill, switch reads, then remove the old one: every step is compatible.',
      ],
      [
        'Debes renombrar una columna que usa la app en marcha, sin downtime. ¿Enfoque más seguro?',
        [
          'Renombrarla en una migración',
          'Cortar el tráfico una hora',
          'Editar filas a mano',
          'Expandir, migrar y contraer',
        ],
        'Añades la columna nueva, escribes en ambas y rellenas, cambias las lecturas y luego quitas la vieja: cada paso es compatible.',
      ],
    ),
    item(
      'scaling.reads',
      4,
      'senior',
      null,
      'A',
      [
        'Reads overwhelm the primary database. What scales reads first?',
        [
          'Read replicas or a cache',
          'Stricter isolation levels',
          'An index on every column',
          'Sharding by user today',
        ],
        'Replicas and caches take read traffic off the primary with far less complexity than sharding.',
      ],
      [
        'Las lecturas saturan la base de datos principal. ¿Qué escala las lecturas primero?',
        [
          'Réplicas de lectura o caché',
          'Aislamiento más estricto',
          'Un índice en cada columna',
          'Particionar por usuario ya',
        ],
        'Las réplicas y la caché quitan tráfico de lectura a la principal con mucha menos complejidad que el sharding.',
      ],
    ),
    item(
      'teamwork.code-review',
      4,
      'senior',
      null,
      'C',
      [
        "A teammate's PR works but will be hard to maintain. Best response as a senior?",
        [
          'Rewrite it yourself silently',
          'Approve to avoid conflict',
          'Review with concrete proposals',
          'Reject without comments',
        ],
        'Specific, respectful suggestions improve the code and help the teammate grow; silence or rewrites do neither.',
      ],
      [
        'El PR de un compañero funciona pero será difícil de mantener. ¿Mejor respuesta como senior?',
        [
          'Reescribirlo sin decir nada',
          'Aprobarlo para evitar roces',
          'Revisar con propuestas concretas',
          'Rechazarlo sin comentarios',
        ],
        'Las sugerencias concretas y respetuosas mejoran el código y ayudan a crecer; el silencio o reescribirlo no logran ninguna de las dos cosas.',
      ],
    ),
    item(
      'jobs.idempotency',
      4,
      'senior',
      null,
      'B',
      [
        'A background job sometimes runs twice. How do you keep it safe?',
        ['Run it less often', 'Make the job idempotent', 'Add more workers', 'Log a warning'],
        'Delivery is usually at least once; an idempotent job produces the same result no matter how many times it runs.',
      ],
      [
        'Un job en segundo plano a veces se ejecuta dos veces. ¿Cómo lo haces seguro?',
        [
          'Ejecutarlo menos a menudo',
          'Hacer el job idempotente',
          'Añadir más workers',
          'Registrar un aviso',
        ],
        'La entrega suele ser "al menos una vez"; un job idempotente da el mismo resultado se ejecute las veces que se ejecute.',
      ],
    ),
    item(
      'observability.tail-latency',
      4,
      'senior',
      null,
      'D',
      [
        'After a release p99 latency doubled while p50 did not change. Where do you look first?',
        [
          'Average CPU usage',
          'The homepage HTML size',
          'Unit test coverage',
          'Traces of the slowest requests',
        ],
        'Tail latency hides in a subset of requests; traces show which calls or queries make those requests slow.',
      ],
      [
        'Tras un release la latencia p99 se duplicó y la p50 no cambió. ¿Dónde miras primero?',
        [
          'El uso medio de CPU',
          'El tamaño del HTML de inicio',
          'La cobertura de tests',
          'Las trazas más lentas',
        ],
        'La latencia de cola se esconde en un subconjunto de peticiones; las trazas muestran qué llamadas o consultas las ralentizan.',
      ],
    ),
    item(
      'architecture.modular-monolith',
      4,
      'senior',
      null,
      'A',
      [
        'A small new team starts a product. Which architecture is usually the best start?',
        [
          'A modular monolith',
          'Microservices from day one',
          'One service per developer',
          'Only serverless functions',
        ],
        'A modular monolith keeps deployment simple while module boundaries leave room to extract services later.',
      ],
      [
        'Un equipo pequeño y nuevo empieza un producto. ¿Qué arquitectura suele ser el mejor comienzo?',
        [
          'Un monolito modular',
          'Microservicios desde el día uno',
          'Un servicio por desarrollador',
          'Solo funciones serverless',
        ],
        'Un monolito modular mantiene el despliegue simple y sus límites entre módulos permiten extraer servicios más adelante.',
      ],
    ),
  ],
  'general:1': [
    item(
      'http.status.404',
      1,
      'junior',
      null,
      'B',
      [
        'What does the HTTP status 404 mean?',
        ['Unauthorized', 'Not Found', 'Server error', 'Redirect'],
        '404 means the server has nothing at that URL.',
      ],
      [
        '¿Qué significa el estado HTTP 404?',
        ['No autorizado', 'No encontrado', 'Error del servidor', 'Redirección'],
        '404 significa que el servidor no tiene nada en esa URL.',
      ],
    ),
    item(
      'git.branch',
      1,
      'junior',
      null,
      'A',
      [
        'Which Git command creates a new branch and switches to it?',
        ['git switch -c', 'git merge', 'git push -f', 'git stash'],
        'git switch -c (or git checkout -b) creates the branch and moves to it.',
      ],
      [
        '¿Qué comando de Git crea una rama nueva y cambia a ella?',
        ['git switch -c', 'git merge', 'git push -f', 'git stash'],
        'git switch -c (o git checkout -b) crea la rama y se mueve a ella.',
      ],
    ),
    item(
      'testing.unit',
      1,
      'junior',
      null,
      'D',
      [
        'What is a unit test?',
        [
          'The whole system end to end',
          'A page load measurement',
          'A code formatting check',
          'One small piece in isolation',
        ],
        'A unit test checks one small piece of code, isolated from the rest.',
      ],
      [
        '¿Qué es un test unitario?',
        [
          'Probar todo el sistema',
          'Medir la carga de una página',
          'Revisar el formato del código',
          'Probar una pieza aislada',
        ],
        'Un test unitario comprueba una pieza pequeña de código, aislada del resto.',
      ],
    ),
    item(
      'api.json',
      1,
      'junior',
      null,
      'C',
      [
        'Which data format is most common for REST API bodies?',
        ['CSV', 'INI', 'JSON', 'YAML'],
        'JSON is the de facto format for REST request and response bodies.',
      ],
      [
        '¿Qué formato de datos es el más común en los cuerpos de una API REST?',
        ['CSV', 'INI', 'JSON', 'YAML'],
        'JSON es el formato de facto para los cuerpos de peticiones y respuestas REST.',
      ],
    ),
  ],
  'general:2': [
    item(
      'security.secrets',
      2,
      'junior',
      null,
      'A',
      [
        'Where should a backend keep its API keys?',
        [
          'Env vars or a secret store',
          'Committed in the repo',
          'In the frontend bundle',
          'In a public wiki',
        ],
        'Secrets belong outside the code, injected at runtime from the environment or a secret manager.',
      ],
      [
        '¿Dónde debe guardar un backend sus claves de API?',
        [
          'Variables de entorno o un vault',
          'En el repositorio',
          'En el bundle del frontend',
          'En una wiki pública',
        ],
        'Los secretos van fuera del código y se inyectan en ejecución desde el entorno o un gestor de secretos.',
      ],
    ),
    item(
      'debugging.repro',
      2,
      'junior',
      null,
      'C',
      [
        "A user reports a bug you can't reproduce. What helps most first?",
        [
          'Rewriting the module',
          'Closing the ticket',
          'Logs and their exact steps',
          'Upgrading every dependency',
        ],
        'Logs and precise steps narrow down the conditions under which the bug happens.',
      ],
      [
        'Un usuario reporta un bug que no puedes reproducir. ¿Qué ayuda más primero?',
        [
          'Reescribir el módulo',
          'Cerrar el ticket',
          'Logs y sus pasos exactos',
          'Actualizar todas las dependencias',
        ],
        'Los logs y los pasos exactos acotan las condiciones en las que ocurre el bug.',
      ],
    ),
    item(
      'http.safe-methods',
      2,
      'junior',
      null,
      'B',
      [
        'Which HTTP method should only read data, so retrying it is harmless?',
        ['POST', 'GET', 'PATCH', 'CONNECT'],
        'GET is a safe method: it must not change server state, so repeating it is harmless.',
      ],
      [
        '¿Qué método HTTP solo debe leer datos, de modo que reintentarlo sea inocuo?',
        ['POST', 'GET', 'PATCH', 'CONNECT'],
        'GET es un método seguro: no debe cambiar el estado del servidor, así que repetirlo es inocuo.',
      ],
    ),
    item(
      'teamwork.review-goal',
      2,
      'junior',
      null,
      'D',
      [
        'What is the main goal of a code review?',
        [
          'Assigning blame',
          'Adding lines of code',
          'Slowing down releases',
          'Catching issues, sharing knowledge',
        ],
        'Reviews catch problems early and spread knowledge of the code across the team.',
      ],
      [
        '¿Cuál es el objetivo principal de una code review?',
        [
          'Buscar culpables',
          'Añadir líneas de código',
          'Frenar los releases',
          'Detectar fallos y compartir',
        ],
        'Las revisiones detectan problemas pronto y reparten el conocimiento del código en el equipo.',
      ],
    ),
    item(
      'security.passwords',
      2,
      'junior',
      null,
      'A',
      [
        "What's the safest way to store user passwords?",
        [
          'A slow salted hash (Argon2)',
          'Base64 encoding',
          'AES with a shared key',
          'Plain text, private table',
        ],
        'Slow, salted password hashes make stolen hashes expensive to crack; encoding or reversible encryption do not.',
      ],
      [
        '¿Cuál es la forma más segura de guardar contraseñas?',
        [
          'Un hash lento con sal (Argon2)',
          'Codificarlas en Base64',
          'AES con una clave común',
          'Texto plano en tabla privada',
        ],
        'Los hashes lentos y con sal encarecen romper hashes robados; codificar o cifrar de forma reversible no lo hace.',
      ],
    ),
    item(
      'ci.benefit',
      2,
      'junior',
      null,
      'B',
      [
        'CI runs the tests on every pull request. What is the main benefit?',
        [
          'Faster laptops',
          'Catching regressions early',
          'Fewer code reviews',
          'Smaller Docker images',
        ],
        'Running tests automatically before merging catches regressions before they reach users.',
      ],
      [
        'La CI ejecuta los tests en cada pull request. ¿Cuál es el beneficio principal?',
        [
          'Portátiles más rápidos',
          'Detectar regresiones pronto',
          'Menos code reviews',
          'Imágenes Docker más pequeñas',
        ],
        'Ejecutar los tests antes de mergear detecta regresiones antes de que lleguen a los usuarios.',
      ],
    ),
    // Deliberately invalid: the pipeline must reject "all of the above" options.
    item(
      'invalid.all-of-the-above',
      2,
      'junior',
      null,
      'D',
      [
        'Which of these is a version control system?',
        ['Git', 'Mercurial', 'Subversion', 'All of the above'],
        'All of them are version control systems.',
      ],
      [
        '¿Cuál de estos es un sistema de control de versiones?',
        ['Git', 'Mercurial', 'Subversion', 'Todas las anteriores'],
        'Todos son sistemas de control de versiones.',
      ],
    ),
  ],
  'general:3': [
    item(
      'performance.measure-first',
      3,
      'mid',
      null,
      'C',
      [
        'An endpoint is slow only for users with lots of data. First move?',
        [
          'Add a cache everywhere',
          'Rewrite it in another language',
          'Measure that code path',
          'Buy a bigger server',
        ],
        'Profiling the slow path shows where time goes before choosing a fix.',
      ],
      [
        'Un endpoint solo es lento para usuarios con muchos datos. ¿Primer paso?',
        [
          'Poner caché en todo',
          'Reescribirlo en otro lenguaje',
          'Medir ese camino del código',
          'Comprar un servidor mayor',
        ],
        'Perfilar el camino lento muestra dónde se va el tiempo antes de elegir una solución.',
      ],
    ),
    item(
      'databases.transactions',
      3,
      'mid',
      null,
      'A',
      [
        'When do you need a database transaction?',
        [
          'Writes must succeed together',
          'Any time you read data',
          'Only for big tables',
          'Never with an ORM',
        ],
        'A transaction makes several writes atomic: they all succeed or none do.',
      ],
      [
        '¿Cuándo necesitas una transacción de base de datos?',
        [
          'Varias escrituras van juntas',
          'Siempre que lees datos',
          'Solo en tablas grandes',
          'Nunca con un ORM',
        ],
        'Una transacción hace atómicas varias escrituras: o se aplican todas o ninguna.',
      ],
    ),
    item(
      'delivery.feature-flags',
      3,
      'mid',
      null,
      'D',
      [
        'Which practice helps most to release a risky feature safely?',
        [
          'A Friday-night deploy',
          'Skipping the tests',
          'One big release per quarter',
          'A flag with gradual rollout',
        ],
        'A feature flag lets you enable the feature for a small share of users and turn it off without a deploy.',
      ],
      [
        '¿Qué práctica ayuda más a lanzar una funcionalidad arriesgada con seguridad?',
        [
          'Desplegar el viernes noche',
          'Saltarse los tests',
          'Un gran release por trimestre',
          'Un flag con rollout gradual',
        ],
        'Un feature flag permite activarla para un porcentaje pequeño de usuarios y apagarla sin desplegar.',
      ],
    ),
    item(
      'observability.structured-logs',
      3,
      'mid',
      null,
      'B',
      [
        'Logs are so noisy that real errors get missed. What helps?',
        [
          'Logging everything twice',
          'Structured logs with levels',
          'Deleting old logs daily',
          'Printing to the console',
        ],
        'Structured logs with levels can be filtered and searched, so real errors stand out.',
      ],
      [
        'Los logs tienen tanto ruido que se pierden los errores reales. ¿Qué ayuda?',
        [
          'Registrar todo dos veces',
          'Logs estructurados y con niveles',
          'Borrar logs viejos cada día',
          'Imprimir en la consola',
        ],
        'Los logs estructurados y con niveles se pueden filtrar y buscar, así los errores reales destacan.',
      ],
    ),
  ],
  'general:4': [
    item(
      'scaling.launch',
      4,
      'senior',
      null,
      'A',
      [
        'Your service must handle 10× traffic tomorrow for a launch. What do you prioritize?',
        [
          'Load test and autoscaling',
          'A new framework',
          'Removing all logging',
          'Disabling the database',
        ],
        'A load test reveals the first bottleneck, and autoscaling absorbs the peak.',
      ],
      [
        'Tu servicio debe aguantar 10× tráfico mañana por un lanzamiento. ¿Qué priorizas?',
        [
          'Pruebas de carga y autoescalado',
          'Un framework nuevo',
          'Quitar todos los logs',
          'Desactivar la base de datos',
        ],
        'Una prueba de carga revela el primer cuello de botella y el autoescalado absorbe el pico.',
      ],
    ),
    item(
      'integration.rate-limits',
      4,
      'senior',
      null,
      'C',
      [
        'A third-party API has a strict rate limit. How do you design the calls?',
        [
          'Call it in a tight loop',
          'Use several API keys',
          'Queue calls, back off on 429',
          'Ignore the errors',
        ],
        'A queue smooths bursts and backing off on 429 responses respects the limit.',
      ],
      [
        'Una API externa tiene un rate limit estricto. ¿Cómo diseñas las llamadas?',
        [
          'Llamarla en un bucle',
          'Usar varias API keys',
          'Encolar y esperar ante 429',
          'Ignorar los errores',
        ],
        'Una cola suaviza los picos y esperar ante respuestas 429 respeta el límite.',
      ],
    ),
    item(
      'api.breaking-change',
      4,
      'senior',
      null,
      'B',
      [
        'Two teams depend on your API and you need a breaking change. Best approach?',
        [
          'Change it and announce later',
          'Version it, deprecate gradually',
          'Freeze the API forever',
          'Ask them to stop using it',
        ],
        'A new version lets consumers migrate on their own schedule while the old one is deprecated with a deadline.',
      ],
      [
        'Dos equipos dependen de tu API y necesitas un cambio incompatible. ¿Mejor enfoque?',
        [
          'Cambiarla y avisar después',
          'Versionarla y deprecar poco a poco',
          'Congelar la API para siempre',
          'Pedirles que dejen de usarla',
        ],
        'Una versión nueva permite migrar a su ritmo mientras la antigua se depreca con una fecha límite.',
      ],
    ),
  ],
};
