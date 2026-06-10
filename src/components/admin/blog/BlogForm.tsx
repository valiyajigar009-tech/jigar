"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/Card";
import { Input } from "@/components/admin/ui/Input";
import { Button } from "@/components/admin/ui/Button";
import { RichTextEditor } from "@/components/admin/ui/RichTextEditor";
import { createBlogPost, updateBlogPost } from "@/lib/actions/blog";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function BlogForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    featuredImage: initialData?.featuredImage || "",
    status: initialData?.status || "DRAFT",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    readingTime: initialData?.readingTime || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "title" && !initialData) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContentChange = (content: string) => {
    // Simple reading time calculation
    const words = content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    const readingTime = Math.ceil(words / 200); // 200 words per min
    
    setFormData(prev => ({ ...prev, content, readingTime }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = initialData 
        ? await updateBlogPost(initialData.id, formData)
        : await createBlogPost(formData);

      if (res.success) {
        router.push("/admin/blog");
      } else {
        setError(res.error || "Failed to save post");
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
          <Link href="/admin/blog">
            <Button variant="outline" size="icon" className="rounded-full" type="button">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-outfit">{initialData ? "Edit Post" : "New Post"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" type="button" onClick={() => router.push("/admin/blog")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save size={16} />
            {isSubmitting ? "Saving..." : "Save Post"}
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
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="Post Title" 
                  className="text-2xl h-14 font-bold bg-transparent border-none px-0 focus-visible:ring-0"
                  required 
                />
              </div>
              <div className="space-y-2">
                <RichTextEditor content={formData.content} onChange={handleContentChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Excerpt</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea 
                name="excerpt" 
                value={formData.excerpt} 
                onChange={handleChange}
                rows={3}
                placeholder="A short summary of the post..."
                className="flex w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
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
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL Slug</label>
                <Input name="slug" value={formData.slug} onChange={handleChange} required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input name="featuredImage" value={formData.featuredImage} onChange={handleChange} placeholder="Image URL" />
                {formData.featuredImage && (
                  <div className="mt-2 aspect-video rounded-lg border border-slate-800 overflow-hidden bg-slate-900">
                    <img src={formData.featuredImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Meta Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">SEO Title</label>
                <Input name="seoTitle" value={formData.seoTitle} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SEO Description</label>
                <textarea 
                  name="seoDescription" 
                  value={formData.seoDescription} 
                  onChange={handleChange}
                  rows={3}
                  className="flex w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
