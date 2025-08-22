"use server";
import { prisma } from "@/lib/prisma";

// Listar todas las empresas (solo id y nombre)
export async function getCompanies() {
  return prisma.company.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
}
