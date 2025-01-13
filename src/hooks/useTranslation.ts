import { useEffect, useState } from 'react';
import { db } from '../lib/db';

const translations: Record<string, Record<string, string>> = {
    en: {
      // Loading states
      loading: 'Loading...',
      
      // Navigation
      back: 'Back',
      open: 'Open',
      
      // Book actions
      export: 'Export',
      delete: 'Delete',
      deleteBook: 'Delete Book',
      deleteBookConfirmTitle: 'Delete Book',
      deleteBookConfirmDescription: 'Are you sure you want to delete this book? This action can be undone within 30 days.',
      
      // Page management
      pages: 'Pages',
      page: 'Page',
      addPage: 'Add Page',
      addFirstPage: 'Add First Page',
      addNewPage: 'Add New Page',
      previousPage: 'Previous Page',
      nextPage: 'Next Page',
      pageOf: 'Page {{current}} of {{total}}',
      noPages: 'This book has no pages yet. Add your first page to get started.',
      deletedPage: 'Deleted Page',
      deletedPageDescription: 'This page has been deleted. You can restore it or navigate to another page.',
      restorePage: 'Restore Page',
      
      // Dialog actions
      cancel: 'Cancel',
      confirm: 'Confirm',
      
      // Image upload
      dragDropImage: 'Drag and drop an image here or click to select',
      
      // Error messages
      noApiKey: 'Please add your Gemini API key in settings',
      imageAnalysisError: 'Error analyzing image',
      fileReadError: 'Error reading file',
      saveError: 'Error saving book'
    },
    uk: {
      // Loading states
      loading: 'Завантаження...',
      
      // Navigation
      back: 'Назад',
      open: 'Відкрити',
      
      // Book actions
      export: 'Експорт',
      delete: 'Видалити',
      deleteBook: 'Видалити книгу',
      deleteBookConfirmTitle: 'Видалити книгу',
      deleteBookConfirmDescription: 'Ви впевнені, що хочете видалити цю книгу? Цю дію можна скасувати протягом 30 днів.',
      
      // Page management
      pages: 'Сторінки',
      page: 'Сторінка',
      addPage: 'Додати сторінку',
      addFirstPage: 'Додати першу сторінку',
      addNewPage: 'Додати нову сторінку',
      previousPage: 'Попередня сторінка',
      nextPage: 'Наступна сторінка',
      pageOf: 'Сторінка {{current}} з {{total}}',
      noPages: 'У цій книзі ще немає сторінок. Додайте першу сторінку, щоб почати.',
      deletedPage: 'Видалена сторінка',
      deletedPageDescription: 'Цю сторінку було видалено. Ви можете відновити її або перейти до іншої сторінки.',
      restorePage: 'Відновити сторінку',
      
      // Dialog actions
      cancel: 'Скасувати',
      confirm: 'Підтвердити',
      
      // Image upload
      dragDropImage: 'Перетягніть зображення сюди або клацніть, щоб вибрати',
      
      // Error messages
      noApiKey: 'Будь ласка, додайте свій ключ Gemini API в налаштуваннях',
      imageAnalysisError: 'Помилка аналізу зображення',
      fileReadError: 'Помилка читання файлу',
      saveError: 'Помилка збереження книги'
    }
  };

export function useTranslation() {
    const [language, setLanguage] = useState('en');
  
    useEffect(() => {
      db.getUserSettings().then(settings => {
        setLanguage(settings.language);
      });
    }, []);
  
    function t(key: string): string {
      return translations[language]?.[key] || key;
    }
  
    return { t, language };
  }