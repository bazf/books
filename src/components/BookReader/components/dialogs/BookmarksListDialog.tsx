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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('bookmarks')}</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    {bookmarks && bookmarks.length > 0 ? (
                        <div className="space-y-4">
                            {bookmarks
                                .sort((a, b) => a.position - b.position)
                                .map((bookmark) => (
                                    <BookmarkItem
                                        key={bookmark.id}
                                        bookmark={bookmark}
                                        onGoTo={() => onBookmarkClick(bookmark.position)}
                                        onRemove={() => onBookmarkRemove(bookmark.id)}
                                    />
                                ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                            {t('noBookmarks')}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>
                        {t('close')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}