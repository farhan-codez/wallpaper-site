import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
} from "@/lib/cloudinary";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const wallpaper = await prisma.wallpaper.findUnique({ where: { id } });

  if (!wallpaper) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(wallpaper);
}

async function handleFileUpload(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return uploadToCloudinary(buffer);
}

async function removeFile(url: string | null) {
  if (!url) return;
  const publicId = getPublicIdFromUrl(url);
  if (publicId) await deleteFromCloudinary(publicId);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contentType = req.headers.get("content-type") || "";

  const wallpaper = await prisma.wallpaper.findUnique({ where: { id } });
  if (!wallpaper) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const title = (formData.get("title") as string) || wallpaper.title;
    const tags = (formData.get("tags") as string) ?? wallpaper.tags;
    const desktopFile = formData.get("desktop") as File | null;
    const mobileFile = formData.get("mobile") as File | null;
    const removeDesktop = formData.get("removeDesktop") === "true";
    const removeMobile = formData.get("removeMobile") === "true";

    const update: Record<string, unknown> = {
      title: title.trim(),
      tags: tags.trim(),
    };

    if (removeDesktop && wallpaper.desktopUrl) {
      await removeFile(wallpaper.desktopUrl);
      update.desktopUrl = null;
      update.desktopWidth = 0;
      update.desktopHeight = 0;
    }

    if (removeMobile && wallpaper.mobileUrl) {
      await removeFile(wallpaper.mobileUrl);
      update.mobileUrl = null;
      update.mobileWidth = 0;
      update.mobileHeight = 0;
    }

    if (desktopFile && desktopFile.size > 0) {
      if (wallpaper.desktopUrl) await removeFile(wallpaper.desktopUrl);
      const result = await handleFileUpload(desktopFile);
      update.desktopUrl = result.url;
      update.desktopWidth = result.width;
      update.desktopHeight = result.height;
    }

    if (mobileFile && mobileFile.size > 0) {
      if (wallpaper.mobileUrl) await removeFile(wallpaper.mobileUrl);
      const result = await handleFileUpload(mobileFile);
      update.mobileUrl = result.url;
      update.mobileWidth = result.width;
      update.mobileHeight = result.height;
    }

    const updated = await prisma.wallpaper.update({
      where: { id },
      data: update,
    });

    return NextResponse.json(updated);
  }

  const body = await req.json();
  const updated = await prisma.wallpaper.update({
    where: { id },
    data: {
      title: body.title,
      tags: body.tags,
    },
  });

  return NextResponse.json(updated);
}

async function removeFileById(url: string | null) {
  if (!url) return;
  const publicId = getPublicIdFromUrl(url);
  if (publicId) await deleteFromCloudinary(publicId);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const wallpaper = await prisma.wallpaper.findUnique({ where: { id } });

  if (!wallpaper) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await removeFileById(wallpaper.desktopUrl);
  await removeFileById(wallpaper.mobileUrl);

  await prisma.wallpaper.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
