'use server'; 

import { cookies } from "next/headers"; 
import { prisma } from "@/lib/prisma"; 
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken"; 

// Interface que define la estructura de la respuesta
interface LoginResponse {
  token: string;
  user: { id: string; username: string; password: string; email: string; role: string };
  success: boolean;
  error?: string;
}


export async function loginUser(_: any, formData: FormData): Promise<LoginResponse> {
  // Extrae username y password del FormData
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  console.log("[loginUser] Recibido:", { username, password });

  // Validación básica - verifica que se enviaron ambos campos
  if (!username || !password) {
    console.log("[loginUser] Faltan datos");
    return { 
      success: false, 
      error: "Debes ingresar usuario y contraseña", 
      token: '', 
      user: { id: '', username: '', email: '', role: '', password: '' } 
    };
  }

  try {
    // Busca el usuario en la base de datos usando Prisma
    const user = await prisma.user.findFirst({ where: { username } });
    console.log("[loginUser] Usuario encontrado en DB:", user);

    // Si no encuentra el usuario, devuelve error
    if (!user) {
      console.log("[loginUser] Usuario no encontrado");
      return { 
        success: false, 
        error: "Usuario o contraseña incorrectos", 
        token: '', 
        user: { id: '', username: '', email: '', role: '', password: '' } 
      };
    }

    // Compara la contraseña proporcionada con el hash almacenado en la DB
    const isValid = await bcrypt.compare(password, user.password);
    console.log("[loginUser] Contraseña válida:", isValid);

    // Si la contraseña no coincide, devuelve error (mismo mensaje por seguridad)
    if (!isValid) {
      return { 
        success: false, 
        error: "Usuario o contraseña incorrectos", 
        token: '', 
        user: { id: '', username: '', email: '', role: '', password: '' } 
      };
    }

    // Genera un token JWT con los datos del usuario
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        password: user.password,
        email: user.email,
        role: user.roles 
      },
      process.env.JWT_SECRET!// Secreto para firmar el token (desde variables de entorno)
    );
    console.log("[loginUser] Token generado:", token);

    // Configura la cookie con el token
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "development", 
      sameSite: "strict",
      path: "/", 
    });

    // Prepara la respuesta exitosa
    const result = {
      success: true,
      token, // Token JWT
      user: { 
        id: String(user.id), 
        username: user.username,
        password: user.password,
        email: user.email,
        role: user.roles 
      },
    };

    console.log("[loginUser] Resultado final:", result);
    return result;

  } catch (err) {
    // Manejo de errores
    console.error("[loginUser] Error:", err);
    return { 
      success: false, 
      error: "Error de conexión con el servidor", 
      token: '', 
      user: { id: '', username: '', email: '', role: '', password: '' } 
    };
  }
}