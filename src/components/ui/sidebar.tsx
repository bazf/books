import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { useTranslation } from '@/hooks/useTranslation';

export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function Sidebar({ isOpen, onToggle, children }: SidebarProps) {
  const { t } = useTranslation();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;

    // Swipe left (close)
    if (distance > 50 && isOpen) {
      onToggle();
    }
    // Swipe right (open)
    else if (distance < -50 && !isOpen) {
      onToggle();
    }

    setTouchStart(null);
  };

  return (
    <>
      {/* Desktop Toggle Button */}
      <div 
        className={cn(
          "fixed z-50 transition-all duration-300 ease-in-out hidden md:block",
          isOpen ? "left-64" : "left-0"
        )}
        style={{ 
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label={t(isOpen ? 'closeSidebar' : 'openSidebar')}
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          'fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out z-40',
          isOpen ? 'w-64' : 'w-0'
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-hidden={!isOpen}
      >
        {/* Mobile Close Button */}
        {isOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 md:hidden"
            onClick={onToggle}
            aria-label={t('closeSidebar')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="h-full overflow-y-auto pt-12">
          {isOpen && children}
        </div>
      </div>
    </>
  );
}