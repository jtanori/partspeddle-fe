import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search,
  X,
  Cog,
  Compass,
  Disc,
  Zap,
  Car,
  Armchair,
  ArrowRight,
  ShieldAlert,
  Clock,
  Trash2,
} from "lucide-react";
import { Part, PARTS_FALLBACK_IMAGE } from "../types";
import { saveRecentSearch } from "./search/utils/recent-searches";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPart: (partId: string) => void;
  onSeeAllResults: (query: string, system: string) => void;
  initialQuery?: string;
}

const SYSTEMS_LIST = [
  "Powertrain",
  "Suspension & Steering",
  "Brake System",
  "Electrical System",
  "Body & Exterior",
  "Interior",
];

const getSystemIcon = (sysId: string) => {
  switch (sysId) {
    case "Powertrain":
      return Cog;
    case "Suspension & Steering":
      return Compass;
    case "Brake System":
      return Disc;
    case "Electrical System":
      return Zap;
    case "Body & Exterior":
      return Car;
    case "Interior":
      return Armchair;
    default:
      return Cog;
  }
};

const PART_THUMBNAILS: Record<string, string> = {
  "1100428":
    "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=300",
  "1100429":
    "https://images.unsplash.com/photo-1518364538800-6bcb3f25da49?auto=format&fit=crop&q=80&w=300",
  "1100430":
    "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=300",
  "1100431":
    "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=300",
  "1100432":
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=300",
  "th400-trans":
    "https://images.unsplash.com/photo-1504222014244-63be825126f5?auto=format&fit=crop&q=80&w=300",
  "holley-4160":
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=300",
  "f150-door":
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=300",
  "ford9-rearend":
    "https://images.unsplash.com/photo-1530047625168-4b18fa65f242?auto=format&fit=crop&q=80&w=300",
  "brembo-caliper-red":
    "https://images.unsplash.com/photo-1606577924006-27d39b132af2?auto=format&fit=crop&q=80&w=300",
  "eibach-springs-sports":
    "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=300",
  "wilwood-disc-rotors":
    "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=300",
  "bilstein-b6-strut":
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=300",
  "custom-steering-wheel":
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=300",
  "edelbrock-manifold":
    "https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&q=80&w=300",
  "msd-ignition-box":
    "https://images.unsplash.com/photo-1532585078488-03b0ff297fea?auto=format&fit=crop&q=80&w=300",
};

export default function SearchModal({
  isOpen,
  onClose,
  onSelectPart,
  onSeeAllResults,
  initialQuery = "",
}: SearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [matchingParts, setMatchingParts] = useState<Part[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Swipe-down to close gestures (mobile sheet)
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(0);

  // Load recent searches from localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem("partspeddle_recent_searches");
        if (saved) {
          const parsed = JSON.parse(saved);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setRecentSearches(
            parsed.map((s: any) => (typeof s === "string" ? s : s.query)),
          );
        } else {
          // Put some default helpful ones initially if empty
          const defaults = ["alternator", "transmission", "springs", "caliper"];
          localStorage.setItem(
            "partspeddle_recent_searches",
            JSON.stringify(defaults),
          );

          setRecentSearches(defaults);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  // Focus the input when the modal opens
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(initialQuery);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialQuery]);

  // Compute live search results based on query and subsystem
  useEffect(() => {
    const fetchResults = async () => {
      const trimmed = query.toLowerCase().trim();

      if (trimmed.length < 3 && !selectedSystem) {
        setMatchingParts([]);
        return;
      }

      let dbQuery = supabase.from("parts").select("*");
      if (selectedSystem) dbQuery = dbQuery.eq("system", selectedSystem);
      if (trimmed.length >= 3) dbQuery = dbQuery.textSearch("title", trimmed);

      const { data, error } = await dbQuery.limit(10);

      if (error) {
        console.error("Search query error:", error);
        setMatchingParts([]);
      } else if (data) {
        setMatchingParts(data as unknown as Part[]);
      } else {
        setMatchingParts([]);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, selectedSystem]);

  if (!isOpen) return null;

  const saveSearchTerm = (term: string) => {
    saveRecentSearch(term);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("partspeddle_recent_searches");
    } catch (e) {
      console.error(e);
    }
  };

  const getConditionColor = (cond: string) => {
    const c = cond.toLowerCase();
    if (
      c.includes("new") ||
      c.includes("oem original") ||
      c.includes("original")
    ) {
      return "bg-[#B87333] text-zinc-950 font-black";
    }
    if (c.includes("excellent")) {
      return "bg-[#7A8B6F] text-zinc-950 font-black";
    }
    if (c.includes("good")) {
      return "bg-[#E9DEC1] text-zinc-950 font-bold";
    }
    return "bg-[#8B6239] text-[#FCFAF8] font-semibold";
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartRef.current;
    if (diff > 0) {
      setTranslateY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (translateY > 120) {
      onClose();
    }
    setTranslateY(0);
  };

  const handleSystemToggle = (system: string) => {
    setSelectedSystem((prev) => (prev === system ? "" : system));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveSearchTerm(query);
      onSeeAllResults(query, selectedSystem);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-end justify-center md:items-center md:justify-center transition-all duration-300 animate-fade-in"
      id="global-search-modal"
    >
      {/* Backdrop clicks dismiss the modal safely */}
      <div className="absolute inset-0 z-10 cursor-pointer" onClick={onClose} />

      {/* Main container: Fullscreen on mobile (< 768px), beautiful centered dialogue on desktop */}
      <div
        className="bg-[#1A1A1A] md:bg-white text-white md:text-zinc-900 w-full md:w-[75%] md:min-w-[700px] md:max-w-[75%] h-full md:h-[85vh] md:max-h-[85vh] rounded-none md:rounded-2xl z-20 flex flex-col shadow-[0_-15px_45px_rgba(0,0,0,0.5)] md:shadow-[0_20px_60px_rgba(0,0,0,0.2)] md:border md:border-zinc-200 overflow-hidden select-none"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: isDragging
            ? "none"
            : "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        id="search-overlay-container"
      >
        {/* Mobile-only draggable handlebar */}
        <div
          className="md:hidden pt-3 pb-1 select-none cursor-row-resize active:cursor-grabbing flex-shrink-0 flex justify-center items-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          id="search-draggable-handle-bar"
        >
          <div className="w-12 h-1 bg-zinc-700 rounded-full" />
        </div>

        {/* Header Region: [✕] close, [Search........................] input, [🔍] submit */}
        <div className="px-4 py-3 border-b border-zinc-800 md:border-zinc-100 flex-shrink-0 flex items-center gap-3">
          {/* Close button  */}
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white md:hover:text-[#1E1E1E] md:hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
            id="btn-close-search-modal"
            title="Close Search"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>

          {/* Search Input Box */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search parts, VIN, SKU..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#242424] md:bg-zinc-50 border border-zinc-700 md:border-zinc-250 hover:border-zinc-600 focus:border-[#B87333] focus:ring-1 focus:ring-[#B87333]/30 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white md:text-zinc-900 placeholder-zinc-500 md:placeholder-zinc-400 focus:outline-none font-sans font-medium transition-all"
              id="input-modal-search"
            />
            <div className="absolute left-3.5 top-3.5 text-zinc-500">
              <Search className="w-4 h-4" />
            </div>
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-3 text-zinc-400 hover:text-white md:hover:text-zinc-600 transition-colors cursor-pointer"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Submit Action Button */}
          <button
            onClick={handleSearchSubmit}
            className="w-10 h-10 flex items-center justify-center bg-[#B87333] text-white rounded-lg hover:bg-[#A35D1F] active:translate-y-0.5 shadow-sm transition-all cursor-pointer"
            title="Submit Search"
            id="btn-submit-search-overlay"
          >
            <Search className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Interactive Search Overlay Body Contents */}
        <div className="flex-grow overflow-y-auto p-5 md:p-6 space-y-6 bg-[#1A1A1A] md:bg-white">
          {query.trim().length > 0 && query.trim().length < 3 ? (
            /* Helpful state prompting 3+ chars */
            <div className="text-center py-12 max-w-sm mx-auto space-y-4">
              <div className="w-14 h-14 bg-amber-950/40 md:bg-amber-50 border border-amber-800/30 md:border-amber-200 text-[#B87333] rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm uppercase text-zinc-200 md:text-zinc-800 tracking-wider">
                  Entering Search Term...
                </h4>
                <p className="text-xs text-zinc-400 md:text-zinc-500 font-sans mt-1.5 leading-relaxed">
                  Please type{" "}
                  <span className="font-bold text-[#B87333]">
                    at least 3 characters
                  </span>{" "}
                  to initiate live parts inventory search lookup.
                </p>
              </div>
            </div>
          ) : query.trim().length === 0 ? (
            /* Blank state help layout: Recent searches + Browse by System chips */
            <div className="space-y-6">
              {/* 1. Recent Searches List */}
              {recentSearches.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
                    <span>Recent Searches</span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-zinc-500 hover:text-[#B87333] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  </div>
                  <div className="divide-y divide-zinc-800/50 md:divide-zinc-100 rounded-lg overflow-hidden border border-zinc-800/85 md:border-zinc-200 bg-[#222222] md:bg-zinc-50">
                    {recentSearches.map((term, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setQuery(term);
                          saveSearchTerm(term);
                        }}
                        className="flex items-center justify-between p-3 cursor-pointer text-sm text-zinc-300 md:text-zinc-700 hover:bg-zinc-800 md:hover:bg-zinc-100 transition-all select-none group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-zinc-500 group-hover:text-[#B87333] transition-colors" />
                          <span className="font-sans font-medium uppercase tracking-wide">
                            {term}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Browse by System (Category chips) */}
              <div className="space-y-3">
                <div className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
                  <span>Browse by System</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SYSTEMS_LIST.map((sys) => {
                    const isSelected =
                      selectedSystem.toLowerCase() === sys.toLowerCase();
                    const Icon = getSystemIcon(sys);
                    return (
                      <button
                        key={sys}
                        onClick={() => handleSystemToggle(sys)}
                        className={`p-3 rounded-lg flex items-center gap-2.5 text-left transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-[#B87333] border-[#B87333] text-white font-bold shadow-md"
                            : "bg-[#222222] md:bg-zinc-50 text-zinc-300 md:text-zinc-700 hover:bg-zinc-800 md:hover:bg-zinc-100 border-zinc-800 md:border-zinc-200"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-white" : "text-[#B87333]"}`}
                        />
                        <span className="text-xs uppercase font-sans font-semibold tracking-wide truncate">
                          {sys}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : matchingParts.length > 0 ? (
            /* Results feed matching criteria */
            <div className="space-y-3">
              <div className="text-[10px] uppercase tracking-wider font-mono font-bold text-zinc-500 border-b border-zinc-800/80 md:border-zinc-100 pb-2 mb-3">
                <span>
                  Matching Live Inventory ({matchingParts.length} parts found)
                </span>
              </div>

              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                id="search-modal-results-list"
              >
                {matchingParts.map((part) => {
                  const thumb =
                    PART_THUMBNAILS[part.id] || PARTS_FALLBACK_IMAGE;
                  const cleanedTitle = (part.title || "").replace(
                    /^\d{4}\s+/,
                    "",
                  );
                  const yearMatch =
                    part.subtitle.match(/\d{4}-\d{4}/) ||
                    part.subtitle.match(/\d{4}/);
                  const years = yearMatch ? yearMatch[0] : "1981–1987";
                  const engines = (part.fits || "")
                    .replace(/\s+Engines?/gi, "")
                    .trim();
                  const consolidatedSubtitle = `${years} • ${engines}`;
                  return (
                    <div
                      key={part.id}
                      onClick={() => {
                        saveSearchTerm(query);
                        onSelectPart(part.id);
                        onClose();
                      }}
                      className="bg-[#222222] md:bg-white border border-stone-800/10 rounded-lg overflow-hidden cursor-pointer flex flex-col transition-all duration-250 hover:border-[#B87333]/70 hover:shadow-lg active:scale-[0.98] text-left group shadow-sm shadow-black/5"
                    >
                      {/* TOP PART: Compacted Image */}
                      <div className="relative h-24 sm:h-26 w-full bg-zinc-950 flex-shrink-0 overflow-hidden">
                        <img
                          src={thumb}
                          alt={part.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-95"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = PARTS_FALLBACK_IMAGE;
                          }}
                        />

                        {/* Compacted Condition Badge */}
                        <span className="absolute bottom-2 left-2 text-[8px] font-display font-medium uppercase tracking-wider bg-black/75 text-[#C4A882] py-0.5 px-1.5 rounded-sm">
                          In Stock
                        </span>
                      </div>

                      {/* BOTTOM PART: Content Details */}
                      <div className="p-3 flex-grow flex flex-col justify-between bg-[#1E1E1E] md:bg-[#FCFAF8] gap-2">
                        <div>
                          {/* Brand colored System label + Icon above Title */}
                          <div className="flex items-center gap-1 text-[9px] text-[#B87333] font-display font-semibold uppercase tracking-wider mb-1">
                            {(() => {
                              const IconComp = getSystemIcon(part.system);
                              return (
                                <IconComp className="w-3 h-3 text-[#B87333] stroke-[2]" />
                              );
                            })()}
                            <span>{part.system}</span>
                          </div>

                          {/* Uppercase Title */}
                          <h5 className="text-xs font-display font-bold text-zinc-100 md:text-zinc-900 line-clamp-2 uppercase leading-snug group-hover:text-[#B87333] transition-colors">
                            {cleanedTitle}
                          </h5>

                          <p className="text-[11px] text-zinc-400 mt-1 font-sans">
                            {consolidatedSubtitle}
                          </p>

                          {/* Conditional specs tags - removed fits tag, keep mileage */}
                          {part.mileage && (
                            <div className="flex flex-wrap gap-1 mt-2 text-[8.5px] font-sans text-zinc-400 font-semibold uppercase">
                              {typeof part.mileage === "number" &&
                              part.mileage > 0 ? (
                                <span className="bg-[#242424] md:bg-[#F5F0EB]/60 px-1.5 py-0.5 rounded border border-zinc-800 md:border-zinc-150 text-zinc-450">
                                  {part.mileage.toLocaleString()} mi
                                </span>
                              ) : null}
                            </div>
                          )}
                        </div>

                        {/* Asking price and prominent grading badge at bottom - PRICE label removed */}
                        <div className="border-t border-zinc-800 md:border-zinc-150 pt-2 flex items-center justify-between text-[10px] mt-1.5">
                          <div className="space-y-0.5">
                            <span className="font-display font-black text-sm text-zinc-200 md:text-zinc-900 tracking-tight block">
                              ${part.price.toFixed(2)}
                            </span>
                          </div>

                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[8.5px] uppercase tracking-wide leading-none font-sans shadow-xs ${getConditionColor(part.condition)}`}
                          >
                            {part.condition}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Results empty layout */
            <div className="text-center py-16 max-w-sm mx-auto space-y-4">
              <div className="w-14 h-14 bg-rose-950/40 md:bg-rose-50 border border-rose-800/30 md:border-rose-200 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm uppercase text-zinc-300 md:text-zinc-800 tracking-wider">
                  No Matching Listings Listed
                </h4>
                <p className="text-xs text-zinc-400 md:text-zinc-500 font-sans mt-1.5 leading-relaxed">
                  We couldn&apos;t locate any auto parts matches under &quot;
                  {query}&quot; filter on {selectedSystem || "all"} systems. Try
                  entering a broader keyword.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer info layout */}
        {matchingParts.length > 0 && (
          <div
            className="px-5 py-3.5 bg-[#222222] md:bg-zinc-50 border-t border-zinc-800 md:border-zinc-200 flex items-center justify-end flex-shrink-0 w-full"
            id="search-modal-footer-btn-bar"
          >
            <button
              onClick={() => {
                saveSearchTerm(query);
                onSeeAllResults(query, selectedSystem);
                onClose();
              }}
              className="w-full sm:w-auto bg-[#B87333] hover:bg-[#A35D1F] text-white text-xs font-display font-bold uppercase tracking-wider py-2.5 px-5 rounded-lg transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              id="search-btn-see-all-results-footer"
            >
              <span>See All ({matchingParts.length}) Results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
