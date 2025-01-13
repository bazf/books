import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface BookReaderDB extends DBSchema {
  books: {
    key: string;
    value: Book;
  };
  settings: {
    key: 'userSettings';
    value: UserSettings;
  };
}

class DatabaseService {
    private db: Promise<IDBPDatabase<BookReaderDB>>;
  
    constructor() {
      this.db = openDB<BookReaderDB>('book-reader', 1, {
        upgrade(db) {
          // Check if stores exist before creating them
          if (!db.objectStoreNames.contains('books')) {
            db.createObjectStore('books');
          }
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings');
          }
        },
      });
    }
  
    async getBooks(): Promise<Book[]> {
      const db = await this.db;
      const books = await db.getAll('books');
      console.log('Retrieved all books:', books);
      return books;
    }
  
    async getBook(id: string): Promise<Book | undefined> {
      const db = await this.db;
      const book = await db.get('books', id);
      console.log('Retrieved book:', id, book);
      return book;
    }
  
    async saveBook(book: Book): Promise<void> {
      console.log('Saving book:', book);
      const db = await this.db;
      await db.put('books', book, book.id);
      
      // Verify the save
      const savedBook = await this.getBook(book.id);
      console.log('Verified saved book:', savedBook);
      if (!savedBook) {
        throw new Error('Book failed to save properly');
      }
    }
  
    async deleteBook(id: string): Promise<void> {
      const db = await this.db;
      await db.delete('books', id);
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