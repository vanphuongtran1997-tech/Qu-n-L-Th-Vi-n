import React, { useState } from 'react';
import { 
  ArrowLeftRight, CheckCircle2, AlertTriangle, Barcode, 
  Calendar, Clock, UserCheck, BookOpen, Search, DollarSign,
  History, ArrowRight, ShieldAlert, Sparkles
} from 'lucide-react';
import { Book, BookCopy, Patron, Circulation } from '../types/library';

interface CirculationViewProps {
  books: Book[];
  copies: BookCopy[];
  patrons: Patron[];
  circulations: Circulation[];
  onCheckOut: (patronBarcode: string, copyBarcode: string, loanDays?: number) => { success: boolean; message: string };
  onCheckIn: (copyBarcode: string) => { success: boolean; message: string; fine: number; overdueDays: number };
}

export const CirculationView: React.FC<CirculationViewProps> = ({
  books,
  copies,
  patrons,
  circulations,
  onCheckOut,
  onCheckIn
}) => {
  const [activeTab, setActiveTab] = useState<'checkout' | 'checkin'>('checkout');

  // Check-out form state
  const [checkoutPatronBarcode, setCheckoutPatronBarcode] = useState('CARD-001');
  const [checkoutCopyBarcode, setCheckoutCopyBarcode] = useState('');
  const [loanDays, setLoanDays] = useState(14);
  const [checkoutResult, setCheckoutResult] = useState<{ success: boolean; message: string } | null>(null);

  // Check-in form state
  const [checkinCopyBarcode, setCheckinCopyBarcode] = useState('');
  const [checkinResult, setCheckinResult] = useState<{ success: boolean; message: string; fine: number; overdueDays: number } | null>(null);

  // History search filter
  const [historyFilter, setHistoryFilter] = useState<'all' | 'active' | 'overdue' | 'returned'>('all');
  const [searchHistory, setSearchHistory] = useState('');

  // Auto previews
  const previewPatron = patrons.find(p => p.cardBarcode.toLowerCase() === checkoutPatronBarcode.trim().toLowerCase());
  const previewCopy = copies.find(c => c.barcode.toLowerCase() === checkoutCopyBarcode.trim().toLowerCase());
  const previewBook = previewCopy ? books.find(b => b.bookId === previewCopy.bookId) : null;

  const checkinCopy = copies.find(c => c.barcode.toLowerCase() === checkinCopyBarcode.trim().toLowerCase());
  const checkinBook = checkinCopy ? books.find(b => b.bookId === checkinCopy.bookId) : null;
  const activeCirculationForCheckin = checkinCopy 
    ? circulations.find(c => c.copyId === checkinCopy.copyId && (c.status === 'Active' || c.status === 'Overdue'))
    : null;

  const handleProcessCheckOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutPatronBarcode.trim() || !checkoutCopyBarcode.trim()) {
      setCheckoutResult({
        success: false,
        message: 'Vui lòng nhập hoặc quét đầy đủ Mã Thẻ Độc Giả và Mã Vạch Sách.'
      });
      return;
    }

    const res = onCheckOut(checkoutPatronBarcode, checkoutCopyBarcode, loanDays);
    setCheckoutResult(res);
    if (res.success) {
      setCheckoutCopyBarcode('');
    }
  };

  const handleProcessCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkinCopyBarcode.trim()) {
      setCheckinResult({
        success: false,
        message: 'Vui lòng nhập hoặc quét Mã Vạch Bản Sao Sách.',
        fine: 0,
        overdueDays: 0
      });
      return;
    }

    const res = onCheckIn(checkinCopyBarcode);
    setCheckinResult(res);
    if (res.success) {
      setCheckinCopyBarcode('');
    }
  };

  // Available copies for quick test checkout
  const availableCopies = copies.filter(c => c.status === 'Available');
  // Borrowed copies for quick test checkin
  const borrowedCopies = copies.filter(c => c.status === 'Borrowed');

  // Filter history
  const filteredCirculations = circulations.filter(c => {
    if (historyFilter === 'active' && c.status !== 'Active') return false;
    if (historyFilter === 'overdue' && c.status !== 'Overdue') return false;
    if (historyFilter === 'returned' && c.status !== 'Returned') return false;

    if (!searchHistory.trim()) return true;

    const copy = copies.find(item => item.copyId === c.copyId);
    const book = books.find(item => item.bookId === copy?.bookId);
    const patron = patrons.find(item => item.patronId === c.patronId);

    const query = searchHistory.toLowerCase();
    return (
      copy?.barcode.toLowerCase().includes(query) ||
      book?.title.toLowerCase().includes(query) ||
      patron?.fullName.toLowerCase().includes(query) ||
      patron?.cardBarcode.toLowerCase().includes(query)
    );
  });

  return (
    <div id="circulation-view" className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
            <span>Quầy Giao Lưu Thông Mượn / Trả Sách Nhanh</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quét mã vạch tự động hóa quy trình Check-out và Check-in, tính tiền phạt quá hạn theo thời gian thực.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            id="tab-checkout-btn"
            onClick={() => setActiveTab('checkout')}
            className={`px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'checkout'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Mượn Sách (Check-out)</span>
          </button>

          <button
            id="tab-checkin-btn"
            onClick={() => setActiveTab('checkin')}
            className={`px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'checkin'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Trả Sách (Check-in)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left is Fast Operation Panel, Right is History Table */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 overflow-hidden">
        {/* Left Operation Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900/80 rounded-xl border border-slate-800 p-5 overflow-y-auto space-y-4">
          {activeTab === 'checkout' ? (
            /* CHECKOUT FORM */
            <form onSubmit={handleProcessCheckOut} className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  Thủ Tục Mượn Sách (Check-out)
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono text-[10px]">
                  Quy định 14 ngày
                </span>
              </div>

              {/* 1. Patron Barcode */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-medium">
                  1. Mã Thẻ Độc Giả (Patron Barcode) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Barcode className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    id="input-patron-barcode"
                    type="text"
                    required
                    value={checkoutPatronBarcode}
                    onChange={e => setCheckoutPatronBarcode(e.target.value)}
                    placeholder="Quét mã thẻ (VD: CARD-001)..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Quick Patron suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400">Thẻ mẫu:</span>
                  {patrons.slice(0, 3).map(p => (
                    <button
                      key={p.patronId}
                      type="button"
                      onClick={() => setCheckoutPatronBarcode(p.cardBarcode)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px]"
                    >
                      {p.cardBarcode} ({p.fullName.split(' ').slice(-1)[0]})
                    </button>
                  ))}
                </div>

                {previewPatron && (
                  <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-800/40 text-[11px] text-slate-300 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <strong className="text-white">{previewPatron.fullName}</strong> ({previewPatron.phone})
                      <span className="text-slate-400 block text-[10px]">Thành viên từ: {new Date(previewPatron.membershipDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Book Copy Barcode */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-medium">
                  2. Mã Vạch Bản Sao Sách (Copy Barcode) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Barcode className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    id="input-copy-barcode"
                    type="text"
                    required
                    value={checkoutCopyBarcode}
                    onChange={e => setCheckoutCopyBarcode(e.target.value)}
                    placeholder="Quét mã gáy sách (VD: BC-CC-001)..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Quick available copies */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400">Sách sẵn có:</span>
                  {availableCopies.slice(0, 3).map(c => (
                    <button
                      key={c.copyId}
                      type="button"
                      onClick={() => setCheckoutCopyBarcode(c.barcode)}
                      className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 hover:bg-emerald-900 text-emerald-300 font-mono text-[10px]"
                    >
                      {c.barcode}
                    </button>
                  ))}
                </div>

                {previewCopy && (
                  <div className={`p-2.5 rounded-lg border text-[11px] flex items-center gap-2 ${
                    previewCopy.status === 'Available'
                      ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-800/40 text-rose-200'
                  }`}>
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <div>
                      <strong className="text-white">{previewBook?.title || previewCopy.barcode}</strong>
                      <span className="block text-[10px]">
                        Trạng thái: <strong>{previewCopy.status === 'Available' ? 'Sẵn sàng cho mượn' : previewCopy.status}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Loan Duration */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-medium">
                  3. Thời Gian Mượn (Ngày)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={loanDays}
                    onChange={e => setLoanDays(parseInt(e.target.value) || 14)}
                    className="w-24 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-slate-400 text-xs">
                    Hạn trả dự kiến: <strong className="text-sky-300 font-mono">
                      {new Date(Date.now() + loanDays * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Feedback alert */}
              {checkoutResult && (
                <div className={`p-3 rounded-lg flex items-start gap-2 ${
                  checkoutResult.success 
                    ? 'bg-emerald-950/90 border border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/90 border border-rose-800 text-rose-300'
                }`}>
                  {checkoutResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{checkoutResult.message}</span>
                </div>
              )}

              {/* Submit Checkout */}
              <button
                type="submit"
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold shadow-sm shadow-sky-600/30 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Xác Nhận Cho Mượn (Check-out)</span>
              </button>
            </form>
          ) : (
            /* CHECKIN FORM */
            <form onSubmit={handleProcessCheckIn} className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Thủ Tục Trả Sách (Check-in)
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono text-[10px]">
                  Phạt trễ: 5.000 đ/ngày
                </span>
              </div>

              {/* Book Copy Barcode for Return */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-medium">
                  Mã Vạch Sách Cần Trả (Copy Barcode) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Barcode className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    id="input-checkin-barcode"
                    type="text"
                    required
                    value={checkinCopyBarcode}
                    onChange={e => setCheckinCopyBarcode(e.target.value)}
                    placeholder="Quét mã vạch cuốn sách để trả (VD: BC-CC-002)..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Sách đang mượn để thử trả nhanh */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400">Sách đang mượn:</span>
                  {borrowedCopies.map(c => (
                    <button
                      key={c.copyId}
                      type="button"
                      onClick={() => setCheckinCopyBarcode(c.barcode)}
                      className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/60 hover:bg-amber-900 text-amber-300 font-mono text-[10px]"
                    >
                      {c.barcode}
                    </button>
                  ))}
                  {borrowedCopies.length === 0 && (
                    <span className="text-[10px] text-slate-500">Tất cả sách đã được trả.</span>
                  )}
                </div>

                {checkinCopy && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-slate-200 font-semibold">
                      {checkinBook?.title} ({checkinCopy.barcode})
                    </div>
                    {activeCirculationForCheckin ? (
                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div>
                          Hạn trả gốc: <strong className="text-slate-200 font-mono">
                            {new Date(activeCirculationForCheckin.dueDate).toLocaleDateString('vi-VN')}
                          </strong>
                        </div>
                        {new Date() > new Date(activeCirculationForCheckin.dueDate) ? (
                          <div className="text-rose-400 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Đã quá hạn! Hệ thống sẽ tự động tính phí phạt 5.000 VNĐ / ngày.
                          </div>
                        ) : (
                          <div className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Trong hạn mượn cho phép. Không phát sinh phí phạt.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400">
                        Trạng thái hiện tại trong kho: <strong>{checkinCopy.status}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Checkin Result Feedback */}
              {checkinResult && (
                <div className={`p-3 rounded-lg flex flex-col gap-1.5 ${
                  checkinResult.success 
                    ? 'bg-emerald-950/90 border border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/90 border border-rose-800 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2 font-semibold">
                    {checkinResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{checkinResult.message}</span>
                  </div>
                  {checkinResult.fine > 0 && (
                    <div className="text-xs text-rose-300 font-bold bg-black/40 p-2 rounded border border-rose-800/60">
                      Thu tiền phạt quá hạn: {checkinResult.fine.toLocaleString('vi-VN')} VNĐ ({checkinResult.overdueDays} ngày quá hạn)
                    </div>
                  )}
                </div>
              )}

              {/* Submit Checkin */}
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-sm shadow-emerald-600/30 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác Nhận Trả Sách Vào Kho (Check-in)</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Circulation Transactions Ledger (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
          {/* Filter Bar */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-sky-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Sổ Giao Dịch Lưu Thông (Table Circulations)
              </h2>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  value={searchHistory}
                  onChange={e => setSearchHistory(e.target.value)}
                  placeholder="Tìm mã vạch, tên..."
                  className="w-full pl-8 pr-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Status Filter */}
              <select
                value={historyFilter}
                onChange={e => setHistoryFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded px-2.5 py-1 focus:outline-none"
              >
                <option value="all">Tất cả ({circulations.length})</option>
                <option value="active">Đang mượn</option>
                <option value="overdue">Quá hạn</option>
                <option value="returned">Đã trả</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="px-3 py-2.5">Mã Vạch Sách</th>
                  <th className="px-3 py-2.5">Độc Giả</th>
                  <th className="px-3 py-2.5">Ngày Mượn</th>
                  <th className="px-3 py-2.5">Hạn Trả</th>
                  <th className="px-3 py-2.5">Trạng Thái</th>
                  <th className="px-3 py-2.5 text-right">Phạt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredCirculations.map(circ => {
                  const copy = copies.find(c => c.copyId === circ.copyId);
                  const book = books.find(b => b.bookId === copy?.bookId);
                  const patron = patrons.find(p => p.patronId === circ.patronId);

                  return (
                    <tr key={circ.transactionId} className="hover:bg-slate-800/30">
                      <td className="px-3 py-2.5">
                        <div className="font-mono font-semibold text-sky-300">
                          {copy?.barcode || `#${circ.copyId}`}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {book?.title}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-slate-200">{patron?.fullName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{patron?.cardBarcode}</div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-300 text-[11px]">
                        {new Date(circ.borrowDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[11px]">
                        <span className={circ.status === 'Overdue' ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {new Date(circ.dueDate).toLocaleDateString('vi-VN')}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          circ.status === 'Returned'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : circ.status === 'Overdue'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-sky-950 text-sky-400 border border-sky-800'
                        }`}>
                          {circ.status === 'Returned' ? 'Đã trả' : circ.status === 'Overdue' ? 'Quá hạn' : 'Đang mượn'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold">
                        {circ.fineAmount && circ.fineAmount > 0 ? (
                          <span className="text-rose-400">{circ.fineAmount.toLocaleString('vi-VN')} đ</span>
                        ) : (
                          <span className="text-slate-500">0 đ</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredCirculations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                      Không có bản ghi giao dịch nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
