"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/Card";
import { Input } from "@/components/admin/ui/Input";
import { Button } from "@/components/admin/ui/Button";
import { Save } from "lucide-react";

export function SocialsForm({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState(initialData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage("Social links saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to save social links.");
      }
    } catch (err) {
      setMessage("Network error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {message && (
        <div className="lg:col-span-2 p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg font-medium">
          {message}
        </div>
      )}

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Sidebar Social Icons</CardTitle>
          <CardDescription>Manage the floating icons on the right side of your portfolio.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Instagram URL</label>
            <Input name="instagram" value={formData.instagram || ""} onChange={handleChange} placeholder="https://instagram.com/..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">LinkedIn URL</label>
            <Input name="linkedin" value={formData.linkedin || ""} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone / WhatsApp Number</label>
            <Input name="contactPhone" value={formData.contactPhone || ""} onChange={handleChange} placeholder="e.g. 8200951722" />
            <p className="text-xs text-slate-500 mt-1">This number drives both the Call icon and the WhatsApp chat link.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">GitHub URL (Optional)</label>
            <Input name="github" value={formData.github || ""} onChange={handleChange} placeholder="https://github.com/..." />
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 flex justify-end">
        <Button type="submit" disabled={isSaving} className="gap-2 px-8">
          <Save size={16} />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
