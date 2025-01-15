export interface Book {
    id: string;
    title: string;
    pages: BookPage[];
    currentPage: number;
    language: string;
    createdAt: number;
    bookmarks: Bookmark[];
    settings?: BookSettings;
}

export interface BookSettings {
    translationLanguage: string | null; // null means no translation
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
    position: number;
}

export interface UserSettings {
    darkMode: boolean;
    fontSize: number;
    language: string;
    geminiApiKey?: string;
}