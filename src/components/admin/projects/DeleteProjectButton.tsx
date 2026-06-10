"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/admin/ui/Button";
import { deleteProject } from "@/lib/actions/project";
import { useState } from "react";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      setIsDeleting(true);
      await deleteProject(projectId);
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-slate-400 hover:text-red-400 disabled:opacity-50"
      onClick={handleDelete}
      disabled={isDeleting}
      title="Delete Project"
    >
      <Trash2 size={16} />
    </Button>
  );
}
