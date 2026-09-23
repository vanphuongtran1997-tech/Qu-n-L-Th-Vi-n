import React, { useState } from 'react';
import { 
  LayoutDashboard, BookMarked, ArrowLeftRight, Users, Database, 
  Code2, BookOpen, HardDrive, Wifi, Camera, ShieldCheck,
  PlusCircle, Sparkles, AlertTriangle
} from 'lucide-react';

import { Book, BookCopy, Patron, Circulation, CopyStatus } from './types/library';
import { INITIAL_BOOKS, INITIAL_COPIES, INITIAL_PATRONS, INITIAL_CIRCULATIONS } from './data/initialData';

import { DesktopWindowFrame } from './components/DesktopWindowFrame';
import { DashboardView } from './components/DashboardView';
import { BookManagementView } from './components/BookManagementView';
import { CirculationView } from './components/CirculationView';
import { PatronManagementView } from './components/PatronManagementView';
import { SqliteInspectorView } from './components/SqliteInspectorView';
import { CodeExplorerView } from './components/CodeExplorerView';
import { PublishGuideView } from './components/PublishGuideView';

export default function App() {
  // Navigation tabs
  const [topTab, setTopTab] = useState<'runtime' | 'code' | 'sqlite' | 'guide'>('runtime');
  const [runtimeNav, setRuntimeNav] = useState<'dashboard' | 'books' | 'circulation' | 'patrons'>('dashboard');

  // Database State (Simulating SQLite local storage)
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [copies, setCopies] = useState<BookCopy[]>(INITIAL_COPIES);
  const [patrons, setPatrons] = useState<Patron[]>(INITIAL_PATRONS);
  const [circulations, setCirculations] = useState<Circulation[]>(INITIAL_CIRCULATIONS);

  // Total SQLite records
  const totalDbRecords = books.length + copies.length + patrons.length + circulations.length;

  // Handler: Thêm đầu sách mới cùng các bản sao ban đầu
  const handleAddBook = (newBook: Book, initialBarcodes: string[]) => {
    setBooks(prev => [newBook, ...prev]);

    const newCopies: BookCopy[] = initialBarcodes.map((barcode, idx) => ({
      copyId: Date.now() + idx,
      bookId: newBook.bookId,
      barcode: barcode.trim(),
      status: 'Available',
      addedDate: new Date().toISOString().split('T')[0],
      conditionNote: 'Mới nhập kho'
    }));

    setCopies(prev => [...newCopies, ...prev]);
  };

  // Handler: Thêm bản sao vật lý cho đầu sách đã có
  const handleAddCopy = (bookId: number, barcode: string) => {
    // Kiểm tra trùng barcode
    if (copies.some(c => c.barcode.toLowerCase() === barcode.trim().toLowerCase())) {
      alert(`Mã vạch "${barcode}" đã tồn tại trên một cuốn sách khác.`);
      return;
    }

    const newCopy: BookCopy = {
      copyId: Date.now(),
      bookId,
      barcode: barcode.trim(),
      status: 'Available',
      addedDate: new Date().toISOString().split('T')[0],
      conditionNote: 'Bản sao bổ sung'
    };

    setCopies(prev => [newCopy, ...prev]);
  };

  // Handler: Cập nhật trạng thái bản sao (Available, Borrowed, Maintenance)
  const handleUpdateCopyStatus = (copyId: number, status: CopyStatus) => {
    setCopies(prev => prev.map(c => c.copyId === copyId ? { ...c, status } : c));
  };

  // Handler: Xóa đầu sách
  const handleDeleteBook = (bookId: number) => {
    setBooks(prev => prev.filter(b => b.bookId !== bookId));
    setCopies(prev => prev.filter(c => c.bookId !== bookId));
  };

  // Handler: Thêm độc giả
  const handleAddPatron = (newPatron: Patron) => {
    if (patrons.some(p => p.cardBarcode.toLowerCase() === newPatron.cardBarcode.toLowerCase())) {
      alert(`Mã thẻ "${newPatron.cardBarcode}" đã được cấp cho độc giả khác.`);
      return;
    }
    setPatrons(prev => [newPatron, ...prev]);
  };

  // Handler: Mượn sách (Check-out)
  const handleCheckOut = (patronBarcode: string, copyBarcode: string, loanDays: number = 14) => {
    const patron = patrons.find(p => p.cardBarcode.trim().toLowerCase() === patronBarcode.trim().toLowerCase());
    if (!patron) {
      return { success: false, message: `Không tìm thấy độc giả với mã thẻ "${patronBarcode}".` };
    }

    const copy = copies.find(c => c.barcode.trim().toLowerCase() === copyBarcode.trim().toLowerCase());
    if (!copy) {
      return { success: false, message: `Không tìm thấy bản sao sách với mã vạch "${copyBarcode}".` };
    }

    if (copy.status !== 'Available') {
      return { success: false, message: `Cuốn sách này hiện không sẵn sàng (Trạng thái: ${copy.status}).` };
    }

    const now = new Date();
    const dueDate = new Date(now.getTime() + loanDays * 24 * 60 * 60 * 1000);

    const newTransaction: Circulation = {
      transactionId: Date.now(),
      copyId: copy.copyId,
      patronId: patron.patronId,
      borrowDate: now.toISOString(),
      dueDate: dueDate.toISOString(),
      returnDate: null,
      status: 'Active',
      fineAmount: 0
    };

    // Cập nhật trạng thái sách thành Borrowed
    setCopies(prev => prev.map(c => c.copyId === copy.copyId ? { ...c, status: 'Borrowed' } : c));
    setCirculations(prev => [newTransaction, ...prev]);

    return {
      success: true,
      message: `Cho mượn thành công! Độc giả: ${patron.fullName}. Hạn trả: ${dueDate.toLocaleDateString('vi-VN')}.`
    };
  };

  // Handler: Trả sách (Check-in) với tính phí phạt quá hạn 5.000 VNĐ / ngày
  const handleCheckIn = (copyBarcode: string) => {
    const copy = copies.find(c => c.barcode.trim().toLowerCase() === copyBarcode.trim().toLowerCase());
    if (!copy) {
      return { success: false, message: `Mã vạch "${copyBarcode}" không tồn tại trong hệ thống.`, fine: 0, overdueDays: 0 };
    }

    // Tìm giao dịch active
    const activeCirc = circulations.find(c => c.copyId === copy.copyId && (c.status === 'Active' || c.status === 'Overdue'));

    if (!activeCirc) {
      if (copy.status === 'Available') {
        return { success: false, message: 'Cuốn sách này đã ở trong kho, không có giao dịch chưa trả.', fine: 0, overdueDays: 0 };
      }
      // Khôi phục trạng thái
      setCopies(prev => prev.map(c => c.copyId === copy.copyId ? { ...c, status: 'Available' } : c));
      return { success: true, message: 'Đã cập nhật lại trạng thái cuốn sách thành Sẵn sàng (Available).', fine: 0, overdueDays: 0 };
    }

    const now = new Date();
    const due = new Date(activeCirc.dueDate);
    let overdueDays = 0;
    let fine = 0;

    if (now > due) {
      const diffTime = Math.abs(now.getTime() - due.getTime());
      overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (overdueDays > 0) {
        fine = overdueDays * 5000; // 5.000 VNĐ / ngày
      }
    }

    // Cập nhật giao dịch
    setCirculations(prev => prev.map(c => c.transactionId === activeCirc.transactionId ? {
      ...c,
      returnDate: now.toISOString(),
      status: overdueDays > 0 ? 'Overdue' : 'Returned',
      fineAmount: fine
    } : c));

    // Đưa sách về Available
    setCopies(prev => prev.map(c => c.copyId === copy.copyId ? { ...c, status: 'Available' } : c));

    const msg = fine > 0 
      ? `Đã trả sách! Quá hạn ${overdueDays} ngày. Phạt: ${fine.toLocaleString('vi-VN')} VNĐ.`
      : 'Trả sách đúng hạn thành công!';

    return { success: true, message: msg, fine, overdueDays };
  };

  return (
    <DesktopWindowFrame
      activeTab={topTab}
      onSelectTab={setTopTab}
      dbRecordCount={totalDbRecords}
    >
      {topTab === 'runtime' && (
        <div className="flex h-full overflow-hidden">
          {/* Windows Desktop Left Navigation Rail */}
          <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
            <div className="p-3 space-y-4">
              {/* App Sub-header */}
              <div className="px-2 pt-2">
                <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                  Desktop Interface
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  C# WPF / WinForms UI
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                <button
                  id="nav-dashboard-btn"
                  onClick={() => setRuntimeNav('dashboard')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    runtimeNav === 'dashboard'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Tổng Quan (Dashboard)</span>
                </button>

                <button
                  id="nav-books-btn"
                  onClick={() => setRuntimeNav('books')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    runtimeNav === 'books'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <BookMarked className="w-4 h-4" />
                  <span>Quản Lý Sách &amp; ISBN</span>
                </button>

                <button
                  id="nav-circulation-btn"
                  onClick={() => setRuntimeNav('circulation')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    runtimeNav === 'circulation'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Mượn / Trả Sách</span>
                </button>

                <button
                  id="nav-patrons-btn"
                  onClick={() => setRuntimeNav('patrons')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    runtimeNav === 'patrons'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Quản Lý Độc Giả</span>
                </button>
              </nav>
            </div>

            {/* Offline Health Box */}
            <div className="p-3">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Cục Bộ Offline
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">.NET 8</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  SQLite: <span className="text-slate-200 font-mono">library.db</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Ảnh: <span className="text-slate-200 font-mono">BookImages/</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Sub-view switcher */}
          <section className="flex-1 overflow-hidden bg-slate-950">
            {runtimeNav === 'dashboard' && (
              <DashboardView
                books={books}
                copies={copies}
                patrons={patrons}
                circulations={circulations}
                onNavigate={view => {
                  if (view === 'sqlite') {
                    setTopTab('sqlite');
                  } else {
                    setRuntimeNav(view);
                  }
                }}
                onOpenAddBookModal={() => setRuntimeNav('books')}
                onOpenQuickCheckOut={() => setRuntimeNav('circulation')}
              />
            )}

            {runtimeNav === 'books' && (
              <BookManagementView
                books={books}
                copies={copies}
                onAddBook={handleAddBook}
                onAddCopy={handleAddCopy}
                onUpdateCopyStatus={handleUpdateCopyStatus}
                onDeleteBook={handleDeleteBook}
              />
            )}

            {runtimeNav === 'circulation' && (
              <CirculationView
                books={books}
                copies={copies}
                patrons={patrons}
                circulations={circulations}
                onCheckOut={handleCheckOut}
                onCheckIn={handleCheckIn}
              />
            )}

            {runtimeNav === 'patrons' && (
              <PatronManagementView
                patrons={patrons}
                circulations={circulations}
                copies={copies}
                books={books}
                onAddPatron={handleAddPatron}
              />
            )}
          </section>
        </div>
      )}

      {topTab === 'code' && (
        <CodeExplorerView />
      )}

      {topTab === 'sqlite' && (
        <SqliteInspectorView
          books={books}
          copies={copies}
          patrons={patrons}
          circulations={circulations}
        />
      )}

      {topTab === 'guide' && (
        <PublishGuideView />
      )}
    </DesktopWindowFrame>
  );
}
