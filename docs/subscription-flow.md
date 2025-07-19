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
- **ACTIVE**: Suscripción vigente y usable
- **CANCELLED**: Cancelada por el usuario
- **EXPIRED**: Fecha de expiración pasada
- **PENDING**: Pago pendiente
- **FAILED**: Error en el pago

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
