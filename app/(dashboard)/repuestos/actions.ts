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

  const skip = (page - 1) * pageSize;

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

  const [total, data] = await prisma.$transaction([
    prisma.part.count({ where: whereClause }),
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

  return { data, total };
}

export async function getTalleres() {
  const allCompanies = await prisma.company.findMany({
    where: {
      OR: [
        { showInParts: true }
      ]
    },
    orderBy: { name: "asc" }
  });

  const allUsers = await prisma.user.findMany({
    select: {
      username: true,
      email: true
    }
  });

  const userMap = new Map();
  allUsers.forEach(user => {
    userMap.set(user.username, user.email);
  });

  const resultWithEmail = allCompanies.map(company => {
    let managerEmail = null;

    if (company.manager) {
      const email = userMap.get(company.manager);
      if (email) {
        managerEmail = email;
      }
    }

    return {
      ...company,
      managerEmail: managerEmail,
    };
  });

  return resultWithEmail;
}

// --- TIPOS DE DATOS PARA EL REPORTE ---
interface DeleteResult {
    success: boolean;
    message: string;
    deletedCount?: number;
}
// ---------------------------------------

/**
 * Borra todos los repuestos asociados a una empresa específica.
 * @param companyId El ID de la empresa cuyos repuestos serán borrados.
 * @returns {DeleteResult} El resultado de la operación.
 */
export async function borrarRepuestosEmpresa(companyId: number): Promise<DeleteResult> {
    // VALIDACIÓN DE ENTRADA
    if (!companyId || isNaN(companyId) || companyId <= 0) {
        return { success: false, message: "ID de empresa inválido." };
    }
    
    try {
        // OBTENER NOMBRE DE LA EMPRESA (para el mensaje de éxito)
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { name: true }
        });

        if (!company) {
             return { success: false, message: `No se encontró la empresa con ID ${companyId}.` };
        }

        // EJECUTAR LA ACCIÓN DE BORRADO
        const deleteResult = await prisma.part.deleteMany({
            where: {
                companyId: companyId,
            },
        });

        const deletedCount = deleteResult.count;
        
        // RESPUESTA DE ÉXITO
        return { 
            success: true, 
            message: `✅ Borrado exitoso. Se eliminaron **${deletedCount}** repuestos pertenecientes a la empresa **${company.name}**.`,
            deletedCount: deletedCount, 
        };

    } catch (error) {
        console.error(`Error al borrar repuestos de la empresa ${companyId}:`, error);
        return { 
            success: false, 
            message: "No se pueden eliminar los repuestos, debido a que pertenecen a alguna orden." 
        };
    }
}