import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import OutfitBuilderPageNew from "./OutfitBuilderPageNew";
import { getDatabase, ref, get } from "firebase/database";

// Mock Firebase Database
vi.mock("firebase/database", () => ({
  getDatabase: vi.fn(),
  ref: vi.fn(),
  get: vi.fn(),
}));

// Sample mock clothing data
const mockClothingData = {
  "clothing1": { id: "clothing1", category: "Tops", imageUrl: "top.jpg" },
  "clothing2": { id: "clothing2", category: "Shoes", imageUrl: "shoes.jpg" },
};

describe("Outfit Builder Clothing Fetch Tests", () => {
  beforeEach(() => {
    // Mock Firebase responses
    get.mockResolvedValue({
      exists: () => true,
      val: () => mockClothingData,
    });
  });

  test("Fetches and displays clothing items", async () => {
    render(<OutfitBuilderPageNew />);

    // Wait for items to appear
    await waitFor(() => {
      expect(screen.getByAltText("Tops")).toBeInTheDocument();
      expect(screen.getByAltText("Shoes")).toBeInTheDocument();
    });

    // Check if the correct images are displayed
    expect(screen.getByAltText("Tops").src).toContain("top.jpg");
    expect(screen.getByAltText("Shoes").src).toContain("shoes.jpg");
  });
});
