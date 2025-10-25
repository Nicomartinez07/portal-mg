'use server'; 

import { cookies } from "next/headers"; 
import { prisma } from "@/lib/prisma"; 
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken"; 

// Interface de respuesta de login
// --- MODIFICACIÓN 1: Se exporta la interfaz ---
export interface LoginResponse {
  token: string;
  user: { 
    id: string; 
    username: string; 
    email: string; 
    role: string;
    companyId: number;
  };
  success: boolean;
  error?: string;
  isPending?: boolean;
}

// --- MODIFICACIÓN 2: Se tipa el primer argumento como LoginResponse ---
export async function loginUser(
  prevState: LoginResponse, 
  formData: FormData
): Promise<LoginResponse> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { 
      success: false, 
      error: "Debes ingresar usuario y contraseña", 
      token: '', 
      user: { 
        id: '', 
        username: '', 
        email: '', 
        role: '', 
        companyId: 0
      } 
    };
  }

  try {
    const user = await prisma.user.findFirst({ 
      where: { username },
      include: {
        company: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return { 
        success: false, 
        error: "Usuario o contraseña incorrectos", 
        token: '', 
        user: { 
          id: '', 
          username: '', 
          email: '', 
          role: '', 
          companyId: 0 
        } 
      };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { 
        success: false, 
        error: "Usuario o contraseña incorrectos", 
        token: '', 
        user: { 
          id: '', 
          username: '', 
          email: '', 
          role: '', 
          companyId: 0
        } 
      };
    }

    // JWT como una creacion del token con esos datos
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        companyId: user.companyId,
        role: user.roles.map(userRole => userRole.role.name).join(', ') 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 // 1 día
    });

    // ✅ Respuesta del token con los respectivos datos
    const result = {
      success: true,
      token,
      user: { 
        id: String(user.id), 
        username: user.username,
        email: user.email,
        companyId: user.companyId,
        role: user.roles.map(userRole => userRole.role.name).join(', ')
      },
    };
    return result;

  } catch (err) {
    console.error("[loginUser] Error:", err);
    return { 
      success: false, 
      error: "Error de conexión con el servidor", 
      token: '', 
      user: { 
        id: '', 
        username: '', 
        email: '', 
        role: '', 
        companyId: 0
      } 
    };
  }
}