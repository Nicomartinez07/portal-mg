"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// 📌 Listar todas las empresas
export async function getCompanies() {
  return prisma.company.findMany({
    select: {
      id: true,
      name: true,
      showInParts: true,
    },
    orderBy: { name: "asc" },
  });
}

// Crear empresa
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
  showInParts?: boolean;
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
      companyType: data.companyType ?? "GENERAL",
      manager: data.manager ?? null,
      showInParts: data.showInParts ?? false,
    },
  });
}

// Eliminar empresa
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


// Obtener detalles de una empresa para tu botón "detalles"
export async function getCompanyById(id: number) {
  return prisma.company.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      manager: true,
      address: true,
      state: true,
      city: true,
      phone1: true,
      phone2: true,
      email: true,
      showInParts: true, 
    },
  });
}

// Listar usuarios de una empresa en especifico
export async function getUsersByCompany(companyId: number) {
  return prisma.user.findMany({
    where: { companyId },
    select: {
      id: true,
      username: true,
      email: true,
      notifications: true,
      roles: {
        include: { role: true },
      },
    },
  });
}

// Actualizar empresa
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
    showInParts?: boolean | null;
  }
) {
  return prisma.company.update({
    where: { id },
    data: {
      name: data.name,
      address: data.address ?? undefined,
      state: data.state ?? undefined,
      city: data.city,
      phone1: data.phone1,
      phone2: data.phone2,
      email: data.email,
      manager: data.manager,
      showInParts: data.showInParts, 
    },
  });
}
export async function createUser(data: {
  username: string;
  email: string;
  companyId: number;
  password?: string;
  roles: {
    taller: boolean;
    concesionario: boolean;
  };
  notifications: boolean;
}) {
  if (!data.password) {
    throw new Error("La contraseña es requerida para crear un usuario.");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const rolesToConnect = [];
  
  if (data.roles.taller) {
    rolesToConnect.push({
      role: {
        connect: { name: "WORKSHOP" } 
      },
    });
  }
  
  if (data.roles.concesionario) {
    rolesToConnect.push({
      role: {
        connect: { name: "DEALER" }
      },
    });
  }

  return prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      password: hashedPassword,
      companyId: data.companyId,
      notifications: data.notifications,
      roles: {
        create: rolesToConnect,
      },
    },
  });
}

export async function updateUser(
  id: number,
  data: {
    username?: string;
    email?: string;
    password?: string;
    roles?: {
      taller: boolean;
      concesionario: boolean;
    };
    notifications?: boolean; 
  }
) {
  const updateData: any = {};
  if (data.username) updateData.username = data.username;
  if (data.email) updateData.email = data.email;
  if (data.notifications !== undefined)
    updateData.notifications = data.notifications;

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  if (data.roles) {
    await prisma.userRole.deleteMany({
      where: { 
        userId: id,
        role: {
          name: { in: ["WORKSHOP", "DEALER"] }
        }
      },
    });

    const rolesToCreate = [];
    if (data.roles.taller) {
      rolesToCreate.push({
        role: {
          connect: { name: "WORKSHOP" },
        },
      });
    }
    if (data.roles.concesionario) {
      rolesToCreate.push({
        role: {
          connect: { name: "DEALER" },
        },
      });
    }

    if (rolesToCreate.length > 0) {
        updateData.roles = {
            create: rolesToCreate,
        };
    }
  }
  return prisma.user.update({
    where: { id },
    data: updateData,
  });
}

// 📌 Eliminar solo el usuario (sin borrar relaciones)
export async function deleteUser(id: number) {
  // Primero hacer null las relaciones en warranties
  await prisma.warranty.updateMany({
    where: { userId: id },
    data: { userId: null }
  });

  // Hacer null las relaciones en orders
  await prisma.order.updateMany({
    where: { userId: id },
    data: { userId: null }
  });

  // Eliminar roles del usuario
  await prisma.userRole.deleteMany({
    where: { userId: id }
  });

  // Finalmente eliminar el usuario
  return prisma.user.delete({
    where: { id },
  });
}