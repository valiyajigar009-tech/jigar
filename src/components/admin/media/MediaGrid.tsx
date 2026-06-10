"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, FolderPlus, Image as ImageIcon, File as FileIcon, MoreVertical, Trash2, Link as LinkIcon, Folder as FolderIcon, X, Search } from "lucide-react";
import { Button } from "@/components/admin/ui/Button";
import { Input } from "@/components/admin/ui/Input";

export function MediaGrid({ onSelect }: { onSelect?: (url: string) => void }) {
  const [files, setFiles] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      const url = currentFolder ? `/api/admin/media?folderId=${currentFolder}` : "/api/admin/media";
      const res = await fetch(url);
      const data = await res.json();
      setFiles(data.files || []);
      setFolders(data.folders || []);
    } catch (error) {
      console.error("Failed to fetch media", error);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [currentFolder]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    if (currentFolder) formData.append("folderId", currentFolder);

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        fetchMedia();
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch("/api/admin/media/folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName, parentId: currentFolder }),
      });
      if (res.ok) {
        setNewFolderName("");
        setIsCreatingFolder(false);
        fetchMedia();
      }
    } catch (error) {
      console.error("Create folder failed", error);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <Input className="pl-10 w-full" placeholder="Search media..." />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" className="gap-2" onClick={() => setIsCreatingFolder(true)}>
            <FolderPlus size={16} />
            New Folder
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,video/*,.pdf" 
          />
          <Button className="gap-2" onClick={handleUploadClick} disabled={isUploading}>
            {isUploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Upload size={16} />}
            Upload
          </Button>
        </div>
      </div>

      {isCreatingFolder && (
        <form onSubmit={handleCreateFolder} className="flex items-center gap-3 p-4 bg-slate-900 rounded-lg border border-slate-800">
          <FolderIcon size={20} className="text-indigo-400" />
          <Input 
            autoFocus
            placeholder="Folder name" 
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="h-9"
          />
          <Button type="submit" size="sm">Create</Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => setIsCreatingFolder(false)}>
            <X size={16} />
          </Button>
        </form>
      )}

      {currentFolder && (
        <div className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-white" onClick={() => setCurrentFolder(null)}>
          <ArrowLeft size={14} /> Back to root
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {/* Render Folders */}
        {folders.map(folder => (
          <div 
            key={folder.id}
            onClick={() => setCurrentFolder(folder.id)}
            className="group relative flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-slate-800/50 cursor-pointer transition-all"
          >
            <FolderIcon size={48} className="text-indigo-500 mb-3" />
            <span className="text-sm font-medium text-center truncate w-full">{folder.name}</span>
          </div>
        ))}

        {/* Render Files */}
        {files.map(file => (
          <div 
            key={file.id} 
            onClick={() => onSelect && onSelect(file.url)}
            className={`group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all ${onSelect ? 'cursor-pointer' : ''}`}
          >
            <div className="aspect-square bg-slate-950 flex items-center justify-center relative">
              {file.mimeType.startsWith('image/') ? (
                <img src={file.url} alt={file.originalName} className="w-full h-full object-cover" />
              ) : (
                <FileIcon size={32} className="text-slate-500" />
              )}
              {!onSelect && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                  <Button size="icon" variant="secondary" className="h-8 w-8 bg-slate-900/80 hover:bg-slate-800 text-white border-none shadow-sm backdrop-blur-sm">
                    <LinkIcon size={14} />
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8 bg-slate-900/80 hover:bg-red-500 hover:text-white text-red-400 border-none shadow-sm backdrop-blur-sm">
                    <Trash2 size={14} />
                  </Button>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-slate-800">
              <p className="text-xs font-medium text-slate-300 truncate" title={file.originalName}>{file.originalName}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
        ))}

        {folders.length === 0 && files.length === 0 && !isUploading && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
            <ImageIcon size={48} className="mb-4 text-slate-600" />
            <p className="font-medium text-slate-400">This folder is empty</p>
            <p className="text-sm mt-1">Upload files to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Just importing ArrowLeft for the back button
import { ArrowLeft } from "lucide-react";
