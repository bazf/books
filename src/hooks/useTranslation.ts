import { useEffect, useState } from 'react';
import { db } from '../lib/db';

const translations: Record<string, Record<string, string>> = {
  en: {
    loading: 'Loading...',
    pages: 'Pages',
    open: 'Open',
    export: 'Export',
    delete: 'Delete',
    addPage: 'Add Page',
    back: 'Back',
    dragDropImage: 'Drag and drop an image here or click to select',
    noApiKey: 'Please add your Gemini API key in settings',
    imageAnalysisError: 'Error analyzing image',
    addNewPage: 'Add New Page',
    // Add more translations
  },
  uk: {
    // Add Ukrainian translations
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