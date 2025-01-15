import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '../../../../hooks/useTranslation';
import { db } from '../../../../lib/db';
import { analyzeImage } from '../../../../lib/gemini';
import { BookPage } from '../../../../types';
import { cn } from '../../../../lib/utils';

interface AddPageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPageAdded: () => void;
    bookId: string;
}

export function AddPageDialog({ 
    open, 
    onOpenChange, 
    onPageAdded,
    bookId 
}: AddPageDialogProps) {
    const { t } = useTranslation();
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');

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
                const book = await db.getBook(bookId);
                
                if (book) {
                    const newPage: BookPage = {
                        id: crypto.randomUUID(),
                        content: text,
                        pageNumber: book.pages.length + 1
                    };

                    const updatedBook = {
                        ...book,
                        pages: [...(book.pages || []), newPage],
                        currentPage: book.pages ? book.pages.length : 0,
                        lastModified: Date.now()
                    };

                    await db.saveBook(updatedBook);
                    onPageAdded();
                    onOpenChange(false);
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('addNewPage')}</DialogTitle>
                </DialogHeader>
                <div
                    className={cn(
                        'border-2 border-dashed rounded p-8 text-center relative',
                        isProcessing ? 'bg-gray-50 dark:bg-gray-800' : ''
                    )}
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
    );
}