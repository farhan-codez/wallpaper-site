"use client";

import { useEffect, useState, useCallback } from "react";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, Search, Download, Monitor, Smartphone, X } from "lucide-react";
import Link from "next/link";
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

export default function Home() {
  const { theme, toggle } = useTheme();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloadTarget, setDownloadTarget] = useState<Wallpaper | null>(null);

  const fetchWallpapers = useCallback(async (q?: string, tag?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (tag) params.set("tag", tag);
    const res = await fetch(`/api/wallpapers?${params}`);
    const data = await res.json();
    setWallpapers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWallpapers();
  }, [fetchWallpapers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWallpapers(search, activeTag);
  };

  const handleTagClick = (tag: string) => {
    const newTag = activeTag === tag ? "" : tag;
    setActiveTag(newTag);
    fetchWallpapers(search, newTag);
  };

  const allTags = Array.from(
    new Set(
      wallpapers.flatMap((w) =>
        w.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      )
    )
  );

  const getThumbnail = (wp: Wallpaper) =>
    wp.desktopUrl || wp.mobileUrl || "";

  const handleDownload = async (wp: Wallpaper, target?: "desktop" | "mobile") => {
    const url = target === "mobile" ? wp.mobileUrl : target === "desktop" ? wp.desktopUrl : (wp.desktopUrl || wp.mobileUrl);
    if (!url) return;
    const ext = url.split(".").pop()?.split("?")[0] || "jpg";
    const name = wp.title
      .replace(/[^a-zA-Z0-9\s-_]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
    const hasBoth = !!wp.desktopUrl && !!wp.mobileUrl;
    const suffix = hasBoth ? `-${target || "desktop"}` : "";

    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${name}${suffix}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }

    await fetch("/api/wallpapers/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: wp.id }),
    });

    setWallpapers((prev) =>
      prev.map((w) =>
        w.id === wp.id ? { ...w, downloads: w.downloads + 1 } : w
      )
    );
    setDownloadTarget(null);
  };

  const onDownloadClick = (e: React.MouseEvent, wp: Wallpaper) => {
    e.preventDefault();
    e.stopPropagation();
    if (wp.desktopUrl && wp.mobileUrl) {
      setDownloadTarget(wp);
    } else {
      handleDownload(wp);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold tracking-tight">
              wallpapers
            </Link>

            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search wallpapers..."
                  className="w-64 pl-9 pr-4 py-2 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                />
              </form>

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
            </div>
          </div>
        </div>
      </header>

      {/* Mobile search */}
      <div className="sm:hidden px-4 pt-4">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search wallpapers..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
          />
        </form>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeTag === tag
                    ? "bg-foreground text-background"
                    : "bg-card border border-border text-muted hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gallery */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        ) : wallpapers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center px-4">
            <p className="text-xl sm:text-2xl font-bold mb-2">No wallpapers yet</p>
            <p className="text-muted mb-6">
              {search
                ? "Try a different search term"
                : "Check back later for new wallpapers"}
            </p>
          </div>
        ) : (
          <div className="masonry">
            {wallpapers.map((wp) => {
              const thumb = getThumbnail(wp);
              if (!thumb) return null;
              return (
                <Link
                  key={wp.id}
                  href={`/wallpaper/${wp.id}`}
                  className="group relative block rounded-2xl overflow-hidden bg-card border border-border hover:border-foreground/20 transition-all"
                >
                  <img
                    src={thumb}
                    alt={wp.title}
                    className="w-full block"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-semibold text-sm truncate">
                        {wp.title}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {wp.desktopUrl && (
                          <Monitor className="w-3 h-3 text-white/60" />
                        )}
                        {wp.mobileUrl && (
                          <Smartphone className="w-3 h-3 text-white/60" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-white/70 text-xs">
                        <Download className="w-3 h-3" />
                        {wp.downloads}
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={(e) => onDownloadClick(e, wp)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer
        wallpaperCount={wallpapers.length}
        totalDownloads={wallpapers.reduce((acc, w) => acc + w.downloads, 0)}
      />

      {/* Download Modal */}
      {downloadTarget && (
        <div
          className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setDownloadTarget(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-5 w-full max-w-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg text-foreground mb-4 text-center">Download</h3>
            <div className="space-y-2">
              {downloadTarget.desktopUrl && (
                <button
                  onClick={() => handleDownload(downloadTarget, "desktop")}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-background transition-colors text-left"
                >
                  <Monitor className="w-5 h-5 text-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Desktop</p>
                    {downloadTarget.desktopWidth > 0 && (
                      <p className="text-xs text-muted">{downloadTarget.desktopWidth} x {downloadTarget.desktopHeight}</p>
                    )}
                  </div>
                </button>
              )}
              {downloadTarget.mobileUrl && (
                <button
                  onClick={() => handleDownload(downloadTarget, "mobile")}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-background transition-colors text-left"
                >
                  <Smartphone className="w-5 h-5 text-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Mobile</p>
                    {downloadTarget.mobileWidth > 0 && (
                      <p className="text-xs text-muted">{downloadTarget.mobileWidth} x {downloadTarget.mobileHeight}</p>
                    )}
                  </div>
                </button>
              )}
            </div>
            <button
              onClick={() => setDownloadTarget(null)}
              className="w-full mt-4 px-4 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-background transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
