import React, { useState } from 'react';
import { 
  Database, Table, Download, Code, Play, CheckCircle2, 
  Layers, HardDrive, Key, FileText, RefreshCw 
} from 'lucide-react';
import { Book, BookCopy, Patron, Circulation } from '../types/library';

interface SqliteInspectorViewProps {
  books: Book[];
  copies: BookCopy[];
  patrons: Patron[];
  circulations: Circulation[];
}

export const SqliteInspectorView: React.FC<SqliteInspectorViewProps> = ({
  books,
  copies,
  patrons,
  circulations
}) => {
  const [activeTable, setActiveTable] = useState<'Books' | 'BookCopies' | 'Patrons' | 'Circulations'>('Books');
  const [customQuery, setCustomQuery] = useState('SELECT * FROM Books WHERE Author LIKE \'%Martin%\';');
  const [queryOutput, setQueryOutput] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  const tables = [
    { name: 'Books', count: books.length, desc: 'Lưu trữ thông tin metadata của đầu sách (ISBN, Title, Author, Publisher, ImagePath)' },
    { name: 'BookCopies', count: copies.length, desc: 'Lưu trữ các bản sao vật lý của sách (CopyID, BookID, Barcode, Status)' },
    { name: 'Patrons', count: patrons.length, desc: 'Hồ sơ độc giả và mã thẻ thư viện (PatronID, FullName, Email, Phone, CardBarcode)' },
    { name: 'Circulations', count: circulations.length, desc: 'Lịch sử và phiên mượn/trả sách (TransactionID, CopyID, PatronID, DueDate, FineAmount)' },
  ];

  const handleRunQuery = () => {
    setQueryError(null);
    const q = customQuery.trim().toLowerCase();

    try {
      if (q.includes('from books')) {
        let result = [...books];
        if (q.includes('like')) {
          result = result.filter(b => b.author.toLowerCase().includes('martin') || b.title.toLowerCase().includes('martin'));
        }
        setQueryOutput(result);
      } else if (q.includes('from bookcopies')) {
        let result = [...copies];
        if (q.includes('status = \'available\'') || q.includes('available')) {
          result = result.filter(c => c.status === 'Available');
        } else if (q.includes('borrowed')) {
          result = result.filter(c => c.status === 'Borrowed');
        }
        setQueryOutput(result);
      } else if (q.includes('from circulations')) {
        let result = [...circulations];
        if (q.includes('overdue')) {
          result = result.filter(c => c.status === 'Overdue');
        }
        setQueryOutput(result);
      } else if (q.includes('from patrons')) {
        setQueryOutput(patrons);
      } else {
        setQueryError('Query parser hỗ trợ: SELECT * FROM Books / BookCopies / Patrons / Circulations');
      }
    } catch (e: any) {
      setQueryError(`Lỗi thực thi truy vấn: ${e.message}`);
    }
  };

  const handleExportDatabaseJson = () => {
    const dbDump = {
      databaseName: 'library.db',
      exportDate: new Date().toISOString(),
      engine: 'SQLite 3 (C# EF Core 8)',
      tables: {
        Books: books,
        BookCopies: copies,
        Patrons: patrons,
        Circulations: circulations
      }
    };

    const blob = new Blob([JSON.stringify(dbDump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sqlite_library_dump_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="sqlite-inspector-view" className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-400" />
            <span>Trình Kiểm Tra Cơ Sở Dữ Liệu SQLite Cục Bộ (library.db)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            File SQLite nằm cùng thư mục file <code className="text-sky-300 font-mono">.exe</code>. Không cần cài đặt máy chủ SQL server bên ngoài.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportDatabaseJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Xuất JSON Dump Database</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 overflow-hidden">
        {/* Left: Table Selector & SQL Console (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto">
          {/* Table Cards */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              Các Bảng Trong library.db (4 Tables)
            </span>
            {tables.map(tbl => (
              <div
                key={tbl.name}
                onClick={() => {
                  setActiveTable(tbl.name as any);
                  setQueryOutput(null);
                }}
                className={`p-3 rounded-xl cursor-pointer border transition-all ${
                  activeTable === tbl.name && !queryOutput
                    ? 'bg-sky-950/70 border-sky-600/70 text-white shadow-sm'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono font-bold text-xs text-sky-300">
                    <Table className="w-3.5 h-3.5" />
                    <span>{tbl.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
                    {tbl.count} rows
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {tbl.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Mini SQL Runner */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chạy Thử Truy Vấn SQL</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">SQLite Engine</span>
            </div>

            <textarea
              rows={2}
              value={customQuery}
              onChange={e => setCustomQuery(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-[11px] focus:outline-none focus:border-sky-500"
            />

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setCustomQuery('SELECT * FROM Books WHERE Author LIKE \'%Martin%\';')}
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white"
                >
                  Books
                </button>
                <button
                  type="button"
                  onClick={() => setCustomQuery('SELECT * FROM Circulations WHERE Status = \'Overdue\';')}
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white"
                >
                  Overdue
                </button>
              </div>

              <button
                type="button"
                onClick={handleRunQuery}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold flex items-center gap-1 transition-colors"
              >
                <Play className="w-3 h-3" />
                <span>Execute</span>
              </button>
            </div>

            {queryError && (
              <div className="p-2 rounded bg-rose-950/80 border border-rose-800 text-rose-300 text-[10px]">
                {queryError}
              </div>
            )}
          </div>
        </div>

        {/* Right: Table Data Grid (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-sky-400" />
              <span className="font-mono font-bold text-xs text-white">
                {queryOutput ? 'KẾT QUẢ TRUY VẤN SQL' : `TABLE: ${activeTable}`}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {queryOutput ? `${queryOutput.length} records` : `${tables.find(t => t.name === activeTable)?.count} records`}
            </span>
          </div>

          <div className="flex-1 overflow-auto">
            {/* Display active table */}
            {queryOutput ? (
              <pre className="p-4 font-mono text-[11px] text-sky-300 overflow-auto">
                {JSON.stringify(queryOutput, null, 2)}
              </pre>
            ) : activeTable === 'Books' ? (
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 font-mono">BookID</th>
                    <th className="px-3 py-2 font-mono">ISBN</th>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Author</th>
                    <th className="px-3 py-2">Publisher</th>
                    <th className="px-3 py-2">ImagePath</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {books.map(b => (
                    <tr key={b.bookId} className="hover:bg-slate-800/30">
                      <td className="px-3 py-2 font-mono text-slate-400">{b.bookId}</td>
                      <td className="px-3 py-2 font-mono text-sky-400 font-semibold">{b.isbn}</td>
                      <td className="px-3 py-2 text-slate-200 font-medium max-w-[200px] truncate">{b.title}</td>
                      <td className="px-3 py-2 text-slate-300">{b.author}</td>
                      <td className="px-3 py-2 text-slate-400">{b.publisher}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-400 max-w-[150px] truncate">{b.imagePath}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : activeTable === 'BookCopies' ? (
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 font-mono">CopyID</th>
                    <th className="px-3 py-2 font-mono">BookID (FK)</th>
                    <th className="px-3 py-2 font-mono">Barcode</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">ConditionNote</th>
                    <th className="px-3 py-2">AddedDate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {copies.map(c => (
                    <tr key={c.copyId} className="hover:bg-slate-800/30">
                      <td className="px-3 py-2 font-mono text-slate-400">{c.copyId}</td>
                      <td className="px-3 py-2 font-mono text-slate-400">{c.bookId}</td>
                      <td className="px-3 py-2 font-mono text-sky-400 font-bold">{c.barcode}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          c.status === 'Available' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-300">{c.conditionNote || 'N/A'}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-400">{c.addedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : activeTable === 'Patrons' ? (
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 font-mono">PatronID</th>
                    <th className="px-3 py-2">FullName</th>
                    <th className="px-3 py-2 font-mono">CardBarcode</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">MembershipDate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {patrons.map(p => (
                    <tr key={p.patronId} className="hover:bg-slate-800/30">
                      <td className="px-3 py-2 font-mono text-slate-400">{p.patronId}</td>
                      <td className="px-3 py-2 font-bold text-slate-200">{p.fullName}</td>
                      <td className="px-3 py-2 font-mono text-violet-400 font-bold">{p.cardBarcode}</td>
                      <td className="px-3 py-2 text-slate-300">{p.phone}</td>
                      <td className="px-3 py-2 text-slate-400">{p.email}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-400">
                        {new Date(p.membershipDate).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 font-mono">TransactionID</th>
                    <th className="px-3 py-2 font-mono">CopyID</th>
                    <th className="px-3 py-2 font-mono">PatronID</th>
                    <th className="px-3 py-2">BorrowDate</th>
                    <th className="px-3 py-2">DueDate</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">FineAmount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {circulations.map(c => (
                    <tr key={c.transactionId} className="hover:bg-slate-800/30">
                      <td className="px-3 py-2 font-mono text-slate-400">{c.transactionId}</td>
                      <td className="px-3 py-2 font-mono text-slate-300">{c.copyId}</td>
                      <td className="px-3 py-2 font-mono text-slate-300">{c.patronId}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-400">
                        {new Date(c.borrowDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-200">
                        {new Date(c.dueDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          c.status === 'Returned' ? 'bg-emerald-950 text-emerald-400' : c.status === 'Overdue' ? 'bg-rose-950 text-rose-400' : 'bg-sky-950 text-sky-400'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-rose-400">
                        {c.fineAmount && c.fineAmount > 0 ? `${c.fineAmount.toLocaleString('vi-VN')} đ` : '0 đ'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
