"use server";

import * as XLSX from "xlsx";
// Importa los tipos necesarios de Prisma para TypeScript
import { PrismaClient, Warranty, Vehicle, Customer, Company, User } from '@prisma/client';

// Asumo que tienes una instancia de Prisma Client disponible.
const prisma = new PrismaClient();

// 1. Tipos de Datos Requeridos

// Tipo de filtro basado en tu función getFilteredWarranties
export interface WarrantyFilters {
    vin?: string;
    model?: string;
    certificateNumber?: string;
    licensePlate?: string;
    companyId?: number;
    customerId?: number;
    customerName?: string;
    fromDate?: string;
    toDate?: string;
    // Si manejas un filtro de 'status' o 'userId' para el vendedor, inclúyelo aquí
}

// Tipo de Garantía con relaciones incluidas para la consulta
type WarrantyWithRelations = Warranty & {
    vehicle: Vehicle;
    customer: Customer;
    company: Company;
    user: User | null; 
};

// Interfaz de respuesta del Server Action
export interface ExportResult {
    success: boolean;
    message: string;
    fileBase64?: string; // Archivo binario codificado para enviar por JSON/Server Action
    filename?: string;
    mimeType?: string; // Ej: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}

/**
 * Server Action para exportar las garantías filtradas a un archivo XLSX.
 * Utiliza los mismos filtros que la tabla en pantalla.
 * @param filters El objeto de filtros usado por la tabla en el cliente.
 * @returns Un objeto ExportResult con el archivo en Base64 o un mensaje de error.
 */
export async function exportWarranties(filters: WarrantyFilters): Promise<ExportResult> {
    try {
        
        // --- CONSTRUCCIÓN DEL OBJETO 'WHERE' PARA PRISMA ---
        const whereClause: any = {
            // Filtros anidados: Campos de VEHICLE
            vehicle: {
                vin: filters.vin ? { contains: filters.vin } : undefined,
                model: filters.model ? { contains: filters.model } : undefined,
                certificateNumber: filters.certificateNumber ? { contains: filters.certificateNumber } : undefined,
                licensePlate: filters.licensePlate ? { contains: filters.licensePlate } : undefined,
            },

            // Filtros directos en WARRANTY
            companyId: filters.companyId || undefined,

            // Filtros de Fechas (activationDate)
            activationDate: {
                gte: filters.fromDate ? new Date(filters.fromDate) : undefined,
                // Asegura que el rango de fechas incluya el día final completo
                lte: filters.toDate 
                    ? new Date(new Date(filters.toDate).setHours(23, 59, 59, 999)) 
                    : undefined,
            },

            // Filtros anidados: Campos de CUSTOMER (Nombre/Apellido)
            customer: filters.customerName
                ? {
                    OR: [
                        { firstName: { contains: filters.customerName } },
                        { lastName: { contains: filters.customerName } },
                    ],
                  }
                : undefined,
            
            // Si el filtro de 'status' está en el modelo Warranty o User/Company, inclúyelo aquí si es necesario
            // status: filters.status ? filters.status : undefined, 
        };
        
        // 2. Consulta DB: Usar los filtros recibidos para obtener los datos
        const warranties: WarrantyWithRelations[] = await prisma.warranty.findMany({
            where: whereClause,
            include: {
                vehicle: true, // Incluye la data del vehículo para los campos de filtro/exportación
                customer: true, // Incluye la data del cliente
                company: true, // Incluye la data de la empresa
                user: true, // Incluye la data del vendedor/usuario
            },
            orderBy: {
                activationDate: 'desc',
            }
        }) as WarrantyWithRelations[];
        
        // Manejar el caso de no resultados (tal como lo requiere el cliente)
        if (warranties.length === 0) {
            return {
                success: false,
                message: "No se encontraron garantías para exportar con los filtros aplicados."
            };
        }

        // 3. Procesamiento/Mapeo: De objeto complejo a formato plano y legible
        const dataForExport = warranties.map(w => ({
            // Mapeo de campos de WARRANTY y VEHICLE
            'Fecha': new Date(w.activationDate).toLocaleDateString('es-AR'), // w.activationDate
            'Vin': w.vehicle.vin,
            'Modelo': w.vehicle.model,
            'Nro.Motor': w.vehicle.engineNumber ?? '',
            'Tipo': w.vehicle.type ?? '',
            'Año': w.vehicle.year ?? '',
            'Nro.Certificado': w.vehicle.certificateNumber ?? '',
            // Si importDate es Date/DateTime, usa toLocaleDateString
            'F.Importacion': w.vehicle.importDate ? new Date(w.vehicle.importDate).toLocaleDateString('es-AR') : '',
            
            // Mapeo de campos de COMPANY
            'Empresa': w.company.name,
            
            // Mapeo de campos de USER (Vendedor)
            'Vendedor': w.user?.username ?? 'N/A',
            
            // Mapeo de campos de CUSTOMER
            'Nombre': w.customer.firstName,
            'Apellido': w.customer.lastName,
            'Email': w.customer.email,
            'Telefono': w.customer.phone,
            'Direccion': w.customer.address,
            'Provincia': w.customer.state,
            'Localidad': w.customer.city,
        }));

        // 4. Generación: Usar 'xlsx' para crear el archivo
        const worksheet = XLSX.utils.json_to_sheet(dataForExport);
        const workbook = XLSX.utils.book_new();
        
        // Agregar la hoja de cálculo al libro
        XLSX.utils.book_append_sheet(workbook, worksheet, "Garantias");
        
        // Escribir el buffer del archivo
        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        // 5. Codificación: Convertir el Buffer a Base64
        const fileBase64 = buffer.toString('base64');
        const filename = `Garantias_${new Date().toISOString().slice(0, 10)}.xlsx`;
        const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        // 6. Retorno
        return {
            success: true,
            message: `Exportación exitosa. ${warranties.length} registros exportados.`,
            fileBase64,
            filename,
            mimeType,
        };

    } catch (error) {
        console.error("Error en exportWarranties:", error);
        return {
            success: false,
            message: "Ocurrió un error al generar el archivo de exportación."
        };
    }
}