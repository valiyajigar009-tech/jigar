"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/Card";
import { Input } from "@/components/admin/ui/Input";
import { Button } from "@/components/admin/ui/Button";
import { Save, Upload } from "lucide-react";

export function AboutForm({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState(initialData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage("About section saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to save.");
      }
    } catch (err) {
      setMessage("Network error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent re-entry while an upload is already in progress
    if (isUploading) return;

    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: uploadData,
      });
      const data = await res.json();
      if (res.ok && data.file?.url) {
        setFormData((prev: any) => ({ ...prev, aboutImageUrl: data.file.url }));
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
      // Clear the file input so the same file can be selected again and to avoid stale events
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {message && (
        <div className="lg:col-span-3 p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg font-medium">
          {message}
        </div>
      )}

      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>About Me Details</CardTitle>
            <CardDescription>Content displayed in the About section of your portfolio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Headline</label>
              <Input name="headline" value={formData.headline || ""} onChange={handleChange} placeholder="e.g. Hello, I'm Jigar" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Long Bio</label>
              <textarea 
                name="longBio"
                rows={8}
                className="flex w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                value={formData.longBio || ""}
                onChange={handleChange}
                placeholder="Write your story here..."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
            <CardDescription>Displayed next to your bio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <div className="flex gap-2">
                <Input name="aboutImageUrl" value={formData.aboutImageUrl || ""} onChange={handleChange} className="flex-1" placeholder="/uploads/my-photo.jpg" />
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileInputRef.current?.click(); }} disabled={isUploading}>
                  {isUploading ? "..." : <Upload size={16} />}
                </Button>
              </div>
              {formData.aboutImageUrl && (
                <div className="mt-4 aspect-[4/5] rounded-xl border border-slate-800 overflow-hidden bg-slate-900 relative">
                  <img src={formData.aboutImageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3 flex justify-end">
        <Button type="submit" disabled={isSaving} className="gap-2 px-8">
          <Save size={16} />
          {isSaving ? "Saving..." : "Save About Section"}
        </Button>
      </div>
    </form>
  );
}
