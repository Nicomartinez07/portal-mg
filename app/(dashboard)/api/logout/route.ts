// app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Crea una respuesta vacía o con un mensaje de éxito.
  const response = NextResponse.json(
    { message: "Logout successful" },
    { status: 200 }
  );
  // Borra la cookie del JWT
  response.cookies.set({
    name: "token",
    value: "",
    path: "/",
    httpOnly: true,
    expires: new Date(0),
  });
  // Retorna la respuesta para que el cliente la reciba y borre la cookie.
  return response;
}