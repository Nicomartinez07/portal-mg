"use server";
import { prisma } from "@/lib/prisma";

export async function getRepuestos() {
  return prisma.part.findMany({
    include: {
      company: true,
      contact: true, 
    },
    orderBy: {
      loadDate: "desc"
    }
  });
}

export async function getTalleres() {
  // 1️⃣ Traer todos los talleres y la empresa "Eximar MG" en una sola consulta
  const allCompanies = await prisma.company.findMany({
    where: {
      OR: [
        { showInParts: true }
      ]
    },
    orderBy: { name: "asc" }
  });

  // 2️⃣ Traer todos los usuarios (para mapear el manager)
  const allUsers = await prisma.user.findMany({
    select: {
      username: true,
      email: true
    }
  });

  // 3️⃣ Crear un mapa para búsqueda rápida de managers
  const userMap = new Map();
  allUsers.forEach(user => {
    // Usamos el username como clave para la búsqueda
    userMap.set(user.username, user.email);
  });

  // 4️⃣ Mapear las compañías y agregar el campo 'managerEmail'
  const resultWithEmail = allCompanies.map(company => {
    let managerEmail = null;

    if (company.manager) {
      // Buscar el email usando el manager como clave en el mapa
      const email = userMap.get(company.manager);
      if (email) {
        managerEmail = email;
      }
    }

    // Retornar la compañía con el nuevo campo calculado
    return {
      ...company,
      managerEmail: managerEmail, // Será el email del usuario o null
    };
  });

  return resultWithEmail;
}