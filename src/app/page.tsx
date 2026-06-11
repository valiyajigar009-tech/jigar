"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
});

// Types Definition for Portfolio Config
interface HeroConfig {
  title: string;
  email: string;
  phone: string;
  location: string;
  description: string;
  imageUrl: string;
  bgColor: string;
  accentColor: string;
  grayscale: boolean;
  imageFit: string;
  imagePosition: string;
  imageMask: boolean;
}

interface ServiceConfig {
  id: string;
  title: string;
  icon: string;
  description: string;
}

interface WorkflowConfig {
  id: string;
  title: string;
  description: string;
}

interface ResumeItem {
  id: string;
  role?: string;
  company?: string;
  degree?: string;
  school?: string;
  duration: string;
  description: string;
}

interface ResumeConfig {
  experience: ResumeItem[];
  education: ResumeItem[];
}


interface AboutStat {
  label: string;
  value: string;
}

interface AboutConfig {
  name: string;
  headline: string;
  bio: string;
  aboutImageUrl: string;
  skills: string[];
  stats: AboutStat[];
}

interface ProjectItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  link: string;
}

interface PortfolioConfig {
  about: AboutConfig;
  hero: HeroConfig;
  services: ServiceConfig[];
  workflow: WorkflowConfig[];
  resume: ResumeConfig;
  projects: ProjectItem[];
  socials: {
    instagram: string;
    linkedin: string;
    whatsapp: string;
    phone: string;
  };
}

// Default Configuration values
const initialDefaultData: PortfolioConfig = {
  about: {
    name: "Jigar Valiya",
    headline: "Hello,\nI'm Jigar",
    bio: "I am Jigar Valiya, an MCA student specializing in UI/UX and graphic design. I bridge the gap between design and development by combining my foundation in web technologies (HTML, CSS, JS, PHP, MySQL) with a passion for branding and visual design. My focus is on transforming complex ideas into intuitive, user-centered digital experiences through research, wireframing, and thoughtful interface design.",
    aboutImageUrl: "",
    skills: ["Figma", "Adobe XD", "HTML/CSS", "JavaScript"],
    stats: [
      { label: "Design Tool Proficiency", value: "95%" },
      { label: "Coffee Cups", value: "400+" },
      { label: "Pixel Perfection", value: "100%" }
    ]
  },
  hero: {
    title: "HOME",
    email: "j.martin@uptowork.com",
    phone: "774-555-3021222",
    location: "Florida, Orlando — 12529 State Road 535",
    description: "Graphic Designer with over 10 years of experience specializing in IT Department management for international logistics companies...",
    imageUrl: "/demo.png",
    bgColor: "#0d1b2a",
    accentColor: "#778da9",
    grayscale: false,
    imageFit: "cover",
    imagePosition: "top",
    imageMask: false
  },
  socials: {
    instagram: "https://www.instagram.com/jigarr_18?igsh=MWhobWQwZW52c2Zlag==",
    linkedin: "https://www.linkedin.com/in/jigar-valiya-b411a8359?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    whatsapp: "https://wa.me/918200951722",
    phone: "8200951722",
  },
  services: [],
  workflow: [],
  resume: { experience: [], education: [] },
  projects: []
};

export default function PortfolioPage() {
  const [data, setData] = useState<PortfolioConfig>(initialDefaultData);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"hero" | "services" | "workflow" | "resume">("hero");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation state and ref for Resume section
  const [resumeVisible, setResumeVisible] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isGridVisible, setIsGridVisible] = useState(true);

  // Intersection Observer to trigger scroll animations
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setResumeVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (resumeRef.current) {
      observer.observe(resumeRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  // Track mouse for interactive cursor grid effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
        containerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Load configuration from API
  useEffect(() => {
    async function loadPortfolio() {
      try {
        const res = await fetch("/api/portfolio?t=" + new Date().getTime(), { cache: "no-store" });
        if (res.ok) {
          const configData = await res.json();
          setData(configData);
        }
      } catch (err) {
        console.error("Data load error:", err);
        showToast("Configuration load karne me error aayi", "error");
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Save data to API
  const handleSave = async (updatedData: PortfolioConfig) => {
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        setData(updatedData);
        showToast("Changes successfully save ho gaye hain!", "success");
      } else {
        showToast("Save fail ho gaya", "error");
      }
    } catch (err) {
      console.error("Save Error:", err);
      showToast("Server side save logic fail", "error");
    }
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const uploadResult = await res.json();

      if (res.ok && uploadResult.url) {
        const updatedHero = { ...data.hero, imageUrl: uploadResult.url };
        const updatedData = { ...data, hero: updatedHero };
        setData(updatedData);
        await handleSave(updatedData);
        showToast("Image upload ho gayi aur save ho gayi!", "success");
      } else {
        showToast(uploadResult.error || "Upload failed", "error");
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast("File upload network failure", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to trigger file upload
  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0a] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="font-outfit text-lg font-medium tracking-wide">Loading Portfolio...</p>
        </div>
      </div>
    );
  }

  // Icons mapper for services section
  const renderServiceIcon = (iconName: string) => {
    const baseClass = "w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform duration-300";
    switch (iconName) {
      case "Layers":
        return (
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m-4.179-2.25L12 7.5l9.75 4.5-9.75 4.5-9.75-4.5zm0 0l4.179 2.25m11.142-2.25l4.179 2.25m-4.179-2.25L12 16.5 2.25 12m11.142 4.5L12 18l-1.393-.75M12 18v3" />
          </svg>
        );
      case "Code2":
        return (
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
        );
      case "Sparkles":
        return (
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.096.813zM18.625 8.625L18 12l-.625-3.375L14 8l3.375-.625L18 4l.625 3.375L22 8l-3.375.625z" />
          </svg>
        );
      default:
        return (
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        );
    }
  };

  // Icons mapper for skills section
  const renderSkillIcon = (skillName: string) => {
    const baseClass = "w-6 h-6 opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300";
    const lower = skillName.toLowerCase();

    if (lower.includes("illustrator")) {
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.53 10.73c-.1-.31-.19-.61-.29-.92-.1-.31-.19-.6-.27-.89-.08-.28-.15-.54-.22-.78h-.02c-.09.43-.2.86-.34 1.29-.15.48-.3.98-.46 1.48-.14.51-.29.98-.44 1.4h2.54c-.06-.211-.14-.46-.23-.721-.09-.269-.18-.559-.27-.859zM19.75.3H4.25C1.9.3 0 2.2 0 4.55v14.9c0 2.35 1.9 4.25 4.25 4.25h15.5c2.35 0 4.25-1.9 4.25-4.25V4.55C24 2.2 22.1.3 19.75.3zM14.7 16.83h-2.091c-.069.01-.139-.04-.159-.11l-.82-2.38H7.91l-.76 2.35c-.02.09-.1.15-.19.141H5.08c-.11 0-.14-.061-.11-.18L8.19 7.38c.03-.1.06-.21.1-.33.04-.21.06-.43.06-.65-.01-.05.03-.1.08-.11h2.59c.08 0 .12.03.13.08l3.65 10.3c.03.109 0 .16-.1.16zm3.4-.15c0 .11-.039.16-.129.16H16.01c-.1 0-.15-.061-.15-.16v-7.7c0-.1.041-.14.131-.14h1.98c.09 0 .129.05.129.14v7.7zm-.209-9.03c-.231.24-.571.37-.911.35-.33.01-.65-.12-.891-.35-.23-.25-.35-.58-.34-.92-.01-.34.12-.66.359-.89.242-.23.562-.35.892-.35.391 0 .689.12.91.35.22.24.34.56.33.89.01.34-.11.67-.349.92z" />
        </svg>
      );
    }
    if (lower.includes("photoshop")) {
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.85 8.42c-.37-.15-.77-.21-1.18-.2-.26 0-.49 0-.68.01-.2-.01-.34 0-.41.01v3.36c.14.01.27.02.39.02h.53c.39 0 .78-.06 1.15-.18.32-.09.6-.28.82-.53.21-.25.31-.59.31-1.03.01-.31-.07-.62-.23-.89-.17-.26-.41-.46-.7-.57zM19.75.3H4.25C1.9.3 0 2.2 0 4.55v14.899c0 2.35 1.9 4.25 4.25 4.25h15.5c2.35 0 4.25-1.9 4.25-4.25V4.55C24 2.2 22.1.3 19.75.3zm-7.391 11.65c-.399.56-.959.98-1.609 1.22-.68.25-1.43.34-2.25.34-.24 0-.4 0-.5-.01s-.24-.01-.43-.01v3.209c.01.07-.04.131-.11.141H5.52c-.08 0-.12-.041-.12-.131V6.42c0-.07.03-.11.1-.11.17 0 .33 0 .56-.01.24-.01.49-.01.76-.02s.56-.01.87-.02c.31-.01.61-.01.91-.01.82 0 1.5.1 2.06.31.5.17.96.45 1.34.82.32.32.57.71.73 1.14.149.42.229.85.229 1.3.001.86-.199 1.57-.6 2.13zm7.091 3.89c-.28.4-.671.709-1.12.891-.49.209-1.09.318-1.811.318-.459 0-.91-.039-1.359-.129-.35-.061-.7-.17-1.02-.32-.07-.039-.121-.109-.111-.189v-1.74c0-.029.011-.07.041-.09.029-.02.06-.01.09.01.39.23.8.391 1.24.49.379.1.779.15 1.18.15.38 0 .65-.051.83-.141.16-.07.27-.24.27-.42 0-.141-.08-.27-.24-.4-.16-.129-.489-.279-.979-.471-.51-.18-.979-.42-1.42-.719-.31-.221-.569-.51-.761-.85-.159-.32-.239-.67-.229-1.021 0-.43.12-.84.341-1.21.25-.4.619-.72 1.049-.92.469-.239 1.059-.349 1.769-.349.41 0 .83.03 1.24.09.3.04.59.12.86.23.039.01.08.05.1.09.01.04.02.08.02.12v1.63c0 .04-.02.08-.05.1-.09.02-.14.02-.18 0-.3-.16-.62-.27-.96-.34-.37-.08-.74-.13-1.12-.13-.2-.01-.41.02-.601.07-.129.03-.24.1-.31.2-.05.08-.08.18-.08.27s.04.18.101.26c.09.11.209.2.34.27.229.12.47.23.709.33.541.18 1.061.43 1.541.73.33.209.6.49.789.83.16.318.24.67.23 1.029.011.471-.129.94-.389 1.331z" />
        </svg>
      );
    }
    if (lower.includes("indesign")) {
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.25.3C1.9.3 0 2.2 0 4.55v14.9c0 2.35 1.9 4.25 4.25 4.25h15.5c2.35 0 4.25-1.9 4.25-4.25V4.55C24 2.2 22.1.3 19.75.3zm11.31 5.13h2.03c.05-.01.09.03.1.07v9.54c0 .18.01.38.02.6.02.21.03.41.04.58 0 .07-.03.13-.1.16-.52.22-1.07.38-1.63.48-.5.09-1.02.14-1.54.14-.74.01-1.48-.14-2.15-.45-.63-.29-1.15-.77-1.51-1.36-.37-.61-.55-1.37-.55-2.28-.01-.74.18-1.47.55-2.11.38-.65.93-1.19 1.59-1.55.7-.39 1.54-.58 2.53-.58.05 0 .12 0 .21.01s.19.01.31.02V5.54c0-.07.03-.11.1-.11zm-8.93.86h1.95c.06-.01.12.03.13.1.01.01.01.02.01.03v10.26c0 .11-.05.16-.14.16H6.62c-.09 0-.13-.05-.13-.16V6.42c0-.09.05-.13.14-.13zm8.23 4.24c-.39 0-.78.08-1.13.26-.34.17-.63.42-.85.74-.22.32-.33.75-.33 1.27-.01.35.05.7.17 1.03.1.27.25.51.45.71.19.18.42.32.68.4.27.09.55.13.83.13.15 0 .29-.01.42-.02.13.01.25-.01.36-.05v-4.4c-.09-.02-.18-.04-.27-.05-.11-.01-.22-.02-.33-.02z" />
        </svg>
      );
    }
    if (lower.includes("figma")) {
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z" />
        </svg>
      );
    }
    if (lower.includes("front") || lower.includes("html") || lower.includes("css") || lower.includes("react")) {
      return (
        <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      );
    }
    if (lower.includes("back") || lower.includes("node") || lower.includes("database")) {
      return (
        <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.027-.392.05-.59.077m-10.136-3.745L12 14.25l7.636-4.512M12 14.25V21" />
        </svg>
      );
    }

    // Default star icon for others
    return (
      <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-x-hidden font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-500"
      style={{ backgroundColor: data.hero.bgColor, color: "#ffffff" }}
    >
      {/* Interactive Cursor Grid Overlay */}
      <div
        className={`pointer-events-none fixed inset-0 z-[100] mix-blend-screen transition-opacity duration-500 ${isGridVisible ? "opacity-100" : "opacity-0"}`}
        style={{
          backgroundImage: `linear-gradient(${data.hero.accentColor}50 1px, transparent 1px), linear-gradient(90deg, ${data.hero.accentColor}50 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          maskImage: `radial-gradient(circle 150px at var(--mouse-x, -100%) var(--mouse-y, -100%), black 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle 150px at var(--mouse-x, -100%) var(--mouse-y, -100%), black 0%, transparent 100%)`
        }}
      />
      {/* Toast Banner notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl transition-all duration-300 flex items-center gap-2 font-medium tracking-wide ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
          {toast.type === "success" ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          )}
          {toast.message}
        </div>
      )}

      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      {/* CREATIVE FLOATING SOCIAL SIDEBAR */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:bottom-auto md:left-auto md:right-6 md:top-1/2 md:-translate-y-1/2 z-50 flex flex-row md:flex-col gap-4 p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all hover:bg-white/10" style={{ boxShadow: `0 0 20px ${data.hero.accentColor}15` }}>
        {/* Instagram */}
        <a href={data.socials.instagram} target="_blank" rel="noreferrer" className="group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:bg-pink-500 hover:shadow-[0_0_15px_rgba(236,72,153,0.6)] hover:-translate-x-1" title="Instagram">
          <svg className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
        </a>
        {/* WhatsApp */}
        <a href={data.socials.whatsapp} target="_blank" rel="noreferrer" className="group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:bg-[#25D366] hover:shadow-[0_0_15px_rgba(37,211,102,0.6)] hover:-translate-x-1" title="WhatsApp">
          <svg className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
        </a>
        {/* LinkedIn */}
        <a href={data.socials.linkedin} target="_blank" rel="noreferrer" className="group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:bg-[#0077b5] hover:shadow-[0_0_15px_rgba(0,119,181,0.6)] hover:-translate-x-1" title="LinkedIn">
          <svg className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" /></svg>
        </a>
        {/* Call */}
        <a href={`tel:${data.socials.phone}`} className="group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:bg-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.6)] hover:-translate-x-1" title="Call">
          <svg className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.265-3.965-6.861-6.861l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
        </a>
      </div>

      {/* SECTION 1: HERO - NEW DARK MINIMALIST DESIGN (HOME & ABOUT) */}
      <section
        id="home"
        className="relative min-h-[100dvh] md:h-screen w-full overflow-hidden flex flex-col justify-between"
        style={{ backgroundColor: data.hero.bgColor }}
      >
        {/* Navigation bar - matching upload photo */}
        <header className="w-full flex justify-between items-center px-8 md:px-16 py-8 z-30 shrink-0">
          {/* Display Name - Left side */}
          <div className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <span className="font-outfit text-sm font-semibold tracking-[0.2em] uppercase">Jigar Valiya</span>
          </div>

          {/* Admin Link - Right side */}
          <a href="/admin/login" className="font-outfit text-xs font-semibold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 hover:border-white/20">
            Admin
          </a>
        </header>

        {/* Content Layout: 2 Columns */}
        <div className="flex-1 w-full flex flex-col md:flex-row items-center md:items-stretch relative z-20">
          {/* Left Column: Bio Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 md:py-0 md:pl-16 md:pr-10 text-left select-text md:h-full">
            {/* Creative Hero Text - Left Aligned */}
            <div className="relative mb-8 text-left">
              {/* Larger Hello label */}
              <span className="font-outfit text-[clamp(1.25rem,4vw,2.5rem)] font-semibold tracking-[0.35em] uppercase mb-2 block" style={{ color: data.hero.accentColor }}>
                Welcome,
              </span>
              {/* Main tagline */}
              <h1 className="font-outfit font-black text-[clamp(2.5rem,8vw,5.5rem)] leading-[1.1] pb-2 text-white">
                I'm a UI UX & Graphic Designer.
              </h1>
              {/* Left-aligned paragraph */}
              <p className="mt-2 text-white/80 font-inter text-[clamp(0.875rem,2vw,1.125rem)] max-w-full text-left font-light leading-relaxed">
                Fusing striking visual aesthetics with seamless user journeys to engineer digital experiences that leave a lasting impact.
              </p>
            </div>
          </div>

          <div
            className="w-full md:w-1/2 h-[50vh] min-h-[400px] md:min-h-0 md:h-full relative flex items-center justify-center overflow-hidden [&_canvas]:!cursor-default cursor-default flex-shrink-0"
            onMouseEnter={() => setIsGridVisible(false)}
            onMouseLeave={() => setIsGridVisible(true)}
            onPointerDownCapture={(e) => {
              // Custom spatial click detection supporting both mouse and touch
              const rect = e.currentTarget.getBoundingClientRect();
              const clientX = e.clientX;
              const clientY = e.clientY;
              const x = (clientX - rect.left) / rect.width;
              const y = (clientY - rect.top) / rect.height;

              // Give custom names or broad areas to fallback
              // Broadened zones to make clicking easier for Services
              if (x > 0.5 && y > 0.5) {
                // Bottom-Right
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              } else if (x < 0.5 && y > 0.5) {
                // Bottom-Left
                document.getElementById('project')?.scrollIntoView({ behavior: 'smooth' });
              } else if (y <= 0.6) { // Expanded top half slightly
                if (x < 0.3) {
                  // Top-Left
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                } else if (x >= 0.3 && x < 0.7) {
                  // Top-Middle / Center (Services) - widened the clickable zone
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  // Top-Right
                  // Do nothing or map to something
                }
              }
            }}
          >
            <div className="spline-wrapper w-full h-full scale-[0.65] sm:scale-[1.15] md:scale-[1.3] -translate-y-4 sm:-translate-y-8 md:-translate-y-12 transition-transform duration-500 relative pointer-events-auto">
              <Spline 
                scene="https://prod.spline.design/c1piGarzYclIrSek/scene.splinecode" 
                onMouseDown={(e: any) => {
                  try {
                    const name = e.target?.name?.toLowerCase() || '';
                    if (name.includes('service') || name.includes('what')) {
                      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (name.includes('about') || name.includes('resume')) {
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (name.includes('project') || name.includes('portfolio') || name.includes('work')) {
                      document.getElementById('project')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (name.includes('contact')) {
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  } catch (err) {}
                }}
              />
            </div>
          </div>
        </div>


      </section>

      {/* SECTION 2: ABOUT ME */}
      <section
        id="about"
        className="relative min-h-screen w-full overflow-hidden flex flex-col"
        style={{ backgroundColor: data.hero.bgColor }}
      >


        {/* Main Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-stretch min-h-screen">

          {/* LEFT SIDE: Photo Panel (Moved from right) */}
          <div className="w-full md:w-1/2 relative flex items-center justify-center overflow-hidden min-h-[400px] md:min-h-[500px] py-12 md:py-0">



            {/* Corner decoration top-right */}
            <div
              className="absolute top-10 right-10 w-24 h-24 rounded-full opacity-10 blur-2xl"
              style={{ backgroundColor: data.hero.accentColor }}
            />
            <div
              className="absolute bottom-10 left-10 w-40 h-40 rounded-full opacity-5 blur-3xl"
              style={{ backgroundColor: data.hero.accentColor }}
            />

            {/* Photo container with decorative frame */}
            <div
              className="relative z-10 mx-auto w-[90%] sm:w-[380px] md:w-[440px] lg:w-[520px]"
              onMouseEnter={() => setIsGridVisible(false)}
              onMouseLeave={() => setIsGridVisible(true)}
            >
              {/* Floating accent card behind photo removed per user request */}

              {data.about.aboutImageUrl ? (
                <img
                  src={data.about.aboutImageUrl || "/demo.png"}
                  alt={data.about.name}
                  className="relative z-10 w-full aspect-[4/5] object-cover object-center rounded-3xl cursor-default"
                  style={{
                    boxShadow: `0 32px 80px -10px ${data.hero.accentColor}25, 0 0 0 1px ${data.hero.accentColor}15`,
                    pointerEvents: 'none'
                  }}
                />
              ) : null}
            </div>
          </div>

          {/* RIGHT SIDE: Text Content (Moved from left) */}
          <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-8 md:pl-10 md:pr-32 lg:pr-40 py-12 md:py-24 text-left">

            {/* Section label pill */}
            <div className="flex items-center justify-start gap-3 mb-8">
              <div className="h-px w-8" style={{ backgroundColor: data.hero.accentColor }} />
              <span
                className="text-xs font-outfit font-bold tracking-[0.3em] uppercase"
                style={{ color: data.hero.accentColor }}
              >
                About Me
              </span>
            </div>

            {/* Giant "Hello, I'm Jigar" heading */}
            <div className="mb-8 flex flex-col items-start">
              {data.about.headline.split("\n").map((line, i) => (
                <span key={i} className="block font-outfit font-black text-white leading-[1.05] tracking-tight" style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)" }}>
                  {line}
                </span>
              ))}
            </div>

            {/* Bio paragraph with attractive styling */}
            <p className="text-white/70 text-base md:text-lg leading-[1.9] mb-10 mr-auto max-w-[520px] font-inter font-light">
              <span className="text-white font-medium">{data.about.bio.substring(0, 20)}</span>{data.about.bio.substring(20)}
            </p>

            {/* Skills grid with descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10">
              {data.about.skills.map((skill, i) => {
                const getDesc = (s: string) => {
                  const lower = s.toLowerCase();
                  if (lower.includes('figma')) return "UI/UX design, wireframing & interactive prototyping";
                  if (lower.includes('illustrator')) return "Vector graphics, branding & complex illustrations";
                  if (lower.includes('photoshop')) return "Image editing, retouching & visual manipulation";
                  if (lower.includes('indesign')) return "Print, typography & digital page layout design";
                  if (lower.includes('frontend')) return "Modern web development with React & Tailwind";
                  if (lower.includes('backend')) return "Server logic, APIs & Database management";
                  return "Professional expertise & proficiency in this domain";
                };

                return (
                  <div
                    key={i}
                    className="flex flex-col items-start p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 cursor-default bg-slate-900/40"
                    style={{
                      borderColor: `${data.hero.accentColor}30`,
                      boxShadow: `0 4px 20px -10px ${data.hero.accentColor}20`
                    }}
                  >
                    <span className="font-outfit text-sm font-bold tracking-wider uppercase mb-1.5" style={{ color: data.hero.accentColor }}>
                      {skill}
                    </span>
                    <span className="text-white/60 text-xs font-inter leading-relaxed text-left">
                      {getDesc(skill)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-start gap-8">
              {data.about.stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-start">
                  <span
                    className="font-outfit font-black text-4xl leading-none mb-1"
                    style={{ color: data.hero.accentColor }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-white/40 text-xs font-outfit tracking-wider uppercase">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SERVICES */}
      <section id="services" className="relative py-24 bg-slate-950/40 px-6 sm:px-12 lg:px-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center mb-16">
            <span className="text-xs font-bold font-outfit text-indigo-400 tracking-[0.25em] uppercase mb-3">Our Expertise</span>
            <h2 className="text-4xl sm:text-5xl font-black font-outfit tracking-tight text-white mb-4">WHAT I DO</h2>
            <div className="h-1 w-20 bg-indigo-500 rounded-full" style={{ backgroundColor: data.hero.accentColor }}></div>
          </div>

          {data.services.length === 0 ? (
            <div className="text-center text-white/50 py-12">Services configure nahi kiye gaye hain. Customizer use karein.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {data.services.map((service) => (
                <div
                  key={service.id}
                  className="group relative p-8 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/80 transition-all duration-300 hover:-translate-y-2 flex flex-col gap-6"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:text-white"
                    style={{
                      backgroundColor: `${data.hero.accentColor}10`,
                      borderColor: `${data.hero.accentColor}25`
                    }}
                  >
                    {renderServiceIcon(service.icon)}
                  </div>
                  <h3 className="text-2xl font-bold font-outfit text-white tracking-tight">{service.title}</h3>
                  <p className="text-white/60 leading-relaxed text-sm">{service.description}</p>
                </div>
              ))}
            </div>
          )}
        </div></section>

      {/* SECTION: MY WORK (PROJECTS) */}
      <section id="project" className="relative py-24 bg-slate-950 px-6 sm:px-12 lg:px-20 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col items-center justify-center text-center mb-16">
            <span className="text-xs font-bold font-outfit text-indigo-400 tracking-[0.25em] uppercase mb-3">Portfolio</span>
            <h2 className="text-4xl sm:text-5xl font-black font-outfit tracking-tight text-white mb-4">MY WORK</h2>
            <div className="h-1 w-20 bg-indigo-500 rounded-full" style={{ backgroundColor: data.hero.accentColor }}></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {data.projects?.map((project) => (
              <div
                key={project.id}
                className="group relative overflow-hidden rounded-3xl aspect-[4/3] bg-slate-900 border border-white/10 transition-all duration-500 hover:-translate-y-2"
                style={{ boxShadow: `0 0 0 rgba(0,0,0,0)` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 20px 40px ${data.hero.accentColor}30`;
                  e.currentTarget.style.borderColor = data.hero.accentColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 rgba(0,0,0,0)`;
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <div className="absolute inset-0 z-0">
                  <img
                    src={project.imageUrl || "/demo.png"}
                    alt={project.title}
                    className="w-full h-full object-cover transition-all duration-700 grayscale-0 opacity-100 lg:grayscale lg:opacity-60 lg:group-hover:grayscale-0 lg:group-hover:opacity-100 lg:group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent opacity-60 lg:opacity-80 lg:group-hover:opacity-60 transition-opacity duration-500"></div>
                </div>

                <a href={project.link || "#"} target="_blank" rel="noopener noreferrer" className="absolute top-6 right-6 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-500 bg-white/10 p-3 rounded-full text-white backdrop-blur-sm border border-white/20 hover:bg-white/30 hover:-translate-y-1 hover:scale-110 z-30 cursor-pointer flex items-center justify-center shadow-lg" title="View Project">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                </a>

                <div className="relative z-10 w-full h-full flex flex-col justify-end px-6 pb-6 pt-8 translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: data.hero.accentColor }}>
                    {project.category}
                  </span>
                  <h3 className="text-2xl font-outfit font-bold text-white mb-4">{project.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="w-12 lg:w-0 h-0.5 bg-white lg:group-hover:w-12 transition-all duration-500"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="flex justify-center mt-16">
            <a
              href="/projects"
              className="group px-8 py-4 rounded-full font-outfit font-bold tracking-widest uppercase text-sm border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] flex items-center gap-3"
              style={{ borderColor: data.hero.accentColor, color: data.hero.accentColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = data.hero.accentColor;
                e.currentTarget.style.color = '#020617';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = data.hero.accentColor;
              }}
            >
              View All Projects
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 4: RESUME */}
      <section
        id="resume"
        ref={resumeRef}
        className="relative py-24 bg-[#0a0a0a] px-6 sm:px-12 lg:px-20 border-t border-white/5 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto">
          <div
            className="flex flex-col items-center justify-center text-center mb-16 transition-all duration-1000 ease-out transform"
            style={{
              opacity: resumeVisible ? 1 : 0,
              transform: resumeVisible ? 'translateY(0)' : 'translateY(30px)'
            }}
          >
            <span className="text-xs font-bold font-outfit text-indigo-400 tracking-[0.25em] uppercase mb-3">Timeline</span>
            <h2 className="text-4xl sm:text-5xl font-black font-outfit tracking-tight text-white mb-4">MY STORY</h2>
            <div className="h-1 w-20 bg-indigo-500 rounded-full" style={{ backgroundColor: data.hero.accentColor }}></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Column 1: Experience */}
            <div
              className="transition-all duration-1000 ease-out transform"
              style={{
                opacity: resumeVisible ? 1 : 0,
                transform: resumeVisible ? 'translateY(0)' : 'translateY(30px)',
                transitionDelay: '100ms'
              }}
            >
              <div className="flex items-center gap-3 mb-10">
                <div
                  className="w-10 h-10 rounded-xl border flex items-center justify-center"
                  style={{
                    backgroundColor: `${data.hero.accentColor}10`,
                    borderColor: `${data.hero.accentColor}25`,
                    color: data.hero.accentColor
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-2xl font-bold font-outfit text-white">Experience</h3>
              </div>

              {data.resume.experience.length === 0 ? (
                <div className="text-white/40 text-sm">Experience records empty right now.</div>
              ) : (
                <div className="relative space-y-8 pl-4">
                  {/* Timeline vertical line that draws down */}
                  <div
                    className="absolute left-0 top-0 w-[2px] bg-slate-805 origin-top transition-transform duration-1000 ease-out"
                    style={{
                      height: '100%',
                      transform: resumeVisible ? 'scaleY(1)' : 'scaleY(0)',
                      transitionDelay: '200ms',
                      backgroundColor: `${data.hero.accentColor}30`
                    }}
                  />

                  {data.resume.experience.map((exp, index) => (
                    <div
                      key={exp.id}
                      className="relative group pl-6 transition-all duration-1000 ease-out transform"
                      style={{
                        opacity: resumeVisible ? 1 : 0,
                        transform: resumeVisible ? 'translateY(0)' : 'translateY(30px)',
                        transitionDelay: `${index * 150 + 300}ms`
                      }}
                    >
                      {/* Timeline dot that pops in */}
                      <div
                        className="absolute left-[-22px] top-1.5 w-3 h-3 rounded-full bg-slate-900 border-2 transition-all duration-500 ease-out group-hover:bg-indigo-500"
                        style={{
                          borderColor: data.hero.accentColor,
                          transform: resumeVisible ? 'scale(1)' : 'scale(0)',
                          transitionDelay: `${index * 150 + 400}ms`
                        }}
                      />
                      <span className="text-xs font-bold font-outfit tracking-wider" style={{ color: data.hero.accentColor }}>{exp.duration}</span>
                      <h4 className="text-lg font-bold font-outfit text-white mt-1">{exp.role}</h4>
                      <p className="text-sm font-semibold text-white/50">{exp.company}</p>
                      <p className="text-sm text-white/60 mt-3 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Education */}
            <div
              className="transition-all duration-1000 ease-out transform"
              style={{
                opacity: resumeVisible ? 1 : 0,
                transform: resumeVisible ? 'translateY(0)' : 'translateY(30px)',
                transitionDelay: '150ms'
              }}
            >
              <div className="flex items-center gap-3 mb-10">
                <div
                  className="w-10 h-10 rounded-xl border flex items-center justify-center"
                  style={{
                    backgroundColor: `${data.hero.accentColor}10`,
                    borderColor: `${data.hero.accentColor}25`,
                    color: data.hero.accentColor
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                </div>
                <h3 className="text-2xl font-bold font-outfit text-white">Education</h3>
              </div>

              {data.resume.education.length === 0 ? (
                <div className="text-white/40 text-sm">Education records empty right now.</div>
              ) : (
                <div className="relative space-y-8 pl-4">
                  {/* Timeline vertical line that draws down */}
                  <div
                    className="absolute left-0 top-0 w-[2px] bg-slate-805 origin-top transition-transform duration-1000 ease-out"
                    style={{
                      height: '100%',
                      transform: resumeVisible ? 'scaleY(1)' : 'scaleY(0)',
                      transitionDelay: '250ms',
                      backgroundColor: `${data.hero.accentColor}30`
                    }}
                  />

                  {data.resume.education.map((edu, index) => (
                    <div
                      key={edu.id}
                      className="relative group pl-6 transition-all duration-1000 ease-out transform"
                      style={{
                        opacity: resumeVisible ? 1 : 0,
                        transform: resumeVisible ? 'translateY(0)' : 'translateY(30px)',
                        transitionDelay: `${index * 150 + 350}ms`
                      }}
                    >
                      {/* Timeline dot that pops in */}
                      <div
                        className="absolute left-[-22px] top-1.5 w-3 h-3 rounded-full bg-slate-900 border-2 transition-all duration-500 ease-out group-hover:bg-indigo-500"
                        style={{
                          borderColor: data.hero.accentColor,
                          transform: resumeVisible ? 'scale(1)' : 'scale(0)',
                          transitionDelay: `${index * 150 + 450}ms`
                        }}
                      />
                      <span className="text-xs font-bold font-outfit tracking-wider" style={{ color: data.hero.accentColor }}>{edu.duration}</span>
                      <h4 className="text-lg font-bold font-outfit text-white mt-1">{edu.degree}</h4>
                      <p className="text-sm font-semibold text-white/50">{edu.school}</p>
                      <p className="text-sm text-white/60 mt-3 leading-relaxed">{edu.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CONTACT ME */}
      <section
        id="contact"
        className="relative py-24 bg-slate-900 px-6 sm:px-12 lg:px-20 border-t border-white/5"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center mb-16">
            <span className="text-xs font-bold font-outfit text-indigo-400 tracking-[0.25em] uppercase mb-3">Get in touch</span>
            <h2 className="text-4xl sm:text-5xl font-black font-outfit tracking-tight text-white mb-4">CONTACT ME</h2>
            <div className="h-1 w-20 bg-indigo-500 rounded-full" style={{ backgroundColor: data.hero.accentColor }}></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <h3 className="text-2xl font-bold font-outfit text-white">Let's discuss your next project</h3>
              <p className="text-white/60 leading-relaxed">
                I'm always open to discussing product design work or partnership opportunities. Feel free to reach out to me via email or phone.
              </p>

              <div className="space-y-6 mt-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-white/10" style={{ color: data.hero.accentColor }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1">Email</p>
                    <a href={`mailto:${data.hero.email}`} className="text-lg font-medium text-white hover:underline decoration-white/30 transition-all">{data.hero.email}</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-white/10" style={{ color: data.hero.accentColor }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-lg font-medium text-white">{data.hero.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-white/10" style={{ color: data.hero.accentColor }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1">Location</p>
                    <p className="text-lg font-medium text-white">{data.hero.location}</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="p-8 rounded-3xl bg-slate-950 border border-white/10 shadow-2xl relative overflow-hidden"
              onMouseEnter={() => setIsGridVisible(false)}
              onMouseLeave={() => setIsGridVisible(true)}
            >
              <div className="absolute inset-0 opacity-10" style={{ backgroundColor: data.hero.accentColor }}></div>
              <form className="relative z-10 space-y-6" onSubmit={async (e) => { 
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const name = formData.get("name");
                const email = formData.get("email");
                const message = formData.get("message");
                const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                if(submitBtn) submitBtn.disabled = true;
                
                try {
                  const res = await fetch("/api/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, message })
                  });
                  if (res.ok) {
                    showToast("Message sent successfully!", "success");
                    form.reset();
                  } else {
                    showToast("Failed to send message.", "error");
                  }
                } catch(err) {
                  showToast("Network error.", "error");
                } finally {
                  if(submitBtn) submitBtn.disabled = false;
                }
              }}>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 block">Name</label>
                  <input name="name" type="text" required placeholder="John Doe" className="w-full min-h-[44px] bg-slate-900/80 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 block">Email</label>
                  <input name="email" type="email" required placeholder="john@example.com" className="w-full min-h-[44px] bg-slate-900/80 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 block">Message</label>
                  <textarea name="message" required rows={4} placeholder="How can I help you?" className="w-full min-h-[120px] bg-slate-900/80 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors resize-none"></textarea>
                </div>
                <button type="submit" className="w-full py-4 min-h-[44px] rounded-xl font-bold tracking-wide text-white transition-transform hover:-translate-y-1 hover:shadow-2xl disabled:opacity-50" style={{ backgroundColor: data.hero.accentColor }}>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative py-12 bg-slate-950 text-center border-t border-white/5 text-white/40 text-sm">
        <div className="max-w-6xl mx-auto px-6">
          <p>© 2026 Personal Portfolio. All rights reserved.</p>
        </div>
      </footer>

      {/* FLOATING CUSTOMIZE SIDEBAR BUTTON REMOVED PER USER REQUEST */}

      {/* CUSTOMIZATION DRAWER OVERLAY */}
      {isEditorOpen && (
        <>
          <div
            onClick={() => setIsEditorOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          ></div>
          <div className="fixed right-0 top-0 h-full w-[450px] max-w-full bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col font-sans text-slate-100 animate-slide-in">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-outfit font-black text-xl tracking-tight text-white uppercase">Portfolio Builder</h3>
                <p className="text-xs text-slate-400 mt-1">Configure layout, details and image uploads.</p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Customizer tabs */}
            <div className="flex border-b border-slate-800 text-xs font-semibold uppercase tracking-wider overflow-x-auto scrollbar-none shrink-0 bg-slate-950/45">
              {(["hero", "services", "workflow", "resume"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-4 text-center border-b-2 whitespace-nowrap transition-all cursor-pointer ${activeTab === tab ? "border-indigo-500 text-white bg-slate-900/60" : "border-transparent text-slate-400 hover:text-white"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Customizer content options */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: HERO CONFIG */}
              {activeTab === "hero" && (
                <div className="space-y-4">
                  <h4 className="font-outfit text-sm font-bold text-indigo-400 tracking-wider uppercase">Landing Typography</h4>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Header Section Title</label>
                    <input
                      type="text"
                      value={data.hero.title}
                      onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <h4 className="font-outfit text-sm font-bold text-indigo-400 tracking-wider uppercase pt-4">Contact Info</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={data.hero.email}
                        onChange={(e) => setData({ ...data, hero: { ...data.hero, email: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={data.hero.phone}
                        onChange={(e) => setData({ ...data, hero: { ...data.hero, phone: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Location Details</label>
                      <input
                        type="text"
                        value={data.hero.location}
                        onChange={(e) => setData({ ...data, hero: { ...data.hero, location: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">About Bio Description</label>
                    <textarea
                      value={data.hero.description}
                      onChange={(e) => setData({ ...data, hero: { ...data.hero, description: e.target.value } })}
                      rows={5}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:border-indigo-500 focus:outline-none resize-none"
                    />
                  </div>

                  <h4 className="font-outfit text-sm font-bold text-indigo-400 tracking-wider uppercase pt-4">Colors & Photo Effects</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Background Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={data.hero.bgColor}
                          onChange={(e) => setData({ ...data, hero: { ...data.hero, bgColor: e.target.value } })}
                          className="h-9 w-9 bg-transparent border-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={data.hero.bgColor}
                          onChange={(e) => setData({ ...data, hero: { ...data.hero, bgColor: e.target.value } })}
                          className="w-24 bg-slate-950 border border-slate-800 rounded-lg text-xs p-1 flex-1 text-center"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Theme Accent Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={data.hero.accentColor}
                          onChange={(e) => setData({ ...data, hero: { ...data.hero, accentColor: e.target.value } })}
                          className="h-9 w-9 bg-transparent border-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={data.hero.accentColor}
                          onChange={(e) => setData({ ...data, hero: { ...data.hero, accentColor: e.target.value } })}
                          className="w-24 bg-slate-950 border border-slate-800 rounded-lg text-xs p-1 flex-1 text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-slate-800 rounded-xl bg-slate-950 mt-2">
                    <div>
                      <label className="text-xs font-semibold block text-slate-200">Grayscale Photo Filter</label>
                      <span className="text-[10px] text-slate-500 block">Convert image to black & white just like screenshot.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={data.hero.grayscale}
                      onChange={(e) => setData({ ...data, hero: { ...data.hero, grayscale: e.target.checked } })}
                      className="h-5 w-5 rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-slate-800 rounded-xl bg-slate-950 mt-2">
                    <div>
                      <label className="text-xs font-semibold block text-slate-200">Soft Edge Vignette Mask</label>
                      <span className="text-[10px] text-slate-500 block">Fades rectangular background edges into page.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={data.hero.imageMask}
                      onChange={(e) => setData({ ...data, hero: { ...data.hero, imageMask: e.target.checked } })}
                      className="h-5 w-5 rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                  </div>

                  {/* Image alignment and fit properties */}
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Image Fit</label>
                      <select
                        value={data.hero.imageFit || "cover"}
                        onChange={(e) => setData({ ...data, hero: { ...data.hero, imageFit: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                      >
                        <option value="cover">Cover (Stretch Fill)</option>
                        <option value="contain">Contain (Fit Inside)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Image Position</label>
                      <select
                        value={data.hero.imagePosition || "top"}
                        onChange={(e) => setData({ ...data, hero: { ...data.hero, imagePosition: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                      >
                        <option value="top">Top</option>
                        <option value="center">Center</option>
                        <option value="bottom">Bottom</option>
                      </select>
                    </div>
                  </div>

                  <h4 className="font-outfit text-sm font-bold text-indigo-400 tracking-wider uppercase pt-4">Portrait Upload</h4>
                  <div className="p-4 border border-slate-800 rounded-2xl bg-slate-950 flex flex-col items-center gap-3">
                    {data.hero.imageUrl ? (
                      <div className="flex items-center gap-3 w-full">
                        <img src={data.hero.imageUrl || "/demo.png"} className="w-12 h-12 rounded-lg object-contain bg-slate-800" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{data.hero.imageUrl}</p>
                          <p className="text-[10px] text-slate-500">Local storage saved portrait</p>
                        </div>
                        <button
                          onClick={triggerImageUpload}
                          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-xs text-slate-400 mb-2">No portrait photo selected.</p>
                        <button
                          onClick={triggerImageUpload}
                          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer"
                        >
                          Select Image File
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: SERVICES CONFIG */}
              {activeTab === "services" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-outfit text-sm font-bold text-indigo-400 tracking-wider uppercase">Services Offered</h4>
                    <button
                      onClick={() => {
                        const newService: ServiceConfig = {
                          id: `s_${Date.now()}`,
                          title: "New Service",
                          icon: "Code2",
                          description: "Short details about this new specialty."
                        };
                        setData({ ...data, services: [...data.services, newService] });
                      }}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium cursor-pointer flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      Add Service
                    </button>
                  </div>

                  <div className="space-y-4">
                    {data.services.map((service, index) => (
                      <div key={service.id} className="p-4 border border-slate-800 rounded-2xl bg-slate-950 space-y-3 relative">
                        <button
                          onClick={() => {
                            const updated = data.services.filter((s) => s.id !== service.id);
                            setData({ ...data, services: updated });
                          }}
                          className="absolute right-3 top-3 text-slate-500 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        <span className="text-[10px] font-bold text-indigo-400/80">SERVICE #{index + 1}</span>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Title</label>
                          <input
                            type="text"
                            value={service.title}
                            onChange={(e) => {
                              const updated = [...data.services];
                              updated[index].title = e.target.value;
                              setData({ ...data, services: updated });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Icon Type</label>
                          <select
                            value={service.icon}
                            onChange={(e) => {
                              const updated = [...data.services];
                              updated[index].icon = e.target.value;
                              setData({ ...data, services: updated });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none cursor-pointer"
                          >
                            <option value="Layers">Layers Icon</option>
                            <option value="Code2">Code Icon</option>
                            <option value="Sparkles">Sparkles Icon</option>
                            <option value="Flash">Flash Icon</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Description</label>
                          <textarea
                            value={service.description}
                            onChange={(e) => {
                              const updated = [...data.services];
                              updated[index].description = e.target.value;
                              setData({ ...data, services: updated });
                            }}
                            rows={2}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: WORKFLOW CONFIG */}
              {activeTab === "workflow" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-outfit text-sm font-bold text-indigo-400 tracking-wider uppercase">Workflow Steps</h4>
                    <button
                      onClick={() => {
                        const newStep: WorkflowConfig = {
                          id: `w_${Date.now()}`,
                          title: "New Workflow Step",
                          description: "Short details explaining this part of the process."
                        };
                        setData({ ...data, workflow: [...data.workflow, newStep] });
                      }}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium cursor-pointer flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      Add Step
                    </button>
                  </div>

                  <div className="space-y-4">
                    {data.workflow.map((step, index) => (
                      <div key={step.id} className="p-4 border border-slate-800 rounded-2xl bg-slate-950 space-y-3 relative">
                        <button
                          onClick={() => {
                            const updated = data.workflow.filter((w) => w.id !== step.id);
                            setData({ ...data, workflow: updated });
                          }}
                          className="absolute right-3 top-3 text-slate-500 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        <span className="text-[10px] font-bold text-indigo-400/80">STEP #{index + 1}</span>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Step Title</label>
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => {
                              const updated = [...data.workflow];
                              updated[index].title = e.target.value;
                              setData({ ...data, workflow: updated });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Description</label>
                          <textarea
                            value={step.description}
                            onChange={(e) => {
                              const updated = [...data.workflow];
                              updated[index].description = e.target.value;
                              setData({ ...data, workflow: updated });
                            }}
                            rows={3}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: RESUME TIMELINE CONFIG */}
              {activeTab === "resume" && (
                <div className="space-y-6">
                  {/* Experience block list */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-outfit text-sm font-bold text-indigo-400 tracking-wider uppercase">Professional Experience</h4>
                      <button
                        onClick={() => {
                          const newItem: ResumeItem = {
                            id: `e_${Date.now()}`,
                            role: "New Role",
                            company: "Company Name",
                            duration: "2025 - 2026",
                            description: "Primary key achievements and tasks summary."
                          };
                          setData({
                            ...data,
                            resume: { ...data.resume, experience: [...data.resume.experience, newItem] }
                          });
                        }}
                        className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg font-medium cursor-pointer flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Add Job
                      </button>
                    </div>

                    <div className="space-y-4">
                      {data.resume.experience.map((exp, index) => (
                        <div key={exp.id} className="p-4 border border-slate-800 rounded-2xl bg-slate-950 space-y-3 relative">
                          <button
                            onClick={() => {
                              const updated = data.resume.experience.filter((x) => x.id !== exp.id);
                              setData({ ...data, resume: { ...data.resume, experience: updated } });
                            }}
                            className="absolute right-3 top-3 text-slate-500 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                          <span className="text-[10px] font-bold text-indigo-400/80">JOB TIMELINE #{index + 1}</span>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-slate-400 block mb-1">Role/Job Title</label>
                              <input
                                type="text"
                                value={exp.role || ""}
                                onChange={(e) => {
                                  const updated = [...data.resume.experience];
                                  updated[index].role = e.target.value;
                                  setData({ ...data, resume: { ...data.resume, experience: updated } });
                                }}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400 block mb-1">Company</label>
                              <input
                                type="text"
                                value={exp.company || ""}
                                onChange={(e) => {
                                  const updated = [...data.resume.experience];
                                  updated[index].company = e.target.value;
                                  setData({ ...data, resume: { ...data.resume, experience: updated } });
                                }}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Duration Years</label>
                            <input
                              type="text"
                              value={exp.duration}
                              onChange={(e) => {
                                const updated = [...data.resume.experience];
                                updated[index].duration = e.target.value;
                                setData({ ...data, resume: { ...data.resume, experience: updated } });
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Description</label>
                            <textarea
                              value={exp.description}
                              onChange={(e) => {
                                const updated = [...data.resume.experience];
                                updated[index].description = e.target.value;
                                setData({ ...data, resume: { ...data.resume, experience: updated } });
                              }}
                              rows={2}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none resize-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education block list */}
                  <div className="space-y-4 pt-6 border-t border-slate-800">
                    <div className="flex justify-between items-center">
                      <h4 className="font-outfit text-sm font-bold text-indigo-400 tracking-wider uppercase">Academic Education</h4>
                      <button
                        onClick={() => {
                          const newItem: ResumeItem = {
                            id: `ed_${Date.now()}`,
                            degree: "New Degree",
                            school: "Academy / College",
                            duration: "2021 - 2024",
                            description: "Primary courses, achievements, and highlights."
                          };
                          setData({
                            ...data,
                            resume: { ...data.resume, education: [...data.resume.education, newItem] }
                          });
                        }}
                        className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg font-medium cursor-pointer flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Add School
                      </button>
                    </div>

                    <div className="space-y-4">
                      {data.resume.education.map((edu, index) => (
                        <div key={edu.id} className="p-4 border border-slate-800 rounded-2xl bg-slate-950 space-y-3 relative">
                          <button
                            onClick={() => {
                              const updated = data.resume.education.filter((x) => x.id !== edu.id);
                              setData({ ...data, resume: { ...data.resume, education: updated } });
                            }}
                            className="absolute right-3 top-3 text-slate-500 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                          <span className="text-[10px] font-bold text-indigo-400/80">SCHOOL TIMELINE #{index + 1}</span>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-slate-400 block mb-1">Degree Title</label>
                              <input
                                type="text"
                                value={edu.degree || ""}
                                onChange={(e) => {
                                  const updated = [...data.resume.education];
                                  updated[index].degree = e.target.value;
                                  setData({ ...data, resume: { ...data.resume, education: updated } });
                                }}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400 block mb-1">Academy / School</label>
                              <input
                                type="text"
                                value={edu.school || ""}
                                onChange={(e) => {
                                  const updated = [...data.resume.education];
                                  updated[index].school = e.target.value;
                                  setData({ ...data, resume: { ...data.resume, education: updated } });
                                }}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Duration Years</label>
                            <input
                              type="text"
                              value={edu.duration}
                              onChange={(e) => {
                                const updated = [...data.resume.education];
                                updated[index].duration = e.target.value;
                                setData({ ...data, resume: { ...data.resume, education: updated } });
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Description</label>
                            <textarea
                              value={edu.description}
                              onChange={(e) => {
                                const updated = [...data.resume.education];
                                updated[index].description = e.target.value;
                                setData({ ...data, resume: { ...data.resume, education: updated } });
                              }}
                              rows={2}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none resize-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}


            </div>

            {/* Save panel CTA */}
            <div className="p-6 border-t border-slate-800 bg-slate-950 flex gap-4 shrink-0">
              <button
                onClick={() => {
                  handleSave(data);
                  setIsEditorOpen(false);
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-center text-sm shadow-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                Save Changes
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/portfolio");
                    if (res.ok) {
                      const backup = await res.json();
                      setData(backup);
                      showToast("Config reset successfully!", "success");
                    }
                  } catch (e) {
                    showToast("Failed to reset config", "error");
                  }
                  setIsEditorOpen(false);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl text-center text-sm transition-all cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
