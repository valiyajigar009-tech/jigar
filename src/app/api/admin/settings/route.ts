import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    let settings = await prisma.globalSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.globalSettings.create({ data: { id: 1 } });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Always upsert id: 1
    const settings = await prisma.globalSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data }
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Settings Update Error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
