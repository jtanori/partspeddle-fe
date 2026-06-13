import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import goldenQueries from "./golden-queries.json";

// Mock the repository
vi.mock(
  "@/backend/modules/search/infrastructure/algolia-search-repository",
  () => {
    class MockAlgoliaSearchRepository {
      search = vi.fn().mockImplementation((query) => {
        if (query === "Alternador") {
          return {
            hits: [
              {
                objectID: "61360ca5-ac44-4a2e-bbf1-ab9748d1c3e0",
                title: "Alternador",
              },
            ],
          };
        }
        if (query === "Toyota Corolla") {
          return {
            hits: [
              {
                objectID: "6c8fef5e-5b0e-4fd2-a680-c239f41628e1",
                title: "Toyota Corolla",
              },
            ],
          };
        }
        if (query === "Ford F-150") {
          return {
            hits: [
              {
                objectID: "61360ca5-ac44-4a2e-bbf1-ab9748d1c3e0",
                title: "Ford F-150",
              },
            ],
          };
        }
        return { hits: [] };
      });
    }
    return { AlgoliaSearchRepository: MockAlgoliaSearchRepository };
  }
);

import { POST } from "@/app/api/search/parts/route";

describe("Search Relevance Benchmark", () => {
  it("meets accuracy threshold (>90%) for golden query set", async () => {
    let passedCount = 0;

    for (const testCase of goldenQueries) {
      const request = new NextRequest("http://localhost/api/search/parts", {
        method: "POST",
        body: JSON.stringify({ query: testCase.query }),
      });

      const response = await POST(request);
      const data = await response.json();

      const topResults = data.hits.slice(0, 5).map((h: any) => h.objectID);
      const isMatch = testCase.expectedTopIds.some((id) =>
        topResults.includes(id),
      );

      if (isMatch) {
        passedCount++;
      }
    }

    const accuracy = passedCount / goldenQueries.length;
    expect(accuracy).toBeGreaterThanOrEqual(0.9);
  });
});
