"use server";
import { prisma } from "@/lib/prisma";

export async function getFilteredWarranties({
  filters = {},
  page = 1,
  pageSize = 25,
}: {
  filters?: {
    vin?: string;
    model?: string;
    certificateNumber?: string;
    licensePlate?: string;
    companyId?: number;
    customerId?: number;
    customerName?: string;
    fromDate?: string;
    toDate?: string;
  };
  page?: number;
  pageSize?: number;
}) {
  // Filtro dinámico seguro
  const whereClause = {
    vehicle: {
      vin: filters.vin ? { equals: filters.vin } : undefined,
      licensePlate: filters.licensePlate
        ? { contains: filters.licensePlate }
        : undefined,
      model: filters.model ? { contains: filters.model } : undefined,
      certificateNumber: filters.certificateNumber
        ? { contains: filters.certificateNumber }
        : undefined,
    },
    companyId: filters.companyId || undefined,
    customerId: filters.customerId || undefined,
    activationDate:
      filters.fromDate || filters.toDate
        ? {
            gte: filters.fromDate ? new Date(filters.fromDate) : undefined,
            lte: filters.toDate ? new Date(filters.toDate) : undefined,
          }
        : undefined,
    customer: filters.customerName
      ? {
          OR: [
            { firstName: { contains: filters.customerName } },
            { lastName: { contains: filters.customerName } },
          ],
        }
      : undefined,
  };

  // Total de resultados (para paginación)
  const total = await prisma.warranty.count({
    where: whereClause,
  });

  // Resultados paginados
  const data = await prisma.warranty.findMany({
    where: whereClause,
    include: {
      vehicle: true,
      user: true,
      company: true,
      customer: true,
    },
    orderBy: { activationDate: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return { data, total };
}



// Eliminar garantía
export async function deleteWarranty(id: number) {
  try {
    await prisma.warranty.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error al borrar garantía:", error);
    return { success: false, error: "No se pudo borrar la garantía" };
  }
}
