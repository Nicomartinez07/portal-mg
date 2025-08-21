// /pages/api/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. Leer cookie
    const token = req.cookies.token; // 👈 Asegúrate que este sea el nombre que usaste al loguear

    if (!token) {
      return res.status(401).json({ message: "No autorizado" });
    }

    // 2. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { username: string };

    // 3. Responder con datos del usuario
    return res.status(200).json({ username: decoded.username });
  } catch (error) {
    console.error("Error en /api/me:", error);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

