"use server";

import * as XLSX from "xlsx";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Definición de tipos de Reporte (similar al de Repuestos)
interface ReportError {
    fila: number;
    error: string;
}

export interface ImportResult {
    success: boolean;
    message: string;
    errors?: ReportError[];
    totalRows?: number;
    inserted?: number;
}

// Definimos el tipo de resultado que esperamos de cada fila del Excel
interface ImportRow {
    VIN: string;
    'N.Certificado': string;
    'Fecha. Importación': string; 
}

/**
 * Server Action para importar certificados desde un archivo XLSX.
 * Recibe FormData con el archivo.
 */
export async function importCertificates(formData: FormData): Promise<ImportResult> {
    const file = formData.get('excelFile') as File;

    if (!file || file.size === 0) {
        return { success: false, message: "No se encontró ningún archivo para procesar." };
    }

    const errors: ReportError[] = [];
    let importedCount = 0;
    let totalCount = 0;
    
    // Convertir File a Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
        // 1. Lectura del archivo
        const workbook = XLSX.read(buffer, { type: 'buffer' }); 
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data: ImportRow[] = XLSX.utils.sheet_to_json(worksheet);
        totalCount = data.length;

        if (totalCount === 0) {
             return { success: false, message: "El archivo está vacío o no tiene el formato de encabezados correcto." };
        }

        // 2. Procesamiento y Actualización en DB (Transacción)
        await prisma.$transaction(async (tx) => {
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                const rowNumber = i + 2; // Fila del Excel (asumiendo que la fila 1 es el encabezado)
                const { VIN, 'N.Certificado': certificateNumber, 'Fecha. Importación': importDateString } = row;

                if (!VIN || !certificateNumber || !importDateString) {
                    errors.push({ fila: rowNumber, error: "Faltan campos obligatorios (VIN, N.Certificado o Fecha. Importación)." });
                    continue;
                }
                
                // Formato de Fecha
                let importDate: Date | undefined;
                try {
                    importDate = new Date(importDateString);
                    if (isNaN(importDate.getTime())) {
                        throw new Error("Fecha inválida.");
                    }
                } catch (e) {
                    errors.push({ fila: rowNumber, error: `Formato de Fecha. Importación ('${importDateString}') inválido.` });
                    continue;
                }
                
                try {
                    // Actualizar el Vehicle por VIN
                    await tx.vehicle.update({
                        where: { vin: VIN },
                        data: {
                            certificateNumber: certificateNumber,
                            importDate: importDate,
                        },
                    });
                    importedCount++;
                } catch (e) {
                    // Error si el vehículo no existe
                    errors.push({ fila: rowNumber, error: `No se encontró el vehículo con VIN '${VIN}' para actualizar.` });
                }
            }
        });
        
        // 3. Retorno del resumen
        if (errors.length > 0) {
             return { success: true, message: `Importación parcial finalizada.`, inserted: importedCount, totalRows: totalCount, errors };
        }
        
        return { success: true, message: `Importación exitosa.`, inserted: importedCount, totalRows: totalCount };

    } catch (error) {
        console.error("Error fatal en importCertificates:", error);
        return { success: false, message: "Ocurrió un error fatal al procesar el archivo. Asegúrese del formato." };
    }
}
// En el mismo archivo (o en otro importado)

export interface DescargarEjemploResult {
    success: boolean;
    fileBase64?: string;
    filename?: string;
    message?: string;
}

export async function downloadCertificateExample(): Promise<DescargarEjemploResult> {
    try {
        const headers = ['VIN', 'N.Certificado', 'Fecha. Importación'];
        const dataForExample = [
            // Fila de ejemplo con datos
            { 'VIN': 'EJEMPLOVIN123', 'N.Certificado': 'CERT-001', 'Fecha. Importación': '2023-12-31' },
            // Fila vacía para estructura
            {},
        ];

        const worksheet = XLSX.utils.json_to_sheet(dataForExample, { header: headers });
        
        // Ajustar el ancho de las columnas (opcional)
        worksheet['!cols'] = [ {wch: 15}, {wch: 15}, {wch: 20} ]; 

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Certificados");
        
        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        return {
            success: true,
            fileBase64: buffer.toString('base64'),
            filename: 'ejemplo_certificados.xlsx',
        };

    } catch (error) {
        console.error("Error al generar plantilla de certificados:", error);
        return { success: false, message: "Error interno al generar el archivo de ejemplo." };
    }
}