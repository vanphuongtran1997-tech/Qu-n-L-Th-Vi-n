export type CopyStatus = 'Available' | 'Borrowed' | 'Maintenance';
export type TransactionStatus = 'Active' | 'Returned' | 'Overdue';

export interface Book {
  bookId: number;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  imagePath?: string;
  description?: string;
  publishedYear?: string;
  pageCount?: number;
  categories?: string[];
}

export interface BookCopy {
  copyId: number;
  bookId: number;
  barcode: string;
  status: CopyStatus;
  conditionNote?: string;
  addedDate: string;
}

export interface Patron {
  patronId: number;
  fullName: string;
  email: string;
  phone: string;
  membershipDate: string;
  cardBarcode: string;
  activeLoansCount?: number;
}

export interface Circulation {
  transactionId: number;
  copyId: number;
  patronId: number;
  borrowDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: TransactionStatus;
  fineAmount?: number;
  notes?: string;
}

export interface GoogleBookVolumeInfo {
  title?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
}

export interface CSharpSourceFile {
  path: string;
  fileName: string;
  language: 'csharp' | 'xml' | 'json' | 'markdown';
  category: 'Project' | 'Models' | 'Data' | 'Services' | 'Views' | 'Docs';
  description: string;
  code: string;
}
