import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

// Ensure upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");
    
    // Get folders
    const folders = await prisma.mediaFolder.findMany({
      where: folderId ? { parentId: folderId } : { parentId: null },
      orderBy: { name: "asc" }
    });
    
    // Get files
    const files = await prisma.mediaFile.findMany({
      where: folderId ? { folderId } : { folderId: null },
      orderBy: { createdAt: "desc" }
    });
    
    return NextResponse.json({ folders, files });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folderId = formData.get("folderId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate unique filename
    const originalName = file.name;
    const extension = path.extname(originalName);
    const uniqueFilename = `${uuidv4()}${extension}`;
    
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);
    await writeFile(filePath, buffer);
    
    const url = `/uploads/${uniqueFilename}`;

    // Save to database
    const mediaFile = await prisma.mediaFile.create({
      data: {
        filename: uniqueFilename,
        originalName: originalName,
        url: url,
        mimeType: file.type,
        size: file.size,
        folderId: folderId || null,
      }
    });

    return NextResponse.json({ success: true, file: mediaFile });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
