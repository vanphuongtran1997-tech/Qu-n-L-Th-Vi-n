import { Book, BookCopy, Patron, Circulation } from '../types/library';

export const INITIAL_BOOKS: Book[] = [
  {
    bookId: 1,
    isbn: '9780132350884',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    publisher: 'Prentice Hall',
    publishedYear: '2008',
    imagePath: 'BookImages/clean_code.jpg',
    description: 'Nguyên lý viết mã sạch, kiến trúc phần mềm linh hoạt và bảo trì mã nguồn chuẩn mực cho kỹ sư chuyên nghiệp.',
    categories: ['Công nghệ thông tin', 'Lập trình', 'Kiến trúc phần mềm']
  },
  {
    bookId: 2,
    isbn: '9780135957059',
    title: 'The Pragmatic Programmer: Your Journey To Mastery',
    author: 'David Thomas, Andrew Hunt',
    publisher: 'Addison-Wesley Professional',
    publishedYear: '2019',
    imagePath: 'BookImages/pragmatic.jpg',
    description: 'Cẩm nang tư duy lập trình viên thực tế, cách quản lý công việc và phát triển sự nghiệp kỹ sư phần mềm.',
    categories: ['Lập trình', 'Kỹ năng phần mềm']
  },
  {
    bookId: 3,
    isbn: '9780134494166',
    title: 'Clean Architecture: A Craftsman\'s Guide to Software Structure',
    author: 'Robert C. Martin',
    publisher: 'Prentice Hall',
    publishedYear: '2017',
    imagePath: 'BookImages/clean_arch.jpg',
    description: 'Các quy tắc cốt lõi về cấu trúc và thiết kế hệ thống phần mềm độc lập với framework và database.',
    categories: ['Kiến trúc phần mềm', 'Thiết kế hệ thống']
  },
  {
    bookId: 4,
    isbn: '9780596517748',
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    publisher: 'O\'Reilly Media',
    publishedYear: '2008',
    imagePath: 'BookImages/js_good_parts.jpg',
    description: 'Khám phá các tính năng tinh hoa và tránh các cạm bẫy của ngôn ngữ lập trình JavaScript.',
    categories: ['Web Development', 'JavaScript']
  }
];

export const INITIAL_COPIES: BookCopy[] = [
  { copyId: 1, bookId: 1, barcode: 'BC-CC-001', status: 'Available', addedDate: '2026-01-10', conditionNote: 'Sách mới 100%' },
  { copyId: 2, bookId: 1, barcode: 'BC-CC-002', status: 'Borrowed', addedDate: '2026-01-10', conditionNote: 'Tình trạng tốt' },
  { copyId: 3, bookId: 1, barcode: 'BC-CC-003', status: 'Available', addedDate: '2026-02-15', conditionNote: 'Gáy sách hơi sờn' },
  { copyId: 4, bookId: 2, barcode: 'BC-PP-001', status: 'Available', addedDate: '2026-02-01', conditionNote: 'Nguyên vẹn' },
  { copyId: 5, bookId: 2, barcode: 'BC-PP-002', status: 'Borrowed', addedDate: '2026-02-01', conditionNote: 'Có ghi chú trang 45' },
  { copyId: 6, bookId: 3, barcode: 'BC-CA-001', status: 'Available', addedDate: '2026-03-05', conditionNote: 'Mới nhập kho' },
  { copyId: 7, bookId: 4, barcode: 'BC-JS-001', status: 'Maintenance', addedDate: '2026-03-10', conditionNote: 'Đang dán lại bìa' }
];

export const INITIAL_PATRONS: Patron[] = [
  {
    patronId: 1,
    fullName: 'Nguyễn Văn An',
    email: 'an.nguyen@example.com',
    phone: '0901234567',
    cardBarcode: 'CARD-001',
    membershipDate: '2025-09-01',
    activeLoansCount: 1
  },
  {
    patronId: 2,
    fullName: 'Trần Thị Mai',
    email: 'mai.tran@example.com',
    phone: '0912345678',
    cardBarcode: 'CARD-002',
    membershipDate: '2025-11-15',
    activeLoansCount: 1
  },
  {
    patronId: 3,
    fullName: 'Lê Hoàng Nam',
    email: 'nam.le@example.com',
    phone: '0987654321',
    cardBarcode: 'CARD-003',
    membershipDate: '2026-01-20',
    activeLoansCount: 0
  },
  {
    patronId: 4,
    fullName: 'Phạm Thu Trang',
    email: 'trang.pham@example.com',
    phone: '0933445566',
    cardBarcode: 'CARD-004',
    membershipDate: '2026-02-10',
    activeLoansCount: 0
  }
];

export const INITIAL_CIRCULATIONS: Circulation[] = [
  {
    transactionId: 1,
    copyId: 2, // BC-CC-002
    patronId: 1, // Nguyễn Văn An
    borrowDate: '2026-09-01T10:00:00',
    dueDate: '2026-09-15T23:59:59',
    returnDate: null,
    status: 'Active',
    fineAmount: 0,
    notes: 'Mượn phục vụ nghiên cứu luận văn'
  },
  {
    transactionId: 2,
    copyId: 5, // BC-PP-002
    patronId: 2, // Trần Thị Mai
    borrowDate: '2026-08-20T09:30:00',
    dueDate: '2026-09-03T23:59:59', // Quá hạn ~11 ngày
    returnDate: null,
    status: 'Overdue',
    fineAmount: 55000,
    notes: 'Đã gửi SMS nhắc nhở ngày 05/09'
  },
  {
    transactionId: 3,
    copyId: 1,
    patronId: 3,
    borrowDate: '2026-08-01T14:15:00',
    dueDate: '2026-08-15T23:59:59',
    returnDate: '2026-08-14T16:00:00',
    status: 'Returned',
    fineAmount: 0,
    notes: 'Trả đúng hạn, sách nguyên vẹn'
  }
];
