// app/api/upload-tarifario/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // 📌 Guardar archivo en public/archivos/tarifario.xlsx
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filePath = path.join(process.cwd(), "public/archivos/tarifario.xlsx");
  await fs.writeFile(filePath, buffer);

  return NextResponse.json({ success: true });
}
