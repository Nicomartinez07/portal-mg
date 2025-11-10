"use server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { CertificateFilters } from "@/contexts/CertificateContext";

export async function getCertificates(params: {
  filters: CertificateFilters;
  page: number;
  pageSize: number;
}) {
  const { filters, page, pageSize } = params;
  const skip = (page - 1) * pageSize;

  // Objeto 'where' principal para la tabla Vehicle
  const where: Prisma.VehicleWhereInput = {};
  // Objeto 'where' secundario para la tabla Warranty
  const warrantyWhere: Prisma.WarrantyWhereInput = {};

  // FILTROS DE VEHICLE
  if (filters.vin) where.vin = { equals: filters.vin };
  if (filters.model) where.model = { contains: filters.model };
  if (filters.certificateNumber)
    where.certificateNumber = { contains: filters.certificateNumber };

  if (filters.importDateFrom || filters.importDateTo) {
    where.importDate = {
      gte: filters.importDateFrom ? new Date(filters.importDateFrom) : undefined,
      lte: filters.importDateTo ? new Date(filters.importDateTo) : undefined,
    };
  }

  if (filters.blocked === "BLOQUEADO") {
    where.blocked = true;
  } else if (filters.blocked === "NO_BLOQUEADO") {
    where.blocked = { not: true };
  }

  // FILTROS DE WARRANTY
  let hasWarrantyFilters = false;

  if (filters.fromDate || filters.toDate) {
    warrantyWhere.activationDate = {
      gte: filters.fromDate ? new Date(filters.fromDate) : undefined,
      lte: filters.toDate ? new Date(filters.toDate) : undefined,
    };
    hasWarrantyFilters = true;
  }

  // LÓGICA DE GARANTIA
  if (filters.garantia === "ACTIVA") {
    where.warranty = hasWarrantyFilters ? { ...warrantyWhere } : { isNot: null };
  } else if (filters.garantia === "NO_ACTIVA") {
    if (hasWarrantyFilters) {
      return { data: [], total: 0 };
    }
    where.warranty = { is: null };
  } else {
    if (hasWarrantyFilters) {
      where.OR = [
        { warranty: { is: null } },
        { warranty: { ...warrantyWhere } },
      ];
    }
  }


  const [total, data] = await prisma.$transaction([
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({
      where,
      include: {
        company: true,
        warranty: {
          include: {
            user: true,
            company: true,
            customer: true,
          },
        },
      },
      orderBy: { date: "desc" },
      skip: skip,
      take: pageSize, 
    }),
  ]);

  return { data, total };
}