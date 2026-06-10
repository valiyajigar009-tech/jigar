import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const { name, parentId } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    const folder = await prisma.mediaFolder.create({
      data: {
        name,
        parentId: parentId || null,
      }
    });

    return NextResponse.json({ success: true, folder });
  } catch (error) {
    console.error("Folder creation error:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
