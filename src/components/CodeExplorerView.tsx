import React, { useState } from 'react';
import { 
  Code2, Copy, Check, FileCode, Folder, FolderOpen, 
  Download, Terminal, Sparkles, FileText, ChevronRight,
  ExternalLink, Search, FolderArchive
} from 'lucide-react';
import { CSHARP_FILES } from '../data/csharpSourceCode';
import { CSharpSourceFile } from '../types/library';
import { downloadCompleteCSharpProjectZip } from '../utils/zipExporter';

export const CodeExplorerView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CSharpSourceFile>(CSHARP_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');
  const [isZipping, setIsZipping] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await downloadCompleteCSharpProjectZip();
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadAllTxt = () => {
    // Tạo file text tổng hợp toàn bộ file nguồn dự án C#
    const combinedContent = CSHARP_FILES.map(f => (
      `================================================================================\n` +
      `FILE: ${f.path}\n` +
      `MÔ TẢ: ${f.description}\n` +
      `================================================================================\n\n` +
      f.code +
      `\n\n\n`
    )).join('');

    const blob = new Blob([combinedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LibraryManagementSystem_Complete_CSharp_DotNet8.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Group files by category
  const categories = [
    { name: 'Project', label: 'Cấu hình & Điểm nhập (.csproj, Program.cs)' },
    { name: 'Models', label: 'Mô hình Dữ liệu (Entities EF Core)' },
    { name: 'Data', label: 'DbContext & SQLite Database' },
    { name: 'Services', label: 'Nghiệp vụ (Google Books, Camera, Mượn/Trả)' },
    { name: 'Views', label: 'Giao diện Windows Desktop (WPF XAML & C#)' },
    { name: 'Docs', label: 'Tài liệu & Hướng dẫn Đóng gói .EXE' },
  ];

  const filteredFiles = CSHARP_FILES.filter(f => 
    f.fileName.toLowerCase().includes(search.toLowerCase()) ||
    f.path.toLowerCase().includes(search.toLowerCase()) ||
    f.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="code-explorer-view" className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-sky-400" />
            <span>Mã Nguồn Toàn Diện C# .NET 8 &amp; SQLite Desktop</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Dự án hoàn chỉnh, chuẩn bị sẵn sàng mở trong Visual Studio 2022 / VS Code hoặc biên dịch qua .NET CLI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-download-solution-zip"
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
            title="Tải về file ZIP chứa toàn bộ cấu trúc dự án .NET 8 kèm file build_and_publish_exe.bat tự sinh .EXE"
          >
            {isZipping ? (
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
            ) : (
              <FolderArchive className="w-4 h-4 text-sky-200" />
            )}
            <span>Tải Trọn Gói Solution (.ZIP Đóng Gói .EXE)</span>
          </button>

          <button
            id="btn-download-solution-txt"
            onClick={handleDownloadAllTxt}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
            title="Tải toàn bộ code dưới dạng 1 file văn bản tổng hợp"
          >
            <Download className="w-3.5 h-3.5" />
            <span>File Tổng Hợp (.txt)</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Solution Tree & Right Code Viewer */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 overflow-hidden">
        {/* Left: Solution Tree Explorer (4 cols) */}
        <div className="lg:col-span-4 flex flex-col bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
          {/* Solution Header */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-slate-200">
                Solution 'LibraryManagementSystem'
              </span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              {CSHARP_FILES.length} files
            </span>
          </div>

          {/* Search Box */}
          <div className="p-2 border-b border-slate-800/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm file theo tên hoặc đường dẫn..."
                className="w-full pl-8 pr-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Tree View list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {categories.map(cat => {
              const catFiles = filteredFiles.filter(f => f.category === cat.name);
              if (catFiles.length === 0) return null;

              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <Folder className="w-3.5 h-3.5 text-amber-400/80" />
                    <span>{cat.name}</span>
                  </div>

                  <div className="space-y-0.5 pl-2">
                    {catFiles.map(file => {
                      const isSelected = selectedFile.path === file.path;

                      return (
                        <div
                          key={file.path}
                          onClick={() => setSelectedFile(file)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all text-xs ${
                            isSelected
                              ? 'bg-sky-600/20 text-sky-300 font-semibold border border-sky-600/40'
                              : 'text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileCode className={`w-3.5 h-3.5 shrink-0 ${
                              file.language === 'csharp' ? 'text-emerald-400' :
                              file.language === 'xml' ? 'text-amber-400' : 'text-sky-400'
                            }`} />
                            <span className="truncate">{file.fileName}</span>
                          </div>
                          {isSelected && <ChevronRight className="w-3 h-3 text-sky-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden">
          {/* File Tab Bar */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-sky-400" />
              <span className="font-mono font-bold text-xs text-white">
                {selectedFile.path}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-[11px] text-slate-400 truncate max-w-sm">
                {selectedFile.description}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Đã chép mã</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao Chép File</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadFile}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors"
                title="Tải file này về máy"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Code Content with Line Numbers */}
          <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-200">
            <pre className="overflow-x-auto">
              <code>
                {selectedFile.code}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
