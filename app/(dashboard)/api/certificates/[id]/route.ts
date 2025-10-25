// app/api/certificates/[id]/route.ts
import { NextResponse } from "next/server";
import { generateCertificate } from "@/app/(dashboard)/actions/certificate";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // ¡Importante: await aquí!
  const warrantyId = parseInt(id, 10);

  const buffer = await generateCertificate(warrantyId);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificado-${warrantyId}.pdf"`,
    },
  });
}