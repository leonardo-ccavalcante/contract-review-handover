# Bolt Food Sales Handover Automation

Sistema de auditoría y validación de contratos de ventas con IA para automatizar el proceso de handover de ventas de Bolt Food a Account Managers.

## 📋 Descripción

Esta plataforma automatiza el proceso de transferencia de comerciantes desde el equipo de ventas a los Account Managers, garantizando transparencia y cumplimiento entre promesas verbales y contratos firmados mediante el uso de inteligencia artificial.

## ✨ Funcionalidades Principales

### 1. Sistema de Carga y Almacenamiento
- **Transcripciones de llamadas**: Carga de texto de llamadas de ventas con metadata (fecha, vendedor, comerciante)
- **Audio a texto**: Conversión automática de archivos de audio a transcripciones usando Whisper API
- **Contratos PDF**: Almacenamiento seguro de contratos firmados en S3 para auditoría histórica

### 2. Motor de Extracción con IA
- Procesamiento de transcripciones con LLM (GPT-4/Claude)
- Extracción estructurada de datos de contratos:
  - Términos comerciales (comisión, tipo de campaña, duración)
  - Contexto de negocio (ingresos actuales, competidores, objetivos)
  - Perfil del propietario (rasgos de personalidad, preocupaciones principales)
  - Inteligencia de mercado (tipo de cocina, sensibilidad al precio)
- Puntuación de confianza para cada campo extraído

### 3. Sistema de Validación Pre-Contrato (Hard Gate)
- Validación de campos obligatorios
- Verificación de umbrales de confianza de IA
- Reglas de negocio configurables
- Árbol de decisiones para routing automático
- Workflow de aprobación por Sales Manager

### 4. Auditoría Automatizada de Contratos
- Comparación entre promesas verbales y contratos PDF firmados
- Detección de discrepancias usando IA
- Clasificación de severidad (crítica, alta, media, baja)
- Generación de reportes de auditoría

### 5. Gestión de Perfiles de Comerciantes
- Almacenamiento de información completa del comerciante
- Control de versiones y historial de cambios
- Tracking de estado de validación
- Asignación a Account Managers

### 6. Dashboard para Account Managers
- Vista de comerciantes asignados
- Estado de validación y alertas
- Historial de interacciones
- Métricas de rendimiento

### 7. Sistema de Notificaciones
- Notificaciones automáticas al owner sobre nuevos handovers
- Alertas de discrepancias detectadas
- Notificaciones de cambios de estado

### 8. Panel de Administración
- Configuración de reglas de validación
- Gestión de flujo de trabajo de handover
- Administración de usuarios y permisos
- Visualización de métricas del sistema

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express 4 + tRPC 11
- **Base de Datos**: MySQL/TiDB con Drizzle ORM
- **Almacenamiento**: AWS S3
- **IA**: OpenAI GPT-4 / Anthropic Claude (via Manus LLM API)
- **Transcripción**: Whisper API
- **Autenticación**: Manus OAuth

### Estructura de Base de Datos

#### Tablas Principales

1. **users** - Usuarios del sistema con roles
   - Roles: admin, user, account_manager, sales_ops, sales_manager

2. **call_transcriptions** - Transcripciones de llamadas de ventas
   - Almacena texto, metadata y archivos de audio

3. **ai_extractions** - Datos extraídos por IA
   - Términos de contrato, contexto de negocio, perfil del propietario

4. **merchant_profiles** - Perfiles de comerciantes
   - Información completa con control de versiones

5. **contracts** - Contratos PDF firmados
   - Almacenamiento de contratos con metadata

6. **pre_contract_validations** - Validaciones pre-contrato
   - Resultados de validación Hard Gate

7. **contract_audits** - Auditorías de contratos
   - Comparación entre promesas y contratos firmados

8. **audit_discrepancies** - Discrepancias detectadas
   - Detalles de inconsistencias con severidad

9. **handover_assignments** - Asignaciones a Account Managers
   - Tracking de transferencias

10. **exception_logs** - Logs de excepciones
    - Registro de errores y excepciones del sistema

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 22.x o superior
- pnpm 10.x
- Base de datos MySQL/TiDB
- Cuenta de AWS S3 (configurada automáticamente en Manus)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/leonardo-ccavalcante/bolt-food-handover.git
cd bolt-food-handover

# Instalar dependencias
pnpm install

# Configurar base de datos
pnpm db:push

# Iniciar servidor de desarrollo
pnpm dev
```

### Variables de Entorno

Las siguientes variables de entorno son inyectadas automáticamente por la plataforma Manus:

- `DATABASE_URL` - Conexión a base de datos
- `JWT_SECRET` - Secreto para sesiones
- `BUILT_IN_FORGE_API_KEY` - API key para servicios de IA
- `BUILT_IN_FORGE_API_URL` - URL de servicios de IA
- `OAUTH_SERVER_URL` - URL de autenticación OAuth
- `VITE_APP_ID` - ID de aplicación

## 📁 Estructura del Proyecto

```
bolt-food-handover/
├── client/                    # Frontend React
│   ├── public/               # Archivos estáticos
│   └── src/
│       ├── components/       # Componentes reutilizables
│       ├── pages/           # Páginas de la aplicación
│       ├── lib/             # Utilidades y configuración
│       └── App.tsx          # Configuración de rutas
├── server/                   # Backend Express + tRPC
│   ├── _core/               # Infraestructura del servidor
│   ├── db.ts                # Funciones de base de datos
│   └── routers.ts           # Endpoints tRPC
├── drizzle/                 # Esquema de base de datos
│   └── schema.ts            # Definición de tablas
├── shared/                  # Código compartido
└── storage/                 # Helpers de S3
```

## 🔌 API Endpoints (tRPC)

### Transcripciones
- `transcriptions.uploadText` - Cargar transcripción de texto
- `transcriptions.uploadAudio` - Cargar archivo de audio
- `transcriptions.list` - Listar transcripciones
- `transcriptions.getById` - Obtener transcripción por ID

### Extracción con IA
- `extractions.extract` - Extraer datos de transcripción
- `extractions.getByCallId` - Obtener extracción por call ID

### Contratos
- `contracts.upload` - Cargar contrato PDF
- `contracts.list` - Listar contratos
- `contracts.getById` - Obtener contrato por ID

### Comerciantes
- `merchants.create` - Crear perfil de comerciante
- `merchants.update` - Actualizar perfil
- `merchants.list` - Listar comerciantes
- `merchants.getById` - Obtener comerciante por ID
- `merchants.getVersionHistory` - Historial de versiones

### Validaciones
- `validations.validate` - Ejecutar validación pre-contrato
- `validations.list` - Listar validaciones
- `validations.getById` - Obtener validación por ID

### Auditorías
- `audits.audit` - Ejecutar auditoría de contrato
- `audits.list` - Listar auditorías
- `audits.getById` - Obtener auditoría por ID
- `audits.getDiscrepancies` - Obtener discrepancias

### Handovers
- `handovers.assign` - Asignar comerciante a Account Manager
- `handovers.list` - Listar asignaciones
- `handovers.updateStatus` - Actualizar estado

## 🧪 Testing

```bash
# Ejecutar tests
pnpm test

# Ejecutar tests en modo watch
pnpm test --watch
```

## 📊 Flujo de Trabajo

1. **Carga de Transcripción**
   - Sales Manager carga transcripción o audio de llamada
   - Sistema almacena en base de datos y S3

2. **Extracción con IA**
   - Motor de IA procesa transcripción
   - Extrae datos estructurados con puntuación de confianza
   - Almacena resultados en `ai_extractions`

3. **Validación Pre-Contrato (Hard Gate)**
   - Sistema valida campos obligatorios
   - Verifica umbrales de confianza
   - Aplica reglas de negocio configurables
   - Determina si requiere aprobación manual

4. **Creación de Perfil de Comerciante**
   - Sistema crea perfil con datos extraídos
   - Almacena en `merchant_profiles` con versión inicial

5. **Carga de Contrato Firmado**
   - Sales Manager carga PDF del contrato firmado
   - Sistema almacena en S3 y registra en `contracts`

6. **Auditoría Automática**
   - Sistema compara promesas verbales vs contrato firmado
   - Detecta discrepancias usando IA
   - Clasifica severidad y genera reporte

7. **Handover a Account Manager**
   - Sistema asigna comerciante a Account Manager
   - Envía notificación al owner
   - Account Manager recibe acceso al perfil completo

## 🔐 Seguridad

- Autenticación OAuth con Manus
- Control de acceso basado en roles (RBAC)
- Almacenamiento seguro en S3
- Sesiones firmadas con JWT
- Validación de entrada en todos los endpoints

## 🎨 Interfaz de Usuario

- Diseño profesional para usuarios empresariales
- Interfaz responsiva con Tailwind CSS
- Componentes de shadcn/ui
- Dashboard con navegación lateral
- Formularios interactivos con validación

## 📝 Roles y Permisos

- **Admin**: Acceso completo al sistema
- **Sales Manager**: Carga de transcripciones, audio y contratos
- **Sales Ops**: Configuración de reglas de validación
- **Account Manager**: Visualización de comerciantes asignados
- **User**: Acceso básico de lectura

## 🔄 Estado del Proyecto

### ✅ Completado
- Base de datos completa con 10 tablas
- Sistema de autenticación con roles
- Integración con S3 para almacenamiento
- Motor de IA para extracción de datos
- Transcripción automática de audio
- API tRPC completa
- Interfaz de usuario base
- Formulario de carga de transcripciones

### 🔄 En Desarrollo
- Páginas de visualización (listas y detalles)
- Sistema de validación Hard Gate completo
- Auditor de contratos con OCR
- Dashboard de Account Managers
- Panel de administración
- Sistema de notificaciones en tiempo real

## 🤝 Contribución

Este es un proyecto privado. Para contribuir, contacta al administrador del repositorio.

## 📄 Licencia

MIT License

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para Bolt Food**
