import { test, expect } from "@playwright/test";
import { fetchSmokeListingId } from "./helpers/listing-id";

test.describe("Home smoke", () => {
  test("loads the homepage", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.getByText(/PartsPeddle/i).first()).toBeVisible();
    await expect(
      page.locator('input[type="text"], input[type="search"]').first(),
    ).toBeVisible();
  });
});

test.describe("Search smoke", () => {
  test("loads the search page", async ({ page }) => {
    const response = await page.goto("/search");
    expect(response?.status()).toBe(200);
    await expect(
      page.locator('input[type="text"], input[type="search"]').first(),
    ).toBeVisible();
  });

  test("loads search results for a query", async ({ page }) => {
    const response = await page.goto("/search?q=brake");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).not.toContainText("Application error");
  });
});

test.describe("Listing smoke", () => {
  test("loads a listing detail page", async ({ page, request, baseURL }) => {
    test.skip(!baseURL, "baseURL is required");

    const listingId = await fetchSmokeListingId(request, baseURL!);
    const response = await page.goto(`/listing/${listingId}`);

    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).not.toContainText("Part not found");
  });
});

test.describe("Auth smoke", () => {
  test("loads the login page", async ({ page }) => {
    const response = await page.goto("/login");
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign in securely/i }),
    ).toBeVisible();
  });

  test("loads the register page", async ({ page }) => {
    const response = await page.goto("/register");
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: /create account/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /^buyer$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^seller$/i })).toBeVisible();
  });
});
