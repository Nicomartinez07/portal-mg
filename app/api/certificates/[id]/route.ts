
import { NextResponse } from "next/server";
import { generateCertificate } from "@/app/actions/certificate";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const warrantyId = parseInt(params.id);
  const buffer = await generateCertificate(warrantyId);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificado-${warrantyId}.pdf"`,
    },
  });
}