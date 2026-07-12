import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
} from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") || "";
  const tag = req.nextUrl.searchParams.get("tag") || "";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { tags: { contains: search } },
    ];
  }

  if (tag) {
    where.tags = { contains: tag };
  }

  const wallpapers = await prisma.wallpaper.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(wallpapers);
}

async function handleFileUpload(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return uploadToCloudinary(buffer);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const desktopFile = formData.get("desktop") as File | null;
  const mobileFile = formData.get("mobile") as File | null;
  const title = (formData.get("title") as string) || "";
  const tags = (formData.get("tags") as string) || "";

  if (!desktopFile && !mobileFile) {
    return NextResponse.json(
      { error: "Upload at least one file" },
      { status: 400 }
    );
  }

  if (!title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  let desktopUrl: string | null = null;
  let desktopWidth = 0;
  let desktopHeight = 0;
  let mobileUrl: string | null = null;
  let mobileWidth = 0;
  let mobileHeight = 0;

  if (desktopFile && desktopFile.size > 0) {
    const result = await handleFileUpload(desktopFile);
    desktopUrl = result.url;
    desktopWidth = result.width;
    desktopHeight = result.height;
  }

  if (mobileFile && mobileFile.size > 0) {
    const result = await handleFileUpload(mobileFile);
    mobileUrl = result.url;
    mobileWidth = result.width;
    mobileHeight = result.height;
  }

  const wallpaper = await prisma.wallpaper.create({
    data: {
      title: title.trim(),
      tags: tags.trim(),
      desktopUrl,
      desktopWidth,
      desktopHeight,
      mobileUrl,
      mobileWidth,
      mobileHeight,
    },
  });

  return NextResponse.json(wallpaper, { status: 201 });
}
