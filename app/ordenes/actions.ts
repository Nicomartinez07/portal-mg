// app/ordenes/actions.ts

"use server";

import { prisma } from "@/lib/prisma";

export async function getOrders(filters: {
  orderNumber?: string;
  vin?: string;
  customerName?: string;
  status?: string;
  type?: string;
  internalStatus?: string;
  companyId?: string; 
  fromDate?: string;
  toDate?: string;
}) {
  return prisma.order.findMany({
    where: {
      draft: false,
      ...(filters.orderNumber && { orderNumber: Number(filters.orderNumber) }),
      vehicle: filters.vin
        ? { vin: { contains: filters.vin } }
        : undefined,

      ...(filters.status && { status: filters.status as any }),
      ...(filters.type && { type: filters.type as any }),
      ...(filters.internalStatus && { internalStatus: filters.internalStatus as any }),
      ...(filters.companyId && { companyId: Number(filters.companyId) }),

      creationDate: {
        gte: filters.fromDate ? new Date(filters.fromDate) : undefined,
        lte: filters.toDate ? new Date(filters.toDate) : undefined,
      },
    },
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
  });
}

export async function updateOrderStatus(orderId: number, newStatus: string, observation?: string) {
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

    console.log(`✅ Estado de la orden ${orderId} actualizado a ${newStatus} y registrado en historial.`);
    return { success: true, updatedOrder };
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    return { success: false, error: "Failed to update status" };
  }
}


export async function updateOrderInternalStatus(orderId: number, newInternalStatus: string | null) {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        internalStatus: newInternalStatus as any,
      },
    });

    console.log(`Estado interno de la orden ${orderId} actualizado a ${newInternalStatus}`);
    return { success: true, updatedOrder };
  } catch (error) {
    console.error("Error updating order internal status:", error);
    return { success: false, error: "Failed to update internal status" };
  }
}