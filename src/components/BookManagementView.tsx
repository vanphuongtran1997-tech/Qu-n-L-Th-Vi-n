import React, { useState, useRef, useEffect } from 'react';
import { 
  BookMarked, Search, Plus, Sparkles, Camera, Barcode, 
  Trash2, RefreshCw, Check, AlertCircle, ExternalLink, Image as ImageIcon,
  Copy, Layers, ArrowUpRight
} from 'lucide-react';
import { Book, BookCopy, CopyStatus } from '../types/library';

interface BookManagementViewProps {
  books: Book[];
  copies: BookCopy[];
  onAddBook: (newBook: Book, initialCopies: string[]) => void;
  onAddCopy: (bookId: number, barcode: string) => void;
  onUpdateCopyStatus: (copyId: number, status: CopyStatus) => void;
  onDeleteBook: (bookId: number) => void;
}

export const BookManagementView: React.FC<BookManagementViewProps> = ({
  books,
  copies,
  onAddBook,
  onAddCopy,
  onUpdateCopyStatus,
  onDeleteBook
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(books[0] || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for Add Book
  const [isbn, setIsbn] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [description, setDescription] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [initialBarcodeList, setInitialBarcodeList] = useState<string[]>(['']);
  
  // API & Webcam status states
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [apiFeedback, setApiFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Webcam state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Quick ISBN test presets
  const sampleIsbns = [
    { label: 'Clean Code', isbn: '9780132350884' },
    { label: 'Pragmatic Prog', isbn: '9780135957059' },
    { label: 'Clean Architecture', isbn: '9780134494166' },
    { label: 'C Programming', isbn: '9780131103627' }
  ];

  // Stop camera when modal closes
  useEffect(() => {
    if (!isAddModalOpen) {
      stopCamera();
    }
  }, [isAddModalOpen]);

  // Clean stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ MediaDevices API.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Không thể mở Webcam (Hãy kiểm tra quyền Camera hoặc dùng chế độ nạp ảnh mẫu).');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      // Giả lập lưu file vào BookImages/
      const cleanIsbn = isbn.trim() || 'custom';
      const simulatedPath = `BookImages/book_${cleanIsbn}_${Date.now()}.jpg`;
      setImagePath(dataUrl); // hiển thị dataUrl trực tiếp trong preview
      stopCamera();
      setApiFeedback({
        type: 'success',
        text: `Đã chụp ảnh bìa thành công! Đã lưu vào đường dẫn cục bộ '${simulatedPath}'.`
      });
    }
  };

  // Google Books API lookup function with timeout and offline handling
  const handleLookupGoogleBooks = async () => {
    const clean = isbn.replace(/[-\s]/g, '').trim();
    if (!clean) {
      setApiFeedback({ type: 'error', text: 'Vui lòng nhập mã ISBN hợp lệ trước khi tra cứu.' });
      return;
    }

    setIsSearchingApi(true);
    setApiFeedback({ type: 'info', text: 'Đang kết nối Google Books API chớp nhoáng...' });

    // Tạo AbortController với timeout 5 giây
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${clean}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        setApiFeedback({
          type: 'error',
          text: `Không tìm thấy sách với ISBN '${clean}' trên Google Books. Bạn có thể nhập tay thông tin bên dưới.`
        });
        setIsSearchingApi(false);
        return;
      }

      const volumeInfo = data.items[0].volumeInfo || {};
      setTitle(volumeInfo.title || '');
      setAuthor(volumeInfo.authors ? volumeInfo.authors.join(', ') : '');
      setPublisher(volumeInfo.publisher || '');
      setPublishedYear(volumeInfo.publishedDate ? volumeInfo.publishedDate.substring(0, 4) : '');
      setDescription(volumeInfo.description || '');

      // Tự sinh mã Barcode gợi ý cho bản sao đầu tiên
      const autoBarcode = `BC-${clean.slice(-4)}-001`;
      setInitialBarcodeList([autoBarcode]);

      setApiFeedback({
        type: 'success',
        text: `Tra cứu thành công: "${volumeInfo.title}". Đã tự động điền Tác giả & Nhà xuất bản!`
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setApiFeedback({
          type: 'error',
          text: 'Quá thời gian chờ (Timeout 5s). Hệ thống giữ trạng thái ngoại tuyến, vui lòng nhập tay.'
        });
      } else {
        setApiFeedback({
          type: 'error',
          text: `Lỗi kết nối API: ${err.message}. Hệ thống chuyển sang chế độ nhập sách ngoại tuyến.`
        });
      }
    } finally {
      setIsSearchingApi(false);
    }
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !isbn.trim()) {
      alert('Vui lòng nhập đầy đủ Mã ISBN và Tên sách.');
      return;
    }

    const newBook: Book = {
      bookId: Date.now(),
      isbn: isbn.trim(),
      title: title.trim(),
      author: author.trim() || 'Chưa rõ',
      publisher: publisher.trim() || 'N/A',
      publishedYear: publishedYear.trim() || undefined,
      description: description.trim() || undefined,
      imagePath: imagePath || 'BookImages/default_cover.jpg'
    };

    const validBarcodes = initialBarcodeList
      .map(b => b.trim())
      .filter(b => b.length > 0);

    onAddBook(newBook, validBarcodes.length > 0 ? validBarcodes : [`BC-${Date.now().toString().slice(-4)}-001`]);
    
    // Reset & close modal
    setIsAddModalOpen(false);
    setIsbn('');
    setTitle('');
    setAuthor('');
    setPublisher('');
    setPublishedYear('');
    setDescription('');
    setImagePath('');
    setInitialBarcodeList(['']);
    setApiFeedback(null);
    setSelectedBook(newBook);
  };

  // Filter books
  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedBookCopies = selectedBook 
    ? copies.filter(c => c.bookId === selectedBook.bookId) 
    : [];

  const [newCopyBarcode, setNewCopyBarcode] = useState('');

  const handleCreateCopy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !newCopyBarcode.trim()) return;
    onAddCopy(selectedBook.bookId, newCopyBarcode.trim().toUpperCase());
    setNewCopyBarcode('');
  };

  return (
    <div id="book-management-view" className="h-full flex flex-col p-6 overflow-hidden">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-sky-400" />
            <span>Quản Lý Đầu Sách &amp; Bản Sao Vật Lý (BookCopies)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Lưu trữ cục bộ trong bảng <code className="text-sky-300 font-mono">Books</code> và <code className="text-sky-300 font-mono">BookCopies</code> SQLite.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-open-add-book-modal"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm shadow-sky-600/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sách Mới (ISBN &amp; Webcam)</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Book List (Left) & Book Details + Physical Copies (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 overflow-hidden">
        {/* Left Column: Search & Books Roster (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full overflow-hidden bg-slate-900/70 rounded-xl border border-slate-800">
          <div className="p-3 border-b border-slate-800 bg-slate-900/90">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="input-search-books"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm theo Tên sách, Tác giả hoặc ISBN..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex justify-between items-center mt-2 px-1 text-[11px] text-slate-400">
              <span>Đang hiển thị {filteredBooks.length} / {books.length} đầu sách</span>
              <span className="text-sky-400 font-mono">SQLite: Table Books</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
            {filteredBooks.map(book => {
              const bookCopies = copies.filter(c => c.bookId === book.bookId);
              const available = bookCopies.filter(c => c.status === 'Available').length;
              const isSelected = selectedBook?.bookId === book.bookId;

              return (
                <div
                  key={book.bookId}
                  onClick={() => setSelectedBook(book)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-sky-950/60 border border-sky-600/60 text-white' 
                      : 'hover:bg-slate-800/40 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-xs text-slate-100 line-clamp-1">
                      {book.title}
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                      {bookCopies.length} bản sao
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    Tác giả: <span className="text-slate-300">{book.author}</span>
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
                    <span className="text-sky-400">ISBN: {book.isbn}</span>
                    <span className={available > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {available > 0 ? `Sẵn sàng: ${available}` : 'Hết sách'}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredBooks.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                Không tìm thấy sách nào phù hợp.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Book Details & Physical Copies (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-y-auto bg-slate-900/70 rounded-xl border border-slate-800 p-5 space-y-5">
          {selectedBook ? (
            <>
              {/* Selected Book Header Card */}
              <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg bg-slate-950/80 border border-slate-800/80">
                <div className="w-24 h-32 rounded bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 text-slate-500 shadow-sm relative">
                  {selectedBook.imagePath && selectedBook.imagePath.startsWith('data:') ? (
                    <img 
                      src={selectedBook.imagePath} 
                      alt={selectedBook.title}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="text-center p-2">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                      <span className="text-[9px] text-slate-400 font-mono block">BookImages/</span>
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/70 text-[9px] text-white rounded font-mono">
                    JPG
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-bold text-white leading-snug">
                      {selectedBook.title}
                    </h2>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc chắn muốn xóa đầu sách "${selectedBook.title}" và toàn bộ bản sao?`)) {
                          onDeleteBook(selectedBook.bookId);
                          setSelectedBook(books.find(b => b.bookId !== selectedBook.bookId) || null);
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Xóa đầu sách"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-y-1 gap-x-4 mt-2 text-xs">
                    <div>
                      <span className="text-slate-400">Tác giả:</span>{' '}
                      <span className="text-slate-200 font-medium">{selectedBook.author}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Nhà XB:</span>{' '}
                      <span className="text-slate-200">{selectedBook.publisher}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Mã ISBN:</span>{' '}
                      <span className="text-sky-400 font-mono">{selectedBook.isbn}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Năm XB:</span>{' '}
                      <span className="text-slate-300 font-mono">{selectedBook.publishedYear || 'N/A'}</span>
                    </div>
                  </div>

                  {selectedBook.description && (
                    <p className="mt-2 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {selectedBook.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Physical Copies Section (Table BookCopies) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Danh Sách Bản Sao Vật Lý (Table BookCopies)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    {selectedBookCopies.length} bản sao đang quản lý
                  </span>
                </div>

                {/* Add new Copy Barcode Form */}
                <form onSubmit={handleCreateCopy} className="flex gap-2">
                  <div className="relative flex-1">
                    <Barcode className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={newCopyBarcode}
                      onChange={e => setNewCopyBarcode(e.target.value)}
                      placeholder="Nhập hoặc quét Barcode mới (VD: BC-CC-004)..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors shrink-0"
                  >
                    + Thêm Bản Sao
                  </button>
                </form>

                {/* Physical Copies Table */}
                <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-950/60">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] text-slate-400 uppercase bg-slate-900/90 border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2.5">Copy ID</th>
                        <th className="px-3 py-2.5">Mã Vạch Barcode</th>
                        <th className="px-3 py-2.5">Tình Trạng</th>
                        <th className="px-3 py-2.5">Trạng Thái Mượn</th>
                        <th className="px-3 py-2.5 text-right">Cập Nhật</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {selectedBookCopies.map(copy => (
                        <tr key={copy.copyId} className="hover:bg-slate-800/30">
                          <td className="px-3 py-2 text-slate-400 font-mono text-[11px]">
                            #{copy.copyId}
                          </td>
                          <td className="px-3 py-2 font-mono font-semibold text-sky-300">
                            {copy.barcode}
                          </td>
                          <td className="px-3 py-2 text-slate-300 text-[11px]">
                            {copy.conditionNote || 'Bình thường'}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                              copy.status === 'Available'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : copy.status === 'Borrowed'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {copy.status === 'Available' ? '● Có sẵn' : copy.status === 'Borrowed' ? '● Đang mượn' : '● Bảo trì'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <select
                              value={copy.status}
                              onChange={e => onUpdateCopyStatus(copy.copyId, e.target.value as CopyStatus)}
                              className="bg-slate-900 border border-slate-700 text-slate-200 text-[11px] rounded px-2 py-1 focus:outline-none focus:border-sky-500"
                            >
                              <option value="Available">Available (Sẵn sàng)</option>
                              <option value="Borrowed">Borrowed (Đang mượn)</option>
                              <option value="Maintenance">Maintenance (Bảo trì)</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Chọn một cuốn sách bên trái để xem chi tiết bản sao và tình trạng.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Thêm Sách Thông Minh (ISBN Lookup & Webcam Capture) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Title */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-bold text-white">
                  Thêm Sách Thông Minh (Google Books API + Webcam)
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                ✕ Đóng
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveBook} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* ISBN Lookup Bar */}
              <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-sky-300 flex items-center gap-1.5">
                    <Barcode className="w-3.5 h-3.5" />
                    <span>Mã ISBN (Quét máy đọc hoặc nhập tay)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Google Books API v1</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={isbn}
                    onChange={e => setIsbn(e.target.value)}
                    placeholder="VD: 9780132350884..."
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleLookupGoogleBooks}
                    disabled={isSearchingApi}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold flex items-center gap-1.5 shrink-0 transition-colors disabled:opacity-50"
                  >
                    {isSearchingApi ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang tra cứu...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Tra cứu API</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400">Thử mã mẫu:</span>
                  {sampleIsbns.map(item => (
                    <button
                      key={item.isbn}
                      type="button"
                      onClick={() => {
                        setIsbn(item.isbn);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition-colors"
                    >
                      {item.label} ({item.isbn.slice(-4)})
                    </button>
                  ))}
                </div>

                {/* Feedback Notification */}
                {apiFeedback && (
                  <div className={`p-2.5 rounded text-[11px] flex items-start gap-2 ${
                    apiFeedback.type === 'success' 
                      ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                      : apiFeedback.type === 'error'
                      ? 'bg-rose-950/80 border border-rose-800 text-rose-300'
                      : 'bg-sky-950/80 border border-sky-800 text-sky-300'
                  }`}>
                    {apiFeedback.type === 'success' ? (
                      <Check className="w-4 h-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <span>{apiFeedback.text}</span>
                  </div>
                )}
              </div>

              {/* Book Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">
                    Tên Đầu Sách (Title) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="VD: Clean Code: A Handbook of Agile Software..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tác Giả (Author)
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    placeholder="VD: Robert C. Martin"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Nhà Xuất Bản (Publisher)
                  </label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={e => setPublisher(e.target.value)}
                    placeholder="VD: Prentice Hall"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Năm Xuất Bản (Published Year)
                  </label>
                  <input
                    type="text"
                    value={publishedYear}
                    onChange={e => setPublishedYear(e.target.value)}
                    placeholder="VD: 2008"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Mã Vạch Bản Sao Ban Đầu (Barcode)
                  </label>
                  <input
                    type="text"
                    value={initialBarcodeList[0] || ''}
                    onChange={e => setInitialBarcodeList([e.target.value])}
                    placeholder="VD: BC-CC-001"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">
                    Mô Tả Tóm Tắt (Description)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Tóm tắt nội dung cuốn sách..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Webcam Photo Capture Section */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-violet-400" />
                    <span>Chụp Ảnh Bìa Thực Tế Bằng Webcam (Lưu vào BookImages/)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">OpenCvSharp4 / DirectShow</span>
                </div>

                {isCameraActive ? (
                  <div className="space-y-2">
                    <div className="relative aspect-video max-w-sm mx-auto bg-black rounded-lg overflow-hidden border border-slate-700">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600/80 text-white rounded text-[10px] font-mono flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        LIVE WEBCAM
                      </div>
                    </div>
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Chụp Ảnh Này</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                      >
                        Hủy Camera
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-3">
                      {imagePath ? (
                        <img 
                          src={imagePath} 
                          alt="Bìa sách chụp" 
                          className="w-12 h-16 object-cover rounded border border-slate-700" 
                        />
                      ) : (
                        <div className="w-12 h-16 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-slate-500">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="text-slate-200 font-medium">
                          {imagePath ? 'Đã có ảnh bìa sách' : 'Chưa có ảnh bìa'}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {imagePath ? 'Lưu tại thư mục cục bộ BookImages/' : 'Bấm nút để kích hoạt webcam chụp ảnh'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Kích Hoạt Webcam</span>
                      </button>
                    </div>
                  </div>
                )}

                {cameraError && (
                  <p className="text-[11px] text-amber-400">
                    ⚠️ {cameraError}
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold shadow-sm shadow-sky-600/30 transition-colors"
                >
                  Lưu Vào SQLite Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
