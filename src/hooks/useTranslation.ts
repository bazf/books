import { useEffect, useState } from 'react';
import { db } from '../lib/db';

// Type for translation variables
type TranslationVariables = Record<string, string | number>;

const translations: Record<string, Record<string, string>> = {
    en: {
      // Existing translations...
      
      // BookList
      yourBooks: 'Your Books',
      noBooks: 'No books yet',
      pagesCount: 'Pages: {{count}}',
      importBook: 'Import Book',
      addBook: 'Add Book',
      createBook: 'Create Book',
      deleteBookConfirm: 'Are you sure you want to delete this book? This action cannot be undone.',
      importing: 'Importing book...',
      importError: 'Failed to import book',
      invalidBookFormat: 'Invalid book file format',
  
      // Settings
      settings: 'Settings',
      darkMode: 'Dark Mode',
      fontSize: 'Font Size',
      language: 'Language',
      geminiApiKey: 'Gemini API Key',
      enterApiKey: 'Enter API Key',
      selectLanguage: 'Select Language',
  
      // Bookmarks
      bookmarks: 'Bookmarks',
      noBookmarks: 'No bookmarks yet',
      addBookmark: 'Add Bookmark',
      bookmarkTitle: 'Bookmark Title',
      bookmarkNote: 'Note (optional)',
      bookmarkTitlePlaceholder: 'Enter bookmark title',
      bookmarkNotePlaceholder: 'Enter note (optional)',
      deleteBookmarkConfirm: 'Are you sure you want to delete this bookmark?',
  
          // Book Settings
    selectTranslationLanguage: 'Select translation language',
    currentTranslationLanguage: 'Current translation language: {{language}}',
    exportBookAriaLabel: 'Export book: {{title}}',
    none: 'None',
  
      // Add Page
      addNewPage: 'Add New Page',
      readingImage: 'Reading image...',
      analyzingImage: 'Analyzing image...',
      savingPage: 'Saving page...',
      untitled: 'Untitled',
      dragDropImage: 'Drag and drop an image here or click to select',
      pasteImage: 'Or paste an image (Ctrl+V)',
  
      // Languages
      ukrainian: 'Ukrainian',
      spanish: 'Spanish',
      french: 'French',
      german: 'German',
      italian: 'Italian',
      portuguese: 'Portuguese',
      polish: 'Polish',
      english: 'English',

      // Bookmark Item
    goTo: 'Go to',
    remove: 'Remove',
    pageNumber: 'Page {{number}}',
    bookmarksList: 'Bookmarks list',
    goToBookmark: 'Go to bookmark: {{title}}',
    removeBookmark: 'Remove bookmark: {{title}}',
    },
    uk: {
      // Existing translations...
      
      // BookList
      yourBooks: 'Ваші книги',
      noBooks: 'Ще немає книг',
      pagesCount: 'Сторінок: {{count}}',
      importBook: 'Імпортувати книгу',
      addBook: 'Додати книгу',
      createBook: 'Створити книгу',
      deleteBookConfirm: 'Ви впевнені, що хочете видалити цю книгу? Цю дію не можна відмінити.',
      importing: 'Імпортування книги...',
      importError: 'Не вдалося імпортувати книгу',
      invalidBookFormat: 'Невірний формат файлу книги',
  
      // Settings
      settings: 'Налаштування',
      darkMode: 'Темний режим',
      fontSize: 'Розмір шрифту',
      language: 'Мова',
      geminiApiKey: 'Ключ Gemini API',
      enterApiKey: 'Введіть ключ API',
      selectLanguage: 'Виберіть мову',
  
      // Bookmarks
      bookmarks: 'Закладки',
      noBookmarks: 'Ще немає закладок',
      addBookmark: 'Додати закладку',
      bookmarkTitle: 'Назва закладки',
      bookmarkNote: 'Примітка (необов\'язково)',
      bookmarkTitlePlaceholder: 'Введіть назву закладки',
      bookmarkNotePlaceholder: 'Введіть примітку (необов\'язково)',
      deleteBookmarkConfirm: 'Ви впевнені, що хочете видалити цю закладку?',
  
      // Book Settings
    selectTranslationLanguage: 'Виберіть мову перекладу',
    currentTranslationLanguage: 'Поточна мова перекладу: {{language}}',
    exportBookAriaLabel: 'Експортувати книгу: {{title}}',
    none: 'Немає',
  
      // Add Page
      addNewPage: 'Додати нову сторінку',
      readingImage: 'Читання зображення...',
      analyzingImage: 'Аналіз зображення...',
      savingPage: 'Збереження сторінки...',
      untitled: 'Без назви',
      dragDropImage: 'Перетягніть зображення сюди або клацніть, щоб вибрати',
      pasteImage: 'Або вставте зображення (Ctrl+V)',
  
      // Languages
      ukrainian: 'Українська',
      spanish: 'Іспанська',
      french: 'Французька',
      german: 'Німецька',
      italian: 'Італійська',
      portuguese: 'Португальська',
      polish: 'Польська',
      english: 'Англійська',

      // Bookmark Item
    goTo: 'Перейти',
    remove: 'Видалити',
    pageNumber: 'Сторінка {{number}}',
    bookmarksList: 'Список закладок',
    goToBookmark: 'Перейти до закладки: {{title}}',
    removeBookmark: 'Видалити закладку: {{title}}',
    }
  }

export function useTranslation() {
    const [language, setLanguage] = useState('en');
  
    useEffect(() => {
      db.getUserSettings().then(settings => {
        setLanguage(settings.language);
      });
    }, []);
  
    function t(key: string, variables?: TranslationVariables): string {
      let text = translations[language]?.[key] || key;
      
      if (variables) {
        Object.entries(variables).forEach(([key, value]) => {
          text = text.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        });
      }
      
      return text;
    }
  
    return { t, language };
}