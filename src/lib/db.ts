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
    this.db = openDB<BookReaderDB>('book-reader', 3, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Version 1: Initial setup
        if (oldVersion < 1) {
          const bookStore = db.createObjectStore('books', { keyPath: 'id' });
          bookStore.createIndex('by-title', 'title');
          bookStore.createIndex('by-lastModified', 'lastModified');
          db.createObjectStore('settings');
        }
        
        // Version 2: Add deleted books store
        if (oldVersion < 2) {
          // Create deletedBooks store if it doesn't exist
          if (!db.objectStoreNames.contains('deletedBooks')) {
            db.createObjectStore('deletedBooks', { keyPath: 'id' });
          }
        }

        // Version 3: Add bookmarks support
        if (oldVersion < 3) {
          const store = transaction.objectStore('books');
          // Initialize bookmarks array for all existing books
          store.getAll().then(books => {
            books.forEach(book => {
              if (!book.bookmarks) {
                book.bookmarks = [];
                store.put(book);
              }
            });
          });
        }
      },
      blocked(currentVersion, blockedVersion, event) {
        console.warn('Database upgrade blocked. Please close other tabs of this app.');
      },
      blocking(currentVersion, blockedVersion, event) {
        console.warn('This tab is blocking database upgrade in other tabs.');
      },
      terminated() {
        console.error('Database connection terminated unexpectedly.');
      }
    });

    // Handle database connection errors
    this.db.catch(error => {
      console.error('Failed to connect to database:', error);
    });
  }

  async getBooks(): Promise<Book[]> {
    try {
      const db = await this.db;
      const books = await db.getAll('books');
      return books;
    } catch (error) {
      console.error('Error getting books:', error);
      return [];
    }
  }

  async getBook(id: string): Promise<Book | undefined> {
    try {
      const db = await this.db;
      const book = await db.get('books', id);
      return book;
    } catch (error) {
      console.error('Error getting book:', error);
      return undefined;
    }
  }

  async saveBook(book: Book): Promise<void> {
    try {
      const db = await this.db;      
      const updatedBook = {
        ...book,
        lastModified: Date.now(),
        bookmarks: book.bookmarks || []
      };
      await db.put('books', updatedBook);
    } catch (error) {
      console.error('Error saving book:', error);
      throw error;
    }
  }

  async addBookmark(bookId: string, bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Promise<void> {
    try {
      const book = await this.getBook(bookId);
      if (!book) return;

      const newBookmark: Bookmark = {
        ...bookmark,
        id: crypto.randomUUID(),
        createdAt: Date.now()
      };

      await this.saveBook({
        ...book,
        bookmarks: [...(book.bookmarks || []), newBookmark]
      });
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }

  async removeBookmark(bookId: string, bookmarkId: string): Promise<void> {
    try {
      const book = await this.getBook(bookId);
      if (!book) return;

      await this.saveBook({
        ...book,
        bookmarks: book.bookmarks.filter(b => b.id !== bookmarkId)
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  }

  async updateBookmark(bookId: string, bookmarkId: string, updates: Partial<Bookmark>): Promise<void> {
    try {
      const book = await this.getBook(bookId);
      if (!book) return;

      await this.saveBook({
        ...book,
        bookmarks: book.bookmarks.map(b => 
          b.id === bookmarkId ? { ...b, ...updates } : b
        )
      });
    } catch (error) {
      console.error('Error updating bookmark:', error);
      throw error;
    }
  }

  async deleteBook(id: string): Promise<void> {
    try {
      const db = await this.db;
      const book = await this.getBook(id);
      if (book) {
        await db.put('deletedBooks', {
          ...book,
          deletedAt: Date.now()
        });
        await db.delete('books', id);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  }

  async restoreBook(id: string): Promise<void> {
    try {
      const db = await this.db;
      const deletedBook = await db.get('deletedBooks', id);
      if (deletedBook) {
        const { deletedAt, ...bookData } = deletedBook;
        await db.put('books', {
          ...bookData,
          lastModified: Date.now()
        });
        await db.delete('deletedBooks', id);
      }
    } catch (error) {
      console.error('Error restoring book:', error);
      throw error;
    }
  }

  async getDeletedBooks(): Promise<(Book & { deletedAt: number })[]> {
    try {
      const db = await this.db;
      return db.getAll('deletedBooks');
    } catch (error) {
      console.error('Error getting deleted books:', error);
      return [];
    }
  }

  async deletePage(bookId: string, pageId: string): Promise<void> {
    try {
      const book = await this.getBook(bookId);
      if (!book) return;
  
      const updatedPages = book.pages.filter(page => page.id !== pageId);
  
      // Recalculate page numbers
      const pagesWithNumbers = updatedPages.map((page, index) => ({
        ...page,
        pageNumber: index + 1
      }));
  
      // Remove any bookmarks associated with the deleted page
      const updatedBookmarks = book.bookmarks.filter(
        bookmark => bookmark.pageId !== pageId
      );
  
      await this.saveBook({
        ...book,
        pages: pagesWithNumbers,
        bookmarks: updatedBookmarks,
        currentPage: Math.min(book.currentPage, pagesWithNumbers.length - 1)
      });
    } catch (error) {
      console.error('Error deleting page:', error);
      throw error;
    }
  }

  async restorePage(bookId: string, pageId: string): Promise<void> {
    try {
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
    } catch (error) {
      console.error('Error restoring page:', error);
      throw error;
    }
  }

  async getUserSettings(): Promise<UserSettings> {
    try {
      const db = await this.db;
      const settings = await db.get('settings', 'userSettings');
      return settings || {
        darkMode: false,
        fontSize: 16,
        language: 'en',
      };
    } catch (error) {
      console.error('Error getting user settings:', error);
      return {
        darkMode: false,
        fontSize: 16,
        language: 'en',
      };
    }
  }

  async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      const db = await this.db;
      await db.put('settings', settings, 'userSettings');
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }
  }
}

export const db = new DatabaseService();