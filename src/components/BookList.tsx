// src/components/BookList.tsx
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useBooks } from '../hooks/useBooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Trash2, Upload, Plus, Settings } from 'lucide-react';
import { importBookFromJson, generateUniqueBookTitle } from '../lib/utils';
import { useTranslation } from '../hooks/useTranslation';

export function BookList() {
    const { t } = useTranslation();
    const { books, loading, addBook, deleteBook } = useBooks();
    const navigate = useNavigate();
    const [showAddDialog, setShowAddDialog] = React.useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const [bookToDelete, setBookToDelete] = React.useState<string | null>(null);
    const [newBookTitle, setNewBookTitle] = React.useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (loading) {
        return (
            <div className="p-4" aria-live="polite">
                {t('loading')}
            </div>
        );
    }

    const handleAddBook = async () => {
        if (!newBookTitle.trim()) return;

        const newBook = {
            id: crypto.randomUUID(),
            title: newBookTitle.trim(),
            pages: [],
            currentPage: 0,
            language: 'en',
            createdAt: Date.now(),
            bookmarks: []
        };

        await addBook(newBook);
        setNewBookTitle('');
        setShowAddDialog(false);
        navigate(`/book/${newBook.id}`);
    };

    const handleDeleteConfirm = async () => {
        if (bookToDelete) {
            await deleteBook(bookToDelete);
            setBookToDelete(null);
            setShowDeleteDialog(false);
        }
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setBookToDelete(id);
        setShowDeleteDialog(true);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importedBook = importBookFromJson(text);
            
            if (!importedBook) {
                alert(t('invalidBookFormat'));
                return;
            }

            const existingTitles = books.map(b => b.title);
            const uniqueTitle = generateUniqueBookTitle(existingTitles, importedBook.title);
            
            const newBook = {
                ...importedBook,
                id: crypto.randomUUID(),
                title: uniqueTitle,
                createdAt: Date.now()
            };

            await addBook(newBook);
            navigate(`/book/${newBook.id}`);
        } catch (error) {
            console.error('Error importing book:', error);
            alert(t('importError'));
        }
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{t('yourBooks')}</h1>
                <div className="flex items-center gap-1">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".json"
                        onChange={handleFileImport}
                        aria-label={t('importBook')}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleImportClick}
                        className="h-9 w-9"
                        aria-label={t('importBook')}
                    >
                        <Upload className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowAddDialog(true)}
                        className="h-9 w-9"
                        aria-label={t('addBook')}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/settings')}
                        className="h-9 w-9"
                        aria-label={t('settings')}
                    >
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {books.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">{t('noBooks')}</p>
                    <div className="flex justify-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowAddDialog(true)}
                            className="h-9 w-9"
                            aria-label={t('addBook')}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleImportClick}
                            className="h-9 w-9"
                            aria-label={t('importBook')}
                        >
                            <Upload className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {books.map((book) => (
                        <div
                            key={book.id}
                            className="relative flex items-center justify-between border p-4 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 cursor-pointer"
                            onClick={() => navigate(`/book/${book.id}`)}
                            role="button"
                            tabIndex={0}
                            aria-label={`${book.title}, ${t('pagesCount', { count: book.pages.length })}`}
                        >
                            <div>
                                <h3 className="text-lg font-semibold">{book.title}</h3>
                                <p className="text-sm text-gray-500">
                                    {t('pagesCount', { count: book.pages.length })}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 hover:text-red-500"
                                onClick={(e) => handleDeleteClick(book.id, e)}
                                aria-label={t('delete')}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('addBook')}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">{t('bookTitle')}</Label>
                            <Input
                                id="title"
                                value={newBookTitle}
                                onChange={(e) => setNewBookTitle(e.target.value)}
                                placeholder={t('enterBookTitle')}
                                aria-required="true"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            {t('cancel')}
                        </Button>
                        <Button onClick={handleAddBook}>
                            {t('create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('deleteBook')}</DialogTitle>
                        <DialogDescription>
                            {t('deleteBookConfirm')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            {t('cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            {t('delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}