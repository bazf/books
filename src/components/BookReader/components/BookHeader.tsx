import React from 'react';
import { Book } from '../../../types';
import { Button } from '../../ui/button';
import { useTranslation } from '../../../hooks/useTranslation';
import { Heart, Bookmark, Plus, ArrowLeft } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface BookHeaderProps {
    book: Book;
    showPanels: boolean;
    onNavigateBack: () => void;
    onAddPage: () => void;
    onAddBookmark: () => void;
    onShowBookmarks: () => void;
    onRemoveBookmark: (bookmarkId: string) => void;
}

export function BookHeader({
    book,
    showPanels,
    onNavigateBack,
    onAddPage,
    onAddBookmark,
    onShowBookmarks,
    onRemoveBookmark
}: BookHeaderProps) {
    const { t } = useTranslation();
    const currentPageBookmark = book.bookmarks?.find(b => b.position === book.currentPage);

    return (
        <div 
            className={cn(
                "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b transition-all duration-300 ease-in-out md:translate-y-0",
                !showPanels && "translate-y-[-100%]"
            )}
        >
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">{book.title}</h1>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant={currentPageBookmark ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => currentPageBookmark
                                ? onRemoveBookmark(currentPageBookmark.id)
                                : onAddBookmark()
                            }
                            className="hover:text-red-500 transition-colors"
                            aria-label={currentPageBookmark ? t('removeBookmark') : t('addBookmark')}
                        >
                            <Heart
                                className={cn(
                                    "w-5 h-5",
                                    currentPageBookmark ? "fill-red-500 text-red-500" : ""
                                )}
                            />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onShowBookmarks}
                            aria-label={t('bookmarks')}
                        >
                            <Bookmark className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onAddPage}
                            aria-label={t('addPage')}
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onNavigateBack}
                            aria-label={t('back')}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}