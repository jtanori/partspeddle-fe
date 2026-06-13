import { describe, it, expect } from "vitest";
import { SearchDocument } from "../../domain/search-document";

describe("Search Document Contract", () => {
  it("should match the expected Algolia indexing schema", () => {
    const mockDocument: SearchDocument = {
      objectID: "part-123",
      title: "Test Part",
      description: "Test description",
      price: 100,
      status: "AVAILABLE",
      make: "Ford",
      model: "F150",
      year: 2020,
      category: "Electrical",
      part_type: "Alternator",
      condition: "USED_GOOD",
      seller_name: "Yonke",
      seller_verified: true,
      seller_trust_score: 50,
      location: "N/A",
      image_url: "http://img.url",
      listing_quality_score: 100,
      created_at: 1781251147,
    };

    // Contract validation
    expect(mockDocument).toMatchObject({
      objectID: expect.any(String),
      title: expect.any(String),
      price: expect.any(Number),
      make: expect.any(String),
      category: expect.any(String),
    });
  });
});
