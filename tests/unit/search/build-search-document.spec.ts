import { describe, it, expect, vi, beforeEach } from "vitest";
import { BuildSearchDocumentUseCase } from "../../../src/backend/modules/search/application/build-search-document";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Mock supabase
vi.mock("@/lib/supabase-admin", () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

describe("BuildSearchDocumentUseCase", () => {
  const useCase = new BuildSearchDocumentUseCase();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully builds a search document", async () => {
    const mockPart = {
      id: "part-123",
      title: "Alternator",
      description: "A".repeat(250), // > 200 to test quality score
      price_mxn: 100,
      status: "AVAILABLE",
      created_at: new Date().toISOString(),
      part_types: { name: "Alternator", categories: { name: "Electrical" } },
      vehicle_variants: {
        year: 2015,
        models: { name: "Civic", makes: { name: "Honda" } },
      },
      users: {
        seller_profiles: {
          business_name: "Yonke",
          verification_status: "verified",
        },
      },
      part_images: [{ id: "img-1" }],
    };

    (supabaseAdmin.from as any).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: mockPart, error: null }),
        }),
      }),
    });

    const doc = await useCase.execute("part-123");

    expect(doc.objectID).toBe("part-123");
    expect(doc.title).toBe("Alternator");
    expect(doc.make).toBe("Honda");
    expect(doc.category).toBe("Electrical");
    expect(doc.seller_verified).toBe(true);
    expect(doc.listing_quality_score).toBeGreaterThan(0);
  });

  it("throws an error if part is not found", async () => {
    (supabaseAdmin.from as any).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: "Not found" }),
        }),
      }),
    });

    await expect(useCase.execute("part-404")).rejects.toThrow(
      "Part not found: part-404",
    );
  });
});
