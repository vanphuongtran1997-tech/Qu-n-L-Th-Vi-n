import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { CSHARP_FILES } from '../data/csharpSourceCode';

/**
 * Tạo và tải gói ZIP hoàn chỉnh của Project C# .NET 8 WPF & SQLite
 * Kèm file Batch: build_and_publish_exe.bat để người dùng chỉ cần nhấp đúp là tự sinh ra file .EXE duy nhất!
 */
export async function downloadCompleteCSharpProjectZip() {
  const zip = new JSZip();
  const rootFolder = zip.folder('LibraryManagementSystem');

  if (!rootFolder) {
    throw new Error('Failed to create zip folder');
  }

  // 1. Thêm toàn bộ các file code C#, XAML, json, csproj vào đúng cấu trúc thư mục
  for (const file of CSHARP_FILES) {
    rootFolder.file(file.path, file.code);
  }

  // 2. Thêm file Batch tự động chạy tạo file .exe với 1 click
  const oneClickBuildBat = `@echo off
chcp 65001 >nul
title Đóng Gói Tự Động LibraryManagementSystem.exe (.NET 8)
color 0b

echo ===============================================================================
echo       HỆ THỐNG QUẢN LÝ THƯ VIỆN CỤC BỘ (OFFLINE LIBRARY MANAGEMENT SYSTEM)
echo            TỰ ĐỘNG ĐÓNG GÓI RA 1 FILE .EXE DUY NHẤT (SELF-CONTAINED)
echo ===============================================================================
echo.

:: 1. Kiểm tra môi trường .NET SDK
where dotnet >nul 2>nul
if %errorlevel% neq 0 (
    echo [LỖI]: Máy tính của bạn chưa cài đặt .NET 8 SDK!
    echo Vui lòng tải và cài đặt miễn phí tại: https://dotnet.microsoft.com/download/dotnet/8.0
    echo (Chọn .NET 8.0 SDK x64 cho Windows)
    echo.
    pause
    exit /b 1
)

echo [1/3] Đang khôi phục các gói thư viện NuGet (SQLite, OpenCvSharp, JSON)...
dotnet restore
if %errorlevel% neq 0 (
    echo [LỖI]: Không thể tải thư viện NuGet. Vui lòng kiểm tra kết nối mạng.
    pause
    exit /b 1
)

echo.
echo [2/3] Đang biên dịch và đóng gói thành 1 FILE .EXE DUY NHẤT (win-x64, Self-Contained)...
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -p:EnableCompressionInSingleFile=true -p:PublishTrimmed=false -o ./PublishOutput

if %errorlevel% neq 0 (
    echo [LỖI]: Quá trình xuất bản (Publish) thất bại!
    pause
    exit /b 1
)

echo.
echo ===============================================================================
echo [THÀNH CÔNG RỰC RỠ]!
echo File .EXE độc lập đã được tạo tại thư mục:
echo %~dp0PublishOutput\\LibraryManagementSystem.exe
echo.
echo Bạn có thể copy file "LibraryManagementSystem.exe" sang bất kỳ máy tính Windows 10/11
echo nào để sử dụng ngay mà không cần cài đặt thêm phần mềm nào!
echo ===============================================================================
echo.

:: Mở thư mục chứa file .exe vừa tạo
explorer "%~dp0PublishOutput"
pause
`;

  rootFolder.file('build_and_publish_exe.bat', oneClickBuildBat);

  // 3. Thêm file hướng dẫn nhanh tiếng Việt
  const readmeContent = `# HƯỚNG DẪN TẠO FILE .EXE CÀI ĐẶT TRÊN MÁY TÍNH WINDOWS

Chào bạn, đây là mã nguồn toàn diện của dự án C# .NET 8 & SQLite Offline Library Management System.

## CÁCH 1: TẠO FILE .EXE TỰ ĐỘNG CHỈ VỚI 1 CLICK (KHUYÊN DÙNG)
1. Hãy chắc chắn máy tính của bạn đã có **.NET 8 SDK** (Tải tại: https://dotnet.microsoft.com/download/dotnet/8.0).
2. Nhấp đúp chuột vào file: **\`build_and_publish_exe.bat\`**
3. Chương trình sẽ tự động tải các gói thư viện (SQLite, OpenCV Camera) và đóng gói thành file duy nhất:
   \`PublishOutput\\LibraryManagementSystem.exe\`
4. Thư mục chứa file \`.exe\` sẽ tự động bật lên cho bạn!

## CÁCH 2: MỞ BẰNG VISUAL STUDIO 2022
1. Mở Visual Studio 2022 -> Chọn **Open a project or solution**.
2. Chọn file \`LibraryManagementSystem.csproj\`.
3. Nhấp chuột phải vào Project -> Chọn **Publish**.
4. Chọn Folder -> Hoàn tất -> Nhấn nút **Publish**.

## CÁCH 3: CHẠY LỆNH TRONG CMD / POWERSHELL
Mở Terminal tại thư mục này và chạy lệnh:
\`\`\`bash
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -p:EnableCompressionInSingleFile=true -p:PublishTrimmed=false -o ./PublishOutput
\`\`\`

Sau khi hoàn tất, file \`LibraryManagementSystem.exe\` chạy 100% độc lập, tự động tạo file database \`library.db\` và thư mục ảnh \`BookImages/\` ngay bên cạnh.
`;

  rootFolder.file('README_HUONG_DAN_TAO_EXE.txt', readmeContent);

  // Sinh blob zip và kích hoạt tải về máy
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'LibraryManagementSystem_DotNet8_Windows_Project.zip');
}
