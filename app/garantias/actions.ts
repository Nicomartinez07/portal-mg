import { prisma } from "@/lib/prisma";

export async function getFilteredWarranties(filters: {
  vin?: string;
  model?: string;
  certificateNumber?: string;
  hasWarranty?: string;
  status?: string;
}) {
  const where: any = {};

  if (filters.vin) where.vehicleVin = { contains: filters.vin };
  if (filters.model) where.vehicle = { model: { contains: filters.model } };
  if (filters.certificateNumber)
    where.vehicle = { certificateNumber: { contains: filters.certificateNumber } };
  if (filters.hasWarranty === "si") where.vehicle = { warranty: { not: null } };
  if (filters.status) where.vehicle = { warranty: { status: filters.status } };

  return prisma.warranty.findMany({
    where,
    include: {
      vehicle: true,
      user: true,
      company: true,
      // Si querés incluir cliente asociado al vehículo:
      // vehicle: { include: { customer: true } }
    },
    orderBy: { activationDate: "desc" },
  });
}
