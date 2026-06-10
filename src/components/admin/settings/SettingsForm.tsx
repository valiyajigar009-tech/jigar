"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/Card";
import { Input } from "@/components/admin/ui/Input";
import { Button } from "@/components/admin/ui/Button";
import { Save } from "lucide-react";

export function SettingsForm({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState(initialData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev: any) => ({ ...prev, [name]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage("Settings saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to save settings.");
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

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Core details about your website.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Site Name</label>
            <Input name="siteName" value={formData.siteName || ""} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Site Description</label>
            <textarea 
              name="siteDescription"
              rows={3}
              className="flex w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              value={formData.siteDescription || ""}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
          <CardDescription>Shown in the Hero and Contact sections.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Contact Email</label>
            <Input name="contactEmail" type="email" value={formData.contactEmail || ""} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Contact Phone</label>
            <Input name="contactPhone" value={formData.contactPhone || ""} onChange={handleChange} />
            <p className="text-xs text-slate-500">This number automatically updates your WhatsApp and Call icons on the portfolio.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Location / Address</label>
            <Input name="address" value={formData.address || ""} onChange={handleChange} placeholder="e.g. India" />
          </div>
        </CardContent>
      </Card>



      <Card>
        <CardHeader>
          <CardTitle>Maintenance Mode</CardTitle>
          <CardDescription>Temporarily disable access to your public portfolio while making large changes.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-medium text-white">Enable Maintenance Mode</h4>
            <p className="text-sm text-slate-400">Your site will display a "Coming Soon" or "Under Maintenance" page.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="maintenanceMode" checked={formData.maintenanceMode || false} onChange={handleChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
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
