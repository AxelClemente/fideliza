'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface SubscriptionUpdate {
  subscriptionId: string;
  remainingVisits: number | null;
  placeName: string;
  restaurantName: string;
  validationDate: string;
}

interface UseSubscriptionUpdatesOptions {
  onValidation?: (update: SubscriptionUpdate) => void;
  subscriptionId?: string;
}

// Global connection to prevent multiple SSE connections
let globalEventSource: EventSource | null = null;
let globalCallbacks: Map<string, { callback: (update: SubscriptionUpdate) => void; subscriptionId?: string }> = new Map();

export function useSubscriptionUpdates(options?: UseSubscriptionUpdatesOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<SubscriptionUpdate | null>(null);
  const componentId = useRef(Math.random().toString(36).substr(2, 9));
  const optionsRef = useRef(options);
  
  // Actualizar la ref cuando cambien las opciones
  optionsRef.current = options;

  const connectGlobal = useCallback(() => {
    console.log('🔌 connectGlobal() function called for component:', componentId.current);
    
    // Si ya hay una conexión global, solo registrar callback
    if (globalEventSource && globalEventSource.readyState === EventSource.OPEN) {
      console.log('🔌 Using existing global SSE connection');
      setIsConnected(true);
      
      // Registrar callback para este componente
      if (optionsRef.current?.onValidation) {
        globalCallbacks.set(componentId.current, {
          callback: optionsRef.current.onValidation,
          subscriptionId: optionsRef.current.subscriptionId
        });
      }
      return;
    }

    console.log('🔌 Creating new global SSE connection');

    // Crear nueva conexión SSE con credenciales
    const eventSource = new EventSource('/api/sse/subscription-events', {
      withCredentials: true
    });
    globalEventSource = eventSource;

    eventSource.onopen = () => {
      console.log('SSE connection opened successfully');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      console.log('SSE message received:', event.data);
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connected') {
          console.log('SSE connected for user:', data.userId);
          return;
        }

        if (data.type === 'SUBSCRIPTION_VALIDATED') {
          console.log('Subscription validation event received:', data);
          
          const update: SubscriptionUpdate = {
            subscriptionId: data.data.subscriptionId,
            remainingVisits: data.data.remainingVisits,
            placeName: data.data.placeName,
            restaurantName: data.data.restaurantName,
            validationDate: data.data.validationDate
          };

          console.log('Processing validation for subscription:', update.subscriptionId);

          // Llamar callbacks que coincidan con el subscription ID
          globalCallbacks.forEach((callbackInfo, id) => {
            // Callback con filtro por subscription ID
            if (!callbackInfo.subscriptionId || callbackInfo.subscriptionId === update.subscriptionId) {
              console.log('Calling filtered callback for component:', id, 'subscription:', update.subscriptionId);
              callbackInfo.callback(update);
            } else {
              console.log('Skipping callback for component:', id, 'subscription mismatch');
            }
          });

          // Mostrar notificación toast
          const remainingText = update.remainingVisits === null 
            ? 'Visitas ilimitadas' 
            : `${update.remainingVisits} visitas restantes`;

          toast.success(
            `Validación exitosa en ${update.restaurantName} - ${update.placeName}. ${remainingText}`,
            {
              duration: 5000
            }
          );
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      setIsConnected(false);
      if (globalEventSource) {
        globalEventSource.close();
        globalEventSource = null;
      }

      // Reconectar después de 5 segundos
      setTimeout(() => {
        console.log('Attempting to reconnect to SSE...');
        connectGlobal();
      }, 5000);
    };
    
    // Registrar callback para este componente
    if (optionsRef.current?.onValidation) {
      globalCallbacks.set(componentId.current, {
        callback: optionsRef.current.onValidation,
        subscriptionId: optionsRef.current.subscriptionId
      });
    }
  }, []);

  useEffect(() => {
    console.log('🚀 useSubscriptionUpdates useEffect triggered for component:', componentId.current);
    connectGlobal();

    // Limpiar al desmontar
    return () => {
      console.log('🧹 useSubscriptionUpdates cleanup triggered for component:', componentId.current);
      // Solo remover este componente de los callbacks
      globalCallbacks.delete(componentId.current);
      
      // Si no quedan callbacks y la conexión existe, cerrarla
      if (globalCallbacks.size === 0 && globalEventSource) {
        console.log('🧹 No more callbacks, closing global SSE connection');
        globalEventSource.close();
        globalEventSource = null;
      }
    };
  }, [connectGlobal]);

  return {
    isConnected,
    lastUpdate
  };
}