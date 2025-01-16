import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Book } from "../types";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function exportBookToJson(book: Book): string {
  return JSON.stringify(book);
}

export function importBookFromJson(json: string): Book | null {
  try {
    const book = JSON.parse(json);
    if (!isValidBook(book)) {
      return null;
    }
    return book;
  } catch (e) {
    return null;
  }
}

export function isValidBook(book: any): book is Book {
  return (
    typeof book === 'object' &&
    typeof book.id === 'string' &&
    typeof book.title === 'string' &&
    Array.isArray(book.pages) &&
    typeof book.currentPage === 'number' &&
    typeof book.language === 'string' &&
    typeof book.createdAt === 'number' &&
    Array.isArray(book.bookmarks)
  );
}

export function generateUniqueBookTitle(existingTitles: string[], baseTitle: string): string {
  let title = baseTitle;
  let counter = 1;
  
  while (existingTitles.includes(title)) {
    title = `${baseTitle} (${counter})`;
    counter++;
  }
  
  return title;
}