import React, { useEffect, useRef } from 'react';
import { Book } from '../../../types';
import { Button } from '../../ui/button';
import { Alert, AlertTitle, AlertDescription } from '../../ui/alert';
import { useTranslation } from '../../../hooks/useTranslation';

interface BookContentProps {
    book: Book;
    onRestorePage: (pageId: string) => void;
    onAddFirstPage: () => void;
}

export function BookContent({ book, onRestorePage, onAddFirstPage }: BookContentProps) {
    const { t } = useTranslation();
    const currentPage = book.pages[book.currentPage];
    const contentRef = useRef<HTMLDivElement>(null);

    // Add effect to scroll to top when page changes
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTo(0, 0);
        }
    }, [book.currentPage]); // Dependency on currentPage ensures scroll on page change

    if (book.pages.length === 0) {
        return (
            <div className="flex-1 overflow-y-auto" ref={contentRef}>
                <div className="container mx-auto p-4">
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                            {t('noPages')}
                        </p>
                        <Button onClick={onAddFirstPage}>
                            {t('addFirstPage')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto" ref={contentRef}>
            <div className="container mx-auto p-4">
                {currentPage && !currentPage.isDeleted && (
                    <div className="prose dark:prose-invert max-w-none mb-6">
                        {currentPage.chapterTitle && (
                            <h2 className="text-xl font-semibold mb-4">
                                {currentPage.chapterTitle}
                            </h2>
                        )}
                        <div 
                            className="leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: currentPage.content }}
                        />
                    </div>
                )}

                {currentPage?.isDeleted && (
                    <Alert className="mb-6">
                        <AlertTitle>{t('deletedPage')}</AlertTitle>
                        <AlertDescription>
                            {t('deletedPageDescription')}
                            <Button
                                variant="link"
                                onClick={() => onRestorePage(currentPage.id)}
                                className="p-0 ml-2"
                            >
                                {t('restorePage')}
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    );
}