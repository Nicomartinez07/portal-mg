"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// 📌 Listar un usuario por ID
export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      notifications: true,
      roles: { include: { role: true } },
    },
  });
}

// Listar usuarios (FILTRADOS POR ROL ADMIN Y IMPORTADORA)
export async function getUsers() {
  const IMPORTER_ROLE_ID = 2;
  const ADMIN_ROLE_ID = 1;

  return prisma.user.findMany({
    where: {
      roles: {
        some: {
          OR: [
            { roleId: IMPORTER_ROLE_ID },
            { roleId: ADMIN_ROLE_ID },
          ],
        },
      },
    },
    select: {
      id: true,
      username: true,
      email: true,
      notifications: true,
      roles: { 
        select: {
          role: {
            select: { name: true }
          }
        }
      },
    },
    orderBy: { username: "asc" },
  });
}
export async function createUser(data: {
  username: string;
  email: string;
  companyId: number;
  password: string;
  notifications: boolean;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const IMPORTER_ROLE_ID = 2;

  // Utilizamos una transacción para asegurar que ambos pasos se completen o ninguno.
    return prisma.$transaction(async (tx) => {
        // 1. Crear el usuario
        const newUser = await tx.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: hashedPassword,
                companyId: data.companyId,
                notifications: data.notifications,
            },
        });

        // 2. Asignar el rol de IMPORTADOR
        await tx.userRole.create({
            data: {
                userId: newUser.id,
                roleId: IMPORTER_ROLE_ID, // Asignación fija al ID 2 (IMPORTER)
            },
        });

        return newUser;
    });
}



// 📌 Actualizar usuario
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
    await prisma.userRole.deleteMany({ where: { userId: id } });

    const rolesToCreate = [];
    if (data.roles.taller) {
      rolesToCreate.push({ role: { connect: { name: "Taller" } } });
    }
    if (data.roles.concesionario) {
      rolesToCreate.push({ role: { connect: { name: "Concesionario" } } });
    }

    updateData.roles = { create: rolesToCreate };
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
  });
}

// 📌 Eliminar usuario (limpiando relaciones)
export async function deleteUser(id: number) {
  await prisma.warranty.updateMany({
    where: { userId: id },
    data: { userId: null },
  });

  await prisma.order.updateMany({
    where: { userId: id },
    data: { userId: null },
  });

  await prisma.userRole.deleteMany({
    where: { userId: id },
  });

  return prisma.user.delete({
    where: { id },
  });
}
