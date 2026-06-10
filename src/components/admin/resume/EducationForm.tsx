"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/Card";
import { Input } from "@/components/admin/ui/Input";
import { Button } from "@/components/admin/ui/Button";
import { createEducation, updateEducation } from "@/lib/actions/resume";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function EducationForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    institution: initialData?.institution || "",
    degree: initialData?.degree || "",
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
    description: initialData?.description || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = initialData 
        ? await updateEducation(initialData.id, formData)
        : await createEducation(formData);

      if (res.success) {
        router.push("/admin/resume");
      } else {
        setError(res.error || "Failed to save education");
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
          <Link href="/admin/resume">
            <Button variant="outline" size="icon" className="rounded-full" type="button">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-outfit">{initialData ? "Edit Education" : "Add Education"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" type="button" onClick={() => router.push("/admin/resume")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save size={16} />
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Education Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Degree</label>
              <Input name="degree" value={formData.degree} onChange={handleChange} required placeholder="e.g. Master of Design" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Institution</label>
              <Input name="institution" value={formData.institution} onChange={handleChange} required placeholder="e.g. NID" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium">Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              rows={4}
              className="flex w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
