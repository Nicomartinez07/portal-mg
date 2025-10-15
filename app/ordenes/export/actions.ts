"use server";

import * as XLSX from "xlsx";
import { PrismaClient, Order, Vehicle, Customer, Company, User, OrderType, OrderStatus, InternalStatus, OrderTaskPart, OrderTask, Part } from '@prisma/client';

// Asumo que tienes una instancia de Prisma Client disponible.
const prisma = new PrismaClient();

// --- TIPOS DE DATOS ---

// Tipo de filtro basado en tu lógica de getOrders
export interface OrderFilters {
    orderNumber?: string;
    vin?: string;
    customerName?: string;
    status?: string;
    type?: string;
    internalStatus?: string;
    companyId?: number; 
    fromDate?: string;
    toDate?: string;
}

// Tipo de Orden con todas las relaciones y partes que se usarán en la exportación
type OrderWithRelations = Order & {
    vehicle: Vehicle;
    customer: Customer | null;
    company: Company;
    user: User | null;
    tasks: (OrderTask & {
        parts: (OrderTaskPart & { part: Part })[];
    })[];
};

// Interfaz de respuesta del Server Action (misma que usaste)
export interface ExportResult {
    success: boolean;
    message: string;
    fileBase64?: string;
    filename?: string;
    mimeType?: string; 
}

/**
 * Server Action para exportar las Órdenes filtradas a un archivo XLSX.
 * Utiliza el mismo objeto 'filters' que la consulta de la tabla.
 */
export async function exportOrders(filters: OrderFilters): Promise<ExportResult> {
    try {
        
        // --- CONSTRUCCIÓN DEL OBJETO 'WHERE' (Adaptado de tu actions.ts) ---
        const whereClause: any = {
            draft: false,
            // Filtros directos en Order
            orderNumber: filters.orderNumber ? Number(filters.orderNumber) : undefined,
            status: filters.status ? (filters.status as OrderStatus) : undefined,
            type: filters.type ? (filters.type as OrderType) : undefined,
            internalStatus: filters.internalStatus ? (filters.internalStatus as InternalStatus) : undefined,
            companyId: filters.companyId || undefined,

            // Filtros anidados: Vehículo (por VIN)
            vehicle: filters.vin 
                ? { vin: { contains: filters.vin, mode: 'insensitive' } } 
                : undefined,

            // Filtros de Fechas (creationDate)
            creationDate: {
                gte: filters.fromDate ? new Date(filters.fromDate) : undefined,
                // Incluir el día de 'toDate' completo
                lte: filters.toDate 
                    ? new Date(new Date(filters.toDate).setHours(23, 59, 59, 999)) 
                    : undefined,
            },

            // Filtros anidados: Cliente (por Nombre/Apellido) - Adaptado de Garantías
            customer: filters.customerName
                ? {
                    OR: [
                        { firstName: { contains: filters.customerName, mode: 'insensitive' } },
                        { lastName: { contains: filters.customerName, mode: 'insensitive' } },
                    ],
                  }
                : undefined,
        };
        
        // 2. Consulta DB: Usar los filtros recibidos
        const orders: OrderWithRelations[] = await prisma.order.findMany({
            where: whereClause,
            include: {
                customer: true,
                company: true,
                user: true,
                vehicle: true,
                // Incluimos las tareas y partes para el cálculo y la data si es necesaria
                tasks: {
                    include: {
                        parts: {
                            include: { part: true },
                        },
                    },
                },
            },
            orderBy: { creationDate: "desc" }
        }) as OrderWithRelations[];
        
        // Manejar el caso de no resultados
        if (orders.length === 0) {
            return {
                success: false,
                message: "No se encontraron órdenes para exportar con los filtros aplicados."
            };
        }

        // 3. Procesamiento/Mapeo: De objeto complejo a formato plano
        const dataForExport = orders.map(o => ({
            // Mapeo de campos de ORDER (Datos principales)
            'ID': o.id,
            'Numero': o.orderNumber,
            'Fecha': new Date(o.creationDate).toLocaleDateString('es-AR'), 
            'Tipo': o.type,
            'Estado': o.status,
            'Estado Interno': o.internalStatus ?? '',
            'Kilometraje': o.actualMileage,
            'Diagnostico': o.diagnosis ?? '',
            'Observaciones Adicionales': o.additionalObservations ?? '',
            'Nro. Pre-Autorización': o.preAuthorizationNumber ?? '',
            
            // Mapeo de campos de VEHICLE
            'VIN': o.vehicle.vin,
            'Modelo Vehículo': o.vehicle.model,
            'Patente': o.vehicle.licensePlate ?? '',
            
            // Mapeo de campos de COMPANY
            'Empresa': o.company.name,
            
            // Mapeo de campos de USER (Vendedor/Creador)
            'Usuario': o.user?.username ?? 'N/A',
            
            /* Mapeo de campos de CUSTOMER
            'Nombre Cliente': o.customer?.firstName ?? 'N/A',
            'Apellido Cliente': o.customer?.lastName ?? 'N/A',
            'Email Cliente': o.customer?.email ?? '',
            'Teléfono Cliente': o.customer?.phone ?? '',

            // Opcional: Cálculo de totales (ejemplo: Horas Totales, Partes totales)
            'Horas Totales': o.tasks.reduce((sum, task) => sum + task.hoursCount, 0),
            'Descripción Tareas': o.tasks.map(t => `${t.description} (${t.hoursCount}hs)`).join('; '),
            'Partes Reclamadas': o.tasks.flatMap(t => t.parts).map(p => `${p.quantity}x ${p.part.code} (${p.part.description})`).join('; '),
            */

        }));

        // 4. Generación, 5. Codificación y 6. Retorno 
        const worksheet = XLSX.utils.json_to_sheet(dataForExport);
        const workbook = XLSX.utils.book_new();
        
        XLSX.utils.book_append_sheet(workbook, worksheet, "Ordenes");
        
        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        const fileBase64 = buffer.toString('base64');
        const filename = `Ordenes_${new Date().toISOString().slice(0, 10)}.xlsx`;
        const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        return {
            success: true,
            message: `Exportación exitosa. ${orders.length} registros exportados.`,
            fileBase64,
            filename,
            mimeType,
        };

    } catch (error) {
        console.error("Error en exportOrders:", error);
        return {
            success: false,
            message: "Ocurrió un error al generar el archivo de exportación."
        };
    }
}