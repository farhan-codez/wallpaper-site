"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Share2,
  Maximize,
  Moon,
  Sun,
  X,
  Monitor,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { Footer } from "@/components/footer";

type Wallpaper = {
  id: string;
  title: string;
  tags: string;
  desktopUrl: string | null;
  desktopWidth: number;
  desktopHeight: number;
  mobileUrl: string | null;
  mobileWidth: number;
  mobileHeight: number;
  downloads: number;
  createdAt: string;
};

export default function WallpaperPage() {
  const params = useParams();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/wallpapers/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setWallpaper(data);
        if (!data.desktopUrl && data.mobileUrl) {
          setDevice("mobile");
        }
      }
      setLoading(false);
    };
    load();
  }, [params.id]);

  if (!wallpaper) return null;

  const activeFilename =
    device === "desktop" ? wallpaper.desktopUrl : wallpaper.mobileUrl;
  const activeWidth =
    device === "desktop" ? wallpaper.desktopWidth : wallpaper.mobileWidth;
  const activeHeight =
    device === "desktop" ? wallpaper.desktopHeight : wallpaper.mobileHeight;

  const hasDesktop = !!wallpaper.desktopUrl;
  const hasMobile = !!wallpaper.mobileUrl;

  const handleDownload = async () => {
    if (!activeFilename) return;
    const ext = activeFilename.split(".").pop() || "jpg";
    const name = wallpaper.title
      .replace(/[^a-zA-Z0-9\s-_]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
    const suffix = hasDesktop && hasMobile ? `-${device}` : "";
    const link = document.createElement("a");
    link.href = activeFilename;
    link.download = `${name}${suffix}.${ext}`;
    link.click();

    await fetch("/api/wallpapers/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: wallpaper.id }),
    });

    setWallpaper((prev) =>
      prev ? { ...prev, downloads: prev.downloads + 1 } : prev
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: wallpaper.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!wallpaper || (!hasDesktop && !hasMobile)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold mb-2">Not found</h1>
        <p className="text-muted mb-6">
          This wallpaper doesn&apos;t exist or was deleted.
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-foreground text-background font-medium"
        >
          Back to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button
                onClick={() => router.back()}
                className="shrink-0 p-2 -ml-2 rounded-xl text-muted hover:text-foreground hover:bg-card transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-sm sm:text-lg font-bold truncate">
                {wallpaper.title}
              </h1>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={toggle}
                className="p-2 rounded-xl bg-card border border-border hover:bg-border transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => setLightbox(true)}
                className="p-2 rounded-xl bg-card border border-border hover:bg-border transition-colors"
              >
                <Maximize className="w-4 h-4" />
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-card border border-border hover:bg-border transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Image */}
      <main className="flex-1 max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 w-full">
        {/* Device toggle */}
        {hasDesktop && hasMobile && (
          <div className="flex justify-center mb-4">
            <div className="flex bg-card border border-border rounded-xl p-1">
              <button
                onClick={() => setDevice("desktop")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  device === "desktop"
                    ? "bg-foreground text-background"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Desktop
              </button>
              <button
                onClick={() => setDevice("mobile")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  device === "mobile"
                    ? "bg-foreground text-background"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Mobile
              </button>
            </div>
          </div>
        )}

        <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-card">
          {activeFilename && (
            <img
              src={activeFilename}
              alt={wallpaper.title}
              className="w-full"
            />
          )}
        </div>

        {/* Details */}
        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{wallpaper.title}</h2>
            {wallpaper.tags && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                {wallpaper.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium bg-card border border-border"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-muted">
            {activeWidth > 0 && (
              <span>
                Resolution: {activeWidth} x {activeHeight}
              </span>
            )}
            {hasDesktop && hasMobile && (
              <span className="flex items-center gap-1">
                <Monitor className="w-3 h-3" />
                <Smartphone className="w-3 h-3" />
                Both sizes
              </span>
            )}
            <span>{wallpaper.downloads} downloads</span>
            <span>
              Uploaded: {new Date(wallpaper.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </main>

      <Footer
        wallpaperCount={1}
        totalDownloads={wallpaper.downloads}
      />

      {/* Lightbox */}
      {lightbox && activeFilename && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-3 sm:p-4 cursor-zoom-out"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            onClick={() => setLightbox(false)}
          >
            <X className="w-5 h-5" />
          </button>

          <img
            src={activeFilename}
            alt={wallpaper.title}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
