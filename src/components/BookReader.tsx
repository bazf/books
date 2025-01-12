import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Menu, Sun, Moon, Type } from 'lucide-react';
import { useTheme } from './providers';

export function BookReader() {
  const { theme, toggleTheme } = useTheme();
  const [fontSize, setFontSize] = useState('base');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fontSizes = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className="fixed top-0 w-full bg-white dark:bg-gray-800 shadow-md z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Book Title</h1>
          <div className="flex gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <button 
              onClick={() => {
                const sizes = Object.keys(fontSizes);
                const currentIndex = sizes.indexOf(fontSize);
                const nextIndex = (currentIndex + 1) % sizes.length;
                setFontSize(sizes[nextIndex]);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <Type className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className={`w-64 h-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-4 shadow-lg`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Contents</h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                ×
              </button>
            </div>
            <nav>
              <ul className="space-y-2">
                <li>
                  <a href="#chapter1" className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    Chapter 1
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20 pb-24">
        <div className={`prose max-w-none ${fontSizes[fontSize]} ${theme === 'dark' ? 'prose-invert' : ''}`}>
          <div className="page">
            {/* Content will be inserted here */}
            <p>Sample content will go here...</p>
          </div>
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 w-full bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-sm">Page {currentPage}</span>
          <button 
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default BookReader;