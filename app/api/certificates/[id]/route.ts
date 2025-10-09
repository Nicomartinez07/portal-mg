import { NextResponse } from "next/server";
import { generateCertificate } from "@/app/actions/certificate";

// The second argument's type is corrected to match Next.js's expectation
// for route handlers with dynamic segments.
type Context = {
  params: { id: string };
};

export async function GET(
  req: Request,
  { params }: Context // Use the defined Context type here
) {
  // It's a good practice to ensure params.id exists and is a number before using it.
  const warrantyId = parseInt(params.id);

  if (isNaN(warrantyId)) {
    return new NextResponse("Invalid warranty ID", { status: 400 });
  }

  const buffer = await generateCertificate(warrantyId);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificado-${warrantyId}.pdf"`,
    },
  });
}