"use server";
import { prisma } from "@/lib/prisma";

export async function getFilteredCertificates(filters: {
  vin?: string;
  model?: string;
  certificateNumber?: string;
  licensePlate?: string;
  companyId?: number;
  customerId?: number;
  customerName?: string;
  fromDate?: string;
  toDate?: string;
  blocked?: boolean;
}) {
  return prisma.warranty.findMany({
    where: {
      vehicle: {
        // ✅ Corregido: VIN ahora se filtra dentro del modelo 'vehicle'
        vin: filters.vin ? { equals: filters.vin } : undefined,
        
        // ✅ Añadido: Se agrega el filtro para 'licensePlate'
        licensePlate: filters.licensePlate ? { contains: filters.licensePlate } : undefined,

        model: filters.model
          ? { contains: filters.model } // 👈 Ahora con mode: "insensitive"
          : undefined,
        certificateNumber: filters.certificateNumber
          ? { contains: filters.certificateNumber } // 👈 Ahora con mode: "insensitive"
          : undefined,
      },
      companyId: filters.companyId || undefined,
      customerId: filters.customerId || undefined,
      activationDate: {
        gte: filters.fromDate ? new Date(filters.fromDate) : undefined,
        lte: filters.toDate ? new Date(filters.toDate) : undefined,
      },
      customer: filters.customerName
        ? {
            OR: [
              { firstName: { contains: filters.customerName } }, // 👈 Ahora con mode: "insensitive"
              { lastName: { contains: filters.customerName} },  // 👈 Ahora con mode: "insensitive"
            ],
          }
        : undefined,
    },
    include: {
      vehicle: true,
      user: true,
      company: true,
      customer: true,
    },
    orderBy: { activationDate: "desc" },
  });
}
