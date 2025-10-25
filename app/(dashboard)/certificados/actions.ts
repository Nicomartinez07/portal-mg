"use server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; 

// Importa el tipo desde tu contexto.
// Si da problemas (por "use client"), simplemente copia y pega
// la definición de 'CertificateFilters' de arriba aquí.
import { CertificateFilters } from "@/contexts/CertificateContext"; 

export async function getCertificate(filters: CertificateFilters) {

  // Objeto 'where' principal para la tabla Vehicle
  const where: Prisma.VehicleWhereInput = {};
  
  // Objeto 'where' secundario para la tabla Warranty
  const warrantyWhere: Prisma.WarrantyWhereInput = {};

  // --- 1. FILTROS DE VEHICLE ---
  if (filters.vin) where.vin = { equals: filters.vin };
  if (filters.model) where.model = { contains: filters.model };
  if (filters.certificateNumber) where.certificateNumber = { contains: filters.certificateNumber };

  // Filtro: F. Importacion (Vehicle.importDate)
  if (filters.importDateFrom || filters.importDateTo) {
    where.importDate = {
      gte: filters.importDateFrom ? new Date(filters.importDateFrom) : undefined,
      lte: filters.importDateTo ? new Date(filters.importDateTo) : undefined,
    };
  }

  // Filtro: Bloqueado (Vehicle.blocked) - ¡Implementado correctamente!
  if (filters.blocked === "BLOQUEADO") {
    where.blocked = true;
  } else if (filters.blocked === "NO_BLOQUEADO") {
    where.blocked = { not: true }; // (Cubre false y null)
  }

  // --- 2. FILTROS DE WARRANTY ---
  // Estos filtros se aplicarán a la garantía *si existe*
  let hasWarrantyFilters = false;

  // Filtro: Empadronamiento (Warranty.activationDate)
  if (filters.fromDate || filters.toDate) {
    warrantyWhere.activationDate = {
      gte: filters.fromDate ? new Date(filters.fromDate) : undefined,
      lte: filters.toDate ? new Date(filters.toDate) : undefined,
    };
    hasWarrantyFilters = true;
  }
  // --- 3. LÓGICA DE GARANTIA ---
  // Aquí combinamos todo
  
  if (filters.garantia === "ACTIVA") {
    // Busca vehículos CON garantía que coincidan con los filtros de garantía.
    where.warranty = hasWarrantyFilters ? { ...warrantyWhere } : { isNot: null };
    
  } else if (filters.garantia === "NO_ACTIVA") {
    // Busca vehículos SIN garantía.
    // Si el usuario *también* filtró por campos de garantía (p.ej. customerName),
    // es un conflicto lógico. Devolvemos vacío.
    if (hasWarrantyFilters) {
      console.warn("Conflicto lógico: Filtro 'NO_ACTIVA' con filtros de garantía.");
      return []; 
    }
    where.warranty = { is: null };

  } else {
    // No se especificó filtro de garantía (null o undefined)
    // Muestra vehículos SIN garantía O vehículos CON garantía que coincidan con los filtros.
    if (hasWarrantyFilters) {
      where.OR = [
        { warranty: { is: null } },
        { warranty: { ...warrantyWhere } }
      ];
    }
    // Si no hay 'hasWarrantyFilters', no se añade nada a 'where',
    // por lo que se devuelven todos los vehículos (que coincidan con filtros de vehículo).
  }
  
  return prisma.vehicle.findMany({
    where,
    include: {
      company: true, // Compañía del vehículo
      warranty: {
        include: {
          user: true,
          company: true, // Compañía de la garantía
          customer: true,
        },
      },
    },
    orderBy: { date: "desc" }, // Ordenar por fecha de vehículo
  });
}