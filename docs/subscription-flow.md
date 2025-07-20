# Flujo de Suscripciones - Fideliza

## 📋 Resumen Ejecutivo

Fideliza es una plataforma de fidelización que conecta negocios locales con clientes a través de un sistema de suscripciones y ofertas especiales. El flujo de suscripciones es el núcleo de la aplicación, permitiendo a los clientes suscribirse a beneficios específicos de restaurantes y negocios.

## 🗄️ Modelos de Base de Datos

### Entidades Principales

#### 1. **User** (Usuario)
- **Roles**: `BUSINESS`, `CUSTOMER`, `STAFF`, `ADMIN`
- **Relaciones**: 
  - `ownerId` → Relación jerárquica (staff pertenece a un business owner)
  - `restaurants` → Restaurantes que posee (solo BUSINESS)
  - `userSubscriptions` → Suscripciones que ha comprado (solo CUSTOMER)
  - `validationsAsStaff` → Validaciones que ha realizado (STAFF)
  - `validationsAsSubscriber` → Validaciones de sus suscripciones (CUSTOMER)

#### 2. **Restaurant** (Restaurante)
- **Propietario**: `userId` (BUSINESS user)
- **Relaciones**:
  - `places` → Sucursales del restaurante
  - `images` → Imágenes del restaurante
  - `views` → Estadísticas de visualizaciones
  - `subscriptionValidations` → Historial de validaciones

#### 3. **Place** (Sucursal)
- **Pertenece a**: `restaurantId`
- **Relaciones**:
  - `offers` → Ofertas especiales de la sucursal
  - `subscriptions` → Suscripciones disponibles (muchos a muchos)
  - `userSubscriptions` → Suscripciones activas de clientes
  - `validations` → Validaciones realizadas en esta sucursal

#### 4. **Subscription** (Plan de Suscripción)
- **Campos clave**:
  - `visitsPerMonth` → Número de visitas permitidas
  - `unlimitedVisits` → Visitas ilimitadas (boolean)
  - `period` → `MONTHLY` o `ANNUAL`
  - `price` → Precio del plan
- **Relaciones**:
  - `places` → Sucursales donde está disponible (muchos a muchos)
  - `subscribers` → Usuarios suscritos

#### 5. **UserSubscription** (Suscripción Activa del Cliente)
- **Campos clave**:
  - `remainingVisits` → Visitas restantes
  - `status` → `ACTIVE`, `CANCELLED`, `EXPIRED`, `PENDING`, `FAILED`
  - `startDate`/`endDate` → Período de validez
  - `nextPayment` → Próximo pago
- **Relaciones**:
  - `user` → Cliente suscrito
  - `subscription` → Plan de suscripción
  - `place` → Sucursal específica
  - `payments` → Historial de pagos
  - `codes` → Códigos QR generados

#### 6. **SubscriptionCode** (Código QR)
- **Propósito**: Validación de suscripciones en sucursales
- **Campos clave**:
  - `code` → Código único de 8 dígitos
  - `isUsed` → Si ya fue utilizado
  - `expiresAt` → Expiración (15 minutos)
- **Relación**: `subscription` → UserSubscription

#### 7. **SubscriptionValidation** (Historial de Validaciones)
- **Propósito**: Auditoría de uso de suscripciones
- **Campos clave**:
  - `validationDate` → Fecha de validación
  - `remainingVisits` → Visitas restantes al momento
  - `subscriberName` → Nombre del cliente
  - `subscriptionName` → Nombre del plan
  - `placeName` → Nombre de la sucursal
- **Relaciones**:
  - `restaurant` → Restaurante donde se validó
  - `place` → Sucursal específica
  - `staff` → Empleado que validó
  - `subscriber` → Cliente que usó la suscripción

#### 8. **Payment** (Pagos)
- **Campos clave**:
  - `status` → `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`
  - `paymentMethod` → `CREDIT_CARD`, `DEBIT_CARD`, `PAYPAL`, `BANK_TRANSFER`
- **Relación**: `userSubscription` → Suscripción asociada

## 🔄 Flujo Completo de Suscripciones

### Fase 1: Creación de Suscripciones (Business)

#### 1.1 Gestión de Restaurantes y Sucursales
```
Business User → Crea Restaurant → Crea Places (sucursales)
```

#### 1.2 Creación de Planes de Suscripción
**API**: `POST /api/subscriptions`

**Proceso**:
1. Business user crea un plan de suscripción
2. Define: nombre, beneficios, precio, visitas por mes
3. Asigna a sucursales específicas
4. Sistema crea `Subscription` con relación a `Place[]`

**Validaciones**:
- Solo usuarios `BUSINESS` pueden crear suscripciones
- Verificación de permisos por modelo `SUBSCRIPTIONS`
- Validación de campos requeridos

### Fase 2: Compra de Suscripciones (Customer)

#### 2.1 Exploración de Suscripciones
**Flujo**:
1. Customer navega a restaurantes
2. Ve suscripciones disponibles en cada sucursal
3. Selecciona suscripción y sucursal específica

#### 2.2 Proceso de Compra
**API**: `POST /api/user-subscriptions`

**Proceso**:
1. Customer selecciona suscripción y sucursal
2. Sistema valida:
   - Usuario es `CUSTOMER`
   - No tiene suscripción activa del mismo tipo
   - Sucursal tiene la suscripción disponible
3. Crea `UserSubscription`:
   - `remainingVisits` = `visitsPerMonth` del plan
   - `status` = `ACTIVE`
   - `startDate` = hoy
   - `endDate` = hoy + 30 días
4. Crea `Payment` con `status` = `COMPLETED`

**Validaciones**:
- Un customer no puede tener múltiples suscripciones activas del mismo tipo
- Verificación de rol `CUSTOMER`
- Validación de datos requeridos

**📊 Tablas Afectadas en el Proceso de Compra:**

| Tabla | Operación | Propósito |
|-------|-----------|-----------|
| `subscriptions` | **SELECT** | Consulta el plan de suscripción para obtener detalles (precio, visitas, etc.) |
| `user_subscriptions` | **INSERT** | Crea el registro de la suscripción activa del cliente |
| `_PlaceToSubscription` | **SELECT** | Verifica que la suscripción esté disponible en la sucursal seleccionada |
| `payments` | **INSERT** | Crea el registro del pago asociado a la suscripción |

**🔍 Detalles Técnicos del Proceso:**

1. **Consulta de Plan** (`subscriptions`):
   ```sql
   SELECT * FROM subscriptions WHERE id = 'subscriptionId'
   ```
   - Obtiene: `name`, `price`, `visitsPerMonth`, `period`, etc.

2. **Verificación de Disponibilidad** (`_PlaceToSubscription`):
   ```sql
   SELECT * FROM _PlaceToSubscription 
   WHERE A = 'placeId' AND B = 'subscriptionId'
   ```
   - Confirma que la suscripción está disponible en esa sucursal

3. **Creación de Suscripción** (`user_subscriptions`):
   ```sql
   INSERT INTO user_subscriptions (
     userId, subscriptionId, placeId, status, 
     startDate, endDate, amount, remainingVisits, 
     paymentMethod, isActive
   ) VALUES (...)
   ```

4. **Registro de Pago** (`payments`):
   ```sql
   INSERT INTO payments (
     userSubscriptionId, amount, status, 
     paymentMethod, transactionId
   ) VALUES (...)
   ```

**✅ Confirmación de Datos Creados:**
- `UserSubscription`: ID único, estado ACTIVE, visitas iniciales
- `Payment`: ID único, estado COMPLETED, método de pago
- Relación establecida entre ambos registros

### Fase 3: Gestión de Suscripciones (Customer)

#### 3.1 Visualización de Suscripciones Activas
**API**: `GET /api/user-subscriptions`

**Proceso**:
1. Customer accede a "Mis Suscripciones"
2. Sistema obtiene todas las `UserSubscription` activas
3. Incluye información de:
   - Plan de suscripción
   - Sucursal específica
   - Visitas restantes
   - Próximo pago

#### 3.2 Generación de Códigos QR
**API**: `POST /api/subscription-codes/generate`

**Proceso**:
1. Customer genera código QR para una suscripción
2. Sistema:
   - Genera código único de 8 dígitos
   - Crea `SubscriptionCode` con expiración de 15 minutos
   - Asocia con `UserSubscription` específica

#### 3.3 Cancelación de Suscripciones
**API**: `PATCH /api/user-subscriptions`

**Condiciones de cancelación**:
- Suscripción inactiva (`!isActive`)
- Estado `CANCELLED`
- Fecha de expiración pasada (`endDate < hoy`)
- Sin visitas restantes (`remainingVisits === 0`)

**Proceso**:
1. Sistema verifica condiciones
2. Elimina `UserSubscription` completamente
3. Retorna confirmación

### Fase 4: Validación de Suscripciones (Business/Staff)

#### 4.1 Verificación de Código
**API**: `POST /api/validate-subscription/check`

**Proceso**:
1. Staff/Business escanea código QR
2. Sistema busca `SubscriptionCode`
3. Valida:
   - Código existe y no ha sido usado
   - No ha expirado (15 minutos)
   - Suscripción está activa
4. Retorna información del cliente y suscripción

**📊 Flujo Detallado de Verificación:**

**Fase 1: Generación del Código (Customer)**
```
Customer genera QR → API Response: {success: true, code: '79653158'}
```

**Fase 2: Creación del SubscriptionCode**
```sql
INSERT INTO SubscriptionCode (
  id, code, subscriptionId, isUsed, usedAt, 
  generatedAt, expiresAt
) VALUES (
  '564ee108-b33a-4b1a-bbca-5e837b2b4d87',
  '79653158',
  'ee950d44-c05d-41d0-9ec4-3f25bde2799a',
  false,
  NULL,
  '2025-07-20 10:11:17.882',
  '2025-07-20 10:26:17.881'
)
```

**Fase 3: Verificación por Business/Staff**
```
Business ingresa código → POST /api/validate-subscription/check → 200 OK
```

**📋 Datos del SubscriptionCode Creado:**

| Campo | Valor | Descripción |
|-------|-------|-------------|
| `id` | `564ee108-b33a-4b1a-bbca-5e837b2b4d87` | UUID único del código |
| `code` | `79653158` | Código de 8 dígitos para validación |
| `subscriptionId` | `ee950d44-c05d-41d0-9ec4-3f25bde2799a` | ID de la UserSubscription |
| `isUsed` | `false` | Estado inicial (no usado) |
| `usedAt` | `NULL` | Fecha de uso (vacía inicialmente) |
| `generatedAt` | `2025-07-20 10:11:17.882` | Fecha de generación |
| `expiresAt` | `2025-07-20 10:26:17.881` | Expiración (15 minutos después) |

**🔍 Información Mostrada al Business:**
- **Date & Time**: Jul 20, 2025, 12:11:30 PM
- **Customer**: customer
- **Subscription**: MAC VIP
- **Place**: Palma de Mallorca
- **Start Date**: 7/20/2025
- **End Date**: 8/19/2025

**✅ Validaciones Realizadas:**
1. Código existe en `SubscriptionCode`
2. `isUsed = false` (no ha sido usado)
3. `expiresAt > fecha_actual` (no ha expirado)
4. `UserSubscription.status = 'ACTIVE'` (suscripción activa)
5. `remainingVisits > 0` (tiene visitas disponibles)

#### 4.2 Validación de Suscripción
**API**: `POST /api/validate-subscription`

**Proceso**:
1. Staff confirma validación
2. Sistema verifica autorización:
   - Staff pertenece al business owner
   - Business es dueño del restaurante
3. Actualiza `UserSubscription`:
   - Decrementa `remainingVisits` (si no es ilimitada)
4. Marca `SubscriptionCode` como usado
5. Crea `SubscriptionValidation` para auditoría

**Validaciones**:
- Solo `BUSINESS` o `STAFF` autorizados
- Verificación de propiedad del restaurante
- Control de visitas restantes
- Prevención de uso múltiple del código

**📊 Flujo Detallado de Validación Final:**

**Fase 1: Confirmación por Business**
```
Business hace click en "Confirm Validation" → POST /api/validate-subscription/save-validation
```

**Fase 2: Datos de Validación Preparados**
```javascript
Saving validation data: {
  subscriberId: 'cmdbg8ekf0000elhp5widonzj',
  subscriptionId: 'ee950d44-c05d-41d0-9ec4-3f25bde2799a',
  subscriptionName: 'MAC VIP',
  remainingVisits: 1,  // ← Visitas restantes después de la validación
  placeId: '5a7ea4ea-4b5a-47c8-8220-d449425eb975',
  placeName: 'Palma de Mallorca',
  staffId: 'cmdbg8zhk0005elhpxdsqfh4j',
  status: 'ACTIVE',
  startDate: '2025-07-20T10:02:37.450Z',
  endDate: '2025-08-19T10:02:37.451Z'
}
```

**Fase 3: Creación del SubscriptionValidation**
```sql
INSERT INTO subscription_validations (
  id, validationDate, subscriberId, subscriberName,
  subscriptionId, subscriptionName, remainingVisits,
  placeId, placeName, restaurantId, staffId, ownerId,
  status, startDate, endDate
) VALUES (
  'c3d42fd7-d2a0-40b0-aab7-73c2bde5ae2f',
  '2025-07-20 10:15:40.962',
  'cmdbg8ekf0000elhp5widonzj',
  'customer',
  'ee950d44-c05d-41d0-9ec4-3f25bde2799a',
  'MAC VIP',
  1,  // ← Visitas restantes después de la validación
  '5a7ea4ea-4b5a-47c8-8220-d449425eb975',
  'Palma de Mallorca',
  '535b93c4-b571-4c3f-a78b-6aaae82f6e8e',
  'cmdbg8zhk0005elhpxdsqfh4j',
  'cmdbg8zhk0005elhpxdsqfh4j',
  'ACTIVE',
  '2025-07-20 10:02:37.450',
  '2025-08-19 10:02:37.451'
)
```

**Fase 4: Actualización de UserSubscription**
```sql
UPDATE user_subscriptions 
SET remainingVisits = remainingVisits - 1,
    updatedAt = NOW()
WHERE id = 'ee950d44-c05d-41d0-9ec4-3f25bde2799a'
```

**📋 Datos del SubscriptionValidation Creado:**

| Campo | Valor | Descripción |
|-------|-------|-------------|
| `id` | `c3d42fd7-d2a0-40b0-aab7-73c2bde5ae2f` | UUID único de la validación |
| `validationDate` | `2025-07-20 10:15:40.962` | Fecha y hora de la validación |
| `subscriberId` | `cmdbg8ekf0000elhp5widonzj` | ID del cliente |
| `subscriberName` | `customer` | Nombre del cliente |
| `subscriptionId` | `ee950d44-c05d-41d0-9ec4-3f25bde2799a` | ID de la UserSubscription |
| `subscriptionName` | `MAC VIP` | Nombre del plan de suscripción |
| `remainingVisits` | `1` | **Visitas restantes después de la validación** |
| `placeId` | `5a7ea4ea-4b5a-47c8-8220-d449425eb975` | ID de la sucursal |
| `placeName` | `Palma de Mallorca` | Nombre de la sucursal |
| `staffId` | `cmdbg8zhk0005elhpxdsqfh4j` | ID del staff que validó |
| `ownerId` | `cmdbg8zhk0005elhpxdsqfh4j` | ID del business owner |
| `status` | `ACTIVE` | Estado de la suscripción al momento |
| `startDate` | `2025-07-20 10:02:37.450` | Fecha de inicio de la suscripción |
| `endDate` | `2025-08-19 10:02:37.451` | Fecha de expiración de la suscripción |

**✅ Información del Staff que Validó:**
- **Name**: Axel Clemente
- **Email**: axelclementesosa@gmail.com
- **Role**: BUSINESS
- **Location**: Palma de Mallorca

**🔄 Cambios Realizados:**
1. **UserSubscription**: `remainingVisits` decrementado en 1
2. **SubscriptionValidation**: Registro completo de la validación
3. **SubscriptionCode**: Marcado como usado (`isUsed = true`)
4. **Auditoría**: Historial completo para business y customer

**⚠️ Lógica de Visitas:**
- **Antes**: `remainingVisits = 2`
- **Después**: `remainingVisits = 1`
- **Próxima validación**: Si llega a 0, status cambia a CANCELLED

#### 4.3 Historial de Validaciones
**API**: `GET /api/validate-subscription/save-validation`

**Proceso**:
1. Business/Staff consulta historial
2. Sistema filtra por:
   - `ownerId` (para business)
   - `subscriberId` (para customer)
3. Retorna validaciones ordenadas por fecha

### Fase 5: Transacciones y Auditoría

#### 5.1 Historial de Transacciones
**API**: `GET /api/user-transactions`

**Proceso**:
1. Sistema obtiene `UserSubscription` y `Payment`
2. Combina en una lista de transacciones
3. Ordena por fecha de creación
4. Incluye información de:
   - Código de transacción
   - Tipo de suscripción
   - Sucursal
   - Monto y estado

#### 5.2 Auditoría de Validaciones
**Modelo**: `SubscriptionValidation`

**Propósito**:
- Rastrear cada uso de suscripción
- Mantener historial de visitas
- Auditoría para business y customer
- Análisis de patrones de uso

## 🔐 Sistema de Permisos

### Jerarquía de Roles

1. **ADMIN**: Acceso completo a todo
2. **BUSINESS**: 
   - Gestiona sus restaurantes
   - Crea/edita suscripciones
   - Valida suscripciones
   - Ve estadísticas propias
3. **STAFF**: 
   - Valida suscripciones (con permisos)
   - Ve información limitada
4. **CUSTOMER**: 
   - Compra suscripciones
   - Gestiona sus suscripciones
   - Ve su historial

### Modelo de Permisos

```typescript
enum ModelType {
  ADMIN_USERS
  SUBSCRIBERS
  MAIN_INFO
  PLACES
  SPECIAL_OFFERS
  SUBSCRIPTIONS
  OFFERS_MAILINGS
}

enum PermissionType {
  VIEW_ONLY
  ADD_EDIT_DELETE
  ADD_EDIT
}
```

## 📊 Estados de Suscripción

### UserSubscription Status

| Estado | Descripción | Condiciones | Usabilidad |
|--------|-------------|-------------|------------|
| **ACTIVE** ✅ | Suscripción vigente y usable | - `isActive = true`<br>- `status = 'ACTIVE'`<br>- `remainingVisits > 0`<br>- `endDate > fecha_actual` | ✅ **Usable** |
| **CANCELLED** ❌ | Cancelada por el usuario | - Cancelación manual del cliente<br>- `isActive = false`<br>- `status = 'CANCELLED'` | ❌ **No usable** |
| **EXPIRED** ⏰ | Fecha de expiración pasada | - `endDate < fecha_actual`<br>- `status = 'EXPIRED'` | ❌ **No usable** |
| **PENDING** ⏳ | Pago pendiente | - Suscripción creada pero pago no confirmado<br>- `status = 'PENDING'` | ❌ **No usable** |
| **FAILED** ❌ | Error en el pago | - Pago falló o fue rechazado<br>- `status = 'FAILED'` | ❌ **No usable** |

**🔍 Lógica de Transición de Estados:**

1. **ACTIVE → CANCELLED**: Cancelación manual del usuario
2. **ACTIVE → EXPIRED**: Fecha de expiración alcanzada
3. **PENDING → ACTIVE**: Pago confirmado exitosamente
4. **PENDING → FAILED**: Pago falló
5. **ACTIVE → CANCELLED**: **Visitas agotadas** (automático)

**⚠️ Comportamiento Especial:**
Cuando `remainingVisits` llega a **0**, el sistema automáticamente cambia el status a **CANCELLED** para prevenir uso adicional.

### Payment Status
- **PENDING**: Pago en proceso
- **COMPLETED**: Pago exitoso
- **FAILED**: Pago fallido
- **REFUNDED**: Reembolsado

## 🔄 Ciclo de Vida de una Suscripción

1. **Creación**: Business crea plan de suscripción
2. **Compra**: Customer adquiere suscripción
3. **Activación**: Sistema activa suscripción con visitas iniciales
4. **Uso**: Customer usa suscripción en sucursales
5. **Validación**: Staff valida cada uso
6. **Renovación**: Sistema renueva automáticamente (si está activa)
7. **Cancelación**: Customer puede cancelar en cualquier momento
8. **Expiración**: Sistema marca como expirada al final del período

## 🛡️ Medidas de Seguridad

### Validación de Códigos
- Códigos únicos de 8 dígitos
- Expiración automática (15 minutos)
- Prevención de uso múltiple
- Verificación de autorización

### Control de Acceso
- Verificación de roles en cada operación
- Validación de propiedad de restaurantes
- Control de permisos por modelo
- Auditoría completa de acciones

### Integridad de Datos
- Transacciones de base de datos
- Validación de estados
- Prevención de condiciones de carrera
- Historial completo de cambios

## 📈 Métricas y Analytics

### Para Business
- Visitas por suscripción
- Frecuencia de uso
- Rentabilidad por plan
- Historial de validaciones

### Para Customer
- Visitas restantes
- Historial de uso
- Próximos pagos
- Beneficios utilizados

## 🔧 APIs Principales

| Endpoint | Método | Propósito | Roles |
|----------|--------|-----------|-------|
| `/api/subscriptions` | POST | Crear suscripción | BUSINESS |
| `/api/user-subscriptions` | POST | Comprar suscripción | CUSTOMER |
| `/api/user-subscriptions` | GET | Obtener suscripciones | CUSTOMER |
| `/api/validate-subscription/check` | POST | Verificar código | STAFF/BUSINESS |
| `/api/validate-subscription` | POST | Validar suscripción | STAFF/BUSINESS |
| `/api/subscription-codes/generate` | POST | Generar QR | CUSTOMER |
| `/api/user-transactions` | GET | Historial transacciones | CUSTOMER/BUSINESS |

## 🚀 Mejoras de Tiempo Real (Nueva Funcionalidad)

### Problema Identificado
El flujo actual funciona correctamente pero **falta sincronización en tiempo real** entre customer y business:

1. **Customer** genera QR → Código se crea
2. **Business** valida suscripción → Resta visita
3. **❌ Problema**: Customer no ve cambios en tiempo real

### Solución Propuesta: Notificaciones en Tiempo Real

#### Objetivos
- ✅ **Cierre automático del QR modal** cuando se valida
- ✅ **Actualización inmediata de visitas restantes**
- ✅ **Notificación de confirmación al customer**
- ✅ **Sincronización en tiempo real**

#### Plan de Implementación

##### 1. **WebSocket Server** (Nuevo)
```typescript
// app/api/websocket/route.ts
interface WebSocketMessage {
  type: 'SUBSCRIPTION_VALIDATED'
  data: {
    subscriptionId: string
    remainingVisits: number
    customerId: string
    placeName: string
    validationDate: string
  }
}
```

##### 2. **API de Notificaciones** (Nuevo)
```typescript
// app/api/notifications/route.ts
POST /api/notifications
{
  "type": "SUBSCRIPTION_VALIDATED",
  "subscriptionId": "uuid",
  "customerId": "uuid",
  "remainingVisits": 8,
  "placeName": "Dunkin Madrid"
}
```

##### 3. **Modificación del Flujo de Validación**
**API**: `POST /api/validate-subscription` (Modificar)

**Nuevo Proceso**:
1. Staff confirma validación
2. Sistema actualiza `UserSubscription`
3. **NUEVO**: Envía notificación WebSocket al customer
4. **NUEVO**: Marca código como usado
5. **NUEVO**: Crea `SubscriptionValidation`

##### 4. **Hook de Tiempo Real** (Nuevo)
```typescript
// hooks/useSubscriptionUpdates.ts
export function useSubscriptionUpdates(subscriptionId: string) {
  const [remainingVisits, setRemainingVisits] = useState<number>()
  const [isValidated, setIsValidated] = useState(false)
  
  useEffect(() => {
    // WebSocket connection
    // Listen for validation events
    // Update UI in real-time
  }, [subscriptionId])
}
```

##### 5. **Componente de Notificación** (Nuevo)
```typescript
// components/ui/subscription-notification.tsx
interface SubscriptionNotificationProps {
  type: 'VALIDATED' | 'EXPIRED' | 'CANCELLED'
  remainingVisits: number
  placeName: string
  onClose: () => void
}
```

#### Arquitectura de la Solución

##### **Backend Changes**
1. **WebSocket Server**: Maneja conexiones en tiempo real
2. **Notification Service**: Envía eventos a clientes específicos
3. **Modified Validation API**: Emite eventos después de validación
4. **Database Triggers**: Opcional para mayor confiabilidad

##### **Frontend Changes**
1. **Customer Dashboard**: Escucha eventos de validación
2. **QR Modal**: Se cierra automáticamente
3. **Subscription Cards**: Se actualizan en tiempo real
4. **Toast Notifications**: Confirman validación exitosa

#### Flujo Mejorado

```
Customer Genera QR → Business Valida → WebSocket Event → Customer Recibe → UI Updates
     ↓                    ↓                    ↓                    ↓
  QR Modal Open    →  Validation API   →  Notification   →  QR Modal Close
     ↓                    ↓                    ↓                    ↓
  Waiting State    →  Database Update  →  Real-time UI   →  Success Toast
```

#### Beneficios de la Implementación

1. **Experiencia de Usuario Mejorada**:
   - Feedback inmediato al customer
   - No necesidad de refrescar página
   - Confirmación visual de validación

2. **Reducción de Errores**:
   - Sincronización automática
   - Prevención de estados inconsistentes
   - Validación en tiempo real

3. **Escalabilidad**:
   - Arquitectura preparada para múltiples usuarios
   - Sistema de eventos extensible
   - Fácil integración con nuevas funcionalidades

#### Consideraciones Técnicas

1. **WebSocket Management**:
   - Reconexión automática
   - Manejo de desconexiones
   - Limpieza de conexiones

2. **Performance**:
   - Eventos específicos por usuario
   - Debouncing de actualizaciones
   - Optimización de re-renders

3. **Seguridad**:
   - Autenticación de WebSocket
   - Validación de eventos
   - Rate limiting

#### Implementación Gradual

**Fase 1**: WebSocket básico + notificaciones
**Fase 2**: UI updates en tiempo real
**Fase 3**: Notificaciones avanzadas + analytics
**Fase 4**: Optimizaciones de performance

Este flujo de suscripciones proporciona una base sólida para la fidelización de clientes, con controles de seguridad robustos y auditoría completa de todas las operaciones, ahora con capacidades de tiempo real para una experiencia de usuario superior.
