import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    let about = await prisma.aboutSection.findUnique({ where: { id: 1 } });
    if (!about) {
      about = await prisma.aboutSection.create({ data: { id: 1 } });
    }
    return NextResponse.json(about);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch about data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data; // Exclude id from update

    const about = await prisma.aboutSection.upsert({
      where: { id: 1 },
      update: updateData,
      create: { id: 1, ...updateData }
    });

    return NextResponse.json({ success: true, about });
  } catch (error) {
    console.error("About Update Error:", error);
    return NextResponse.json({ error: "Failed to update about data" }, { status: 500 });
  }
}
