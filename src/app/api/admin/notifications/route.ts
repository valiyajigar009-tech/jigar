import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const unreadCount = await prisma.message.count({
      where: { isRead: false, isArchived: false }
    });
    return NextResponse.json({ unreadCount });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
