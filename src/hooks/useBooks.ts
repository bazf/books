import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Book } from '../types';

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [deletedBooks, setDeletedBooks] = useState<(Book & { deletedAt: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  async function loadBooks() {
    const [loadedBooks, loadedDeletedBooks] = await Promise.all([
      db.getBooks(),
      db.getDeletedBooks()
    ]);
    setBooks(loadedBooks);
    setDeletedBooks(loadedDeletedBooks);
    setLoading(false);
  }

  async function addBook(book: Book) {
    await db.saveBook(book);
    await loadBooks();
  }

  async function deleteBook(id: string) {
    await db.deleteBook(id);
    await loadBooks();
  }

  async function restoreBook(id: string) {
    await db.restoreBook(id);
    await loadBooks();
  }

  return { 
    books, 
    deletedBooks,
    loading, 
    addBook, 
    deleteBook,
    restoreBook,
    reloadBooks: loadBooks 
  };
}