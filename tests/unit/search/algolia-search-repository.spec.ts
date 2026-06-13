import { describe, it, expect } from "vitest";
import { AlgoliaSearchRepository } from "../../../src/backend/modules/search/infrastructure/algolia-search-repository";

describe("AlgoliaSearchRepository", () => {
  const repo = new AlgoliaSearchRepository();

  describe("buildAlgoliaFilters", () => {
    it("handles empty filters", () => {
      const filters = {};
      expect(repo.buildAlgoliaFilters(filters as any)).toBe("");
    });

    it("handles single facet", () => {
      const filters = { makeIds: ["Honda"] };
      expect(repo.buildAlgoliaFilters(filters as any)).toBe("(make:'Honda')");
    });

    it("handles multiple facets", () => {
      const filters = { makeIds: ["Honda", "Toyota"], categoryIds: ["Motor"] };
      const result = repo.buildAlgoliaFilters(filters as any);
      expect(result).toBe(
        "(make:'Honda' OR make:'Toyota') AND (category:'Motor')",
      );
    });

    it("handles part type and verified filters", () => {
      const filters = { partTypeIds: ["Alternator"], verifiedOnly: true };
      expect(repo.buildAlgoliaFilters(filters as any)).toBe(
        "(part_type:'Alternator') AND seller_verified:true",
      );
    });

    it("handles year range", () => {
      const filters = { yearMin: 2010, yearMax: 2020 };
      expect(repo.buildAlgoliaFilters(filters as any)).toBe(
        "year >= 2010 AND year <= 2020",
      );
    });

    it("handles condition filter", () => {
      const filters = { condition: ["NEW", "USED_GOOD"] };
      expect(repo.buildAlgoliaFilters(filters as any)).toBe(
        "(condition:'NEW' OR condition:'USED_GOOD')",
      );
    });

    it("handles extremely long facet values", () => {
      const longValue = "a".repeat(1000);
      const filters = { makeIds: [longValue] };
      const result = repo.buildAlgoliaFilters(filters as any);
      expect(result).toBe(`(make:'${longValue}')`);
    });

    it("handles numeric-only strings as facet values", () => {
      const filters = { makeIds: ["2025"] };
      const result = repo.buildAlgoliaFilters(filters as any);
      expect(result).toBe("(make:'2025')");
    });

    it("handles empty arrays in filters gracefully", () => {
      const filters = { makeIds: [], categoryIds: [] };
      expect(repo.buildAlgoliaFilters(filters as any)).toBe("");
    });
  });
});
