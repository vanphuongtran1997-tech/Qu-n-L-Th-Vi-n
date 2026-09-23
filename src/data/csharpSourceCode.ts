import { CSharpSourceFile } from '../types/library';

export const CSHARP_FILES: CSharpSourceFile[] = [
  {
    path: 'LibraryManagementSystem.csproj',
    fileName: 'LibraryManagementSystem.csproj',
    language: 'xml',
    category: 'Project',
    description: 'Cấu hình dự án .NET 8, gói NuGet và thông số Publish Single-File .exe độc lập.',
    code: `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net8.0-windows</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <UseWPF>true</UseWPF>
    <ApplicationIcon>Assets\\app_icon.ico</ApplicationIcon>
    <RootNamespace>LibraryManagementSystem</RootNamespace>
    <AssemblyName>LibraryManagementSystem</AssemblyName>
    
    <!-- CẤU HÌNH XUẤT BẢN RA 1 FILE .EXE DUY NHẤT (SELF-CONTAINED) -->
    <PublishSingleFile>true</PublishSingleFile>
    <SelfContained>true</SelfContained>
    <RuntimeIdentifier>win-x64</RuntimeIdentifier>
    <IncludeNativeLibrariesForSelfExtract>true</IncludeNativeLibrariesForSelfExtract>
    <EnableCompressionInSingleFile>true</EnableCompressionInSingleFile>
    
    <!-- Tối ưu kích thước file exe -->
    <PublishTrimmed>false</PublishTrimmed> <!-- false để an toàn với EF Core & SQLite -->
    <DebugType>embedded</DebugType>
  </PropertyGroup>

  <!-- GÓI NUGET BẮT BUỘC CHO HỆ THỐNG -->
  <ItemGroup>
    <!-- SQLite & Entity Framework Core 8 -->
    <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="8.0.8" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.8">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>

    <!-- Xử lý Webcam chụp ảnh sách (OpenCvSharp4 tối ưu & đa nền tảng) -->
    <PackageReference Include="OpenCvSharp4" Version="4.10.0.20240616" />
    <PackageReference Include="OpenCvSharp4.WpfExtensions" Version="4.10.0.20240616" />
    <PackageReference Include="OpenCvSharp4.runtime.win" Version="4.10.0.20240616" />

    <!-- Xử lý JSON từ Google Books API -->
    <PackageReference Include="System.Text.Json" Version="8.0.4" />
  </ItemGroup>

  <!-- Đảm bảo thư mục lưu ảnh BookImages được tạo khi build -->
  <ItemGroup>
    <None Update="appsettings.json">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    </None>
  </ItemGroup>

</Project>`
  },
  {
    path: 'Models/Book.cs',
    fileName: 'Book.cs',
    language: 'csharp',
    category: 'Models',
    description: 'Thực thể đầu sách lưu trữ thông tin meta từ Google Books API hoặc nhập tay.',
    code: `using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibraryManagementSystem.Models
{
    /// <summary>
    /// Bảng lưu trữ thông tin đầu mục sách (Metadata của cuốn sách)
    /// </summary>
    [Table("Books")]
    public class Book
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BookID { get; set; }

        [Required]
        [StringLength(20)]
        public string ISBN { get; set; } = string.Empty;

        [Required]
        [StringLength(250)]
        public string Title { get; set; } = string.Empty;

        [StringLength(150)]
        public string Author { get; set; } = string.Empty;

        [StringLength(150)]
        public string Publisher { get; set; } = string.Empty;

        [StringLength(500)]
        public string? ImagePath { get; set; }

        public string? Description { get; set; }

        [StringLength(20)]
        public string? PublishedYear { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Quan hệ 1-N: Một đầu sách có thể có nhiều bản sao vật lý (BookCopies)
        public virtual ICollection<BookCopy> Copies { get; set; } = new List<BookCopy>();
    }
}`
  },
  {
    path: 'Models/BookCopy.cs',
    fileName: 'BookCopy.cs',
    language: 'csharp',
    category: 'Models',
    description: 'Bản sao vật lý của sách, được quản lý bằng Barcode riêng và trạng thái mượn/trả.',
    code: `using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibraryManagementSystem.Models
{
    public enum CopyStatus
    {
        Available = 1,   // Sẵn sàng cho mượn
        Borrowed = 2,    // Đang có người mượn
        Maintenance = 3  // Đang bảo trì / hư hỏng
    }

    /// <summary>
    /// Đại diện cho từng cuốn sách vật lý nằm trên kệ thư viện
    /// </summary>
    [Table("BookCopies")]
    public class BookCopy
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CopyID { get; set; }

        [Required]
        public int BookID { get; set; }

        [ForeignKey(nameof(BookID))]
        public virtual Book? Book { get; set; }

        /// <summary>
        /// Mã vạch duy nhất dán trên gáy cuốn sách để máy quét barcode đọc được
        /// </summary>
        [Required]
        [StringLength(50)]
        public string Barcode { get; set; } = string.Empty;

        [Required]
        public CopyStatus Status { get; set; } = CopyStatus.Available;

        [StringLength(200)]
        public string? ConditionNote { get; set; } // Ghi chú tình trạng sách (ví dụ: gáy cũ, mất trang)

        public DateTime AddedDate { get; set; } = DateTime.Now;

        // Danh sách các lượt mượn của bản sao này
        public virtual ICollection<Circulation> Circulations { get; set; } = new List<Circulation>();
    }
}`
  },
  {
    path: 'Models/Patron.cs',
    fileName: 'Patron.cs',
    language: 'csharp',
    category: 'Models',
    description: 'Thông tin độc giả thư viện, mã thẻ độc giả quét bằng máy quét Barcode.',
    code: `using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibraryManagementSystem.Models
{
    /// <summary>
    /// Bảng Độc giả / Thành viên Thư viện
    /// </summary>
    [Table("Patrons")]
    public class Patron
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PatronID { get; set; }

        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [StringLength(100)]
        [EmailAddress]
        public string? Email { get; set; }

        [StringLength(20)]
        public string? Phone { get; set; }

        /// <summary>
        /// Mã thẻ thư viện (dùng barcode để quét khi làm thủ tục mượn sách)
        /// </summary>
        [Required]
        [StringLength(50)]
        public string CardBarcode { get; set; } = string.Empty;

        public DateTime MembershipDate { get; set; } = DateTime.Now;

        public bool IsActive { get; set; } = true;

        // Các giao dịch mượn trả của độc giả
        public virtual ICollection<Circulation> Circulations { get; set; } = new List<Circulation>();
    }
}`
  },
  {
    path: 'Models/Circulation.cs',
    fileName: 'Circulation.cs',
    language: 'csharp',
    category: 'Models',
    description: 'Lưu vết các giao dịch Mượn/Trả, thời hạn, ngày trả thực tế và tiền phạt quá hạn.',
    code: `using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibraryManagementSystem.Models
{
    public enum CirculationStatus
    {
        Active = 1,   // Đang mượn
        Returned = 2, // Đã trả
        Overdue = 3   // Đã quá hạn
    }

    /// <summary>
    /// Giao dịch Lưu thông: Mượn và Trả sách
    /// </summary>
    [Table("Circulations")]
    public class Circulation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TransactionID { get; set; }

        [Required]
        public int CopyID { get; set; }

        [ForeignKey(nameof(CopyID))]
        public virtual BookCopy? BookCopy { get; set; }

        [Required]
        public int PatronID { get; set; }

        [ForeignKey(nameof(PatronID))]
        public virtual Patron? Patron { get; set; }

        [Required]
        public DateTime BorrowDate { get; set; } = DateTime.Now;

        [Required]
        public DateTime DueDate { get; set; }

        public DateTime? ReturnDate { get; set; }

        [Required]
        public CirculationStatus Status { get; set; } = CirculationStatus.Active;

        [Column(TypeName = "decimal(18,2)")]
        public decimal FineAmount { get; set; } = 0; // Tiền phạt quá hạn (nếu có)

        [StringLength(250)]
        public string? Notes { get; set; }
    }
}`
  },
  {
    path: 'Data/LibraryDbContext.cs',
    fileName: 'LibraryDbContext.cs',
    language: 'csharp',
    category: 'Data',
    description: 'DbContext Entity Framework Core kết nối SQLite cục bộ 100% offline cạnh file .exe.',
    code: `using Microsoft.EntityFrameworkCore;
using LibraryManagementSystem.Models;
using System.IO;

namespace LibraryManagementSystem.Data
{
    /// <summary>
    /// Context quản lý cơ sở dữ liệu SQLite cục bộ (chạy offline 100%)
    /// </summary>
    public class LibraryDbContext : DbContext
    {
        public DbSet<Book> Books => Set<Book>();
        public DbSet<BookCopy> BookCopies => Set<BookCopy>();
        public DbSet<Patron> Patrons => Set<Patron>();
        public DbSet<Circulation> Circulations => Set<Circulation>();

        public LibraryDbContext()
        {
        }

        public LibraryDbContext(DbContextOptions<LibraryDbContext> options) : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // File database SQLite luôn nằm trong thư mục cài đặt cạnh file .exe
                string appDir = AppDomain.CurrentDomain.BaseDirectory;
                string dbPath = Path.Combine(appDir, "library.db");

                // Tạo chuỗi kết nối SQLite chuẩn
                optionsBuilder.UseSqlite($"Data Source={dbPath}");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Chỉ mục (Index) tăng tốc tìm kiếm quét Barcode và ISBN
            modelBuilder.Entity<BookCopy>()
                .HasIndex(bc => bc.Barcode)
                .IsUnique();

            modelBuilder.Entity<Book>()
                .HasIndex(b => b.ISBN);

            modelBuilder.Entity<Patron>()
                .HasIndex(p => p.CardBarcode)
                .IsUnique();

            // 2. Cấu hình quan hệ Cascading
            modelBuilder.Entity<BookCopy>()
                .HasOne(bc => bc.Book)
                .WithMany(b => b.Copies)
                .HasForeignKey(bc => bc.BookID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Circulation>()
                .HasOne(c => c.BookCopy)
                .WithMany(bc => bc.Circulations)
                .HasForeignKey(c => c.CopyID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Circulation>()
                .HasOne(c => c.Patron)
                .WithMany(p => p.Circulations)
                .HasForeignKey(c => c.PatronID)
                .OnDelete(DeleteBehavior.Restrict);

            // 3. Seed dữ liệu mẫu để chạy thử ngay lần đầu khởi động
            SeedInitialData(modelBuilder);
        }

        private void SeedInitialData(ModelBuilder modelBuilder)
        {
            // Sách mẫu
            modelBuilder.Entity<Book>().HasData(
                new Book
                {
                    BookID = 1,
                    ISBN = "9780132350884",
                    Title = "Clean Code: A Handbook of Agile Software Craftsmanship",
                    Author = "Robert C. Martin",
                    Publisher = "Prentice Hall",
                    PublishedYear = "2008",
                    ImagePath = "BookImages/clean_code.jpg",
                    Description = "Cuốn sách kinh điển về kỹ thuật viết mã sạch và bảo trì phần mềm chuyên nghiệp."
                },
                new Book
                {
                    BookID = 2,
                    ISBN = "9780135957059",
                    Title = "The Pragmatic Programmer: Your Journey To Mastery",
                    Author = "David Thomas, Andrew Hunt",
                    Publisher = "Addison-Wesley Professional",
                    PublishedYear = "2019",
                    ImagePath = "BookImages/pragmatic.jpg",
                    Description = "Cẩm nang tư duy lập trình viên thực tế và phát triển nghề nghiệp lâu dài."
                }
            );

            // Bản sao vật lý
            modelBuilder.Entity<BookCopy>().HasData(
                new BookCopy { CopyID = 1, BookID = 1, Barcode = "BC-CC-001", Status = CopyStatus.Available, AddedDate = DateTime.Now },
                new BookCopy { CopyID = 2, BookID = 1, Barcode = "BC-CC-002", Status = CopyStatus.Borrowed, AddedDate = DateTime.Now },
                new BookCopy { CopyID = 3, BookID = 2, Barcode = "BC-PP-001", Status = CopyStatus.Available, AddedDate = DateTime.Now }
            );

            // Độc giả mẫu
            modelBuilder.Entity<Patron>().HasData(
                new Patron
                {
                    PatronID = 1,
                    FullName = "Nguyễn Văn An",
                    Email = "an.nguyen@example.com",
                    Phone = "0901234567",
                    CardBarcode = "CARD-001",
                    MembershipDate = DateTime.Now.AddMonths(-6),
                    IsActive = true
                },
                new Patron
                {
                    PatronID = 2,
                    FullName = "Trần Thị Mai",
                    Email = "mai.tran@example.com",
                    Phone = "0912345678",
                    CardBarcode = "CARD-002",
                    MembershipDate = DateTime.Now.AddMonths(-2),
                    IsActive = true
                }
            );
        }
    }
}`
  },
  {
    path: 'Services/GoogleBooksService.cs',
    fileName: 'GoogleBooksService.cs',
    language: 'csharp',
    category: 'Services',
    description: 'Gọi Google Books API chớp nhoáng khi nhập ISBN, timeout 5s chống đóng băng khi mất mạng.',
    code: `using System.Net.Http;
using System.Text.Json;

namespace LibraryManagementSystem.Services
{
    public class BookMetadataResult
    {
        public bool Success { get; set; }
        public string? Title { get; set; }
        public string? Author { get; set; }
        public string? Publisher { get; set; }
        public string? PublishedYear { get; set; }
        public string? Description { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? ErrorMessage { get; set; }
    }

    /// <summary>
    /// Dịch vụ kết nối internet chớp nhoáng để lấy thông tin sách từ Google Books API theo mã ISBN.
    /// Nếu không có internet hoặc API lỗi, ứng dụng sẽ báo lỗi nhẹ nhàng và chuyển sang chế độ nhập tay.
    /// </summary>
    public class GoogleBooksService
    {
        private static readonly HttpClient _httpClient;

        static GoogleBooksService()
        {
            _httpClient = new HttpClient
            {
                // Đặt timeout 5 giây để tránh làm ứng dụng bị đơ (hang) nếu mạng chập chờn
                Timeout = TimeSpan.FromSeconds(5)
            };
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "LibraryManagementSystem-DotNet8/1.0");
        }

        /// <summary>
        /// Tra cứu sách bằng mã ISBN qua Google Books API
        /// </summary>
        /// <param name="isbn">Chuỗi ISBN-10 hoặc ISBN-13 (có thể có dấu gạch nối)</param>
        public async Task<BookMetadataResult> LookupByIsbnAsync(string isbn)
        {
            // Chuẩn hóa mã ISBN (bỏ ký tự trắng và dấu gạch nối)
            string cleanIsbn = isbn.Replace("-", "").Replace(" ", "").Trim();

            if (string.IsNullOrWhiteSpace(cleanIsbn))
            {
                return new BookMetadataResult
                {
                    Success = false,
                    ErrorMessage = "Mã ISBN không được để trống."
                };
            }

            string requestUrl = $"https://www.googleapis.com/books/v1/volumes?q=isbn:{cleanIsbn}";

            try
            {
                HttpResponseMessage response = await _httpClient.GetAsync(requestUrl);

                if (!response.IsSuccessStatusCode)
                {
                    return new BookMetadataResult
                    {
                        Success = false,
                        ErrorMessage = $"Lỗi kết nối máy chủ Google Books (HTTP {response.StatusCode}). Vui lòng nhập thông tin bằng tay."
                    };
                }

                string jsonContent = await response.Content.ReadAsStringAsync();

                using JsonDocument doc = JsonDocument.Parse(jsonContent);
                JsonElement root = doc.RootElement;

                if (!root.TryGetProperty("totalItems", out JsonElement totalItems) || totalItems.GetInt32() == 0)
                {
                    return new BookMetadataResult
                    {
                        Success = false,
                        ErrorMessage = $"Không tìm thấy sách nào với mã ISBN '{cleanIsbn}' trên Google Books. Bạn có thể tự nhập tay thông tin."
                    };
                }

                // Lấy thông tin cuốn sách đầu tiên trong kết quả trả về
                JsonElement firstItem = root.GetProperty("items")[0];
                JsonElement volumeInfo = firstItem.GetProperty("volumeInfo");

                var result = new BookMetadataResult { Success = true };

                // 1. Tên sách
                if (volumeInfo.TryGetProperty("title", out JsonElement titleElem))
                {
                    result.Title = titleElem.GetString();
                }

                // 2. Tác giả (gộp danh sách các tác giả)
                if (volumeInfo.TryGetProperty("authors", out JsonElement authorsElem) && authorsElem.ValueKind == JsonValueKind.Array)
                {
                    List<string> authors = new();
                    foreach (JsonElement a in authorsElem.EnumerateArray())
                    {
                        string? name = a.GetString();
                        if (!string.IsNullOrEmpty(name)) authors.Add(name);
                    }
                    result.Author = string.Join(", ", authors);
                }

                // 3. Nhà xuất bản
                if (volumeInfo.TryGetProperty("publisher", out JsonElement publisherElem))
                {
                    result.Publisher = publisherElem.GetString();
                }

                // 4. Năm xuất bản
                if (volumeInfo.TryGetProperty("publishedDate", out JsonElement pubDateElem))
                {
                    string? pubDate = pubDateElem.GetString();
                    if (!string.IsNullOrEmpty(pubDate))
                    {
                        result.PublishedYear = pubDate.Length >= 4 ? pubDate[..4] : pubDate;
                    }
                }

                // 5. Mô tả tóm tắt
                if (volumeInfo.TryGetProperty("description", out JsonElement descElem))
                {
                    result.Description = descElem.GetString();
                }

                // 6. Ảnh bìa online (nếu cần tham khảo)
                if (volumeInfo.TryGetProperty("imageLinks", out JsonElement imagesElem))
                {
                    if (imagesElem.TryGetProperty("thumbnail", out JsonElement thumb))
                    {
                        result.ThumbnailUrl = thumb.GetString()?.Replace("http://", "https://");
                    }
                }

                return result;
            }
            catch (HttpRequestException httpEx)
            {
                // Xử lý mất kết nối Internet hoàn toàn
                return new BookMetadataResult
                {
                    Success = false,
                    ErrorMessage = $"Mất kết nối Internet: {httpEx.Message}. Bạn vẫn có thể tiếp tục nhập sách ngoại tuyến (Offline)."
                };
            }
            catch (TaskCanceledException)
            {
                // Xử lý Timeout quá 5s
                return new BookMetadataResult
                {
                    Success = false,
                    ErrorMessage = "Quá thời gian chờ (Timeout 5s) khi kết nối Google Books. Vui lòng kiểm tra đường truyền hoặc nhập tay."
                };
            }
            catch (Exception ex)
            {
                // Bắt mọi lỗi ngoại lệ khác để ứng dụng tuyệt đối không bị crash
                return new BookMetadataResult
                {
                    Success = false,
                    ErrorMessage = $"Lỗi xử lý dữ liệu sách: {ex.Message}"
                };
            }
        }
    }
}`
  },
  {
    path: 'Services/CameraService.cs',
    fileName: 'CameraService.cs',
    language: 'csharp',
    category: 'Services',
    description: 'Chụp ảnh bìa sách từ Webcam với OpenCvSharp4, lưu file .jpg cục bộ vào thư mục BookImages/.',
    code: `using System.IO;
using System.Windows.Media.Imaging;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;

namespace LibraryManagementSystem.Services
{
    /// <summary>
    /// Quản lý Webcam máy tính để chụp ảnh thực tế bìa cuốn sách và lưu vào thư mục cục bộ BookImages/
    /// </summary>
    public class CameraService : IDisposable
    {
        private VideoCapture? _capture;
        private Mat? _currentFrame;
        private bool _isRunning;
        private readonly string _storageDirectory;

        public event Action<BitmapSource>? FrameUpdated;

        public CameraService()
        {
            // Đường dẫn thư mục BookImages nằm ngay cạnh file thực thi .exe
            _storageDirectory = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "BookImages");

            // Đảm bảo thư mục lưu trữ luôn tồn tại
            if (!Directory.Exists(_storageDirectory))
            {
                Directory.CreateDirectory(_storageDirectory);
            }
        }

        /// <summary>
        /// Khởi động Webcam (Camera 0 mặc định trên laptop/PC)
        /// </summary>
        public bool StartCamera(int cameraIndex = 0)
        {
            try
            {
                StopCamera();

                _capture = new VideoCapture(cameraIndex, VideoCaptureAPIs.DSHOW);
                
                if (!_capture.IsOpened())
                {
                    return false;
                }

                // Cài đặt độ phân giải chuẩn (HD 720p hoặc 640x480)
                _capture.Set(VideoCaptureProperties.FrameWidth, 1280);
                _capture.Set(VideoCaptureProperties.FrameHeight, 720);

                _currentFrame = new Mat();
                _isRunning = true;

                // Chạy vòng lặp đọc luồng camera trong background Task
                Task.Run(() => CaptureLoop());

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        private void CaptureLoop()
        {
            while (_isRunning && _capture != null && !_capture.IsDisposed)
            {
                try
                {
                    if (_capture.Read(_currentFrame) && _currentFrame != null && !_currentFrame.Empty())
                    {
                        // Chuyển đổi OpenCv Mat sang WPF BitmapSource để hiển thị lên UI
                        var bitmap = _currentFrame.ToBitmapSource();
                        bitmap.Freeze(); // Freeze để có thể truyền qua UI Thread an toàn
                        FrameUpdated?.Invoke(bitmap);
                    }
                }
                catch
                {
                    break;
                }

                Thread.Sleep(33); // Tương đương ~30 FPS mượt mà
            }
        }

        /// <summary>
        /// Chụp lại khung hình hiện tại và lưu thành file .jpg vào thư mục BookImages/
        /// </summary>
        /// <param name="isbnOrBarcode">Mã ISBN hoặc Barcode để đặt tên file rõ ràng</param>
        /// <returns>Đường dẫn tương đối của file ảnh để lưu vào cột ImagePath trong database</returns>
        public string? CaptureAndSave(string isbnOrBarcode)
        {
            if (_currentFrame == null || _currentFrame.Empty())
            {
                return null;
            }

            try
            {
                // Làm sạch tên file
                string safeName = string.Join("_", isbnOrBarcode.Split(Path.GetInvalidFileNameChars()));
                string fileName = $"book_{safeName}_{DateTime.Now:yyyyMMdd_HHmmss}.jpg";
                string fullPath = Path.Combine(_storageDirectory, fileName);

                // Lưu ảnh với mức nén chất lượng cao (JPEG Quality 90)
                ImageEncodingParam[] p = { new ImageEncodingParam(ImwriteFlags.JpegQuality, 90) };
                Cv2.ImWrite(fullPath, _currentFrame, p);

                // Trả về đường dẫn tương đối (để ứng dụng chạy được độc lập trên mọi máy)
                return Path.Combine("BookImages", fileName);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Lỗi lưu ảnh chụp từ webcam: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Dừng quay camera và giải phóng tài nguyên
        /// </summary>
        public void StopCamera()
        {
            _isRunning = false;

            if (_capture != null)
            {
                if (!_capture.IsDisposed)
                {
                    _capture.Release();
                }
                _capture.Dispose();
                _capture = null;
            }

            _currentFrame?.Dispose();
            _currentFrame = null;
        }

        public void Dispose()
        {
            StopCamera();
            GC.SuppressFinalize(this);
        }
    }
}`
  },
  {
    path: 'Services/CirculationService.cs',
    fileName: 'CirculationService.cs',
    language: 'csharp',
    category: 'Services',
    description: 'Nghiệp vụ Mượn (Check-out 14 ngày) và Trả (Check-in tính phí phạt trễ hạn 5.000đ/ngày).',
    code: `using Microsoft.EntityFrameworkCore;
using LibraryManagementSystem.Data;
using LibraryManagementSystem.Models;

namespace LibraryManagementSystem.Services
{
    public class CirculationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public decimal FineAmount { get; set; } = 0;
        public int OverdueDays { get; set; } = 0;
        public Circulation? Transaction { get; set; }
    }

    /// <summary>
    /// Xử lý nghiệp vụ Mượn / Trả sách lưu thông nhanh chóng qua máy quét mã vạch
    /// </summary>
    public class CirculationService
    {
        private readonly LibraryDbContext _context;
        public const decimal DAILY_OVERDUE_FINE = 5000m; // Phạt 5.000 VNĐ cho mỗi ngày quá hạn

        public CirculationService(LibraryDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Quy trình Check-out (Mượn sách):
        /// - Quét mã vạch thẻ độc giả + mã vạch bản sao sách
        /// - Tự động tính hạn trả (14 ngày)
        /// - Cập nhật trạng thái bản sao thành "Borrowed"
        /// </summary>
        public async Task<CirculationResult> CheckOutAsync(string patronBarcode, string copyBarcode, int loanDays = 14)
        {
            try
            {
                // 1. Kiểm tra độc giả
                var patron = await _context.Patrons
                    .FirstOrDefaultAsync(p => p.CardBarcode == patronBarcode.Trim() && p.IsActive);

                if (patron == null)
                {
                    return new CirculationResult
                    {
                        Success = false,
                        Message = "Không tìm thấy thông tin độc giả hoặc thẻ đã bị khóa."
                    };
                }

                // 2. Kiểm tra bản sao sách
                var copy = await _context.BookCopies
                    .Include(c => c.Book)
                    .FirstOrDefaultAsync(c => c.Barcode == copyBarcode.Trim());

                if (copy == null)
                {
                    return new CirculationResult
                    {
                        Success = false,
                        Message = "Không tìm thấy bản sao sách với mã vạch này trong kho."
                    };
                }

                if (copy.Status != CopyStatus.Available)
                {
                    return new CirculationResult
                    {
                        Success = false,
                        Message = $"Cuốn sách '{copy.Book?.Title}' hiện không sẵn sàng (Trạng thái: {copy.Status})."
                    };
                }

                // 3. Tạo giao dịch mượn
                var now = DateTime.Now;
                var dueDate = now.AddDays(loanDays).Date.AddHours(23).AddMinutes(59).AddSeconds(59);

                var transaction = new Circulation
                {
                    PatronID = patron.PatronID,
                    CopyID = copy.CopyID,
                    BorrowDate = now,
                    DueDate = dueDate,
                    Status = CirculationStatus.Active,
                    FineAmount = 0
                };

                // Cập nhật trạng thái sách sang Đang mượn
                copy.Status = CopyStatus.Borrowed;

                _context.Circulations.Add(transaction);
                await _context.SaveChangesAsync();

                return new CirculationResult
                {
                    Success = true,
                    Message = $"Mượn sách thành công! Hạn trả: {dueDate:dd/MM/yyyy}.",
                    Transaction = transaction
                };
            }
            catch (Exception ex)
            {
                return new CirculationResult
                {
                    Success = false,
                    Message = $"Lỗi hệ thống khi mượn sách: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// Quy trình Check-in (Trả sách):
        /// - Nhận mã vạch sách
        /// - Kiểm tra thời hạn mượn và tính phí quá hạn
        /// - Đưa trạng thái bản sao về "Available"
        /// </summary>
        public async Task<CirculationResult> CheckInAsync(string copyBarcode)
        {
            try
            {
                // 1. Tìm bản sao sách
                var copy = await _context.BookCopies
                    .Include(c => c.Book)
                    .FirstOrDefaultAsync(c => c.Barcode == copyBarcode.Trim());

                if (copy == null)
                {
                    return new CirculationResult
                    {
                        Success = false,
                        Message = "Mã vạch sách không tồn tại trong hệ thống."
                    };
                }

                // 2. Tìm giao dịch đang mượn (Active) gần nhất của cuốn sách này
                var transaction = await _context.Circulations
                    .Include(c => c.Patron)
                    .Include(c => c.BookCopy)
                        .ThenInclude(bc => bc!.Book)
                    .Where(c => c.CopyID == copy.CopyID && c.Status == CirculationStatus.Active)
                    .OrderByDescending(c => c.BorrowDate)
                    .FirstOrDefaultAsync();

                if (transaction == null)
                {
                    // Nếu sách đang ở trạng thái Available mà lại quét trả
                    if (copy.Status == CopyStatus.Available)
                    {
                        return new CirculationResult
                        {
                            Success = false,
                            Message = "Cuốn sách này đã ở trong kho thư viện, không có giao dịch mượn chưa trả."
                        };
                    }

                    // Khắc phục trạng thái nếu không tìm thấy giao dịch nhưng sách bị đánh dấu Borrowed
                    copy.Status = CopyStatus.Available;
                    await _context.SaveChangesAsync();
                    return new CirculationResult
                    {
                        Success = true,
                        Message = "Đã cập nhật lại trạng thái cuốn sách thành Sẵn sàng (Available)."
                    };
                }

                // 3. Tính toán quá hạn và tiền phạt
                var returnDate = DateTime.Now;
                transaction.ReturnDate = returnDate;

                decimal fine = 0;
                int overdueDays = 0;

                if (returnDate > transaction.DueDate)
                {
                    overdueDays = (returnDate.Date - transaction.DueDate.Date).Days;
                    if (overdueDays > 0)
                    {
                        fine = overdueDays * DAILY_OVERDUE_FINE;
                        transaction.Status = CirculationStatus.Overdue;
                    }
                    else
                    {
                        transaction.Status = CirculationStatus.Returned;
                    }
                }
                else
                {
                    transaction.Status = CirculationStatus.Returned;
                }

                transaction.FineAmount = fine;

                // 4. Trả sách vào kho
                copy.Status = CopyStatus.Available;

                await _context.SaveChangesAsync();

                string msg = fine > 0
                    ? $"Đã trả sách! Quá hạn {overdueDays} ngày. Tiền phạt: {fine:N0} VNĐ."
                    : "Trả sách đúng hạn thành công!";

                return new CirculationResult
                {
                    Success = true,
                    Message = msg,
                    FineAmount = fine,
                    OverdueDays = overdueDays,
                    Transaction = transaction
                };
            }
            catch (Exception ex)
            {
                return new CirculationResult
                {
                    Success = false,
                    Message = $"Lỗi khi làm thủ tục trả sách: {ex.Message}"
                };
            }
        }
    }
}`
  },
  {
    path: 'Views/MainWindow.xaml',
    fileName: 'MainWindow.xaml',
    language: 'xml',
    category: 'Views',
    description: 'Giao diện Windows Desktop trực quan phong cách hiện đại với Dashboard, Sách, Mượn/Trả.',
    code: `<Window x:Class="LibraryManagementSystem.Views.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Offline Library Management System (.NET 8 &amp; SQLite)" 
        Height="780" Width="1240"
        MinHeight="650" MinWidth="1000"
        WindowStartupLocation="CenterScreen"
        Background="#0F172A"
        FontFamily="Segoe UI">

    <Grid>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="260" /> <!-- Thanh Menu Điều Hướng Trái -->
            <ColumnDefinition Width="*" />   <!-- Vùng Nội Dung Chính -->
        </Grid.ColumnDefinitions>

        <!-- SIDEBAR ĐIỀU HƯỚNG -->
        <Border Grid.Column="0" Background="#1E293B" BorderBrush="#334155" BorderThickness="0,0,1,0">
            <DockPanel Margin="16">
                <!-- Header App -->
                <StackPanel DockPanel.Dock="Top" Margin="0,10,0,24">
                    <TextBlock Text="📚 C# .NET 8 LIBRARY" Foreground="#38BDF8" FontSize="18" FontWeight="Bold" />
                    <TextBlock Text="Offline SQLite + ISBN Hybrid" Foreground="#94A3B8" FontSize="12" Margin="0,4,0,0" />
                    <Border Background="#0284C7" Height="2" Margin="0,12,0,0" HorizontalAlignment="Stretch" />
                </StackPanel>

                <!-- Trạng thái kết nối phía dưới -->
                <Border DockPanel.Dock="Bottom" Background="#0F172A" CornerRadius="8" Padding="12" Margin="0,16,0,0">
                    <StackPanel>
                        <TextBlock Text="⚡ TRẠNG THÁI HỆ THỐNG" Foreground="#64748B" FontSize="11" FontWeight="SemiBold" />
                        <TextBlock Text="● 100% Offline SQLite" Foreground="#10B981" FontSize="12" Margin="0,4,0,0" />
                        <TextBlock Text="● Google Books API: Sẵn sàng" Foreground="#38BDF8" FontSize="11" />
                    </StackPanel>
                </Border>

                <!-- Các nút điều hướng -->
                <StackPanel>
                    <Button Name="BtnNavDashboard" Click="NavDashboard_Click" Height="46" Margin="0,4"
                            Background="#0284C7" Foreground="White" BorderThickness="0" HorizontalContentAlignment="Left" Padding="16,0">
                        <TextBlock Text="📊 Tổng quan (Dashboard)" FontSize="14" FontWeight="SemiBold" />
                    </Button>
                    <Button Name="BtnNavBooks" Click="NavBooks_Click" Height="46" Margin="0,4"
                            Background="Transparent" Foreground="#CBD5E1" BorderThickness="0" HorizontalContentAlignment="Left" Padding="16,0">
                        <TextBlock Text="📖 Quản lý Sách &amp; ISBN" FontSize="14" />
                    </Button>
                    <Button Name="BtnNavCirculation" Click="NavCirculation_Click" Height="46" Margin="0,4"
                            Background="Transparent" Foreground="#CBD5E1" BorderThickness="0" HorizontalContentAlignment="Left" Padding="16,0">
                        <TextBlock Text="🔄 Mượn / Trả Sách Nhanh" FontSize="14" />
                    </Button>
                    <Button Name="BtnNavPatrons" Click="NavPatrons_Click" Height="46" Margin="0,4"
                            Background="Transparent" Foreground="#CBD5E1" BorderThickness="0" HorizontalContentAlignment="Left" Padding="16,0">
                        <TextBlock Text="👥 Quản lý Độc giả" FontSize="14" />
                    </Button>
                </StackPanel>
            </DockPanel>
        </Border>

        <!-- KHUNG NỘI DUNG CHÍNH (Content Presenter) -->
        <Grid Grid.Column="1" Margin="24">
            <!-- Vùng hiển thị động được điều khiển trong MainWindow.xaml.cs -->
            <ContentControl Name="MainContentArea" />
        </Grid>
    </Grid>
</Window>`
  },
  {
    path: 'Views/MainWindow.xaml.cs',
    fileName: 'MainWindow.xaml.cs',
    language: 'csharp',
    category: 'Views',
    description: 'Logic điều khiển giao diện chính, khởi tạo database tự động và điều hướng màn hình.',
    code: `using System.Windows;
using LibraryManagementSystem.Data;
using LibraryManagementSystem.Services;

namespace LibraryManagementSystem.Views
{
    public partial class MainWindow : Window
    {
        private readonly LibraryDbContext _dbContext;
        private readonly GoogleBooksService _booksService;
        private readonly CirculationService _circulationService;
        private readonly CameraService _cameraService;

        public MainWindow()
        {
            InitializeComponent();

            // Khởi tạo các dịch vụ cốt lõi
            _dbContext = new LibraryDbContext();
            _booksService = new GoogleBooksService();
            _circulationService = new CirculationService(_dbContext);
            _cameraService = new CameraService();

            // Đảm bảo Database SQLite tự tạo bảng ngay khi bật app lần đầu
            EnsureDatabaseCreated();

            // Mặc định mở màn hình Dashboard
            ShowDashboard();
        }

        private void EnsureDatabaseCreated()
        {
            try
            {
                // Tự động sinh file library.db và tạo bảng nếu chưa có
                _dbContext.Database.EnsureCreated();
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Không thể khởi tạo cơ sở dữ liệu SQLite: {ex.Message}",
                    "Lỗi Cơ sở dữ liệu",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error);
            }
        }

        private void NavDashboard_Click(object sender, RoutedEventArgs e) => ShowDashboard();
        private void NavBooks_Click(object sender, RoutedEventArgs e) => ShowBookManagement();
        private void NavCirculation_Click(object sender, RoutedEventArgs e) => ShowCirculation();
        private void NavPatrons_Click(object sender, RoutedEventArgs e) => ShowPatrons();

        private void ShowDashboard()
        {
            // Nạp UserControl Dashboard
            MainContentArea.Content = new DashboardControl(_dbContext);
        }

        private void ShowBookManagement()
        {
            // Nạp UserControl Quản lý sách kèm dịch vụ ISBN và Webcam
            MainContentArea.Content = new BookManagementControl(_dbContext, _booksService, _cameraService);
        }

        private void ShowCirculation()
        {
            // Nạp UserControl Mượn Trả
            MainContentArea.Content = new CirculationControl(_dbContext, _circulationService);
        }

        private void ShowPatrons()
        {
            // Nạp UserControl Độc giả
            MainContentArea.Content = new PatronManagementControl(_dbContext);
        }

        protected override void OnClosed(EventArgs e)
        {
            base.OnClosed(e);
            // Dọn dẹp tài nguyên Webcam và SQLite DbContext
            _cameraService.Dispose();
            _dbContext.Dispose();
        }
    }
}`
  },
  {
    path: 'Program.cs',
    fileName: 'Program.cs',
    language: 'csharp',
    category: 'Project',
    description: 'Điểm khởi nhập ứng dụng Desktop, bắt ngoại lệ toàn cục tránh crash khi mất mạng/lỗi camera.',
    code: `using System.Windows;
using LibraryManagementSystem.Views;

namespace LibraryManagementSystem
{
    public static class Program
    {
        [STAThread]
        public static void Main()
        {
            // 1. Đăng ký xử lý ngoại lệ toàn cục (Global Exception Handling)
            // Giúp ứng dụng không bị đóng đột ngột (crash) nếu phát sinh lỗi phần cứng camera hoặc mạng
            AppDomain.CurrentDomain.UnhandledException += (s, e) =>
            {
                var ex = e.ExceptionObject as Exception;
                MessageBox.Show(
                    $"Đã xảy ra lỗi không mong muốn trong hệ thống:\\n{ex?.Message}",
                    "Lỗi Ngoại lệ Hệ thống",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error);
            };

            // 2. Khởi tạo Application WPF
            var app = new Application();

            app.DispatcherUnhandledException += (s, e) =>
            {
                MessageBox.Show(
                    $"Lỗi giao diện (UI Exception):\\n{e.Exception.Message}",
                    "Cảnh báo",
                    MessageBoxButton.OK,
                    MessageBoxImage.Warning);
                e.Handled = true; // Ngăn ngừa ứng dụng bị crash
            };

            // 3. Chạy cửa sổ chính
            var mainWindow = new MainWindow();
            app.Run(mainWindow);
        }
    }
}`
  },
  {
    path: 'PublishGuide.md',
    fileName: 'PublishGuide.md',
    language: 'markdown',
    category: 'Docs',
    description: 'Hướng dẫn chi tiết từng bước cấu hình NuGet và đóng gói ra file .exe duy nhất bằng .NET 8 CLI.',
    code: `# HƯỚNG DẪN CẤU HÌNH NUGET VÀ ĐÓNG GÓI RA 1 FILE .EXE DUY NHẤT (.NET 8)

Dự án này được thiết kế theo đúng yêu cầu:
- Chạy 100% ngoại tuyến với cơ sở dữ liệu **SQLite** cục bộ (\`library.db\` nằm cùng thư mục file \`.exe\`).
- Cơ chế **Hybrid**: Chỉ kết nối internet chớp nhoáng khi tra cứu ISBN qua **Google Books API**.
- Tích hợp **Webcam** chụp ảnh bìa sách thực tế lưu vào \`BookImages/\`.
- Đóng gói thành **1 file .exe duy nhất (Self-contained)** chạy trực tiếp trên bất kỳ máy Windows nào mà không cần cài đặt .NET Runtime!

---

## BƯỚC 1: CÀI ĐẶT CÁC GÓI NUGET CẦN THIẾT

Mở terminal hoặc Package Manager Console trong thư mục dự án và chạy các lệnh sau:

\`\`\`bash
# 1. Cơ sở dữ liệu SQLite & Entity Framework Core 8
dotnet add package Microsoft.EntityFrameworkCore.Sqlite --version 8.0.8
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.8

# 2. Xử lý Camera & Webcam chụp ảnh
dotnet add package OpenCvSharp4 --version 4.10.0.20240616
dotnet add package OpenCvSharp4.WpfExtensions --version 4.10.0.20240616
dotnet add package OpenCvSharp4.runtime.win --version 4.10.0.20240616

# 3. Phân tích cú pháp JSON từ Google Books
dotnet add package System.Text.Json --version 8.0.4
\`\`\`

---

## BƯỚC 2: CÁCH ĐÓNG GÓI THÀNH 1 FILE .EXE DUY NHẤT (SELF-CONTAINED)

Dùng lệnh **\`dotnet publish\`** với các tham số tối ưu hóa sau:

\`\`\`bash
dotnet publish -c Release \\
  -r win-x64 \\
  --self-contained true \\
  -p:PublishSingleFile=true \\
  -p:IncludeNativeLibrariesForSelfExtract=true \\
  -p:EnableCompressionInSingleFile=true \\
  -p:PublishTrimmed=false \\
  -o ./PublishOutput
\`\`\`

### Ý nghĩa từng cờ tham số:
1. \`-c Release\`: Biên dịch ở chế độ Release tối ưu hiệu năng cao nhất.
2. \`-r win-x64\`: Target cho hệ điều hành Windows 64-bit (Windows 10, Windows 11).
3. \`--self-contained true\`: Nhúng sẵn toàn bộ .NET 8 Runtime vào file exe, máy đích không cần cài bất kỳ phần mềm phụ trợ nào.
4. \`-p:PublishSingleFile=true\`: Gom toàn bộ dll, hình ảnh, tài nguyên thành đúng 1 file \`LibraryManagementSystem.exe\`.
5. \`-p:IncludeNativeLibrariesForSelfExtract=true\`: Nhúng cả file C++ DLL của SQLite (e_sqlite3.dll) và OpenCV (OpenCvSharpExtern.dll) vào trong file .exe để tự động giải nén khi chạy.
6. \`-p:PublishTrimmed=false\`: **Cực kỳ quan trọng!** Tắt tính năng cắt tỉa mã nguồn (Trimming) để bảo toàn các câu truy vấn Reflection của Entity Framework Core SQLite, tránh lỗi crash ngầm khi truy vấn DB.

---

## BƯỚC 3: CẤU TRÚC KHI CHẠY THỰC TẾ TRÊN MÁY TÍNH KHÁCH HÀNG

Sau khi giải nén hoặc copy file \`LibraryManagementSystem.exe\` vào một thư mục bất kỳ (ví dụ: \`D:\\ThuVien\\\`), khi khởi động lần đầu, ứng dụng sẽ tự động sinh ra:

\`\`\`
D:\\ThuVien\\
  ├── LibraryManagementSystem.exe    (File ứng dụng chính ~65-80MB đã chứa cả .NET 8 Runtime)
  ├── library.db                     (Cơ sở dữ liệu SQLite tự động tạo)
  └── BookImages/                    (Thư mục lưu ảnh bìa chụp từ webcam)
       ├── book_9780132350884_20260915_102030.jpg
       └── ...
\`\`\`

---

## BƯỚC 4: XỬ LÝ LỖI PHỔ BIẾN
1. **Lỗi không kết nối được Google Books API**:
   - Ứng dụng đã có khối \`try-catch\` và timeout 5 giây. Nếu máy không có mạng hoặc mạng trường học/cơ quan chặn Google API, giao diện sẽ hiện thông báo nhẹ nhàng và cho phép thủ thư nhập tay tên sách, tác giả mà không bị dừng chương trình.
2. **Lỗi Webcam không mở được**:
   - Kiểm tra xem Windows Settings -> Privacy -> Camera đã cấp quyền cho ứng dụng Desktop hay chưa.
   - Thư viện \`OpenCvSharp4\` sẽ tự động nhận diện Webcam chuẩn USB hoặc Camera tích hợp sẵn của Laptop.`
  }
];
