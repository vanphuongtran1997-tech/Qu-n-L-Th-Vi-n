import React, { useState } from 'react';
import { Users, UserPlus, Barcode, Phone, Mail, Calendar, Search, ShieldCheck } from 'lucide-react';
import { Patron, Circulation, BookCopy, Book } from '../types/library';

interface PatronManagementViewProps {
  patrons: Patron[];
  circulations: Circulation[];
  copies: BookCopy[];
  books: Book[];
  onAddPatron: (patron: Patron) => void;
}

export const PatronManagementView: React.FC<PatronManagementViewProps> = ({
  patrons,
  circulations,
  copies,
  books,
  onAddPatron
}) => {
  const [search, setSearch] = useState('');
  const [selectedPatron, setSelectedPatron] = useState<Patron | null>(patrons[0] || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cardBarcode, setCardBarcode] = useState(`CARD-${String(patrons.length + 1).padStart(3, '0')}`);

  const filteredPatrons = patrons.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.cardBarcode.toLowerCase().includes(search.toLowerCase()) ||
    (p.phone && p.phone.includes(search))
  );

  const patronCirculations = selectedPatron 
    ? circulations.filter(c => c.patronId === selectedPatron.patronId)
    : [];

  const handleSavePatron = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !cardBarcode.trim()) {
      alert('Vui lòng nhập Họ tên và Mã vạch thẻ độc giả.');
      return;
    }

    const newPatron: Patron = {
      patronId: Date.now(),
      fullName: fullName.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      cardBarcode: cardBarcode.trim().toUpperCase(),
      membershipDate: new Date().toISOString(),
      activeLoansCount: 0
    };

    onAddPatron(newPatron);
    setSelectedPatron(newPatron);
    setIsAddModalOpen(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setCardBarcode(`CARD-${String(patrons.length + 2).padStart(3, '0')}`);
  };

  return (
    <div id="patron-management-view" className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-400" />
            <span>Quản Lý Hồ Sơ Độc Giả (Table Patrons)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý mã vạch thẻ thư viện phục vụ quét mượn trả tự động tại quầy lưu thông.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm Độc Giả Mới</span>
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 overflow-hidden">
        {/* Left: Patrons List (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900/70 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-3 border-b border-slate-800 bg-slate-900/90">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm theo Tên độc giả, Mã thẻ hoặc SĐT..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
            {filteredPatrons.map(patron => {
              const activeCount = circulations.filter(
                c => c.patronId === patron.patronId && (c.status === 'Active' || c.status === 'Overdue')
              ).length;
              const isSelected = selectedPatron?.patronId === patron.patronId;

              return (
                <div
                  key={patron.patronId}
                  onClick={() => setSelectedPatron(patron)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-violet-950/60 border border-violet-600/60 text-white'
                      : 'hover:bg-slate-800/40 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-xs text-slate-100">{patron.fullName}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-400">
                      {patron.cardBarcode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>SĐT: {patron.phone || 'Chưa cập nhật'}</span>
                    <span className={activeCount > 0 ? 'text-amber-400 font-semibold' : 'text-slate-500'}>
                      Đang mượn: {activeCount} cuốn
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Patron Card & Loan History (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900/70 rounded-xl border border-slate-800 p-5 overflow-y-auto space-y-5">
          {selectedPatron ? (
            <>
              {/* Virtual Library Card Preview */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-violet-900/60 via-slate-900 to-slate-900 border border-violet-800/50 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-violet-400" />
                    Thẻ Độc Giả Thư Viện Cục Bộ
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">
                    Đang Hoạt Động
                  </span>
                </div>

                <div className="text-base font-bold text-white mb-2">
                  {selectedPatron.fullName}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedPatron.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{selectedPatron.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Gia nhập: {new Date(selectedPatron.membershipDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                {/* Simulated Barcode Banner */}
                <div className="mt-4 p-2 bg-white rounded flex flex-col items-center justify-center">
                  <div className="font-mono text-black font-extrabold tracking-widest text-sm">
                    ||| | |||| | ||||| ||| | ||
                  </div>
                  <span className="font-mono text-[10px] text-slate-800 font-bold tracking-wider">
                    {selectedPatron.cardBarcode}
                  </span>
                </div>
              </div>

              {/* History of Borrowed Books */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Lịch Sử Mượn / Trả Của Độc Giả ({patronCirculations.length} lượt)
                </h3>

                <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-950/60">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] text-slate-400 uppercase bg-slate-900/90 border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2">Mã Vạch</th>
                        <th className="px-3 py-2">Tên Đầu Sách</th>
                        <th className="px-3 py-2">Ngày Mượn</th>
                        <th className="px-3 py-2">Hạn Trả</th>
                        <th className="px-3 py-2">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {patronCirculations.map(c => {
                        const copy = copies.find(item => item.copyId === c.copyId);
                        const book = books.find(b => b.bookId === copy?.bookId);

                        return (
                          <tr key={c.transactionId} className="hover:bg-slate-800/30">
                            <td className="px-3 py-2 font-mono text-sky-400 font-semibold">
                              {copy?.barcode}
                            </td>
                            <td className="px-3 py-2 text-slate-200 font-medium max-w-[150px] truncate">
                              {book?.title}
                            </td>
                            <td className="px-3 py-2 font-mono text-slate-400 text-[11px]">
                              {new Date(c.borrowDate).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-3 py-2 font-mono text-[11px]">
                              <span className={c.status === 'Overdue' ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                                {new Date(c.dueDate).toLocaleDateString('vi-VN')}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                c.status === 'Returned'
                                  ? 'bg-emerald-950 text-emerald-400'
                                  : c.status === 'Overdue'
                                  ? 'bg-rose-950 text-rose-400'
                                  : 'bg-sky-950 text-sky-400'
                              }`}>
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}

                      {patronCirculations.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-500 text-xs">
                            Độc giả này chưa có lượt mượn nào.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Chọn độc giả bên trái để xem chi tiết thẻ và lịch sử mượn.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Thêm Độc Giả */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-violet-400" />
                <span>Thêm Độc Giả Thư Viện Mới</span>
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSavePatron} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Họ và Tên <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="VD: Lê Thị Thu Hương"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Mã Vạch Thẻ Độc Giả (CardBarcode) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cardBarcode}
                  onChange={e => setCardBarcode(e.target.value)}
                  placeholder="VD: CARD-005"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="VD: 0912345678"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="VD: huong.le@example.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-bold shadow-sm"
                >
                  Lưu Độc Giả
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
