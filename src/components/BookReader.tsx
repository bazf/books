import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/db';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { analyzeImage } from '../lib/gemini';
import { useTranslation } from '../hooks/useTranslation';
import { Loader2 } from 'lucide-react';

export function BookReader() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [showAddPage, setShowAddPage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    loadBook();
  }, [id]);

  async function loadBook() {
    if (!id) return;
    const loadedBook = await db.getBook(id);
    if (loadedBook) {
      setBook(loadedBook);
    }
  }

  async function handleImageUpload(file: File) {
    const settings = await db.getUserSettings();
    if (!settings.geminiApiKey) {
      alert(t('noApiKey'));
      return;
    }
  
    setIsProcessing(true);
    setProcessingStatus('Reading image...');
  
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imageData = e.target?.result as string;
        setProcessingStatus('Analyzing image with Gemini...');
        const text = await analyzeImage(settings.geminiApiKey!, imageData);
        
        if (!text || typeof text !== 'string') {
          throw new Error('Invalid response from Gemini API');
        }
  
        setProcessingStatus('Saving page...');
        if (book) {
          console.log('Current book state:', book);
          
          const newPage: BookPage = {
            id: crypto.randomUUID(),
            content: text,
          };
          
          console.log('New page:', newPage);
  
          const updatedBook: Book = {
            ...book,
            pages: [...(book.pages || []), newPage],
            currentPage: book.pages ? book.pages.length : 0,
          };
          
          console.log('Updated book before save:', updatedBook);
          
          try {
            await db.saveBook(updatedBook);
            console.log('Book saved successfully');
            
            // Reload the book to verify the save
            const reloadedBook = await db.getBook(book.id);
            console.log('Reloaded book after save:', reloadedBook);
            
            if (reloadedBook) {
              setBook(reloadedBook);
              setShowAddPage(false);
            } else {
              throw new Error('Failed to reload book after save');
            }
          } catch (error) {
            console.error('Error saving book:', error);
            alert(t('saveError'));
          }
        }
      } catch (error) {
        console.error('Error processing image:', error);
        alert(t('imageAnalysisError'));
      } finally {
        setIsProcessing(false);
        setProcessingStatus('');
      }
    };
  
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      setIsProcessing(false);
      setProcessingStatus('');
      alert(t('fileReadError'));
    };
  
    reader.readAsDataURL(file);
  }

  async function updateCurrentPage(pageIndex: number) {
    if (!book) return;
    
    const updatedBook = {
      ...book,
      currentPage: pageIndex
    };
    
    await db.saveBook(updatedBook);
    setBook(updatedBook);
  }

  if (!book) {
    return <div className="p-4">{t('loading')}</div>;
  }

  const currentPage = book.pages[book.currentPage];
  const hasNextPage = book.currentPage < book.pages.length - 1;
  const hasPrevPage = book.currentPage > 0;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{book.title}</h1>
        <div className="space-x-2">
          <Button onClick={() => setShowAddPage(true)}>
            {t('addPage')}
          </Button>
          <Button onClick={() => navigate('/')}>
            {t('back')}
          </Button>
        </div>
      </div>

      {currentPage && (
        <>
          <div className="prose dark:prose-invert max-w-none mb-6">
            {currentPage.chapterTitle && (
              <h2 className="text-xl font-semibold mb-4">{currentPage.chapterTitle}</h2>
            )}
            <div dangerouslySetInnerHTML={{ __html: currentPage.content }} />
          </div>

          <div className="flex justify-between items-center mt-8">
            <Button 
              onClick={() => updateCurrentPage(book.currentPage - 1)}
              disabled={!hasPrevPage}
              variant="outline"
            >
              Previous Page
            </Button>
            <span className="text-sm">
              Page {book.currentPage + 1} of {book.pages.length}
            </span>
            <Button 
              onClick={() => updateCurrentPage(book.currentPage + 1)}
              disabled={!hasNextPage}
              variant="outline"
            >
              Next Page
            </Button>
          </div>
        </>
      )}

      {book.pages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            This book has no pages yet. Add your first page to get started.
          </p>
          <Button onClick={() => setShowAddPage(true)}>
            Add First Page
          </Button>
        </div>
      )}

      <Dialog open={showAddPage} onOpenChange={setShowAddPage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addNewPage')}</DialogTitle>
          </DialogHeader>
          <div
            className={`border-2 border-dashed rounded p-8 text-center relative ${
              isProcessing ? 'bg-gray-50 dark:bg-gray-800' : ''
            }`}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleImageUpload(file);
            }}
            onDragOver={(e) => e.preventDefault()}
            onPaste={(e) => {
              e.preventDefault();
              const items = e.clipboardData?.items;
              if (!items) return;
              
              const imageItem = Array.from(items).find(
                item => item.type.indexOf('image') !== -1
              );
              
              if (imageItem) {
                const file = imageItem.getAsFile();
                if (file) handleImageUpload(file);
              }
            }}
            tabIndex={0}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {processingStatus}
                </p>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                  id="imageUpload"
                />
                <label htmlFor="imageUpload" className="cursor-pointer">
                  {t('dragDropImage')}
                </label>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}