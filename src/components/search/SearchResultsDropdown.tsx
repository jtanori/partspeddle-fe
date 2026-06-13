import React, { useState, useEffect, useMemo } from "react";
import { SearchSuggestion, LiveSearchResults } from "./types/search-types";
import {
  Camera,
  Search,
  Folder,
  Wrench,
  Clock,
  Zap,
  AlertCircle,
} from "lucide-react";

interface SearchResultsDropdownProps {
  results:
    | LiveSearchResults
    | { recent: SearchSuggestion[]; popular: SearchSuggestion[] };
  onSelect: (suggestion: SearchSuggestion) => void;
  onViewAll: () => void;
  onViewAllSection?: (section: string) => void;
  query: string;
  onClose: () => void;
}

export const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({
  results,
  onSelect,
  onViewAll,
  onViewAllSection,
  query,
  onClose,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  useEffect(() => {
    // eslint-disable-next-line
    setSelectedIndex(0);
  }, [results]);

  const allSuggestions = useMemo(() => {
    if ("recent" in results) {
      return [...results.recent, ...results.popular];
    }
    const res = results as LiveSearchResults;
    return [
      ...res.products.hits,
      ...res.vehicles.hits,
      ...res.taxonomy.hits,
      ...res.manufacturers.hits,
      ...((results as any).special || []),
    ];
  }, [results]);

  useEffect(() => {
    console.log("analytics:dropdown_opened");

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, allSuggestions.length - 1),
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
        case "Tab":
          if (allSuggestions[selectedIndex]) {
            e.preventDefault();
            console.log("analytics:suggestion_clicked", {
              type: allSuggestions[selectedIndex].type,
            });
            onSelect(allSuggestions[selectedIndex]);
          }
          break;
        case "Escape":
          console.log("analytics:dropdown_closed");
          onClose();
          break;
      }
    };
    globalThis.window.addEventListener("keydown", handleKeyDown);
    return () =>
      globalThis.window.removeEventListener("keydown", handleKeyDown);
  }, [allSuggestions, selectedIndex, onSelect, onClose, results]);

  const isFocusedState = "recent" in results;

  return (
    <div className="absolute top-[calc(100%+8px)] right-0 w-[800px] max-w-[90vw] bg-white border border-zinc-200 shadow-2xl z-50 rounded-lg overflow-hidden max-h-[720px] overflow-y-auto">
      {isFocusedState ? (
        <div className="grid grid-cols-2 divide-x divide-zinc-100">
          <Section
            title="Recent Searches"
            items={results.recent}
            onSelect={onSelect}
            selectedIndex={selectedIndex}
            offset={0}
            icon={Clock}
          />
          <Section
            title="Popular Searches"
            items={results.popular}
            onSelect={onSelect}
            selectedIndex={selectedIndex}
            offset={results.recent.length}
            icon={Zap}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 divide-x divide-zinc-100">
            {(results as any).special?.length > 0 && (
              <div className="col-span-4 p-4 border-b border-zinc-100 bg-orange-50">
                {(results as any).special.map((item: SearchSuggestion) => (
                  <div
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="text-orange-800 font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <AlertCircle className="w-5 h-5" /> {item.label}
                  </div>
                ))}
              </div>
            )}
            <Section
              title="Products"
              data={(results as LiveSearchResults).products}
              onSelect={onSelect}
              onViewAll={() =>
                onViewAllSection ? onViewAllSection("products") : onViewAll()
              }
              selectedIndex={selectedIndex}
              offset={(results as any).special?.length || 0}
            />
            <Section
              title="Vehicles"
              data={(results as LiveSearchResults).vehicles}
              onSelect={onSelect}
              onViewAll={() =>
                onViewAllSection ? onViewAllSection("vehicles") : onViewAll()
              }
              selectedIndex={selectedIndex}
              offset={
                ((results as any).special?.length || 0) +
                (results as LiveSearchResults).products.hits.length
              }
            />
            <Section
              title="Categories"
              data={(results as LiveSearchResults).taxonomy}
              onSelect={onSelect}
              onViewAll={() =>
                onViewAllSection ? onViewAllSection("taxonomy") : onViewAll()
              }
              selectedIndex={selectedIndex}
              offset={
                ((results as any).special?.length || 0) +
                (results as LiveSearchResults).products.hits.length +
                (results as LiveSearchResults).vehicles.hits.length
              }
            />
            <Section
              title="Manufacturers"
              data={(results as LiveSearchResults).manufacturers}
              onSelect={onSelect}
              onViewAll={() =>
                onViewAllSection
                  ? onViewAllSection("manufacturers")
                  : onViewAll()
              }
              selectedIndex={selectedIndex}
              offset={
                ((results as any).special?.length || 0) +
                (results as LiveSearchResults).products.hits.length +
                (results as LiveSearchResults).vehicles.hits.length +
                (results as LiveSearchResults).taxonomy.hits.length
              }
            />
          </div>
          <div
            onClick={onViewAll}
            className="p-4 border-t border-zinc-100 text-center text-sm text-blue-600 font-semibold cursor-pointer hover:bg-zinc-50 transition-colors"
          >
            View all results for &quot;{query}&quot; →
          </div>
        </>
      )}
    </div>
  );
};

const Section = ({
  title,
  data,
  items,
  onSelect,
  onViewAll,
  selectedIndex,
  offset,
  icon: Icon,
}: {
  title: string;
  data?: { hits: SearchSuggestion[]; total: number };
  items?: SearchSuggestion[];
  onSelect: (s: SearchSuggestion) => void;
  onViewAll?: () => void;
  selectedIndex?: number;
  offset: number;
  icon?: React.ElementType;
}) => {
  const displayItems = data ? data.hits : items || [];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest">
          {title}
        </h4>
        {data && data.total > 0 && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              if (onViewAll) onViewAll();
            }}
            className="text-[10px] text-zinc-400 hover:text-blue-600 cursor-pointer transition-colors"
          >
            View all ({data.total})
          </span>
        )}
      </div>
      <ul className="space-y-1" role="listbox">
        {displayItems.map((item, idx) => {
          const absoluteIndex = offset + idx;
          const isSelected = selectedIndex === absoluteIndex;
          return (
            <li
              key={`${title}-${item.id || "no-id"}-${idx}`}
              onClick={() => onSelect(item)}
              className={`text-sm flex items-center gap-2 cursor-pointer p-1.5 rounded transition-colors ${
                isSelected
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-blue-600"
              }`}
              role="option"
              aria-selected={isSelected}
            >
              {Icon ? (
                <Icon
                  className={`w-3 h-3 ${isSelected ? "text-white" : "text-zinc-400"}`}
                />
              ) : (
                getIcon(item.type, isSelected)
              )}
              <span className="truncate">{item.label}</span>
              {(item.metadata as any)?.price && (
                <span
                  className={`ml-auto text-xs font-bold ${isSelected ? "text-white" : "text-zinc-900"}`}
                >
                  {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  }).format((item.metadata as any).price)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const getIcon = (type: string, isSelected: boolean) => {
  const className = isSelected ? "w-3 h-3 text-white" : "w-3 h-3 text-zinc-400";
  switch (type) {
    case "product":
      return <Camera className={className} />;
    case "vehicle":
      return <Search className={className} />;
    case "system":
    case "part_type":
      return <Folder className={className} />;
    default:
      return <Wrench className={className} />;
  }
};
