import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface BookReaderDB extends DBSchema {
  books: {
    key: string;
    value: Book;
    indexes: {
      'by-title': string;
      'by-lastModified': number;
    };
  };
  deletedBooks: {
    key: string;
    value: Book & {
      deletedAt: number;
    };
  };
  settings: {
    key: 'userSettings';
    value: UserSettings;
  };
}

class DatabaseService {
  private db: Promise<IDBPDatabase<BookReaderDB>>;

  constructor() {
    this.db = openDB<BookReaderDB>('book-reader', 2, {
      upgrade(db, oldVersion) {
        // Handle version upgrades
        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains('books')) {
            const bookStore = db.createObjectStore('books');
            bookStore.createIndex('by-title', 'title');
            bookStore.createIndex('by-lastModified', 'lastModified');
          }
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings');
          }
        }
        
        // Add new stores and indexes for version 2
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('deletedBooks')) {
            db.createObjectStore('deletedBooks');
          }
        }
      },
    });
  }

  async getBooks(): Promise<Book[]> {
    const db = await this.db;
    const books = await db.getAll('books');
    return books;
  }

  async getBook(id: string): Promise<Book | undefined> {
    const db = await this.db;
    const book = await db.get('books', id);
    return book;
  }

  async saveBook(book: Book): Promise<void> {
    const db = await this.db;
    // Ensure lastModified is set
    const updatedBook = {
      ...book,
      lastModified: Date.now(),
      deletedPages: book.deletedPages || []
    };
    await db.put('books', updatedBook, book.id);
  }

  async deleteBook(id: string): Promise<void> {
    const db = await this.db;
    const book = await this.getBook(id);
    if (book) {
      // Move to deletedBooks store with timestamp
      await db.put('deletedBooks', {
        ...book,
        deletedAt: Date.now()
      }, id);
      await db.delete('books', id);
    }
  }

  async restoreBook(id: string): Promise<void> {
    const db = await this.db;
    const deletedBook = await db.get('deletedBooks', id);
    if (deletedBook) {
      const { deletedAt, ...bookData } = deletedBook;
      await db.put('books', {
        ...bookData,
        lastModified: Date.now()
      }, id);
      await db.delete('deletedBooks', id);
    }
  }

  async getDeletedBooks(): Promise<(Book & { deletedAt: number })[]> {
    const db = await this.db;
    return db.getAll('deletedBooks');
  }

  async deletePage(bookId: string, pageId: string): Promise<void> {
    const book = await this.getBook(bookId);
    if (!book) return;

    const updatedPages = book.pages.map(page =>
      page.id === pageId ? { ...page, isDeleted: true } : page
    );

    await this.saveBook({
      ...book,
      pages: updatedPages,
      deletedPages: [...(book.deletedPages || []), pageId]
    });
  }

  async restorePage(bookId: string, pageId: string): Promise<void> {
    const book = await this.getBook(bookId);
    if (!book) return;

    const updatedPages = book.pages.map(page =>
      page.id === pageId ? { ...page, isDeleted: false } : page
    );

    await this.saveBook({
      ...book,
      pages: updatedPages,
      deletedPages: (book.deletedPages || []).filter(id => id !== pageId)
    });
  }

  async getUserSettings(): Promise<UserSettings> {
    const db = await this.db;
    const settings = await db.get('settings', 'userSettings');
    return settings || {
      darkMode: false,
      fontSize: 16,
      language: 'en',
    };
  }

  async saveUserSettings(settings: UserSettings): Promise<void> {
    const db = await this.db;
    await db.put('settings', settings, 'userSettings');
  }
}

export const db = new DatabaseService();