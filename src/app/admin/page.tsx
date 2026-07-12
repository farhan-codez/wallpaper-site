"use client";

import { useEffect, useRef, useState } from "react";
import {
  Upload,
  LogOut,
  Trash2,
  ArrowLeft,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  Pencil,
  X,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { ConfirmModal } from "@/components/confirm-modal";

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

function FileZone({
  label,
  icon: Icon,
  hint,
  preview,
  file,
  dragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  inputRef,
  onFileChange,
  existingFilename,
  onRemoveExisting,
}: {
  label: string;
  icon: typeof Monitor;
  hint: string;
  preview: string;
  file: File | null;
  dragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  existingFilename: string | null;
  onRemoveExisting: () => void;
}) {
  const hasExisting = existingFilename && !file;
  const hasNew = !!file;

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5 text-foreground">
        <Icon className="w-3.5 h-3.5" />
        {label} <span className="text-muted font-normal">({hint})</span>
      </label>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 sm:p-6 transition-colors cursor-pointer ${
          dragging
            ? "border-foreground bg-card"
            : "border-border hover:border-foreground/30"
        }`}
      >
        {hasExisting && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveExisting();
            }}
            className="absolute top-2 right-2 p-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors z-10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {preview ? (
          <img
            src={preview}
            alt={`${label} preview`}
            className="max-h-32 rounded-lg object-contain"
          />
        ) : hasExisting ? (
          <img
            src={existingFilename}
            alt={`${label} current`}
            className="max-h-32 rounded-lg object-contain opacity-70"
          />
        ) : (
          <>
            <Icon className="w-8 h-8 text-muted mb-1.5" />
            <p className="text-xs text-muted text-center">
              Drag & drop or tap to select
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { theme, toggle } = useTheme();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [dragging, setDragging] = useState<"desktop" | "mobile" | null>(null);
  const desktopRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);

  // Edit state
  const [editing, setEditing] = useState<Wallpaper | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editDesktopFile, setEditDesktopFile] = useState<File | null>(null);
  const [editMobileFile, setEditMobileFile] = useState<File | null>(null);
  const [editDesktopPreview, setEditDesktopPreview] = useState("");
  const [editMobilePreview, setEditMobilePreview] = useState("");
  const [editRemoveDesktop, setEditRemoveDesktop] = useState(false);
  const [editRemoveMobile, setEditRemoveMobile] = useState(false);
  const [editDragging, setEditDragging] = useState<"desktop" | "mobile" | null>(null);
  const [saving, setSaving] = useState(false);
  const editDesktopRef = useRef<HTMLInputElement>(null);
  const editMobileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadWallpapers();
  }, []);

  const loadWallpapers = async () => {
    const res = await fetch("/api/wallpapers");
    const data = await res.json();
    setWallpapers(data);
  };

  const applyFile = (
    f: File,
    setFile: (f: File | null) => void,
    setPreview: (p: string) => void
  ) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e: React.DragEvent, target: "desktop" | "mobile") => {
    e.preventDefault();
    setDragging(null);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) {
      if (target === "desktop") {
        applyFile(f, setDesktopFile, setDesktopPreview);
      } else {
        applyFile(f, setMobileFile, setMobilePreview);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!desktopFile && !mobileFile) || !title.trim()) return;

    setUploading(true);
    const formData = new FormData();
    if (desktopFile) formData.append("desktop", desktopFile);
    if (mobileFile) formData.append("mobile", mobileFile);
    formData.append("title", title.trim());
    formData.append("tags", tags.trim());

    const res = await fetch("/api/wallpapers", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setTitle("");
      setTags("");
      setDesktopFile(null);
      setMobileFile(null);
      setDesktopPreview("");
      setMobilePreview("");
      loadWallpapers();
    }

    setUploading(false);
  };

  // Edit handlers
  const openEdit = (wp: Wallpaper) => {
    setEditing(wp);
    setEditTitle(wp.title);
    setEditTags(wp.tags);
    setEditDesktopFile(null);
    setEditMobileFile(null);
    setEditDesktopPreview("");
    setEditMobilePreview("");
    setEditRemoveDesktop(false);
    setEditRemoveMobile(false);
  };

  const closeEdit = () => {
    setEditing(null);
  };

  const handleEditDrop = (e: React.DragEvent, target: "desktop" | "mobile") => {
    e.preventDefault();
    setEditDragging(null);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) {
      if (target === "desktop") {
        applyFile(f, setEditDesktopFile, setEditDesktopPreview);
      } else {
        applyFile(f, setEditMobileFile, setEditMobilePreview);
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editTitle.trim()) return;
    setSaving(true);

    const formData = new FormData();
    formData.append("title", editTitle.trim());
    formData.append("tags", editTags.trim());

    if (editDesktopFile) formData.append("desktop", editDesktopFile);
    if (editMobileFile) formData.append("mobile", editMobileFile);
    if (editRemoveDesktop) formData.append("removeDesktop", "true");
    if (editRemoveMobile) formData.append("removeMobile", "true");

    const res = await fetch(`/api/wallpapers/${editing.id}`, {
      method: "PATCH",
      body: formData,
    });

    if (res.ok) {
      loadWallpapers();
      closeEdit();
    }

    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    await fetch(`/api/wallpapers/${deleteTarget.id}`, { method: "DELETE" });
    loadWallpapers();
    setDeleting(null);
    setDeleteTarget(null);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const hasFile = desktopFile || mobileFile;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/"
                className="flex items-center gap-1.5 sm:gap-2 text-sm text-muted hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Gallery</span>
              </Link>
              <h1 className="text-lg font-bold">Admin</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
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
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-card border border-border text-sm hover:bg-border transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Upload form */}
        <div className="rounded-2xl bg-card border border-border p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Wallpaper
          </h2>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My awesome wallpaper"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Tags{" "}
                  <span className="text-muted font-normal">
                    (comma separated)
                  </span>
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="quotes, motivation, dark"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FileZone
                label="Desktop"
                icon={Monitor}
                hint="16:9 recommended"
                preview={desktopPreview}
                file={desktopFile}
                dragging={dragging === "desktop"}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging("desktop");
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragging(null);
                }}
                onDrop={(e) => handleDrop(e, "desktop")}
                onClick={() => desktopRef.current?.click()}
                inputRef={desktopRef}
                onFileChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) applyFile(f, setDesktopFile, setDesktopPreview);
                }}
                existingFilename={null}
                onRemoveExisting={() => {}}
              />

              <FileZone
                label="Mobile"
                icon={Smartphone}
                hint="9:16 recommended"
                preview={mobilePreview}
                file={mobileFile}
                dragging={dragging === "mobile"}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging("mobile");
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragging(null);
                }}
                onDrop={(e) => handleDrop(e, "mobile")}
                onClick={() => mobileRef.current?.click()}
                inputRef={mobileRef}
                onFileChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) applyFile(f, setMobileFile, setMobilePreview);
                }}
                existingFilename={null}
                onRemoveExisting={() => {}}
              />
            </div>

            <button
              type="submit"
              disabled={!hasFile || !title.trim() || uploading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>

        {/* Wallpaper list */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-border">
            <h2 className="text-lg font-bold">
              All Wallpapers ({wallpapers.length})
            </h2>
          </div>

          {wallpapers.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-muted">
              No wallpapers uploaded yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {wallpapers.map((wp) => (
                <div
                  key={wp.id}
                  className="flex items-center gap-3 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 hover:bg-background/50 transition-colors"
                >
                  <img
                    src={wp.desktopUrl || wp.mobileUrl || ""}
                    alt={wp.title}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl object-cover bg-background shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{wp.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted mt-0.5">
                      {wp.tags && (
                        <span className="truncate max-w-[120px] sm:max-w-none">
                          {wp.tags}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        {wp.desktopUrl && <Monitor className="w-3 h-3" />}
                        {wp.mobileUrl && (
                          <Smartphone className="w-3 h-3" />
                        )}
                      </span>
                      <span>{wp.downloads} DL</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(wp)}
                      className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-card transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({ id: wp.id, title: wp.title })
                      }
                      disabled={deleting === wp.id}
                      className="p-2 rounded-xl text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">Edit Wallpaper</h3>
              <button
                onClick={closeEdit}
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-background transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Tags{" "}
                  <span className="text-muted font-normal">
                    (comma separated)
                  </span>
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FileZone
                  label="Desktop"
                  icon={Monitor}
                  hint="16:9 recommended"
                  preview={editDesktopPreview}
                  file={editDesktopFile}
                  dragging={editDragging === "desktop"}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setEditDragging("desktop");
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setEditDragging(null);
                  }}
                  onDrop={(e) => handleEditDrop(e, "desktop")}
                  onClick={() => editDesktopRef.current?.click()}
                  inputRef={editDesktopRef}
                  onFileChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) applyFile(f, setEditDesktopFile, setEditDesktopPreview);
                  }}
                  existingFilename={editRemoveDesktop ? null : editing.desktopUrl}
                  onRemoveExisting={() => setEditRemoveDesktop(true)}
                />

                <FileZone
                  label="Mobile"
                  icon={Smartphone}
                  hint="9:16 recommended"
                  preview={editMobilePreview}
                  file={editMobileFile}
                  dragging={editDragging === "mobile"}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setEditDragging("mobile");
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setEditDragging(null);
                  }}
                  onDrop={(e) => handleEditDrop(e, "mobile")}
                  onClick={() => editMobileRef.current?.click()}
                  inputRef={editMobileRef}
                  onFileChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) applyFile(f, setEditMobileFile, setEditMobilePreview);
                  }}
                  existingFilename={editRemoveMobile ? null : editing.mobileUrl}
                  onRemoveExisting={() => setEditRemoveMobile(true)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editTitle.trim() || saving}
                  className="px-5 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete wallpaper"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
