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

// 📌 Listar todos los usuarios
export async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      notifications: true,
      roles: { include: { role: true } },
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

  return prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      password: hashedPassword,
      companyId: data.companyId,
      notifications: data.notifications,
      roles: {
        create: [
          {
            roleId: 2 // 👈 Así es la forma correcta para relaciones many-to-many
          }
        ]
      }
    }
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
