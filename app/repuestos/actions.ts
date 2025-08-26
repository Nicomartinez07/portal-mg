"use server";
import { prisma } from "@/lib/prisma";

export async function getRepuestos() {
  return prisma.part.findMany({
    include: {
      company: true,
      contact: true, // ← Asegúrate de incluir el contacto
    },
    orderBy: {
      loadDate: "desc"
    }
  });
}

export async function getTalleres() {
  return prisma.company.findMany({
    where: {
      companyType: "Workshop"
    },
    orderBy: {
      name: "asc"
    }
  });
}