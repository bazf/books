// src/components/BookReader/components/dialogs/BookmarksListDialog.tsx
import React from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter 
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { useTranslation } from '../../../../hooks/useTranslation';
import { Bookmark } from '../../../../types';
import { BookmarkItem } from '../BookmarkItem';
import { cn } from '../../../../lib/utils';

interface BookmarksListDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookmarks: Bookmark[];
    onBookmarkClick: (position: number) => void;
    onBookmarkRemove: (id: string) => void;
}

export function BookmarksListDialog({
    open,
    onOpenChange,
    bookmarks,
    onBookmarkClick,
    onBookmarkRemove
}: BookmarksListDialogProps) {
    const { t } = useTranslation();
    const hasBookmarks = bookmarks && bookmarks.length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('bookmarks')}</DialogTitle>
                </DialogHeader>
                <div 
                    className={cn(
                        "max-h-[60vh] overflow-y-auto",
                        !hasBookmarks && "flex items-center justify-center min-h-[200px]"
                    )}
                    role="region"
                    aria-label={t('bookmarks')}
                >
                    {hasBookmarks ? (
                        <div 
                            className="space-y-4"
                            role="list"
                            aria-label={t('bookmarksList')}
                        >
                            {bookmarks
                                .sort((a, b) => a.position - b.position)
                                .map((bookmark) => (
                                    <div 
                                        key={bookmark.id}
                                        role="listitem"
                                    >
                                        <BookmarkItem
                                            bookmark={bookmark}
                                            onGoTo={() => onBookmarkClick(bookmark.position)}
                                            onRemove={() => {
                                                if (window.confirm(t('deleteBookmarkConfirm'))) {
                                                    onBookmarkRemove(bookmark.id);
                                                }
                                            }}
                                        />
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div 
                            className="text-center py-8 text-gray-600 dark:text-gray-400"
                            role="status"
                            aria-live="polite"
                        >
                            {t('noBookmarks')}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button 
                        onClick={() => onOpenChange(false)}
                        aria-label={t('close')}
                    >
                        {t('close')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}