'use server';

import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma'; 
import * as fs from 'fs/promises'; 
import * as path from 'path';

// === TIPOS DE DATOS ===

// Tipo de error para el reporte
interface ReportError {
    fila: number;
    error: string;
}

// Tipo de respuesta para la UI
interface ImportResult {
    success: boolean;
    message: string;
    errors?: ReportError[];
    totalRows?: number;
    inserted?: number;
    updated?: number; // Reporte de actualizados
}

// Interfaz para los datos que se procesan desde el Excel
interface PartData {
    code: string;
    description: string;
    model: string;
    stock: number;
    salePrice: number;
    companyId: number;
    contactId: number;
    loadDate: Date;
}

// === SERVER ACTION PRINCIPAL ===

export async function importarStockRepuestos(formData: FormData): Promise<ImportResult> {
    const file = formData.get('excelFile') as File | null;
    const companyIdStr = formData.get('companyId') as string;
    const isEximarStr = formData.get('isEximar') as string; 
    
    const companyId = parseInt(companyIdStr, 10);
    const isEximar = isEximarStr === 'true'; 

    console.log("--- Diagnóstico de Importación ---");
    console.log(`Company ID recibida: ${companyId}`);
    console.log(`isEximar string recibida: ${isEximarStr}`);
    console.log(`isEximar booleano calculado: ${isEximar}`);
    console.log("----------------------------------");

    // 1. Validaciones Iniciales
    if (!file || file.size === 0) {
        return { success: false, message: 'No se ha subido ningún archivo válido.', totalRows: 0 };
    }
    if (!companyId || isNaN(companyId)) {
        return { success: false, message: 'La ID de la empresa es requerida.', totalRows: 0 };
    }

    // 2. Obtener el PartContact ID por defecto
    let defaultContactId: number;
    try {
        const contact = await prisma.partContact.findFirst({
            select: { id: true },
            orderBy: { id: 'asc' }
        });

        if (!contact) {
            return { success: false, message: 'Error de configuración: No se encontró ningún PartContact por defecto.', totalRows: 0 };
        }
        defaultContactId = contact.id;
    } catch (error) {
        console.error("Error al obtener PartContact ID:", error);
        return { success: false, message: 'Error de base de datos al buscar el contacto por defecto.', totalRows: 0 };
    }

    // 3. Procesamiento y Validación del Archivo XLSX
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; 
    const worksheet = workbook.Sheets[sheetName];
    
    const rawData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 }) as string[][];

    if (!rawData || rawData.length <= 1) {
        return { success: false, message: 'El archivo Excel está vacío o no tiene datos.', totalRows: 0 };
    }
    
    // ... (Mapeo y validación de cabeceras y filas)
    const headers = rawData[0]; 
    const dataRows = rawData.slice(1); 
    const validParts: PartData[] = [];
    const errors: ReportError[] = [];
    
    const headerMap: Record<string, number> = {
        "Codigo": headers.findIndex(h => h && h.trim() === 'Codigo'),
        "Descripcion": headers.findIndex(h => h && h.trim() === 'Descripcion'),
        "Modelo": headers.findIndex(h => h && h.trim() === 'Modelo'),
        "Cantidad en stock": headers.findIndex(h => h && h.trim() === 'Cantidad en stock'),
        "Precio de venta": headers.findIndex(h => h && h.trim() === 'Precio de venta'),
    };
    
    dataRows.forEach((row, index) => {
        const rowNumber = index + 2;
        let isValid = true;

        const getValue = (excelHeader: keyof typeof headerMap): string | null => {
            const colIndex = headerMap[excelHeader];
            return colIndex >= 0 ? (row[colIndex] || '').toString().trim() : null;
        };

        const codeStr = getValue("Codigo");
        const descriptionStr = getValue("Descripcion");
        const modelStr = getValue("Modelo");
        const stockStr = getValue("Cantidad en stock");
        const salePriceStr = getValue("Precio de venta");
        const missingFields: string[] = [];
        
        if (!codeStr) missingFields.push('Codigo');
        if (!descriptionStr) missingFields.push('Descripcion');
        if (!stockStr) missingFields.push('Cantidad en stock');
        if (!salePriceStr) missingFields.push('Precio de venta');
        
        if (missingFields.length > 0) {
            errors.push({ fila: rowNumber, error: `Faltan campos obligatorios: ${missingFields.join(', ')}.` });
            isValid = false;
            return;
        }

        let stock: number | null = null;
        let salePrice: number | null = null;
        
        stock = parseInt(stockStr!, 10);
        if (isNaN(stock) || stock < 0) {
            errors.push({ fila: rowNumber, error: `Error de formato: 'Cantidad en stock' debe ser un número entero positivo.` });
            isValid = false;
        }

        salePrice = parseFloat(salePriceStr!.replace(',', '.'));
        if (isNaN(salePrice) || salePrice < 0) {
            errors.push({ fila: rowNumber, error: `Error de formato: 'Precio de venta' debe ser un número positivo.` });
            isValid = false;
        }
        
        if (isValid) {
            validParts.push({
                code: codeStr!,
                description: descriptionStr!,
                model: modelStr || 'N/A',
                stock: stock!,
                salePrice: salePrice!,
                companyId: companyId,
                contactId: defaultContactId, 
                loadDate: new Date(),
            });
        }
    });

    // --- 4. LÓGICA CONDICIONAL: GUARDAR EL ARCHIVO EXCEL DE EXIMAR ---
    if (isEximar) {
        try {
            const publicDir = path.join(process.cwd(), 'public');
            // La ruta final es repuestosEximar.pdf para mantener el enlace fijo
            const targetPath = path.join(publicDir, 'archivos', 'repuestosEximar.xlsx'); 
            
            // Convertir File a Buffer
            const fileBuffer = Buffer.from(arrayBuffer);
            
            // Escribir el archivo, REEMPLAZANDO el anterior
            await fs.writeFile(targetPath, fileBuffer);
            console.log(`[INFO] Archivo de Eximar MG (XLSX) guardado en: ${targetPath}`);

        } catch (fileError) {
            console.error("Error al guardar el archivo de Eximar. El proceso de DB continuará.", fileError);
            // El proceso de DB continúa aunque falle el guardado del archivo.
        }
    }
    
    // --- 5. SEPARACIÓN DE NUEVOS vs. EXISTENTES ---
    let partsToInsert: PartData[] = [];
    let partsToUpdate: PartData[] = [];
    
    if (validParts.length > 0) {
        const codesFromFile = Array.from(new Set(validParts.map(p => p.code)));

        const existingParts = await prisma.part.findMany({
            where: { code: { in: codesFromFile } },
            select: { code: true },
        });

        const existingCodes = new Set(existingParts.map(p => p.code));

        validParts.forEach(p => {
            if (existingCodes.has(p.code)) {
                partsToUpdate.push(p);
            } else {
                partsToInsert.push(p);
            }
        });
    }

    // --- 6. EJECUTAR INSERCIÓN Y ACTUALIZACIÓN ---
    let insertedCount = 0;
    let updatedCount = 0;

    try {
        if (partsToInsert.length > 0) {
            const result = await prisma.part.createMany({
                data: partsToInsert,
            });
            insertedCount = result.count;
        }

        if (partsToUpdate.length > 0) {
            const updatePromises = partsToUpdate.map(async (part) => {
                await prisma.part.update({
                    where: { code: part.code },
                    data: {
                        description: part.description,
                        model: part.model,
                        stock: part.stock,
                        salePrice: part.salePrice,
                        loadDate: new Date(),
                    },
                });
                updatedCount++;
            });

            await Promise.all(updatePromises);
        }
    } catch (dbError) {
        console.error("Error al realizar la operación DB (Insert/Update):", dbError);
        return { 
            success: false, 
            message: 'Error de base de datos durante la operación (inserción o actualización). Revise los logs.',
            totalRows: dataRows.length,
            errors: errors
        };
    }

    // --- 7. Devolver el Reporte Final ---
    const totalProcessed = dataRows.length;
    const finalSuccess = insertedCount > 0 || updatedCount > 0;
    
    return {
        success: finalSuccess,
        message: finalSuccess
            ? `Importación finalizada. Insertados: ${insertedCount}. Actualizados: ${updatedCount}. Total filas: ${totalProcessed}.`
            : `No se insertó ni se actualizó ningún registro. Revise si hay ${dataRows.length - errors.length} filas duplicadas o ${errors.length} errores de formato.`,
        totalRows: totalProcessed,
        inserted: insertedCount,
        updated: updatedCount,
        errors: errors,
    };
}

export async function descargarEjemploRepuestos() {
    // 1. Definir los encabezados requeridos en el Excel
    const headers = [
        "Codigo",
        "Descripcion",
        "Modelo",
        "Cantidad en stock",
        "Precio de venta"
    ];

    // 2. Crear una hoja con solo los encabezados (primera fila)
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    
    // Opcional: Ancho de columnas para mejorar la visualización
    worksheet['!cols'] = [
        { wch: 15 }, // Codigo
        { wch: 40 }, // Descripcion
        { wch: 20 }, // Modelo
        { wch: 15 }, // Cantidad en stock
        { wch: 15 }  // Precio de venta
    ];

    // 3. Crear el libro y agregar la hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "EjemploRepuestos");

    // 4. Convertir a Base64 para enviarlo al cliente
    const excelBase64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

    return {
        success: true,
        fileBase64: excelBase64,
        filename: "EjemploRepuestos.xlsx",
    };
}