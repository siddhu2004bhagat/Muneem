/**
 * NotebookNav - Navigation component for multi-page notebook
 * 
 * Provides Previous/Next buttons, page counter, and page creation.
 * Integrates with NotebookContext for page management.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpen,
  Grid3x3,
  Trash2,
} from 'lucide-react';
import { useNotebook } from '../context/NotebookContext';
import { cn } from '@/lib/utils';

interface NotebookNavProps {
  className?: string;
  showCreateButton?: boolean;
  showDeleteButton?: boolean;
  compact?: boolean;
}

export function NotebookNav({ 
  className, 
  showCreateButton = true,
  showDeleteButton = false,
  compact = false 
}: NotebookNavProps) {
  const {
    currentPage,
    currentPageIndex,
    totalPages,
    canGoNext,
    canGoPrev,
    nextPage,
    prevPage,
    goToPageNumber,
    createPage,
    deletePage,
    loading,
  } = useNotebook();
  
  const [jumpToPage, setJumpToPage] = useState('');
  const [showJumpInput, setShowJumpInput] = useState(false);
  
  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      goToPageNumber(pageNum);
      setJumpToPage('');
      setShowJumpInput(false);
    }
  };
  
  const handleCreatePage = async () => {
    await createPage();
  };
  
  const handleDeleteCurrentPage = async () => {
    if (currentPage) {
      const confirmed = window.confirm(
        `Are you sure you want to delete Page ${currentPage.pageNumber}? This action cannot be undone.`
      );
      if (confirmed) {
        await deletePage(currentPage.id);
      }
    }
  };
  
  if (loading) {
    return (
      <div className={cn('flex items-center justify-center gap-2 p-2', className)}>
        <span className="text-sm text-muted-foreground">Loading notebook...</span>
      </div>
    );
  }
  
  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={prevPage}
          disabled={!canGoPrev}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Badge variant="secondary" className="px-2 py-1 text-xs">
          {currentPage?.pageNumber || 1}/{totalPages}
        </Badge>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={nextPage}
          disabled={!canGoNext}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  return (
    <div className={cn('flex items-center justify-between gap-4 p-3 bg-card border-b', className)}>
      {/* Left: Book info */}
      <div className="flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold">
            {currentPage?.title || `Page ${currentPage?.pageNumber || 1}`}
          </span>
          <span className="text-xs text-muted-foreground">
            {currentPage?.tags && currentPage.tags.length > 0 
              ? currentPage.tags.join(', ')
              : 'Digital Ledger Book'
            }
          </span>
        </div>
      </div>
      
      {/* Center: Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={prevPage}
          disabled={!canGoPrev}
          className="h-9 px-3"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
          {showJumpInput ? (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJumpToPage()}
                placeholder="Page #"
                className="h-7 w-16 text-sm"
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleJumpToPage}
                className="h-7 px-2"
              >
                Go
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowJumpInput(false);
                  setJumpToPage('');
                }}
                className="h-7 px-2"
              >
                ✕
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowJumpInput(true)}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Page {currentPage?.pageNumber || 1} of {totalPages}
            </button>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={nextPage}
          disabled={!canGoNext}
          className="h-9 px-3"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {showDeleteButton && totalPages > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteCurrentPage}
            className="h-9 px-3 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
        
        {showCreateButton && (
          <Button
            variant="default"
            size="sm"
            onClick={handleCreatePage}
            className="h-9 px-3"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Page
          </Button>
        )}
        
        {/* Grid view button (placeholder for Phase 2) */}
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0"
          title="Grid view (coming soon)"
          disabled
        >
          <Grid3x3 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default NotebookNav;

