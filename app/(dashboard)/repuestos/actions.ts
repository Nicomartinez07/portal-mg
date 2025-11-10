"use server";
import { prisma } from "@/lib/prisma";

// === ACCIÓN DE REPUESTOS (MODIFICADA CON PAGINACIÓN) ===
export async function getRepuestos(params: {
  filters: {
    model?: string;
    companyId?: string;
    code?: string;
  };
  page: number;
  pageSize: number;
}) {
  const { filters, page, pageSize } = params;

  // 1. Calculamos el skip
  const skip = (page - 1) * pageSize;

  // 2. Construimos el 'where'
  const whereClause = {
    model: filters.model
      ? { contains: filters.model }
      : undefined,
    code: filters.code
      ? { contains: filters.code }
      : undefined,
    companyId: filters.companyId
      ? Number(filters.companyId)
      : undefined,
  };

  // 3. Usamos la transacción (como en los otros paginados)
  const [total, data] = await prisma.$transaction([
    prisma.part.count({ where: whereClause }), // Asumiendo que tu modelo es 'part'
    prisma.part.findMany({
      where: whereClause,
      include: {
        company: true,
        contact: true,
      },
      orderBy: {
        loadDate: "desc",
      },
      skip: skip, 
      take: pageSize, 
    }),
  ]);

  // 4. Devolvemos el objeto con datos y total
  return { data, total };
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