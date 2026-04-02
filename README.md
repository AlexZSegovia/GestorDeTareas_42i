# Sistema de Tareas

Aplicación web para gestionar tareas de un equipo de desarrollo con jerarquía de subtareas, estimaciones de esfuerzo y seguimiento de progreso.

## 1) Resumen de la solución

- Frontend: React + TypeScript + Vite + Tailwind.
- Backend: 5 workflows n8n (1 por operación de negocio).
- Persistencia: Supabase (PostgreSQL).
- Testing: Vitest sobre lógica de negocio pura.

Arquitectura:

[Browser] -> [n8n Webhooks] -> [Supabase nodes] -> [PostgreSQL tasks]

## 2) Cumplimiento del enunciado

### Gestión de tareas

- Crear, ver, actualizar y eliminar tareas: implementado.
- Campos mínimos por tarea: título, descripción, estado, prioridad, estimación opcional, metadatos de creación/actualización.
- Ciclo de vida de trabajo: todo, in_progress, done.
- Indicador de urgencia: low, medium, high, urgent.
- Jerarquía de subtareas multinivel: implementada con parent_id autorreferencial.

### Estimaciones

- Estimación opcional no negativa: implementado en frontend, n8n y base de datos.
- Métricas para no iniciado, en curso y total estimado: implementadas.
- Cálculo considerando jerarquía completa: implementado en utilidades y endpoints de listado/detalle.

### Vistas

- Vista principal con listado y acceso al detalle: implementada.
- Vista detalle con gestión de subtareas y operaciones completas: implementada.

### Aspectos técnicos

- API CRUD para tareas: implementada vía webhooks n8n.
- Pruebas unitarias de lógica de negocio: implementadas (17 tests).
- README con ejecución y pruebas: este documento.

### Uso de IA

- Se incluye archivo de contexto de agente: CLAUDE.md.

## 3) Funcionalidades implementadas

- CRUD de tareas y subtareas.
- Árbol recursivo de subtareas sin límite de profundidad.
- Filtros por estado, prioridad y texto.
- Ordenamiento configurable.
- Panel de estadísticas globales.
- Barra de progreso por rama de tarea.
- Confirmaciones para acciones sensibles (cambiar estado, eliminar, etc.).
- Navegación de detalle mejorada:
- Volver al elemento anterior en cadena de subtareas.
- Si la tarea es raíz, volver va directo al inicio.
- Botón Home en cabecera del detalle para ir al inicio en un clic.
- Diseño responsive orientado a mobile y desktop.

## 4) Stack real del proyecto

- React 19
- TypeScript 5
- React Router DOM 7
- Vite 8
- Tailwind CSS 3
- Vitest + Testing Library
- n8n
- Supabase PostgreSQL

## 5) Estructura del repositorio

- src/components: componentes UI reutilizables.
- src/pages: vistas principales TaskListPage y TaskDetailPage.
- src/services/api.ts: cliente HTTP con manejo robusto de respuestas vacías/no JSON.
- src/utils/task.utils.ts: lógica pura de árbol, métricas y progreso.
- src/types/task.ts: modelos y contratos TypeScript.
- src/__tests__/task.utils.test.ts: tests unitarios de lógica.
- supabase/schema.sql: tabla, constraints, índices, trigger y funciones auxiliares.
- n8n-flows: exportables JSON de los 5 workflows.
- CLAUDE.md: configuración/contexto de agente IA.

## 6) API (n8n) usada por el frontend

La app está configurada para trabajar con 5 URLs separadas (1 flujo por operación):

- GET /webhook/tasks -> listar tareas raíz + estadísticas.
- GET /webhook/tasks/:id -> detalle de tarea con árbol de subtareas.
- POST /webhook/createtasks -> crear tarea/subtarea.
- POST /webhook/tasks/:id/update -> actualizar tarea.
- POST /webhook/deletetasks/:id/delete -> eliminar tarea (cascada por FK).

Nota: update y delete se exponen como POST por compatibilidad de los workflows actuales.

## 7) Configuración de entorno

Requisitos:

- Node.js 18+
- npm 9+
- Instancia de n8n
- Proyecto en Supabase

### 7.1 Supabase

1. Crear proyecto en Supabase.
2. Ejecutar supabase/schema.sql en SQL Editor.
3. Crear credencial de Supabase en n8n.

### 7.2 n8n

1. Importar los 5 JSON de la carpeta n8n-flows.
2. Asignar credencial Supabase account en cada nodo Supabase.
3. Activar workflows.
4. Ver detalle en n8n-flows/README.md.

### 7.3 Frontend

1. Instalar dependencias:

  npm install

2. Crear archivo .env a partir de .env.example y ajustar URLs:

  VITE_N8N_LIST_URL=...
  VITE_N8N_CREATE_URL=...
  VITE_N8N_DETAIL_URL=...
  VITE_N8N_UPDATE_URL=...
  VITE_N8N_DELETE_URL=...

3. Ejecutar en desarrollo:

  npm run dev

Aplicación disponible en http://localhost:5173

## 8) Scripts

- npm run dev: servidor de desarrollo.
- npm run build: compilación de producción.
- npm run preview: servir build local.
- npm test: ejecutar tests.
- npm run test:watch: tests en modo watch.

## 9) Pruebas

Cobertura actual:

- 17 tests unitarios en src/__tests__/task.utils.test.ts.
- Funciones validadas: buildTaskTree, flattenTree, computeStats, computeProgress, formatDate.

Ejecución:

npm test

## 10) Notas de calidad y decisiones

- API client con parseo defensivo para evitar fallos por body vacío en webhooks.
- Confirmaciones de usuario en operaciones críticas para evitar acciones accidentales.
- Lógica de negocio aislada y testeable en utilidades puras.

## 11) Deseables del enunciado

- Diseño responsive: implementado.
- Filtrado y ordenación: implementado.
- Paginación: no implementada (dataset esperado pequeño para esta prueba).
- Contenerización Docker: no implementada en esta iteración.
