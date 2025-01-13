// src/components/ui/sidebar.tsx
import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function Sidebar({ isOpen, onToggle, children }: SidebarProps) {
  return (
    <div
      className={cn(
        'fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out z-10',
        isOpen ? 'w-64' : 'w-0'
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-10 top-4"
        onClick={onToggle}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
      <div className="h-full overflow-y-auto">
        {isOpen && children}
      </div>
    </div>
  );
}