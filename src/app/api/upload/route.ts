import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File select nahi kiya gaya hai" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // public/uploads directory verify and create
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Profile photo ke liye unique filename generate karenge browser cache issues se bachne ke liye
    const fileExtension = path.extname(file.name) || ".png";
    const fileName = `profile_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file to filesystem
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "File upload logic fail ho gaya" }, { status: 500 });
  }
}
