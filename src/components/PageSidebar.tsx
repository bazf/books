import React from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { useTranslation } from '../hooks/useTranslation';
import { cn } from '../lib/utils';

export interface PageNavigationItem {
  id: string;
  pageNumber: number;
  chapterTitle?: string;
  shortName?: string;
  excerpt: string;
  isDeleted?: boolean;
}

interface PageSidebarProps {
  bookId: string;
  pages: PageNavigationItem[];
  currentPage: number;
  onPageSelect: (pageId: string) => void;
  onPageDelete: (pageId: string) => void;
  onPageRestore: (pageId: string) => void;
}

export function PageSidebar({ 
  pages, 
  currentPage, 
  onPageSelect, 
  onPageDelete,
  onPageRestore
}: PageSidebarProps) {
  const { t } = useTranslation();

  return (
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
                : 'border-transparent',
              page.isDeleted && 'opacity-50'
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
                {page.isDeleted ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPageRestore(page.id);
                    }}
                    className="h-8 w-8 opacity-100 hover:bg-green-100 dark:hover:bg-green-900/20"
                  >
                    <RotateCcw className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPageDelete(page.id);
                    }}
                    className="h-8 w-8 opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}