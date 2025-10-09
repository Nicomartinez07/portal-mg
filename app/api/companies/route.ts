import { NextResponse } from "next/server";
import { getCompanies } from "@/app/actions/companies";

export async function GET() {
  const companies = await getCompanies();
  return NextResponse.json(companies);
}
