import { MediaGrid } from "@/components/admin/media/MediaGrid";

export default function MediaPage() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Media Library</h1>
          <p className="text-slate-400">Manage all your images, videos, and files</p>
        </div>
      </div>
      
      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-6 min-h-[600px]">
        <MediaGrid />
      </div>
    </div>
  );
}
