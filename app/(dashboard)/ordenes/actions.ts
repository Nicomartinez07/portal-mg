"use server";

import { prisma } from "@/lib/prisma";
// Agregué revalidatePath que es necesario para refrescar la UI
import { revalidatePath } from "next/cache";

// --- 1. TIPO DE DATOS ---
// Esto define la "forma" del objeto que envían los modales
export type OrderInternalStatusUpdateData = {
  internalStatus: string | null;
  internalStatusObservation: string | null;
  originClaimNumber: string | null
  laborRecovery: number | null;
  partsRecovery: number | null;
};

// --- 2. Tu función getOrders (SIN CAMBIOS) ---
export async function getOrders(params: {
  filters: {
    orderNumber?: string;
    vin?: string;
    customerName?: string;
    status?: string;
    type?: string;
    internalStatus?: string;
    companyId?: string;
    fromDate?: string;
    toDate?: string;
  };
  page: number;
  pageSize: number;
}) {
  const { filters, page, pageSize } = params;

  // 1. Construir la cláusula 'where' para reutilizarla
  const whereClause = {
    draft: false,
    ...(filters.orderNumber && { orderNumber: Number(filters.orderNumber) }),
    vehicle: filters.vin ? { vin: { contains: filters.vin } } : undefined,
    ...(filters.status && { status: filters.status as any }),
    ...(filters.type && { type: filters.type as any }),
    ...(filters.internalStatus && {
      internalStatus: filters.internalStatus as any,
    }),
    ...(filters.companyId && { companyId: Number(filters.companyId) }),
    creationDate: {
      gte: filters.fromDate ? new Date(filters.fromDate) : undefined,
      lte: filters.toDate ? new Date(filters.toDate) : undefined,
    },
  };

  // 2. Calcular cuántos registros saltar (skip)
  const skip = (page - 1) * pageSize;

  // 3. Usar una transacción para obtener el conteo y los datos
  const [total, data] = await prisma.$transaction([
    // Consulta 1: Contar el total de registros que coinciden con el filtro
    prisma.order.count({ where: whereClause }),
    
    // Consulta 2: Obtener solo la página de datos que necesitamos
    prisma.order.findMany({
      where: whereClause,
      include: {
        customer: true,
        company: true,
        user: true,
        vehicle: { include: { warranty: true } },
        statusHistory: { orderBy: { changedAt: "asc" } },
        tasks: { include: { parts: { include: { part: true } } } },
        photos: true,
      },
      orderBy: { creationDate: "desc" },
      skip: skip,   // Saltar los registros de páginas anteriores
      take: pageSize, // Tomar solo la cantidad para esta página
    }),
  ]);

  // 4. Devolver un objeto con los datos y el total
  return { data, total };
}

// --- 3. Tu función updateOrderStatus (Le agregué revalidatePath) ---
export async function updateOrderStatus(
  orderId: number,
  newStatus: string,
  observation?: string
) {
  try {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1️⃣ Actualizamos el estado de la orden
      const order = await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus as any },
      });

      // 2️⃣ Registramos el cambio en el historial
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: newStatus as any,
          changedAt: new Date(),
          observation: observation?.trim() || null,
        },
      });

      return order;
    });

    console.log(
      `✅ Estado de la orden ${orderId} actualizado a ${newStatus} y registrado en historial.`
    );
    revalidatePath("/ordenes"); // <-- Agregado: Refresca la data en la UI
    return { success: true, updatedOrder };
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    return { success: false, error: "Failed to update status" };
  }
}



export async function updateOrderInternalStatus(
  orderId: number,
  data: OrderInternalStatusUpdateData 
) {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...data,
        internalStatus: data.internalStatus as any, 
      },
    });

    console.log(
      `✅ Estado interno y campos de la orden ${orderId} actualizados.`
    );
    revalidatePath("/ordenes");
    return { success: true, updatedOrder };
  } catch (error) {
    console.error("Error updating order internal status:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to update internal status";
    return { success: false, error: errorMessage };
  }
}