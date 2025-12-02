// app/api/upload-tarifario/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "No file uploaded" },
      { status: 400 }
    );
  }
  // ✔ Lista de MIME types permitidos
  const allowedMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
  ];
  // ✔ Verificación del MIME type
  if (!allowedMimeTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "El archivo debe ser un Excel (.xls o .xlsx)" },
      { status: 400 }
    );
  }
  // ✔ Verificación de extensión por seguridad extra
  const filename = file.name || "";
  if (!filename.endsWith(".xlsx") && !filename.endsWith(".xls")) {
    return NextResponse.json(
      { alert: "El archivo debe tener extensión .xls o .xlsx" },
      { status: 400 }
    );
  }

  // ✔ Guardar archivo como tarifario.xlsx
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filePath = path.join(
    process.cwd(),
    "public/archivos/tarifario.xlsx"
  );
  await fs.writeFile(filePath, buffer);
  return NextResponse.json({ success: true });
}
