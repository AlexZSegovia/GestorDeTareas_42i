# Flujos n8n - Sistema de Tareas

Este directorio contiene la versión final de backend para la prueba técnica: 5 workflows separados, uno por operación principal del frontend.

## 1) Archivos incluidos

- 01-tasks-list.json
- 02-task-detail.json
- 03-task-create.json
- 04-task-update.json
- 05-task-delete.json

## 2) Contrato de endpoints

Los workflows exportados exponen estos endpoints:

- GET /webhook/tasks
- GET /webhook/tasks/:id
- POST /webhook/tasks
- POST /webhook/tasks/:id/update
- POST /webhook/tasks/:id/delete

Nota importante:

- update y delete se publicaron como POST para compatibilidad con el flujo final del frontend.
- Si decides usar rutas distintas (por ejemplo createtasks o deletetasks), actualiza .env en el frontend.

## 3) Importación en n8n

1. Abre n8n.
2. Importa cada archivo JSON como workflow nuevo.
3. Verifica nodos Webhook y Respond to Webhook.
4. Activa los 5 workflows.

## 4) Configuración de credenciales

Cada workflow usa nodos Supabase con credencial llamada Supabase account.

Pasos:

1. Crea credencial Supabase API en n8n.
2. Asóciala a todos los nodos Supabase de los 5 workflows.
3. Valida conectividad ejecutando una prueba manual de cada webhook.

## 5) CORS

Los workflows incluyen headers CORS en Respond:

- Access-Control-Allow-Origin: *
- Access-Control-Allow-Methods: GET,POST,OPTIONS
- Access-Control-Allow-Headers: Content-Type,Authorization

Si tu frontend y n8n están en dominios distintos, mantén estos headers o adáptalos según tu política de seguridad.

## 6) Relación con Supabase

Modelo esperado:

- Tabla tasks con parent_id autorreferencial.
- ON DELETE CASCADE para borrar ramas de subtareas.
- Restricciones de estado, prioridad y estimación no negativa.

El SQL está en supabase/schema.sql.

## 7) Variables en frontend

El cliente React consume 5 URLs configurables:

- VITE_N8N_LIST_URL
- VITE_N8N_CREATE_URL
- VITE_N8N_DETAIL_URL
- VITE_N8N_UPDATE_URL
- VITE_N8N_DELETE_URL

Referencia de ejemplo en .env.example.
