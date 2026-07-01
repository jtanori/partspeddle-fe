import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SearchFilters, PartCondition } from "../types";
import { useTaxonomy } from "../hooks/useTaxonomy";

interface ProductSidebarProps {
  filters: SearchFilters;
  facets?: any;
  clearAllFilters: () => void;
  toggleSection: (sec: string) => void;
  collapsedSections: Record<string, boolean>;
  sortBy: string;
  setSortBy: (sort: string) => void;
  getSystemPartCount: (sys: string) => string;
  getConditionCount: (cond: PartCondition) => number;
  getSellerTypeCount: (type: "all" | "trusted") => number;
  togglePartType: (type: string) => void;
  toggleCondition: (cond: PartCondition) => void;
  handlePriceChange: (index: number, val: number) => void;
  setAndSyncFilters: (updateFn: (prev: SearchFilters) => SearchFilters) => void;
  isDisabled?: boolean;
}

export const ProductSidebar: React.FC<ProductSidebarProps> = ({
  filters,
  facets = {},
  clearAllFilters,
  toggleSection,
  collapsedSections,
  sortBy: _sortBy,
  setSortBy: _setSortBy,
  getSystemPartCount: _getSystemPartCount,
  getConditionCount,
  getSellerTypeCount: _getSellerTypeCount,
  togglePartType,
  toggleCondition,
  handlePriceChange,
  setAndSyncFilters,
  isDisabled = false,
}) => {
  const { taxonomy, loading } = useTaxonomy();

  const selectedSystem = filters.system || "";
  const selectedCategorySlug = filters.category || "";

  const categories = selectedSystem
    ? taxonomy?.categoriesBySystem[selectedSystem] || []
    : [];

  const selectedCategory = selectedCategorySlug
    ? taxonomy?.categoryBySlug[selectedCategorySlug]
    : undefined;

  const partTypes = selectedCategory
    ? taxonomy?.partTypesByCategory[selectedCategory.id] || []
    : [];

  const themeClasses = isDisabled
    ? "bg-zinc-50 border-zinc-200 text-zinc-900"
    : "bg-[#1A1A1A] border-stone-800 text-zinc-300";

  const headerTextClasses = isDisabled ? "text-zinc-500" : "text-rust-copper";
  const sectionTextClasses = isDisabled ? "text-zinc-900" : "text-warm-gray";

  if (loading) {
    return (
      <div
        className={`border rounded-xl p-5 space-y-6 relative shadow-sm ${themeClasses}`}
        id="unified-filters-card"
      >
        <div className="text-xs text-zinc-500">Loading taxonomy...</div>
      </div>
    );
  }

  return (
    <div
      className={`border rounded-xl p-5 space-y-6 relative shadow-sm ${themeClasses}`}
      id="unified-filters-card"
    >
      {/* FILTER BY Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 pb-1">
          <h2
            className={`font-display font-black text-[11px] uppercase tracking-widest select-none ${headerTextClasses}`}
          >
            FILTER BY
          </h2>
          <div className="flex-grow h-px bg-zinc-200" />
        </div>
        <button
          onClick={clearAllFilters}
          className="text-[10px] font-bold uppercase text-zinc-500 hover:text-rust-copper transition-colors cursor-pointer bg-transparent border-none"
        >
          Clear All
        </button>
      </div>

      {/* Filter Sections */}
      {[
        {
          id: "fitment",
          title: "Fitment",
          content: (
            <div className="space-y-2">
              <select
                value={filters.fitmentMake}
                onChange={(e) =>
                  setAndSyncFilters((p) => ({
                    ...p,
                    fitmentMake: e.target.value,
                    fitmentModel: "All Models",
                  }))
                }
                className="w-full bg-white border border-zinc-300 rounded p-2 text-sm"
              >
                <option value="All Makes">All Makes</option>
                {facets.make &&
                  Object.keys(facets.make).map((make) => (
                    <option key={make} value={make}>
                      {make} ({facets.make[make]})
                    </option>
                  ))}
              </select>
              <select
                value={filters.fitmentModel}
                onChange={(e) =>
                  setAndSyncFilters((p) => ({
                    ...p,
                    fitmentModel: e.target.value,
                  }))
                }
                className="w-full bg-white border border-zinc-300 rounded p-2 text-sm"
                disabled={filters.fitmentMake === "All Makes"}
              >
                <option value="All Models">All Models</option>
                {facets.model &&
                  Object.keys(facets.model).map((model) => (
                    <option key={model} value={model}>
                      {model} ({facets.model[model]})
                    </option>
                  ))}
              </select>
              <select
                value={filters.fitmentYear}
                onChange={(e) =>
                  setAndSyncFilters((p) => ({
                    ...p,
                    fitmentYear: e.target.value,
                  }))
                }
                className="w-full bg-white border border-zinc-300 rounded p-2 text-sm"
              >
                <option value="All Years">All Years</option>
                {facets.year &&
                  Object.keys(facets.year)
                    .sort((a, b) => b.localeCompare(a))
                    .map((year) => (
                      <option key={year} value={year}>
                        {year} ({facets.year[year]})
                      </option>
                    ))}
              </select>
            </div>
          ),
        },
        {
          id: "manufacturer",
          title: "Manufacturer",
          content: (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {facets.make &&
                Object.keys(facets.make).map((make) => (
                  <div
                    key={make}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                    onClick={() =>
                      setAndSyncFilters((p) => ({
                        ...p,
                        fitmentMake:
                          p.fitmentMake === make ? "All Makes" : make,
                      }))
                    }
                  >
                    <div
                      className={`w-4 h-4 rounded border ${filters.fitmentMake === make ? "bg-rust-copper border-rust-copper" : "border-zinc-300"}`}
                    ></div>
                    {make} ({facets.make[make]})
                  </div>
                ))}
            </div>
          ),
        },
        {
          id: "category",
          title: "Category",
          content: (
            <div className="space-y-2">
              <select
                value={filters.system}
                onChange={(e) =>
                  setAndSyncFilters((p) => ({
                    ...p,
                    system: e.target.value,
                    category: "",
                    partTypes: [],
                  }))
                }
                className="w-full bg-white border border-zinc-300 rounded p-2 text-sm"
              >
                <option value="">All Systems</option>
                {taxonomy?.systems.map((sys) => (
                  <option key={sys} value={sys}>
                    {sys}
                  </option>
                ))}
              </select>
              {filters.system && (
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setAndSyncFilters((p) => ({
                      ...p,
                      category: e.target.value,
                      partTypes: [],
                    }))
                  }
                  className="w-full bg-white border border-zinc-300 rounded p-2 text-sm"
                >
                  <option value="">All Assemblies</option>
                  {categories.map((cat) => (
                    <option key={cat.slug_en} value={cat.slug_en}>
                      {cat.name_en || cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ),
        },
        {
          id: "partType",
          title: "Part Type",
          content: (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {partTypes.map((type) => (
                <div
                  key={type.slug_en}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                  onClick={() => togglePartType(type.slug_en)}
                >
                  <div
                    className={`w-4 h-4 rounded border ${filters.partTypes.includes(type.slug_en) ? "bg-rust-copper border-rust-copper" : "border-zinc-300"}`}
                  ></div>
                  {type.name_en || type.name}
                </div>
              ))}
            </div>
          ),
        },
        {
          id: "condition",
          title: "Condition",
          content: (
            <div className="space-y-1">
              {(
                [
                  "Used OEM",
                  "OEM Original",
                  "Excellent",
                  "Good",
                  "For Parts",
                ] as any[]
              ).map((cond) => (
                <div
                  key={cond}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                  onClick={() => toggleCondition(cond)}
                >
                  <div
                    className={`w-4 h-4 rounded border ${filters.conditions.includes(cond) ? "bg-rust-copper border-rust-copper" : "border-zinc-300"}`}
                  ></div>
                  {cond} ({getConditionCount(cond)})
                </div>
              ))}
            </div>
          ),
        },
        {
          id: "price",
          title: "Price Range",
          content: (
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="$ Min"
                value={filters.priceRange[0]}
                onChange={(e) => handlePriceChange(0, parseInt(e.target.value))}
                className="w-full border border-zinc-300 rounded p-2 text-sm"
              />
              <span className="text-zinc-400">-</span>
              <input
                type="number"
                placeholder="$ Max"
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange(1, parseInt(e.target.value))}
                className="w-full border border-zinc-300 rounded p-2 text-sm"
              />
            </div>
          ),
        },
      ].map((section) => (
        <div key={section.id} className="space-y-2">
          <div
            onClick={() => toggleSection(section.id)}
            className="flex items-center justify-between cursor-pointer pb-2 border-b border-zinc-200"
          >
            <span
              className={`font-display text-sm uppercase tracking-wider ${sectionTextClasses}`}
            >
              {section.title}
            </span>
            {collapsedSections[section.id] ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
          {!collapsedSections[section.id] && section.content}
        </div>
      ))}

      {/* Apply Filters Button */}
      <button className="w-full bg-rust-copper text-white font-black uppercase tracking-widest py-3 rounded-sm text-xs hover:bg-bronze transition-colors">
        Apply Filters
      </button>
    </div>
  );
};
