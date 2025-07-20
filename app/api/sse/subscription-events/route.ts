import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';

// Almacenar las conexiones activas en memoria
const activeConnections = new Map<string, {
  controller: ReadableStreamDefaultController<Uint8Array>;
  encoder: TextEncoder;
  cleanup: () => void;
}>();

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  // Crear un stream para SSE
  const stream = new ReadableStream({
    start(controller) {
      // Heartbeat para mantener la conexión activa
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Función de limpieza
      const cleanup = () => {
        console.log('🧹 Cleaning up SSE connection for user:', userId);
        console.log('🧹 Reason: Connection closed or aborted');
        clearInterval(heartbeat);
        activeConnections.delete(userId);
        console.log('🧹 Remaining connections:', activeConnections.size);
        try {
          controller.close();
        } catch {
          // Controller ya cerrado
        }
      };

      // Almacenar la conexión
      activeConnections.set(userId, {
        controller,
        encoder,
        cleanup
      });
      
      console.log('🔌 User connected to SSE:', userId);
      console.log('🔌 Total active connections:', activeConnections.size);

      // Limpiar cuando se cierre la conexión
      request.signal.addEventListener('abort', cleanup);

      // Enviar evento inicial
      try {
        const message = `data: ${JSON.stringify({ type: 'connected', userId })}\n\n`;
        controller.enqueue(encoder.encode(message));
      } catch {
        cleanup();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control'
    },
  });
}

// Función para enviar eventos a usuarios específicos
export function sendEventToUser(userId: string, event: unknown) {
  console.log('📤 Attempting to send event to user:', userId);
  console.log('📤 Active connections count:', activeConnections.size);
  console.log('📤 Available user IDs:', Array.from(activeConnections.keys()));
  
  const connection = activeConnections.get(userId);
  if (connection) {
    try {
      console.log('📤 Connection found for user:', userId);
      const message = `data: ${JSON.stringify(event)}\n\n`;
      console.log('📤 Sending message:', message.substring(0, 100) + '...');
      connection.controller.enqueue(connection.encoder.encode(message));
      console.log('✅ Message sent successfully to user:', userId);
    } catch (error) {
      console.error('❌ Error sending event to user:', userId, error);
      connection.cleanup();
    }
  } else {
    console.log('⚠️ No active connection found for user:', userId);
  }
}

// Exportar las conexiones activas
export { activeConnections };