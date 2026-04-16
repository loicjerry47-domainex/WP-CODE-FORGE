import React, { useState } from 'react';
import { Download, File, FolderOpen, Code, Webhook, Box, Check, ExternalLink } from 'lucide-react';
import { obsidianFiles } from './data/obsidian';
import { meridianFiles } from './data/meridian';
import { jengaFiles } from './data/jenga';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const projects = [
  {
    id: 'obsidian',
    name: 'Obsidian Theme',
    description: 'A premium dark-mode business and portfolio theme designed for creative professionals.',
    type: 'WordPress Theme',
    icon: <Box className="w-5 h-5" />,
    files: obsidianFiles,
    folder: 'obsidian',
    accent: '#c9a44a'
  },
  {
    id: 'meridian',
    name: 'Meridian Theme',
    description: 'A modern, conversion-focused theme designed for SaaS companies and digital agencies.',
    type: 'WordPress Theme',
    icon: <Webhook className="w-5 h-5" />,
    files: meridianFiles,
    folder: 'meridian',
    accent: '#6366f1'
  },
  {
    id: 'jenga',
    name: 'Jenga Analytics',
    description: 'Lightweight self-hosted analytics and performance dashboard for WordPress.',
    type: 'WordPress Plugin',
    icon: <Code className="w-5 h-5" />,
    files: jengaFiles,
    folder: 'jenga-analytics',
    accent: '#10b981'
  }
];

export default function App() {
  const [activeProject, setActiveProject] = useState(projects[0]);
  const [activeFile, setActiveFile] = useState(Object.keys(projects[0].files)[0]);
  const [isZipping, setIsZipping] = useState(false);

  const handleDownload = async () => {
    setIsZipping(true);
    const zip = new JSZip();
    const folder = zip.folder(activeProject.folder);
    
    if (folder) {
      Object.entries(activeProject.files).forEach(([filepath, content]) => {
        folder.file(filepath, content as string);
      });
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${activeProject.folder}.zip`);
    setIsZipping(false);
  };

  const fileExt = activeFile.split('.').pop() || 'text';
  let languageClass = "language-markup";
  if (fileExt === 'php') languageClass = "language-php";
  if (fileExt === 'css') languageClass = "language-css";
  if (fileExt === 'js' || fileExt === 'ts') languageClass = "language-javascript";

  return (
    <div className="flex h-screen bg-[#050508] text-[#f0f0f5] font-sans p-6 gap-4 overflow-hidden" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Sidebar - Plugin Card Style */}
      <div 
        className="w-72 flex flex-col rounded-[20px] border border-white/10 overflow-hidden relative shrink-0"
        style={{ background: 'linear-gradient(180deg, #12121a 0%, #1a1a2e 100%)' }}
      >
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-tight text-[#f0f0f5] flex items-center gap-2">
            <Code className="w-6 h-6 text-[#c9a44a]" />
            WP Code Forge
          </h1>
          <p className="text-xs text-[#9999aa] mt-2 leading-relaxed">Production-ready outputs</p>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <h2 className="text-xs uppercase tracking-widest text-[#9999aa] font-bold mb-3 px-2">Generated Projects</h2>
          <div className="space-y-2">
            {projects.map(proj => {
              const isActive = activeProject.id === proj.id;
              return (
                <button
                  key={proj.id}
                  onClick={() => {
                    setActiveProject(proj);
                    setActiveFile(Object.keys(proj.files)[0]);
                  }}
                  style={isActive ? { backgroundColor: `${proj.accent}1a`, color: proj.accent, boxShadow: `inset 0 0 0 1px ${proj.accent}` } : {}}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200",
                    !isActive && "text-[#9999aa] hover:bg-white/5 hover:text-[#f0f0f5]"
                  )}
                >
                  <div style={{ color: isActive ? proj.accent : '#9999aa' }}>{proj.icon}</div>
                  <div>
                    <div className="font-bold text-[14px]">{proj.name}</div>
                    <div className="text-[11px] opacity-80 mt-0.5 tracking-wider uppercase font-bold">{proj.type}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-5 border-t border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#9999aa] uppercase tracking-wider font-bold">Author</div>
            <div className="text-[#f0f0f5] text-xs font-bold mt-0.5">Loic Hazoume</div>
          </div>
          <div className="w-[80px] h-[30px] rounded-md border border-white/10 flex flex-col justify-end gap-[2px] overflow-hidden p-1 bg-black/20">
            <div className="w-full h-1 bg-[#c9a44a]/40 rounded-sm"></div>
            <div className="w-full h-1.5 bg-[#6366f1]/60 rounded-sm"></div>
            <div className="w-full h-2 bg-[#10b981] rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0">
        {/* Header - Hero Card Style */}
        <div 
          className="px-8 py-6 rounded-[20px] border flex items-center justify-between shrink-0 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #12121a 0%, #0a0a0f 100%)', borderColor: activeProject.accent }}
        >
          <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] pointer-events-none rounded-full blur-2xl" style={{ background: `radial-gradient(circle, ${activeProject.accent}26 0%, transparent 70%)` }}></div>
          <div className="relative z-10 flex-1 pr-6">
            <span 
              className="inline-block px-3 py-1 rounded-full text-[11px] uppercase font-bold tracking-widest mb-3 border bg-opacity-10 backdrop-blur-sm"
              style={{ color: activeProject.accent, borderColor: activeProject.accent, backgroundColor: `${activeProject.accent}1a` }}
            >
              Current Project
            </span>
            <h2 className="text-[32px] font-bold text-[#f0f0f5] tracking-tight leading-none mb-2">{activeProject.name}</h2>
            <p className="text-sm text-[#9999aa] max-w-xl line-clamp-2 leading-relaxed">{activeProject.description}</p>
          </div>
          <button
            onClick={handleDownload}
            disabled={isZipping}
            style={{ backgroundColor: activeProject.accent, color: '#000' }}
            className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-[8px] font-bold transition-transform active:scale-95 disabled:opacity-50 text-[13px] relative z-10 border-none cursor-pointer"
          >
            {isZipping ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            {isZipping ? 'ZIPPED!' : `DOWNLOAD ${activeProject.folder.toUpperCase()}.ZIP`}
          </button>
        </div>

        {/* Workspace Grid */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* File Explorer - Normal Card */}
          <div className="w-64 rounded-[20px] border border-white/10 bg-[#12121a] overflow-y-auto hidden md:flex flex-col shrink-0">
            <div className="p-6">
              <div className="flex items-center gap-2 text-xs font-bold text-[#f0f0f5] uppercase tracking-wider mb-5">
                <FolderOpen className="w-4 h-4 text-[#9999aa]" />
                <span className="truncate">/{activeProject.folder}</span>
              </div>
              <div className="space-y-1">
                {Object.keys(activeProject.files).map(filepath => {
                  const parts = filepath.split('/');
                  const filename = parts.pop();
                  const depth = parts.length;
                  const isFileActive = activeFile === filepath;
                  return (
                    <button
                      key={filepath}
                      onClick={() => setActiveFile(filepath)}
                      style={isFileActive ? { paddingLeft: `${depth * 12 + 8}px`, backgroundColor: `${activeProject.accent}1a`, color: activeProject.accent } : { paddingLeft: `${depth * 12 + 8}px` }}
                      className={cn(
                        "w-full flex items-center gap-2 pr-3 py-2 rounded-lg text-[13px] transition-colors text-left",
                        !isFileActive && "text-[#9999aa] hover:bg-white/5 hover:text-[#f0f0f5]"
                      )}
                    >
                      <File className="w-[14px] h-[14px] shrink-0" style={{ color: isFileActive ? activeProject.accent : '#6b7280' }} />
                      <span className="truncate">{filename}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Editor - Normal Card */}
          <div className="flex-1 flex flex-col rounded-[20px] border border-white/10 bg-[#12121a] overflow-hidden min-w-0">
            <div className="h-[52px] border-b border-white/10 flex items-center px-4 shrink-0 bg-black/20">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-[13px] bg-black/40 text-[#f0f0f5] ring-1 ring-white/10">
                <File className="w-[14px] h-[14px]" style={{ color: activeProject.accent }} />
                <span className="font-mono">{activeFile}</span>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6 relative group bg-transparent">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(activeProject.files[activeFile]);
                  }}
                  className="px-4 py-2 bg-[#c9a44a] text-black text-[11px] rounded-[8px] font-bold uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all border-none cursor-pointer"
                >
                  Copy Code
                </button>
              </div>
              <pre className="font-mono text-[13px] leading-relaxed text-[#9999aa] w-full h-full overflow-auto inline-block">
                <code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {activeProject.files[activeFile]}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
