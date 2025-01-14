import React, { useState, useEffect, TouchEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/db';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { analyzeImage } from '../lib/gemini';
import { useTranslation } from '../hooks/useTranslation';
import { Loader2 } from 'lucide-react';
import { Sidebar } from './ui/sidebar';
import { PageSidebar } from './PageSidebar';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function BookReader() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [book, setBook] = useState<Book | null>(null);
    const [showAddPage, setShowAddPage] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        loadBook();
    }, [id]);

    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: TouchEvent) => {
        if (!touchStart) return;

        const touchEnd = e.changedTouches[0].clientX;
        const distance = touchStart - touchEnd;

        // Swipe left (close)
        if (distance > 50 && isSidebarOpen) {
            setIsSidebarOpen(false);
        }
        // Swipe right (open)
        else if (distance < -50 && !isSidebarOpen) {
            setIsSidebarOpen(true);
        }

        setTouchStart(null);
    };

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
                    const newPage: BookPage = {
                        id: crypto.randomUUID(),
                        content: text,
                        pageNumber: book.pages.length + 1
                    };

                    const updatedBook: Book = {
                        ...book,
                        pages: [...(book.pages || []), newPage],
                        currentPage: book.pages ? book.pages.length : 0,
                        lastModified: Date.now()
                    };

                    await db.saveBook(updatedBook);
                    const reloadedBook = await db.getBook(book.id);

                    if (reloadedBook) {
                        setBook(reloadedBook);
                        setShowAddPage(false);
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

    async function handleDeletePage(pageId: string) {
        if (!book || !id) return;
        await db.deletePage(id, pageId);
        await loadBook();
    }

    async function handleRestorePage(pageId: string) {
        if (!book || !id) return;
        await db.restorePage(id, pageId);
        await loadBook();
    }

    async function updateCurrentPage(pageIndex: number) {
        if (!book) return;

        const updatedBook = {
            ...book,
            currentPage: pageIndex,
            lastModified: Date.now()
        };

        await db.saveBook(updatedBook);
        setBook(updatedBook);
    }

    function getPageNavigationItems(): PageNavigationItem[] {
        if (!book?.pages) return [];

        return book.pages.map((page, index) => ({
            id: page.id,
            pageNumber: index + 1,
            chapterTitle: page.chapterTitle,
            excerpt: page.content.slice(0, 50) + '...',
            isDeleted: page.isDeleted
        }));
    }

    if (!book) {
        return <div className="p-4">{t('loading')}</div>;
    }

    const currentPage = book.pages[book.currentPage];
    const hasNextPage = book.currentPage < book.pages.length - 1;
    const hasPrevPage = book.currentPage > 0;

    return (
        <div
            className="flex h-screen"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)}>
                <PageSidebar
                    bookId={book.id}
                    pages={getPageNavigationItems()}
                    currentPage={book.currentPage}
                    onPageSelect={(pageId) => {
                        const pageIndex = book.pages.findIndex(p => p.id === pageId);
                        if (pageIndex !== -1) {
                            updateCurrentPage(pageIndex);
                        }
                    }}
                    onPageDelete={handleDeletePage}
                    onPageRestore={handleRestorePage}
                />
            </Sidebar>

            <div className="flex-1 flex flex-col h-screen">
                {/* Fixed Header */}
                <div className="flex-none bg-background border-b">
                    <div className="container mx-auto p-4">
                        <div className="flex justify-between items-center">
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
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="container mx-auto p-4">
                        {currentPage && !currentPage.isDeleted && (
                            <>
                                <div className="prose dark:prose-invert max-w-none mb-6 whitespace-pre-wrap">
                                    {currentPage.chapterTitle && (
                                        <h2 className="text-xl font-semibold mb-4">{currentPage.chapterTitle}</h2>
                                    )}
                                    <div className="leading-relaxed">
                                        {currentPage.content}
                                    </div>
                                </div>
                            </>
                        )}

                        {currentPage?.isDeleted && (
                            <Alert className="mb-6">
                                <AlertTitle>{t('deletedPage')}</AlertTitle>
                                <AlertDescription>
                                    {t('deletedPageDescription')}
                                    <Button
                                        variant="link"
                                        onClick={() => handleRestorePage(currentPage.id)}
                                        className="p-0 ml-2"
                                    >
                                        {t('restorePage')}
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}

                        {book.pages.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                                    {t('noPages')}
                                </p>
                                <Button onClick={() => setShowAddPage(true)}>
                                    {t('addFirstPage')}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fixed Footer Navigation */}
                {currentPage && !currentPage.isDeleted && (
                    <div className="flex-none bg-background border-t">
                        <div className="container mx-auto p-4">
                            <div className="flex justify-between items-center">
                                <Button
                                    onClick={() => updateCurrentPage(book.currentPage - 1)}
                                    disabled={!hasPrevPage}
                                    variant="outline"
                                >
                                    {t('previousPage')}
                                </Button>
                                <span className="text-sm">
                                    {book.currentPage + 1} / {book.pages.length}
                                </span>
                                <Button
                                    onClick={() => updateCurrentPage(book.currentPage + 1)}
                                    disabled={!hasNextPage}
                                    variant="outline"
                                >
                                    {t('nextPage')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <Dialog open={showAddPage} onOpenChange={setShowAddPage}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('addNewPage')}</DialogTitle>
                        </DialogHeader>
                        <div
                            className={`border-2 border-dashed rounded p-8 text-center relative ${isProcessing ? 'bg-gray-50 dark:bg-gray-800' : ''
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
        </div>
    );
}