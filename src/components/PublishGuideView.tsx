import React, { useState } from 'react';
import { 
  BookOpen, Terminal, Check, Copy, HardDrive, 
  Cpu, Layers, AlertTriangle, ShieldCheck, ExternalLink,
  ChevronRight, Sparkles, Download, Play, FolderArchive
} from 'lucide-react';
import { downloadCompleteCSharpProjectZip } from '../utils/zipExporter';

export const PublishGuideView: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isZipping, setIsZipping] = useState(false);

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

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const publishCmd = `dotnet publish -c Release \\
  -r win-x64 \\
  --self-contained true \\
  -p:PublishSingleFile=true \\
  -p:IncludeNativeLibrariesForSelfExtract=true \\
  -p:EnableCompressionInSingleFile=true \\
  -p:PublishTrimmed=false \\
  -o ./PublishOutput`;

  return (
    <div id="publish-guide-view" className="h-full overflow-y-auto p-6 space-y-6">
      {/* Direct Action Box: Download Project & Auto-Build .EXE */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border-2 border-sky-600/60 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Bộ Cài Đặt Cho Windows PC
              </span>
              <span className="text-xs text-slate-400">Trọn Gói C# .NET 8 + WPF + SQLite</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Tải Toàn Bộ Dự Án &amp; Tạo File .EXE Cài Đặt Ngay
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Vì môi trường trình duyệt web không thể tự chạy trình biên dịch Windows nội bộ để xuất file nhị phân x64 trực tiếp, chúng tôi đã đóng gói sẵn toàn bộ Solution kèm script <code className="text-amber-300 font-mono bg-slate-950/70 px-1.5 py-0.5 rounded">build_and_publish_exe.bat</code>. Bạn chỉ cần tải về, giải nén và nhấp đúp chuột là máy tính Windows của bạn sẽ tự động biên dịch ra file <code className="text-emerald-300 font-mono bg-slate-950/70 px-1.5 py-0.5 rounded">LibraryManagementSystem.exe</code> chạy độc lập!
            </p>
          </div>

          <button
            id="btn-download-complete-project-zip"
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="shrink-0 flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            {isZipping ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Đang nén file ZIP...</span>
              </>
            ) : (
              <>
                <FolderArchive className="w-5 h-5" />
                <span>Tải Gói Solution (.ZIP)</span>
              </>
            )}
          </button>
        </div>

        {/* 3 Steps To EXE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="w-6 h-6 rounded-md bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </div>
            <div>
              <strong className="text-slate-200 block text-xs">Tải &amp; Giải Nén</strong>
              <span className="text-slate-400 text-[11px]">Bấm nút trên để tải file ZIP và giải nén vào ổ D:\ hoặc Desktop.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </div>
            <div>
              <strong className="text-slate-200 block text-xs">Chạy Script 1 Click</strong>
              <span className="text-slate-400 text-[11px]">Nhấp đúp vào file <code className="text-amber-300">build_and_publish_exe.bat</code>.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="w-6 h-6 rounded-md bg-violet-500/20 text-violet-400 font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </div>
            <div>
              <strong className="text-slate-200 block text-xs">Nhận File .EXE</strong>
              <span className="text-slate-400 text-[11px]">Thư mục <code className="text-emerald-300">PublishOutput/</code> sẽ tự mở kèm file .exe chạy offline!</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Execution Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: NuGet Packages */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
              <span>Cài Đặt Các Gói NuGet Cần Thiết</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Package Manager CLI</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Mở Terminal (hoặc PowerShell) tại thư mục dự án chứa file <code className="text-slate-300">.csproj</code> và dán các lệnh sau:
          </p>

          <div className="relative rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-slate-200 border border-slate-800">
            <button
              onClick={() => copyToClipboard(`dotnet add package Microsoft.EntityFrameworkCore.Sqlite --version 8.0.8
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.8
dotnet add package OpenCvSharp4 --version 4.10.0.20240616
dotnet add package OpenCvSharp4.WpfExtensions --version 4.10.0.20240616
dotnet add package OpenCvSharp4.runtime.win --version 4.10.0.20240616
dotnet add package System.Text.Json --version 8.0.4`, 1)}
              className="absolute top-2.5 right-2.5 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Sao chép toàn bộ lệnh NuGet"
            >
              {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <pre className="overflow-x-auto pr-8">
              <code>{`# 1. Cơ sở dữ liệu SQLite & EF Core 8
dotnet add package Microsoft.EntityFrameworkCore.Sqlite --version 8.0.8
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.8

# 2. Xử lý Webcam chụp ảnh sách thực tế
dotnet add package OpenCvSharp4 --version 4.10.0.20240616
dotnet add package OpenCvSharp4.WpfExtensions --version 4.10.0.20240616
dotnet add package OpenCvSharp4.runtime.win --version 4.10.0.20240616

# 3. Phân tích cú pháp JSON từ Google Books
dotnet add package System.Text.Json --version 8.0.4`}</code>
            </pre>
          </div>
        </div>

        {/* Step 2: Cấu hình .csproj */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
              <span>Cấu Hình File .csproj Cho Single-File .EXE</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-400">MSBuild Properties</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Thêm các cờ chỉ thị dưới đây vào thẻ <code className="text-sky-300 font-mono">&lt;PropertyGroup&gt;</code> trong file <code className="text-slate-300">LibraryManagementSystem.csproj</code>:
          </p>

          <div className="relative rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-slate-200 border border-slate-800">
            <button
              onClick={() => copyToClipboard(`<PublishSingleFile>true</PublishSingleFile>
<SelfContained>true</SelfContained>
<RuntimeIdentifier>win-x64</RuntimeIdentifier>
<IncludeNativeLibrariesForSelfExtract>true</IncludeNativeLibrariesForSelfExtract>
<EnableCompressionInSingleFile>true</EnableCompressionInSingleFile>
<PublishTrimmed>false</PublishTrimmed>`, 2)}
              className="absolute top-2.5 right-2.5 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Sao chép cấu hình csproj"
            >
              {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <pre className="overflow-x-auto pr-8">
              <code>{`<PublishSingleFile>true</PublishSingleFile>
<SelfContained>true</SelfContained>
<RuntimeIdentifier>win-x64</RuntimeIdentifier>
<IncludeNativeLibrariesForSelfExtract>true</IncludeNativeLibrariesForSelfExtract>
<EnableCompressionInSingleFile>true</EnableCompressionInSingleFile>

<!-- BẮT BUỘC đặt PublishTrimmed = false để EF Core SQLite không bị lỗi runtime -->
<PublishTrimmed>false</PublishTrimmed>`}</code>
            </pre>
          </div>
        </div>

        {/* Step 3: Publish Command */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">3</span>
              <span>Lệnh Đóng Gói Một Bước (One-Click Publish Command)</span>
            </h2>
            <span className="text-[11px] font-mono text-emerald-400">Production Build</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Chạy lệnh CLI sau đây để tạo ngay file thực thi duy nhất trong thư mục <code className="text-sky-300 font-mono">./PublishOutput/</code>:
          </p>

          <div className="relative rounded-lg bg-slate-950 p-4 font-mono text-xs text-sky-300 border border-slate-800">
            <button
              onClick={() => copyToClipboard(publishCmd, 3)}
              className="absolute top-3 right-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Sao chép lệnh Publish"
            >
              {copiedIndex === 3 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <pre className="overflow-x-auto pr-10">
              <code>{publishCmd}</code>
            </pre>
          </div>

          {/* Explanation of parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <strong className="text-sky-400 font-mono block">--self-contained true</strong>
              <span className="text-slate-400 text-[11px]">
                Nhúng toàn bộ runtime .NET 8 vào file .exe. Người dùng không cần cài thêm .NET Desktop Runtime từ Microsoft.
              </span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <strong className="text-emerald-400 font-mono block">IncludeNativeLibrariesForSelfExtract</strong>
              <span className="text-slate-400 text-[11px]">
                Nhúng thư viện C++ native của SQLite (<code className="text-slate-300">e_sqlite3.dll</code>) và OpenCV (<code className="text-slate-300">OpenCvSharpExtern.dll</code>) vào bên trong .exe.
              </span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <strong className="text-amber-400 font-mono block">PublishTrimmed=false</strong>
              <span className="text-slate-400 text-[11px]">
                Bảo toàn Reflection cho Entity Framework Core và Newtonsoft/System.Text.Json, ngăn chặn lỗi crash ngầm khi truy vấn DB.
              </span>
            </div>
          </div>
        </div>

        {/* Step 4: Visual Studio GUI Walkthrough & Deployment Layout */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[11px] flex items-center justify-center font-bold">4</span>
              <span>Cấu Trúc Thư Mục Triển Khai Thực Tế Cạnh File .EXE</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Zero Configuration Deployment</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Sau khi bàn giao ứng dụng cho khách hàng, người dùng chỉ cần chép file <code className="text-sky-300 font-mono">LibraryManagementSystem.exe</code> vào một thư mục bất kỳ (ví dụ <code className="text-slate-300 font-mono">D:\ThuVien\</code>). Khi chạy, hệ thống sẽ tự sinh các file cần thiết:
          </p>

          <div className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800">
            <pre className="overflow-x-auto">
              <code>{`D:\\ThuVien\\
  ├── LibraryManagementSystem.exe    # File ứng dụng độc lập duy nhất (khoảng ~65-80MB)
  ├── library.db                     # Cơ sở dữ liệu SQLite cục bộ (tự động tạo bảng khi bật app)
  └── BookImages/                    # Thư mục chứa ảnh bìa chụp từ webcam cục bộ
       ├── book_9780132350884_20260915_102030.jpg
       ├── book_9780135957059_20260915_104512.jpg
       └── ...`}</code>
            </pre>
          </div>

          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Lưu ý quan trọng khi chạy Offline:</strong> Nếu máy trạm tại quầy thủ thư không có kết nối Internet hoặc mất sóng WiFi, tính năng tra cứu ISBN sẽ tự động timeout sau 5 giây và hiển thị thông báo nhẹ nhàng để thủ thư nhập thông tin bằng tay. Mọi chức năng còn lại (Mượn/Trả, SQLite, Webcam) vẫn hoạt động 100% bình thường mà không bị ảnh hưởng.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
