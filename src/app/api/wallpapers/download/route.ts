import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const wallpaper = await prisma.wallpaper.update({
    where: { id },
    data: {
      downloads: { increment: 1 },
    },
  });

  return NextResponse.json(wallpaper);
}
