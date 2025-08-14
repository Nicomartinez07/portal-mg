import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: number;
  role: string;
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return null;
  }
}
