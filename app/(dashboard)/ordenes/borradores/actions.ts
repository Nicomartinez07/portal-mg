// app/ordenes/actions.ts

"use server";

import { prisma } from "@/lib/prisma";

export async function getDraftOrders(filters: {
  orderNumber?: string;
  vin?: string;
  status?: string;
  type?: string;  
  fromDate?: string;
  toDate?: string;
}) {
  return prisma.order.findMany({
    where: {
      draft: true,
      ...(filters.orderNumber && { orderNumber: Number(filters.orderNumber) }),
      vehicle: filters.vin
        ? { vin: { contains: filters.vin } }
        : undefined,
      ...(filters.status && { status: filters.status as any }),
      ...(filters.type && { type: filters.type as any }),
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
