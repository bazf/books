import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function Sidebar({ isOpen, onToggle, children }: SidebarProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [showHoverButton, setShowHoverButton] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isOpen && e.clientX <= 20) {
        setShowHoverButton(true);
      } else if (isOpen || e.clientX > 100) {
        setShowHoverButton(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen]);

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
      {/* Desktop hover button */}
      {showHoverButton && !isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-0 top-1/2 -translate-y-1/2 z-50 hidden md:flex"
          onClick={onToggle}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      <div
        ref={sidebarRef}
        className={cn(
          'fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out z-10',
          isOpen ? 'w-64' : 'w-0'
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={onToggle}
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