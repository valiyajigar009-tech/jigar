import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const { path, duration } = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Track visitor
    let visitor = await prisma.visitorAnalytics.findFirst({
      where: { ipHash: ip }
    });

    if (!visitor) {
      visitor = await prisma.visitorAnalytics.create({
        data: {
          ipHash: ip,
          browser: userAgent.substring(0, 50),
        }
      });
    }

    // Record page view
    await prisma.pageView.create({
      data: {
        path: path || "/",
        duration: duration || 0,
        visitorId: visitor.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Fail silently for tracking
    return NextResponse.json({ success: false });
  }
}
