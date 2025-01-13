// src/components/PageSidebar.tsx
import React from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { useTranslation } from '../hooks/useTranslation';
import { cn } from '../lib/utils';

export interface PageNavigationItem {
  id: string;
  pageNumber: number;
  chapterTitle?: string;
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
      <div className="space-y-2">
        {pages.map((page) => (
          <div
            key={page.id}
            className={cn(
              'p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
              'border-l-4',
              currentPage === page.pageNumber - 1
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-transparent',
              page.isDeleted && 'opacity-50'
            )}
            onClick={() => onPageSelect(page.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                {page.chapterTitle && (
                  <div className="text-sm font-medium">{page.chapterTitle}</div>
                )}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('page')} {page.pageNumber}
                </div>
                <div className="text-sm truncate">{page.excerpt}</div>
              </div>
              <div className="flex space-x-1">
                {page.isDeleted ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPageRestore(page.id);
                    }}
                    className="h-8 w-8"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPageDelete(page.id);
                    }}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
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