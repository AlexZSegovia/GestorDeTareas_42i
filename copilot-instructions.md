# GitHub Copilot Instructions

## Proyecto

Aplicacion web para gestion de tareas de un equipo de desarrollo.

## Stack

- Frontend: React 19 + TypeScript + Vite + Tailwind CSS
- Routing: React Router
- Backend: n8n (webhooks como API)
- Persistencia: Supabase PostgreSQL
- Testing: Vitest + Testing Library

## Arquitectura

- El frontend consume 5 endpoints n8n separados.
- n8n usa nodos de Supabase para leer y escribir en la tabla tasks.
- La tabla tasks es autorreferencial mediante parent_id.
- La jerarquia de subtareas puede tener profundidad ilimitada.

## Convenciones de codigo

- Componentes React en src/components y src/pages.
- Utilidades puras en src/utils, sin efectos laterales.
- Tipos centralizados en src/types/task.ts.
- Cliente API centralizado en src/services/api.ts.
- Tests en src/__tests__.
- No usar any; preferir tipos precisos.
- Mantener estilos con clases Tailwind en JSX.
- No agregar librerias de formularios si no son necesarias.

## Comportamiento funcional esperado

- CRUD completo de tareas.
- Cada tarea debe soportar: title, description, status, priority, estimate y parent_id.
- Estados validos: todo, in_progress, done.
- Prioridades validas: low, medium, high, urgent.
- Estimate debe ser null o un numero >= 0.
- Las subtareas deben poder anidarse recursivamente.
- El detalle de una tarea debe permitir editar, eliminar, cambiar estado y gestionar subtareas.
- Si una tarea no tiene parent_id, el boton volver del detalle debe llevar al inicio.
- Si una subtarea fue abierta desde otra tarea, el boton volver debe regresar al detalle anterior.

## UI y UX

- Mantener el estilo dark actual basado en gray-950/900.
- No romper badges de estado y prioridad existentes.
- Conservar confirmaciones en acciones sensibles.
- Mantener el boton Home en la cabecera del detalle.
- Preservar responsive design en mobile y desktop.

## API y entorno

Variables esperadas en frontend:

- VITE_N8N_LIST_URL
- VITE_N8N_CREATE_URL
- VITE_N8N_DETAIL_URL
- VITE_N8N_UPDATE_URL
- VITE_N8N_DELETE_URL

Notas:

- Update y delete usan POST por compatibilidad con los workflows finales.
- api.ts debe seguir manejando respuestas vacias o no JSON de forma robusta.

## Calidad

- Preferir cambios pequenos y enfocados.
- Corregir problemas en la raiz cuando sea posible.
- No reformatear archivos completos sin necesidad.
- Ejecutar build o tests si el cambio lo requiere.