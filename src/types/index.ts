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
    translationLanguage: string | null;
}

export interface BookPage {
    id: string;
    content: string;
    chapterTitle?: string;
    shortName?: string;
    pageNumber?: number;
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