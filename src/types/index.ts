export interface Book {
    id: string;
    title: string;
    pages: BookPage[];
    currentPage: number;
    language: string;
    createdAt: number;
  }
  
  export interface BookPage {
    id: string;
    content: string;
    chapterTitle?: string;
  }
  
  export interface UserSettings {
    darkMode: boolean;
    fontSize: number;
    language: string;
    geminiApiKey?: string;
  }