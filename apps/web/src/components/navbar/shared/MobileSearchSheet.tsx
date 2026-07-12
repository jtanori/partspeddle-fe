import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NavbarSearch } from "../NavbarSearch";

interface MobileSearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSearchSheet: React.FC<MobileSearchSheetProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="bg-steel-black border-oil-dark p-0 h-[85vh] flex flex-col"
      >
        <SheetHeader className="p-4 border-b border-oil-dark">
          <SheetTitle className="text-base-cream uppercase font-black tracking-widest text-xs">
            Search Inventory
          </SheetTitle>
        </SheetHeader>
        <div className="p-4 flex-1">
          <NavbarSearch placeholderText="Search parts, make, model or VIN..." />
        </div>
      </SheetContent>
    </Sheet>
  );
};
