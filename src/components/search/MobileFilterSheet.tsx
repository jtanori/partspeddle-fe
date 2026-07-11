import React from 'react';
import { Sliders } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProductSidebar } from '../ProductSidebar';
import { SearchFilters, PartCondition } from '@/types';
import { Button } from '@/components/ui/button';

interface MobileFilterSheetProps {
  filters: SearchFilters;
  clearAllFilters: () => void;
  toggleSection: (sec: string) => void;
  collapsedSections: Record<string, boolean>;
  sortBy: string;
  setSortBy: (sort: string) => void;
  getSystemPartCount: (sysName: string) => string;
  getConditionCount: (cond: PartCondition) => number;
  getSellerTypeCount: (type: 'all' | 'trusted') => number;
  togglePartType: (type: string) => void;
  toggleCondition: (cond: PartCondition) => void;
  handlePriceChange: (index: number, val: number) => void;
  setAndSyncFilters: (updateFn: SearchFilters | ((prev: SearchFilters) => SearchFilters)) => void;
}

export const MobileFilterSheet: React.FC<MobileFilterSheetProps> = (props) => {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="secondary"
            className="mb-4 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider"
          >
            <Sliders className="h-4 w-4" />
            Filter Results
          </Button>
        }
      />
      <SheetContent
        side="left"
        className="w-[300px] border-r border-stroke-subtle bg-surface-primary p-0 sm:w-[360px]"
      >
        <SheetTitle className="sr-only">Filter Parts</SheetTitle>
        <ScrollArea className="h-full py-6">
          <div className="px-6">
            <ProductSidebar {...props} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
