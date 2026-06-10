"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/Card";
import { Input } from "@/components/admin/ui/Input";
import { Button } from "@/components/admin/ui/Button";
import { createProject, updateProject } from "@/lib/actions/project";
import { Save, ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

export function ProjectForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setFormData(prev => ({ ...prev, thumbnail: data.file.url }));
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    shortDescription: initialData?.shortDescription || "",
    fullDescription: initialData?.fullDescription || "",
    category: initialData?.category || "UI/UX Design",
    thumbnail: initialData?.thumbnail || "",
    liveUrl: initialData?.liveUrl || "",
    githubUrl: initialData?.githubUrl || "",
    status: initialData?.status || "PUBLISHED",
    featured: initialData?.featured || false,
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    
    // Auto generate slug from title if title is changed and no slug exists
    if (name === "title" && !initialData) {
      setFormData(prev => ({
        ...prev,
        [name]: val,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = initialData 
        ? await updateProject(initialData.id, formData)
        : await createProject(formData);

      if (res.success) {
        router.push("/admin/projects");
      } else {
        setError(res.error || "Failed to save project");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/projects">
            <Button variant="outline" size="icon" className="rounded-full" type="button">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-outfit">{initialData ? "Edit Project" : "New Project"}</h1>
            <p className="text-slate-400 text-sm">Fill in the details for your portfolio project.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" type="button" onClick={() => router.push("/admin/projects")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save size={16} />
            {isSubmitting ? "Saving..." : "Save Project"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Core details about this project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Title</label>
                <Input name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL Slug</label>
                <Input name="slug" value={formData.slug} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Short Description</label>
                <textarea 
                  name="shortDescription" 
                  value={formData.shortDescription} 
                  onChange={handleChange}
                  rows={2}
                  className="flex w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Description</label>
                <textarea 
                  name="fullDescription" 
                  value={formData.fullDescription} 
                  onChange={handleChange}
                  rows={6}
                  className="flex w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Links & SEO</CardTitle>
              <CardDescription>External links and search engine optimization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Live URL</label>
                  <Input name="liveUrl" value={formData.liveUrl} onChange={handleChange} placeholder="https://" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">GitHub URL</label>
                  <Input name="githubUrl" value={formData.githubUrl} onChange={handleChange} placeholder="https://github.com/..." />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SEO Title</label>
                <Input name="seoTitle" value={formData.seoTitle} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SEO Description</label>
                <Input name="seoDescription" value={formData.seoDescription} onChange={handleChange} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input name="category" value={formData.category} onChange={handleChange} placeholder="e.g. UI/UX Design" required />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="featured" 
                  name="featured" 
                  checked={formData.featured} 
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="featured" className="text-sm font-medium">Feature this project on homepage</label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Thumbnail URL</label>
                <div className="flex gap-2">
                  <Input name="thumbnail" value={formData.thumbnail} onChange={handleChange} placeholder="/uploads/image.png" className="flex-1" />
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? "..." : <Upload size={16} />}
                  </Button>
                </div>
                {formData.thumbnail && (
                  <div className="mt-2 aspect-video rounded-lg border border-slate-800 overflow-hidden bg-slate-900">
                    <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
