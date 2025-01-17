// src/components/BookReader/components/BookmarkItem.tsx
import React from 'react';
import { Button } from '../../ui/button';
import { useTranslation } from '../../../hooks/useTranslation';
import { Bookmark } from '../../../types';

interface BookmarkItemProps {
    bookmark: Bookmark;
    onGoTo: () => void;
    onRemove: () => void;
}

export function BookmarkItem({ bookmark, onGoTo, onRemove }: BookmarkItemProps) {
    const { t } = useTranslation();

    return (
        <div 
            className="flex items-start justify-between p-4 border rounded-lg"
            aria-labelledby={`bookmark-title-${bookmark.id}`}
        >
            <div className="flex-1 mr-4">
                <h3 
                    id={`bookmark-title-${bookmark.id}`}
                    className="font-medium"
                >
                    {bookmark.title}
                </h3>
                {bookmark.note && (
                    <p 
                        className="text-sm text-gray-600 dark:text-gray-400 mt-1"
                        aria-label={t('bookmarkNote')}
                    >
                        {bookmark.note}
                    </p>
                )}
                <p 
                    className="text-sm text-gray-500 mt-1"
                    aria-label={t('pageNumber', { number: bookmark.position + 1 })}
                >
                    {t('pageNumber', { number: bookmark.position + 1 })}
                </p>
            </div>
            <div className="flex space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onGoTo}
                    aria-label={t('goToBookmark', { title: bookmark.title })}
                >
                    {t('goTo')}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRemove}
                    aria-label={t('removeBookmark', { title: bookmark.title })}
                >
                    {t('remove')}
                </Button>
            </div>
        </div>
    );
}