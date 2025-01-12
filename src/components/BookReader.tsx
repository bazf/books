import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/db';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { analyzeImage } from '../lib/gemini';
import { useTranslation } from '../hooks/useTranslation';

export function BookReader() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [book, setBook] = useState<Book | null>(null);
    const [showAddPage, setShowAddPage] = useState(false);
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

        const reader = new FileReader();
        reader.onload = async (e) => {
            const imageData = e.target?.result as string;
            try {
                const text = await analyzeImage(settings.geminiApiKey!, imageData);
                if (book) {
                    const newPage: BookPage = {
                        id: crypto.randomUUID(),
                        content: text,
                    };

                    const updatedBook = {
                        ...book,
                        pages: [...book.pages, newPage],
                    };

                    await db.saveBook(updatedBook);
                    setBook(updatedBook);
                    setShowAddPage(false);
                }
            } catch (error) {
                console.error('Error analyzing image:', error);
                alert(t('imageAnalysisError'));
            }
        };
        reader.readAsDataURL(file);
    }

    if (!book) {
        return <div className="p-4">{t('loading')}</div>;
    }

    const currentPage = book.pages[book.currentPage];

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
                <div className="prose dark:prose-invert max-w-none">
                    {currentPage.chapterTitle && (
                        <h2 className="text-xl font-semibold mb-4">{currentPage.chapterTitle}</h2>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: currentPage.content }} />
                </div>
            )}

            <Dialog open={showAddPage} onOpenChange={setShowAddPage}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('addNewPage')}</DialogTitle>
                    </DialogHeader>
                    <div
                        className="border-2 border-dashed rounded p-8 text-center"
                        onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file) handleImageUpload(file);
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onPaste={(e) => {
                            e.preventDefault();
                            // Get image from clipboard
                            const items = e.clipboardData?.items;
                            if (!items) return;

                            // Find the first image in the clipboard
                            const imageItem = Array.from(items).find(
                                item => item.type.indexOf('image') !== -1
                            );

                            if (imageItem) {
                                const file = imageItem.getAsFile();
                                if (file) handleImageUpload(file);
                            }
                        }}
                        // Make the div focusable to receive paste events
                        tabIndex={0}
                    >
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
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}