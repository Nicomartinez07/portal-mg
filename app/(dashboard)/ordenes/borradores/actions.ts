// app/ordenes/actions.ts

"use server";

import { prisma } from "@/lib/prisma";
export async function getDraftOrders(params: {
  filters: {
    orderNumber?: string;
    vin?: string;
    status?: string;
    type?: string;
    fromDate?: string;
    toDate?: string;
  };
  page: number;
  pageSize: number;
}) {
  const { filters, page, pageSize } = params;

  // 1. Construir la cláusula 'where'
  const whereClause = {
    draft: true, // <-- La condición clave para borradores
    ...(filters.orderNumber && { orderNumber: Number(filters.orderNumber) }),
    
    // Mantenemos la lógica de filtrado de VIN que tenías
    vehicle: filters.vin
      ? { vin: { contains: filters.vin } } 
      : undefined,
      
    ...(filters.status && { status: filters.status as any }),
    ...(filters.type && { type: filters.type as any }),
    creationDate: {
      gte: filters.fromDate ? new Date(filters.fromDate) : undefined,
      lte: filters.toDate ? new Date(filters.toDate) : undefined,
    },
  };

  // 2. Calcular cuántos registros saltar
  const skip = (page - 1) * pageSize;

  // 3. Usar una transacción para obtener el conteo y los datos
  const [total, data] = await prisma.$transaction([
    // Consulta 1: Contar el total
    prisma.order.count({ where: whereClause }),
    
    // Consulta 2: Obtener solo la página de datos
    prisma.order.findMany({
      where: whereClause,
      include: {
        customer: true,
        company: true,
        user: true,
        vehicle: {
          include: {
            warranty: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: "asc" },
        },
        tasks: {
          include: {
            parts: {
              include: { part: true },
            },
          },
        },
        photos: true,
      },
      orderBy: { creationDate: "desc" },
      skip: skip,
      take: pageSize,
    }),
  ]);

  // 4. Devolver el objeto con datos y total
  return { data, total };
}