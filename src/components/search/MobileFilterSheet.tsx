import React from "react";
import { Sliders } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductSidebar } from "../ProductSidebar";
import { SearchFilters, PartCondition } from "@/types";

interface MobileFilterSheetProps {
  filters: SearchFilters;
  clearAllFilters: () => void;
  toggleSection: (sec: string) => void;
  collapsedSections: Record<string, boolean>;
  sortBy: string;
  setSortBy: (sort: string) => void;
  getSystemPartCount: (sysName: string) => string;
  getConditionCount: (cond: PartCondition) => number;
  getSellerTypeCount: (type: "all" | "trusted") => number;
  togglePartType: (type: string) => void;
  toggleCondition: (cond: PartCondition) => void;
  handlePriceChange: (index: number, val: number) => void;
  setAndSyncFilters: (
    updateFn: SearchFilters | ((prev: SearchFilters) => SearchFilters),
  ) => void;
}

export const MobileFilterSheet: React.FC<MobileFilterSheetProps> = (props) => {
  return (
    <Sheet>
      <SheetTrigger className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider mb-4 hover:bg-zinc-800 transition-colors">
        <Sliders className="w-4 h-4" />
        Filter Results
      </SheetTrigger>
      <SheetContent
        side="left"
        className="bg-zinc-900 border-r border-zinc-800 p-0 w-[300px] sm:w-[360px]"
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
