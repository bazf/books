export interface Book {
    id: string;
    title: string;
    pages: BookPage[];
    currentPage: number;
    language: string;
    createdAt: number;
    bookmarks: Bookmark[];
}

export interface BookPage {
    id: string;
    content: string;
    chapterTitle?: string;
}

export interface Bookmark {
    id: string;
    pageId: string;
    title: string;
    note?: string;
    createdAt: number;
    position: number; // Page position where bookmark was added
}

export interface UserSettings {
    darkMode: boolean;
    fontSize: number;
    language: string;
    geminiApiKey?: string;
}