import React from 'react';
import { 
  BookMarked, Copy, ArrowLeftRight, AlertTriangle, Users, 
  PlusCircle, Sparkles, Clock, CheckCircle2, ChevronRight,
  TrendingUp, Barcode
} from 'lucide-react';
import { Book, BookCopy, Patron, Circulation } from '../types/library';

interface DashboardViewProps {
  books: Book[];
  copies: BookCopy[];
  patrons: Patron[];
  circulations: Circulation[];
  onNavigate: (view: 'books' | 'circulation' | 'patrons' | 'sqlite') => void;
  onOpenAddBookModal: () => void;
  onOpenQuickCheckOut: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  books,
  copies,
  patrons,
  circulations,
  onNavigate,
  onOpenAddBookModal,
  onOpenQuickCheckOut
}) => {
  const availableCopies = copies.filter(c => c.status === 'Available').length;
  const borrowedCopies = copies.filter(c => c.status === 'Borrowed').length;
  const maintenanceCopies = copies.filter(c => c.status === 'Maintenance').length;

  const activeCirculations = circulations.filter(c => c.status === 'Active' || c.status === 'Overdue');
  const overdueCirculations = circulations.filter(c => c.status === 'Overdue');
  const totalFines = circulations.reduce((sum, c) => sum + (c.fineAmount || 0), 0);

  return (
    <div id="dashboard-view" className="h-full overflow-y-auto p-6 space-y-6">
      {/* Top Banner / Hero Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              C# .NET 8 + SQLite
            </span>
            <span className="text-slate-400 text-xs">Cơ chế Hybrid Ngoại tuyến</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Bảng điều khiển Thư viện Cục bộ (Offline LMS)
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Hệ thống lưu trữ SQLite nội bộ 100% tại <code className="text-sky-300 font-mono">./library.db</code>.
            Tự động tra cứu siêu dữ liệu sách qua Google Books API và chụp ảnh bìa bằng Webcam cục bộ.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="btn-quick-add-book"
            onClick={onOpenAddBookModal}
            className="flex items-center gap-2 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-sky-600/30 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm sách (ISBN + Webcam)</span>
          </button>

          <button
            id="btn-quick-checkout"
            onClick={onOpenQuickCheckOut}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-emerald-600/30 transition-colors"
          >
            <Barcode className="w-4 h-4" />
            <span>Mượn / Trả Sách Nhanh</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Books & Copies */}
        <div 
          onClick={() => onNavigate('books')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Kho Sách Cục Bộ</span>
            <div className="p-2 rounded-lg bg-sky-950/60 text-sky-400 group-hover:scale-110 transition-transform">
              <BookMarked className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{books.length}</span>
            <span className="text-xs text-slate-400">đầu sách</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Tổng bản sao: <strong className="text-slate-200">{copies.length}</strong></span>
            <span className="text-emerald-400 font-medium">Sẵn có: {availableCopies}</span>
          </div>
        </div>

        {/* Card 2: Active Circulations */}
        <div 
          onClick={() => onNavigate('circulation')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Đang Cho Mượn</span>
            <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 group-hover:scale-110 transition-transform">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{borrowedCopies}</span>
            <span className="text-xs text-slate-400">cuốn đang lưu thông</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Giao dịch active: <strong className="text-slate-200">{activeCirculations.length}</strong></span>
            <span className="text-sky-400 flex items-center gap-1 font-medium">
              Quét Barcode <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 3: Overdue & Fines */}
        <div 
          onClick={() => onNavigate('circulation')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Cảnh Báo Quá Hạn</span>
            <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{overdueCirculations.length}</span>
            <span className="text-xs text-slate-400">lượt quá hạn</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Tiền phạt tính tự động:</span>
            <span className="text-rose-400 font-semibold">{totalFines.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        {/* Card 4: Patrons */}
        <div 
          onClick={() => onNavigate('patrons')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/50 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Hồ Sơ Độc Giả</span>
            <div className="p-2 rounded-lg bg-violet-950/60 text-violet-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{patrons.length}</span>
            <span className="text-xs text-slate-400">độc giả có thẻ</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Tất cả thẻ:</span>
            <span className="text-violet-400 font-medium">Hoạt động 100%</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Overdue Monitor & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Overdue Items & Immediate Actions (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Alert Table */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-white">
                  Danh sách Sách Quá Hạn Cần Thu Hồi
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Phạt định mức: <strong>5.000 VNĐ / ngày</strong>
              </span>
            </div>

            {overdueCirculations.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-950/40 rounded-lg border border-slate-800/50">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                Tuyệt vời! Hiện tại không có sách nào bị quá hạn trả.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2">Mã Vạch Sách</th>
                      <th className="px-3 py-2">Tên Đầu Sách</th>
                      <th className="px-3 py-2">Độc Giả</th>
                      <th className="px-3 py-2">Hạn Trả</th>
                      <th className="px-3 py-2">Tiền Phạt</th>
                      <th className="px-3 py-2 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {overdueCirculations.map((circ) => {
                      const copy = copies.find(c => c.copyId === circ.copyId);
                      const book = books.find(b => b.bookId === copy?.bookId);
                      const patron = patrons.find(p => p.patronId === circ.patronId);
                      
                      return (
                        <tr key={circ.transactionId} className="hover:bg-slate-800/30">
                          <td className="px-3 py-2.5 font-mono text-sky-300 font-semibold">
                            {copy?.barcode}
                          </td>
                          <td className="px-3 py-2.5 font-medium text-slate-200 max-w-[180px] truncate">
                            {book?.title}
                          </td>
                          <td className="px-3 py-2.5 text-slate-300">
                            {patron?.fullName} ({patron?.phone})
                          </td>
                          <td className="px-3 py-2.5 text-amber-300 font-mono">
                            {new Date(circ.dueDate).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-3 py-2.5 text-rose-400 font-bold">
                            {circ.fineAmount?.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <button
                              onClick={() => onNavigate('circulation')}
                              className="px-2 py-1 bg-sky-600/80 hover:bg-sky-500 text-white rounded text-[11px] transition-colors"
                            >
                              Trả sách ngay
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Architecture Highlights */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <span className="font-semibold text-sky-400 block mb-1">1. SQLite Database</span>
              <p className="text-slate-400 leading-relaxed">
                Tự động khởi tạo <code className="text-slate-300">library.db</code> nội bộ khi bật app. Tốc độ đọc ghi cục bộ nano-giây.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <span className="font-semibold text-emerald-400 block mb-1">2. Hybrid Google Books</span>
              <p className="text-slate-400 leading-relaxed">
                Gọi API chớp nhoáng với timeout 5s. Nếu mất mạng, hệ thống tự động cho phép nhập tay mà không crash.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <span className="font-semibold text-violet-400 block mb-1">3. Chụp Ảnh Webcam</span>
              <p className="text-slate-400 leading-relaxed">
                Dùng OpenCvSharp4 chụp bìa sách thực tế và lưu file JPG vào thư mục <code className="text-slate-300">BookImages/</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Transactions & Database Quick Stats */}
        <div className="space-y-6">
          {/* Recent Circulations */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-semibold text-white">Giao Dịch Gần Nhất</h2>
              </div>
              <button 
                onClick={() => onNavigate('circulation')}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                Xem hết <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {circulations.slice(0, 4).map((circ) => {
                const copy = copies.find(c => c.copyId === circ.copyId);
                const book = books.find(b => b.bookId === copy?.bookId);
                const patron = patrons.find(p => p.patronId === circ.patronId);

                return (
                  <div 
                    key={circ.transactionId}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 flex items-start justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 line-clamp-1">
                        {book?.title || `Sách #${circ.copyId}`}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Độc giả: <span className="text-slate-300">{patron?.fullName}</span>
                      </div>
                      <div className="text-slate-500 text-[10px] mt-1 font-mono">
                        Mượn: {new Date(circ.borrowDate).toLocaleDateString('vi-VN')} | Hạn: {new Date(circ.dueDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                      circ.status === 'Returned' 
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : circ.status === 'Overdue'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                        : 'bg-sky-950/80 text-sky-300 border border-sky-800'
                    }`}>
                      {circ.status === 'Returned' ? 'Đã trả' : circ.status === 'Overdue' ? 'Quá hạn' : 'Đang mượn'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick SQLite Status */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Thực thể SQLite
              </span>
              <button
                onClick={() => onNavigate('sqlite')}
                className="text-xs text-sky-400 hover:underline"
              >
                Mở SQLite Inspector
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Bảng Books</span>
                <span className="font-mono text-slate-200">{books.length} bản ghi</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Bảng BookCopies</span>
                <span className="font-mono text-slate-200">{copies.length} bản ghi</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Bảng Patrons</span>
                <span className="font-mono text-slate-200">{patrons.length} bản ghi</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Bảng Circulations</span>
                <span className="font-mono text-slate-200">{circulations.length} bản ghi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
