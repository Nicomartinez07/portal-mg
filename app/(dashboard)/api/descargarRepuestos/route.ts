// app/api/descargar-repuestos/route.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import { NextResponse } from 'next/server';

const FILENAME = 'repuestosEximar.xlsx';

export async function GET() {
    try {
        const publicDir = path.join(process.cwd(), 'public');
        const filePath = path.join(publicDir, 'archivos', FILENAME);

        // 1. Verificar si el archivo existe
        await fs.access(filePath); 

        // 2. Leer el archivo
        const fileBuffer = await fs.readFile(filePath);

        // Convertir Buffer a Uint8Array para que sea compatible con BodyInit
        const uint8Array = new Uint8Array(fileBuffer);

        // 3. Devolver el archivo como una respuesta (Response)
        return new NextResponse(uint8Array, {
            status: 200,
            headers: {
                // Tipo de archivo correcto para Excel XLSX
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                // Forzar la descarga con el nombre deseado
                'Content-Disposition': `attachment; filename="${FILENAME}"`,
                'Content-Length': uint8Array.length.toString(),
            },
        });

    } catch (error) {
        // Si el archivo no existe o hay error de lectura/permiso
        console.error(`Error al servir el archivo ${FILENAME}:`, error);
        return NextResponse.json({ 
            error: `El archivo ${FILENAME} no está disponible o no existe.`,
            details: (error as Error).message
        }, { status: 404 });
    }
}