# Guía de Contribución

Gracias por tu interés en contribuir al proyecto Bolt Food Sales Handover Automation.

## Proceso de Desarrollo

### 1. Configuración del Entorno

Antes de comenzar, asegúrate de tener instalado:
- Node.js 22.x o superior
- pnpm 10.x
- Acceso a la base de datos MySQL/TiDB

Clona el repositorio y configura el entorno:

```bash
git clone https://github.com/leonardo-ccavalcante/bolt-food-handover.git
cd bolt-food-handover
pnpm install
pnpm db:push
```

### 2. Estructura de Ramas

- `main` - Rama principal de producción
- `develop` - Rama de desarrollo
- `feature/*` - Nuevas funcionalidades
- `bugfix/*` - Corrección de errores
- `hotfix/*` - Correcciones urgentes en producción

### 3. Flujo de Trabajo

1. Crea una rama desde `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nombre-funcionalidad
   ```

2. Realiza tus cambios siguiendo las convenciones del proyecto

3. Ejecuta los tests:
   ```bash
   pnpm test
   ```

4. Verifica el código:
   ```bash
   pnpm check
   ```

5. Commit con mensaje descriptivo:
   ```bash
   git commit -m "feat: descripción de la funcionalidad"
   ```

6. Push a tu rama:
   ```bash
   git push origin feature/nombre-funcionalidad
   ```

7. Crea un Pull Request hacia `develop`

## Convenciones de Código

### TypeScript

- Usa TypeScript para todo el código
- Define tipos explícitos para funciones y variables
- Evita el uso de `any`
- Usa interfaces para objetos complejos

### React

- Componentes funcionales con hooks
- Props tipadas con TypeScript
- Usa `useState` y `useEffect` apropiadamente
- Extrae lógica compleja a custom hooks

### Base de Datos

- Define esquemas en `drizzle/schema.ts`
- Usa funciones helper en `server/db.ts`
- Nunca ejecutes queries SQL directamente en routers
- Siempre usa transacciones para operaciones múltiples

### tRPC

- Define procedimientos en `server/routers.ts`
- Usa `publicProcedure` para endpoints públicos
- Usa `protectedProcedure` para endpoints autenticados
- Valida inputs con Zod

### Estilos

- Usa Tailwind CSS para estilos
- Sigue las convenciones de shadcn/ui
- Mantén consistencia con el diseño existente
- Usa variables CSS para colores del tema

## Convenciones de Commits

Seguimos la convención de Conventional Commits:

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de error
- `docs:` - Cambios en documentación
- `style:` - Cambios de formato (no afectan el código)
- `refactor:` - Refactorización de código
- `test:` - Añadir o modificar tests
- `chore:` - Tareas de mantenimiento

Ejemplos:
```
feat: add contract audit comparison feature
fix: resolve transcription upload timeout issue
docs: update API endpoints documentation
refactor: extract validation logic to separate module
```

## Testing

### Unit Tests

Escribe tests para:
- Funciones de base de datos
- Procedimientos tRPC
- Lógica de negocio compleja
- Validaciones

Ejemplo:
```typescript
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("transcriptions.uploadText", () => {
  it("should create transcription successfully", async () => {
    // Test implementation
  });
});
```

### Integration Tests

- Prueba flujos completos de usuario
- Verifica interacciones entre componentes
- Simula escenarios reales

## Revisión de Código

Todos los Pull Requests deben:

1. Pasar todos los tests
2. Mantener o mejorar la cobertura de tests
3. Seguir las convenciones de código
4. Incluir documentación si es necesario
5. Ser revisados por al menos un miembro del equipo

## Reportar Problemas

Al reportar un bug, incluye:

1. Descripción clara del problema
2. Pasos para reproducir
3. Comportamiento esperado vs actual
4. Screenshots si aplica
5. Información del entorno (navegador, OS, etc.)

## Solicitar Funcionalidades

Al solicitar una nueva funcionalidad:

1. Describe el caso de uso
2. Explica el valor que aporta
3. Proporciona ejemplos de implementación si es posible
4. Considera alternativas

## Código de Conducta

- Sé respetuoso con otros contribuidores
- Acepta críticas constructivas
- Enfócate en lo mejor para el proyecto
- Ayuda a mantener un ambiente colaborativo

## Preguntas

Si tienes preguntas sobre cómo contribuir, contacta al equipo de desarrollo.

---

¡Gracias por contribuir al proyecto!
