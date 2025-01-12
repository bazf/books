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
        db.createObjectStore('books');
        db.createObjectStore('settings');
      },
    });
  }

  async getBooks(): Promise<Book[]> {
    const db = await this.db;
    return db.getAll('books');
  }

  async getBook(id: string): Promise<Book | undefined> {
    const db = await this.db;
    return db.get('books', id);
  }

  async saveBook(book: Book): Promise<void> {
    const db = await this.db;
    await db.put('books', book, book.id);
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