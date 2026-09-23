import React from 'react';
import { 
  Minus, Square, X, Laptop, Code2, Database, BookOpen, 
  Wifi, HardDrive, Camera, ShieldCheck 
} from 'lucide-react';

interface DesktopWindowFrameProps {
  activeTab: 'runtime' | 'code' | 'sqlite' | 'guide';
  onSelectTab: (tab: 'runtime' | 'code' | 'sqlite' | 'guide') => void;
  children: React.ReactNode;
  dbRecordCount: number;
}

export const DesktopWindowFrame: React.FC<DesktopWindowFrameProps> = ({
  activeTab,
  onSelectTab,
  children,
  dbRecordCount
}) => {
  return (
    <div id="desktop-window-container" className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Windows 11 Title Bar */}
      <header id="window-titlebar" className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded bg-sky-600 flex items-center justify-center text-white font-bold text-[10px] shadow-sm shadow-sky-500/30">
            C#
          </div>
          <span className="font-semibold text-slate-200 tracking-wide">
            Offline Library Management System
          </span>
          <span className="text-slate-500 font-normal">|</span>
          <span className="px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-800/60 text-sky-300 text-[10px] font-mono">
            .NET 8.0-windows (win-x64)
          </span>
          <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[10px] font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            SQLite: Cục bộ (Offline)
          </span>
        </div>

        {/* Tab View Switcher inside Title Bar / Top Ribbon */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-0.5 rounded-md border border-slate-800">
          <button
            id="tab-runtime-btn"
            onClick={() => onSelectTab('runtime')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-all ${
              activeTab === 'runtime'
                ? 'bg-sky-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Ứng dụng Trực quan (WPF App)</span>
          </button>

          <button
            id="tab-code-btn"
            onClick={() => onSelectTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-all ${
              activeTab === 'code'
                ? 'bg-sky-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Mã nguồn C# .NET 8 (Solution)</span>
          </button>

          <button
            id="tab-sqlite-btn"
            onClick={() => onSelectTab('sqlite')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-all ${
              activeTab === 'sqlite'
                ? 'bg-sky-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>SQLite Inspector ({dbRecordCount})</span>
          </button>

          <button
            id="tab-guide-btn"
            onClick={() => onSelectTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-all ${
              activeTab === 'guide'
                ? 'bg-sky-600 text-white font-medium shadow-sm'
                : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="font-semibold">Tải &amp; Tạo File .EXE</span>
            <span className="px-1 py-0.2 text-[9px] rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              PC
            </span>
          </button>
        </div>

        {/* Windows Window Control Buttons */}
        <div className="flex items-center gap-2 text-slate-400">
          <button 
            id="btn-window-minimize"
            title="Thu nhỏ (Minimize)"
            className="w-7 h-6 flex items-center justify-center hover:bg-slate-800 rounded text-slate-300 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button 
            id="btn-window-maximize"
            title="Phóng to (Maximize)"
            className="w-7 h-6 flex items-center justify-center hover:bg-slate-800 rounded text-slate-300 transition-colors"
          >
            <Square className="w-2.5 h-2.5" />
          </button>
          <button 
            id="btn-window-close"
            title="Đóng ứng dụng"
            className="w-7 h-6 flex items-center justify-center hover:bg-rose-600 hover:text-white rounded text-slate-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="window-content" className="flex-1 overflow-hidden relative">
        {children}
      </main>

      {/* Desktop App Status Bar */}
      <footer id="window-statusbar" className="flex items-center justify-between px-3 py-1 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <HardDrive className="w-3.5 h-3.5" />
            <span>SQLite: \library.db (Cục bộ cùng thư mục .exe)</span>
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:flex items-center gap-1.5 text-sky-400">
            <Wifi className="w-3.5 h-3.5" />
            <span>Hybrid ISBN Lookup: Google Books API v1 (Online chớp nhoáng)</span>
          </span>
          <span className="hidden lg:inline text-slate-600">|</span>
          <span className="hidden lg:flex items-center gap-1.5 text-violet-400">
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Service: OpenCvSharp4 / DirectShow</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Self-Contained Single-File</span>
          </span>
          <span className="text-slate-500 font-mono text-[10px]">v1.0.0-Release</span>
        </div>
      </footer>
    </div>
  );
};
