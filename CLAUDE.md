# CLAUDE.md — Contexto para agentes de IA

Este archivo describe el proyecto y las convenciones para cualquier agente de IA
que trabaje en este repositorio.

## Stack

- **Frontend:** React 19 + TypeScript + Vite 5 + Tailwind CSS 3 + React Router 6
- **Backend:** n8n (webhooks como REST API)
- **Base de datos:** Supabase (PostgreSQL con PostgREST)
- **Tests:** Vitest + @testing-library/react

## Arquitectura

```
[Browser] ──fetch──> [n8n Webhook] ──HTTP──> [Supabase REST API / RPC]
                                                     │
                                              [PostgreSQL tasks table]
```

La tabla `tasks` es auto-referencial (`parent_id UUID REFERENCES tasks(id)`),
lo que permite jerarquía de subtareas de profundidad ilimitada.

## Convenciones de código

- **Componentes:** PascalCase, en `src/components/` o `src/pages/`
- **Utilidades puras:** en `src/utils/`, sin efectos laterales, 100% testeables
- **API layer:** todo en `src/services/api.ts`, usando `fetch` nativo
- **Tipos:** en `src/types/task.ts`, sin duplicación
- **Tests:** en `src/__tests__/`, usando `describe/it/expect` de Vitest
- Sin `any` de TypeScript — usar tipos precisos
- Clases de Tailwind en JSX, sin módulos CSS separados

## Variables de entorno

| Variable              | Descripción                         |
|-----------------------|-------------------------------------|
| `VITE_N8N_BASE_URL`   | URL base de n8n, ej. https://n8n.../webhook |

## Comandos clave

```bash
npm run dev      # Arranca en localhost:5173
npm test         # Ejecuta 17 tests unitarios
npm run build    # Build de producción en dist/
```

## Archivos importantes

- `supabase/schema.sql` — Todo el DDL: tabla, índices, trigger, funciones RPC
- `n8n-flows/README.md` — Configuración nodo a nodo de los 5 flujos n8n
- `src/utils/task.utils.ts` — Lógica de negocio pura (árbol, stats, progreso)

## Notas para el agente

- Al crear/modificar componentes, mantener el estilo dark (bg-gray-950/900)
- Los colores de prioridad/estado están centralizados en PriorityBadge y StatusBadge
- No añadir librerías de formularios (React Hook Form, Formik…) — los formularios son simples y controlados manualmente
- El servicio `api.ts` lanza `Error` en respuestas no-OK — los componentes deben manejar el estado de error
