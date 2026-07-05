import { SearchRepository } from "../domain/search-repository";
import { SearchFilters } from "../domain/search-filters";
import { SearchResult } from "../domain/search-result";
import { SearchDocument } from "../domain/search-document";
import {
  algoliaClient,
  SEARCH_INDEX_NAME,
  INDEX_PRICE_ASC,
  INDEX_PRICE_DESC,
  INDEX_NEWEST,
} from "./algolia-client";

export class AlgoliaSearchRepository implements SearchRepository {
  async search(
    query: string,
    filters: SearchFilters,
    page: number,
    hitsPerPage: number,
  ): Promise<SearchResult> {
    const algoliaFilters = this.buildAlgoliaFilters(filters);

    // Map sortBy to specific index/replica
    const indexName =
      filters.sortBy === "price_asc"
        ? INDEX_PRICE_ASC
        : filters.sortBy === "price_desc"
          ? INDEX_PRICE_DESC
          : filters.sortBy === "newest"
            ? INDEX_NEWEST
            : SEARCH_INDEX_NAME;

    const result = await algoliaClient.search({
      requests: [
        {
          indexName,
          query,
          ...(algoliaFilters.trim().length > 0
            ? { filters: algoliaFilters }
            : {}),
          page,
          hitsPerPage,
          facets: [
            "category",
            "part_type",
            "make",
            "model",
            "year",
            "condition",
            "seller_verified",
          ],
          attributesToRetrieve: [
            "objectID",
            "title",
            "subtitle",
            "description",
            "price",
            "image_url",
            "category",
            "category_label",
            "part_type",
            "part_type_label",
            "make",
            "model",
            "year",
            "condition",
            "fits",
            "fitment_signatures",
            "seller_name",
            "seller_verified",
            "seller_trust_score",
            "listing_quality_score",
            "location",
            "created_at",
          ],
        },
      ],
    });

    const response = result.results[0] as any;

    if (response.error) {
      throw new Error(`Algolia Search Error: ${response.error}`);
    }

    return {
      hits: (response.hits || []) as SearchDocument[],
      totalHits: response.nbHits || 0,
      page: response.page || 0,
      totalPages: response.nbPages || 0,
      facets: response.facets,
    };
  }

  async saveDocument(document: SearchDocument): Promise<void> {
    await algoliaClient.saveObjects({
      indexName: SEARCH_INDEX_NAME,
      objects: [document as unknown as Record<string, unknown>],
    });
  }

  async deleteDocument(partId: string): Promise<void> {
    await algoliaClient.deleteObject({
      indexName: SEARCH_INDEX_NAME,
      objectID: partId,
    });
  }

  async saveDocuments(documents: SearchDocument[]): Promise<void> {
    await algoliaClient.saveObjects({
      indexName: SEARCH_INDEX_NAME,
      objects: documents as unknown as Record<string, unknown>[],
    });
  }

  private escapeFilterValue(value: any): string {
    // Algolia filter syntax escapes single quotes by doubling them.
    return String(value).replace(/'/g, "''");
  }

  buildAlgoliaFilters(filters: SearchFilters): string {
    const parts: string[] = [];

    const addFilter = (field: string, values: any[] | undefined) => {
      if (!values || !Array.isArray(values)) return;
      const validValues = values.filter(
        (v) => typeof v === "string" && v.trim() !== "",
      );
      if (validValues.length === 0) return;
      parts.push(
        `(${validValues.map((v) => `${field}:'${this.escapeFilterValue(v)}'`).join(" OR ")})`,
      );
    };

    addFilter("make", filters.makeIds);
    addFilter("model", filters.modelIds);

    if (typeof filters.yearMin === "number" && !isNaN(filters.yearMin)) {
      parts.push(`year >= ${filters.yearMin}`);
    }

    if (typeof filters.yearMax === "number" && !isNaN(filters.yearMax)) {
      parts.push(`year <= ${filters.yearMax}`);
    }

    if (filters.fitmentSignatures && filters.fitmentSignatures.length > 0) {
      const signatures = filters.fitmentSignatures.map(
        (s) => `fitment_signatures:'${this.escapeFilterValue(s)}'`
      );
      parts.push(`(${signatures.join(" OR ")})`);
    }

    addFilter("category", filters.categoryIds);
    addFilter("part_type", filters.partTypeIds);
    addFilter("condition", filters.condition);

    if (filters.verifiedOnly === true) {
      parts.push("seller_verified:true");
    }

    if (typeof filters.priceMin === "number" && !isNaN(filters.priceMin)) {
      parts.push(`price >= ${filters.priceMin}`);
    }

    if (typeof filters.priceMax === "number" && !isNaN(filters.priceMax)) {
      parts.push(`price <= ${filters.priceMax}`);
    }

    return parts.join(" AND ");
  }
}
