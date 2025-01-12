import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Book } from '../types';

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  async function loadBooks() {
    const loadedBooks = await db.getBooks();
    setBooks(loadedBooks);
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

  return { books, loading, addBook, deleteBook, reloadBooks: loadBooks };
}