'use server';

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface LoginResponse {
  token: string;
  user: { id: string; username: string; role: string };
  success: boolean;
  error?: string;
}

export async function loginUser(_: any, formData: FormData): Promise<LoginResponse> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  console.log("[loginUser] Recibido:", { username, password });

  if (!username || !password) {
    console.log("[loginUser] Faltan datos");
    return { success: false, error: "Debes ingresar usuario y contraseña", token: '', user: { id: '', username: '', role: '' } };
  }

  try {
    const user = await prisma.user.findFirst({ where: { username } });
    console.log("[loginUser] Usuario encontrado en DB:", user);

    if (!user) {
      console.log("[loginUser] Usuario no encontrado");
      return { success: false, error: "Usuario o contraseña incorrectos", token: '', user: { id: '', username: '', role: '' } };
    }

    const isValid = await bcrypt.compare(password, user.password);
    console.log("[loginUser] Contraseña válida:", isValid);

    if (!isValid) {
      return { success: false, error: "Usuario o contraseña incorrectos", token: '', user: { id: '', username: '', role: '' } };
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.roles },
      process.env.JWT_SECRET!
    );
    console.log("[loginUser] Token generado:", token);

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    const result = {
      success: true,
      token,
      user: { id: String(user.id), username: user.username, role: user.roles },
    };

    console.log("[loginUser] Resultado final:", result);
    return result;

  } catch (err) {
    console.error("[loginUser] Error:", err);
    return { success: false, error: "Error de conexión con el servidor", token: '', user: { id: '', username: '', role: '' } };
  }
}
