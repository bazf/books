import React, { useState, useEffect, TouchEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Book, BookPage, BookSettings } from '../../types';
import { db } from '../../lib/db';
import { useTranslation } from '../../hooks/useTranslation';
import { useDoubleTap } from '../../hooks/useDoubleTap';
import { Sidebar } from '../ui/sidebar';
import { PageSidebar } from '../PageSidebar';
import { BookHeader } from './components/BookHeader';
import { BookContent } from './components/BookContent';
import { BookFooter } from './components/BookFooter';
import { AddPageDialog } from './components/dialogs/AddPageDialog';
import { AddBookmarkDialog } from './components/dialogs/AddBookmarkDialog';
import { BookmarksListDialog } from './components/dialogs/BookmarksListDialog';
import { BookSettingsDialog } from './components/dialogs/BookSettingsDialog';

export function BookReader() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [book, setBook] = useState<Book | null>(null);
    const [showAddPage, setShowAddPage] = useState(false);
    const [showAddBookmark, setShowAddBookmark] = useState(false);
    const [showBookmarksList, setShowBookmarksList] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [showPanels, setShowPanels] = useState(true);

    const handleDoubleTap = useDoubleTap(() => {
        setShowPanels(prev => !prev);
    });

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

    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: TouchEvent) => {
        if (!touchStart) return;
        const touchEnd = e.changedTouches[0].clientX;
        const distance = touchStart - touchEnd;
        if (distance > 50 && isSidebarOpen) {
            setIsSidebarOpen(false);
        }
        else if (distance < -50 && !isSidebarOpen) {
            setIsSidebarOpen(true);
        }
        setTouchStart(null);
    };

    async function handleSettingsChange(settings: BookSettings) {
        if (!book || !id) return;
        const updatedBook = {
            ...book,
            settings,
            lastModified: Date.now()
        };
        await db.saveBook(updatedBook);
        setBook(updatedBook);
    }

    async function handleAddBookmark(title: string, note?: string) {
        if (!book || !id) return;
        const currentPage = book.pages[book.currentPage];
        if (!currentPage) return;

        await db.addBookmark(id, {
            pageId: currentPage.id,
            title: title || `Page ${book.currentPage + 1}`,
            note: note || undefined,
            position: book.currentPage
        });

        await loadBook();
        setShowAddBookmark(false);
    }

    async function handleRemoveBookmark(bookmarkId: string) {
        if (!book || !id) return;
        await db.removeBookmark(id, bookmarkId);
        await loadBook();
    }

    async function handleGoToBookmark(position: number) {
        if (!book) return;
        await updateCurrentPage(position);
        setShowBookmarksList(false);
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

    function getPageNavigationItems() {
        if (!book?.pages) return [];
        return book.pages.map((page, index) => ({
            id: page.id,
            pageNumber: index + 1,
            chapterTitle: page.chapterTitle,
            shortName: page.shortName,
            excerpt: page.content.replace(/<[^>]+>/g, '').slice(0, 50) + '...',
            isDeleted: page.isDeleted
        }));
    }

    if (!book) {
        return <div className="p-4">{t('loading')}</div>;
    }

    return (
        <div
            className="flex h-screen"
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => {
                handleTouchEnd(e);
                handleDoubleTap(e);
            }}
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

            <div className="flex-1 flex flex-col h-screen relative">
                <BookHeader 
                    book={book}
                    showPanels={showPanels}
                    onNavigateBack={() => navigate('/')}
                    onAddPage={() => setShowAddPage(true)}
                    onAddBookmark={() => setShowAddBookmark(true)}
                    onShowBookmarks={() => setShowBookmarksList(true)}
                    onShowSettings={() => setShowSettings(true)}
                    onRemoveBookmark={handleRemoveBookmark}
                />

                <BookContent 
                    book={book}
                    onRestorePage={handleRestorePage}
                    onAddFirstPage={() => setShowAddPage(true)}
                />

                <BookFooter 
                    book={book}
                    onPageChange={updateCurrentPage}
                />

                <AddPageDialog 
                    open={showAddPage}
                    onOpenChange={setShowAddPage}
                    onPageAdded={loadBook}
                    bookId={book.id}
                />

                <AddBookmarkDialog 
                    open={showAddBookmark}
                    onOpenChange={setShowAddBookmark}
                    onBookmarkAdd={handleAddBookmark}
                />

                <BookmarksListDialog 
                    open={showBookmarksList}
                    onOpenChange={setShowBookmarksList}
                    bookmarks={book.bookmarks}
                    onBookmarkClick={handleGoToBookmark}
                    onBookmarkRemove={handleRemoveBookmark}
                />

                <BookSettingsDialog
                    book={book}
                    open={showSettings}
                    onOpenChange={setShowSettings}
                    onSettingsChange={handleSettingsChange}
                />
            </div>
        </div>
    );
}