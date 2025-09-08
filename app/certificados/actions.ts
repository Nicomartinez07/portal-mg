"use server";
import { prisma } from "@/lib/prisma";

export async function getCertificate(filters: {
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
  const blockedValue = typeof filters.blocked === "boolean" ? filters.blocked : null;

  return prisma.warranty.findMany({
  where: {
    vehicle: {
      vin: filters.vin ? { equals: filters.vin } : undefined,
      licensePlate: filters.licensePlate
        ? { contains: filters.licensePlate, }
        : undefined,
      model: filters.model
        ? { contains: filters.model }
        : undefined,
      certificateNumber: filters.certificateNumber
        ? { contains: filters.certificateNumber }
        : undefined,
    },
    companyId: filters.companyId || undefined,
    customerId: filters.customerId || undefined,
    activationDate:
      filters.fromDate || filters.toDate
        ? {
            gte: filters.fromDate && filters.fromDate !== "" ? new Date(filters.fromDate) : undefined,
            lte: filters.toDate && filters.toDate !== "" ? new Date(filters.toDate) : undefined,
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
    blocked: blockedValue,
  },
  include: {
    vehicle: true,
    user: true,
    company: true,
    customer: true,
  },
  orderBy: { activationDate: "desc" },
});
