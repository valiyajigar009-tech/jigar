"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/Card";
import { Input } from "@/components/admin/ui/Input";
import { Button } from "@/components/admin/ui/Button";
import { Save, User, Mail, Lock } from "lucide-react";
import { signOut } from "next-auth/react";

export function AccountForm({ initialData }: { initialData: { name: string; email: string } }) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ text: "New passwords do not match", type: "error" });
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setMessage({ text: "New password must be at least 6 characters", type: "error" });
      return;
    }

    setIsSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/admin/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: data.message || "Account updated successfully!", type: "success" });
        setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
        
        // If email was changed, sign out so they can log back in with new email
        if (formData.email !== initialData.email) {
          setTimeout(() => {
            signOut({ callbackUrl: "/admin/login" });
          }, 2000);
        }
      } else {
        setMessage({ text: data.error || "Failed to update account.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error occurred.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {message.text && (
        <div className={`p-4 rounded-lg font-medium border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User size={20} /> Profile Details</CardTitle>
          <CardDescription>Update your login email and display name.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <Input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <Input 
                type="email"
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock size={20} /> Security</CardTitle>
          <CardDescription>Change your password. Leave new password fields empty if you only want to update your profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-w-md">
            <label className="text-sm font-medium">New Password <span className="text-slate-500 font-normal">(Optional)</span></label>
            <Input 
              type="password" 
              name="newPassword"
              value={formData.newPassword} 
              onChange={handleChange} 
              placeholder="Enter new password" 
            />
          </div>
          <div className="space-y-2 max-w-md">
            <label className="text-sm font-medium">Confirm New Password <span className="text-slate-500 font-normal">(Optional)</span></label>
            <Input 
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword} 
              onChange={handleChange} 
              placeholder="Confirm new password" 
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-indigo-500/30 bg-indigo-500/5">
        <CardContent className="pt-6">
          <div className="space-y-2 max-w-md mb-6">
            <label className="text-sm font-medium text-indigo-400">Current Password (Required)</label>
            <Input 
              type="password" 
              name="currentPassword"
              value={formData.currentPassword} 
              onChange={handleChange} 
              required
              placeholder="Enter current password to save changes" 
              className="border-indigo-500/30 focus-visible:ring-indigo-500"
            />
            <p className="text-xs text-slate-400">For security reasons, you must enter your current password to save any account changes.</p>
          </div>
          
          <div className="flex justify-start">
            <Button type="submit" disabled={isSaving || !formData.currentPassword} className="gap-2 px-8">
              <Save size={16} />
              {isSaving ? "Saving..." : "Save Account Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
