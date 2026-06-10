"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Types Definition for Portfolio Config
interface ProjectItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  link: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [accentColor, setAccentColor] = useState("#778da9");
  const [bgColor, setBgColor] = useState("#0d1b2a");

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const res = await fetch("/api/portfolio");
        if (res.ok) {
          const configData = await res.json();
          setProjects(configData.projects || []);
          if (configData.hero) {
            setAccentColor(configData.hero.accentColor);
            setBgColor(configData.hero.bgColor);
          }
        }
      } catch (err) {
        console.error("Data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center text-white" style={{ backgroundColor: bgColor }}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: `${accentColor}40`, borderTopColor: accentColor }}></div>
          <p className="font-outfit text-lg font-medium tracking-wide">Loading Projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden font-sans selection:text-white transition-colors duration-500 py-16 px-6 sm:px-12 lg:px-20"
      style={{ backgroundColor: bgColor, color: "#ffffff" }}
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
          <Link 
            href="/" 
            className="group flex items-center gap-2 px-6 py-3 rounded-full font-outfit font-bold tracking-widest uppercase text-xs border border-white/10 transition-all duration-300 hover:bg-white/5"
            style={{ color: accentColor }}
          >
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Back
          </Link>
          
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-bold font-outfit tracking-[0.25em] uppercase mb-3" style={{ color: accentColor }}>Complete Archive</span>
            <h1 className="text-4xl sm:text-5xl font-black font-outfit tracking-tight text-white mb-4">ALL PROJECTS</h1>
            <div className="h-1 w-20 rounded-full" style={{ backgroundColor: accentColor }}></div>
          </div>
          
          <div className="hidden md:block w-24"></div> {/* spacer for centering */}
        </div>

        {projects.length === 0 ? (
          <div className="text-center text-white/50 py-24 text-lg">No projects found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <a
                key={project.id}
                href={project.link || "#"}
                className="group relative overflow-hidden rounded-3xl aspect-[4/3] bg-slate-900 border border-white/10 transition-all duration-500 hover:-translate-y-2"
                style={{ boxShadow: `0 0 0 rgba(0,0,0,0)` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 20px 40px ${accentColor}30`;
                  e.currentTarget.style.borderColor = accentColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 rgba(0,0,0,0)`;
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <div className="absolute inset-0 z-0">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
                </div>

                <div className="relative z-10 w-full h-full flex flex-col justify-end p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: accentColor }}>
                    {project.category}
                  </span>
                  <h3 className="text-2xl font-outfit font-bold text-white mb-2">{project.title}</h3>
                  <div className="w-0 h-0.5 bg-white group-hover:w-12 transition-all duration-500"></div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
