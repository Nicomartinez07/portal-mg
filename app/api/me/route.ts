// app/api/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { 
      id: number;    
      username: string; 
      companyId: number;
      email: string;
      role: string;
    };
    return NextResponse.json({ 
      username: decoded.username,
      userId: decoded.id,    
      companyId: decoded.companyId,
      email: decoded.email,
      role: decoded.role
    });
  } catch (error) {
    console.error("❌ Error en /api/me:", error);
    return NextResponse.json({ message: "Token inválido o expirado" }, { status: 401 });
  }
}
