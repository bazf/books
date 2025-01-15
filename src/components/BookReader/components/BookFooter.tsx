import React from 'react';
import { Book } from '../../../types';
import { Button } from '../../ui/button';
import { useTranslation } from '../../../hooks/useTranslation';

interface BookFooterProps {
    book: Book;
    onPageChange: (pageIndex: number) => void;
}

export function BookFooter({ book, onPageChange }: BookFooterProps) {
    const { t } = useTranslation();
    const currentPage = book.pages[book.currentPage];
    const hasNextPage = book.currentPage < book.pages.length - 1;
    const hasPrevPage = book.currentPage > 0;

    if (!currentPage || currentPage.isDeleted) {
        return null;
    }

    return (
        <div className="flex-none sticky bottom-0 bg-background/95 backdrop-blur-sm border-t">
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center">
                    <Button
                        onClick={() => onPageChange(book.currentPage - 1)}
                        disabled={!hasPrevPage}
                        variant="outline"
                    >
                        {t('previousPage')}
                    </Button>
                    <span className="text-sm">
                        {book.currentPage + 1} / {book.pages.length}
                    </span>
                    <Button
                        onClick={() => onPageChange(book.currentPage + 1)}
                        disabled={!hasNextPage}
                        variant="outline"
                    >
                        {t('nextPage')}
                    </Button>
                </div>
            </div>
        </div>
    );
}