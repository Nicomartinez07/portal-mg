"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// 📌 Listar todas las empresas
export async function getCompanies() {
  return prisma.company.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
}

// 📌 Crear empresa
export async function createCompany(data: {
  name: string;
  address?: string;
  state?: string;
  city?: string;
  phone1?: string;
  phone2?: string;
  email?: string;
  companyType: string;
  manager?: string;
}) {
  return prisma.company.create({
    data: {
      name: data.name,
      address: data.address ?? "N/A",
      state: data.state ?? "N/A",
      city: data.city ?? null,
      phone1: data.phone1 ?? null,
      phone2: data.phone2 ?? null,
      email: data.email ?? null,
      companyType: data.companyType ?? "GENERAL", // 👈 default si no se pasa
      manager: data.manager ?? null,
    },
  });
}

export async function deleteCompany(id: number) {
  try {
    return await prisma.company.delete({
      where: { id },
    });
  } catch (error: any) {
    if (error.code === "P2003") {
      // Prisma error de Foreign Key
      throw new Error("No se puede eliminar la empresa porque tiene registros asociados");
    }
    throw error;
  }
}


// 📌 Obtener detalles de una empresa (ejemplo para tu botón "detalles")
export async function getCompanyById(id: number) {
  return prisma.company.findUnique({
    where: { id },
    include: {
      users: true,
      parts: true,
      warranties: true,
      orders: true,
    },
  });
}

// 📌 Listar usuarios de una empresa
export async function getUsersByCompany(companyId: number) {
  return prisma.user.findMany({
    where: { companyId },
    select: {
      id: true,
      username: true,
      email: true,
      roles: {
        include: { role: true },
      },
    },
  });
}

export async function updateCompany(
  id: number,
  data: {
    name?: string;
    address?: string | null;
    state?: string | null;
    city?: string | null;
    phone1?: string | null;
    phone2?: string | null;
    email?: string | null;
    manager?: string | null;
  }
) {
  return prisma.company.update({
    where: { id },
    data: {
      name: data.name,
      address: data.address,
      state: data.state,
      city: data.city,
      phone1: data.phone1,
      phone2: data.phone2,
      email: data.email,
      manager: data.manager,
    },
  });
}
// 📌 Crear un usuario
export async function createUser(data: {
  username: string;
  email: string;
  companyId: number;
  password?: string;
  taller: boolean;
  concesionario: boolean;
  emailNotifications: boolean;
}) {
  // Asegúrate de hashear la contraseña antes de guardarla
  if (data.password) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;
  }

  return prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      companyId: data.companyId,
      password: data.password,
      taller: data.taller,
      concesionario: data.concesionario,
      emailNotifications: data.emailNotifications,
    },
  });
}

// 📌 Actualizar un usuario
export async function updateUser(
  id: number,
  data: {
    username?: string;
    email?: string;
    password?: string;
    taller?: boolean;
    concesionario?: boolean;
    emailNotifications?: boolean;
  }
) {
  const updateData: any = {};
  if (data.username) updateData.username = data.username;
  if (data.email) updateData.email = data.email;
  if (data.taller !== undefined) updateData.taller = data.taller;
  if (data.concesionario !== undefined) updateData.concesionario = data.concesionario;
  if (data.emailNotifications !== undefined) updateData.emailNotifications = data.emailNotifications;
  
  // Hashear la contraseña si se está actualizando
  if (data.password) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    updateData.password = hashedPassword;
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
  });
}

// 📌 Eliminar un usuario
export async function deleteUser(id: number) {
  return prisma.user.delete({
    where: { id },
  });
}
