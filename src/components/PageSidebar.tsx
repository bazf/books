import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { useTranslation } from '../hooks/useTranslation';
import { cn } from '../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';

export interface PageNavigationItem {
  id: string;
  pageNumber: number;
  chapterTitle?: string;
  shortName?: string;
  excerpt: string;
}

interface PageSidebarProps {
  bookId: string;
  pages: PageNavigationItem[];
  currentPage: number;
  onPageSelect: (pageId: string) => void;
  onPageDelete: (pageId: string) => void;
}

export function PageSidebar({ 
  pages, 
  currentPage, 
  onPageSelect, 
  onPageDelete
}: PageSidebarProps) {
  const { t } = useTranslation();
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (pageToDelete) {
      onPageDelete(pageToDelete);
      setPageToDelete(null);
    }
  };

  return (
    <>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">{t('pages')}</h2>
        <div className="space-y-2 h-[calc(100vh-8rem)] overflow-y-auto">
          {pages.map((page) => (
            <div
              key={page.id}
              className={cn(
                'p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
                'border-l-4 group relative',
                currentPage === page.pageNumber - 1
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-transparent'
              )}
              onClick={() => onPageSelect(page.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-2">
                  {page.chapterTitle && (
                    <div className="text-sm font-medium truncate">{page.chapterTitle}</div>
                  )}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('page')} {page.pageNumber}
                  </div>
                  <div className="text-sm font-medium mb-1">
                    {page.shortName || t('untitled')}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-[180px]">
                    {page.excerpt}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPageToDelete(page.id);
                    }}
                    className="h-8 w-8 opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!pageToDelete} onOpenChange={() => setPageToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete_page')}</DialogTitle>
            <DialogDescription>
              {t('delete_page_confirmation')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              {t('delete')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPageToDelete(null)}
            >
              {t('cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}