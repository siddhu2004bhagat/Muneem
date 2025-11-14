/**
 * PaginationControls Component
 * Provides Previous/Next buttons, page number display, and page size selector
 */

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  total?: number;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function PaginationControls({
  page,
  pageSize,
  total,
  hasNext,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const startItem = page * pageSize + 1;
  const endItem = total 
    ? Math.min((page + 1) * pageSize, total)
    : (page + 1) * pageSize;
  
  const totalPages = total ? Math.ceil(total / pageSize) : undefined;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card border-t">
      {/* Items count */}
      <div className="text-sm text-muted-foreground">
        {total !== undefined ? (
          <>
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{total}</span> entries
          </>
        ) : (
          <>
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> entries
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              onPageSizeChange(parseInt(value));
              onPageChange(0); // Reset to first page when changing page size
            }}
          >
            <SelectTrigger className="w-20 h-9 touch-friendly">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className="touch-friendly"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {/* Page Number Display */}
          <div className="text-sm text-muted-foreground min-w-[100px] text-center">
            {totalPages !== undefined ? (
              <>Page {page + 1} of {totalPages}</>
            ) : (
              <>Page {page + 1}</>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNext}
            className="touch-friendly"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

