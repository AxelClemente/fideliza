// Tipos de eventos de suscripción
export interface SubscriptionValidatedEvent {
  type: 'SUBSCRIPTION_VALIDATED';
  data: {
    subscriptionId: string;
    userId: string;
    remainingVisits: number | null;
    placeName: string;
    restaurantName: string;
    validationDate: string;
    subscriptionCode: string;
  };
}

export interface SubscriptionExpiredEvent {
  type: 'SUBSCRIPTION_EXPIRED';
  data: {
    subscriptionId: string;
    userId: string;
    subscriptionName: string;
  };
}

export interface SubscriptionUpdatedEvent {
  type: 'SUBSCRIPTION_UPDATED';
  data: {
    subscriptionId: string;
    userId: string;
    remainingVisits: number | null;
    status: string;
  };
}

export type SubscriptionEvent = 
  | SubscriptionValidatedEvent 
  | SubscriptionExpiredEvent 
  | SubscriptionUpdatedEvent;

// Función para emitir eventos de suscripción
export async function emitSubscriptionEvent(event: SubscriptionEvent) {
  try {
    console.log('🚀 Starting to emit subscription event...');
    console.log('🚀 Event type:', event.type);
    console.log('🚀 Target user ID:', event.data.userId);
    
    // Importar dinámicamente para evitar problemas de dependencias circulares
    const { sendEventToUser } = await import('@/app/api/sse/subscription-events/route');
    
    const userId = event.data.userId;
    console.log('🚀 Calling sendEventToUser with userId:', userId);
    sendEventToUser(userId, event);
    
    console.log(`✅ Event emitted successfully to user ${userId}:`, event.type);
  } catch (error) {
    console.error('❌ Error emitting subscription event:', error);
  }
}