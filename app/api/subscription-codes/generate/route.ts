import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateNumericCode(length = 8) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

export async function POST(req: Request) {
  try {
    console.log('Axelito resolviendo - Generating new subscription code')
    
    const { subscriptionId } = await req.json();
    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId is required' }, { status: 400 });
    }

    // Generar código único
    let code: string;
    let isUnique = false;
    
    while (!isUnique) {
      code = generateNumericCode();
      console.log('Axelito resolviendo - Generated code:', code);
      
      const existing = await prisma.subscriptionCode.findUnique({
        where: { code }
      });
      
      if (!existing) {
        isUnique = true;
      }
    }

    // Crear el código en la base de datos
    const subscriptionCode = await prisma.subscriptionCode.create({
      data: {
        code: code!, // Aseguramos que code no es undefined
        subscriptionId: subscriptionId,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
        isUsed: false
      }
    });

    console.log('Axelito resolviendo - Created subscription code:', subscriptionCode);

    return NextResponse.json({ 
      success: true,
      code: subscriptionCode.code 
    });
    
  } catch (error) {
    console.error('Axelito resolviendo - Error generating code:', error);
    return NextResponse.json(
      { error: 'Error generating code' }, 
      { status: 500 }
    );
  }
} 