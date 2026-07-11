import { describe, expect, it } from "vitest";
import { parseQuery, expandBranches } from "./parser";

describe("parseQuery", () => {
  it("detects a bare category", () => {
    const p = parseQuery("electrician");
    expect(p.intentType).toBe("CATEGORY_ONLY");
    expect(p.detectedCategories[0].name).toBe("Electrician");
  });

  it("detects category + area without connector", () => {
    const p = parseQuery("electrician Gotri");
    expect(p.intentType).toBe("CATEGORY_AREA");
    expect(p.detectedCategories[0].name).toBe("Electrician");
    expect(p.detectedAreas[0].canonicalName).toBe("Gotri");
  });

  it("detects category + area with connector 'in'", () => {
    const p = parseQuery("electrician in Gotri");
    expect(p.intentType).toBe("CATEGORY_AREA");
    expect(p.detectedAreas[0].canonicalName).toBe("Gotri");
    expect(p.unmatchedTerms).not.toContain("in");
  });

  it("resolves alias 'fan repair' to electrician near Akota", () => {
    const p = parseQuery("fan repair near Akota");
    expect(p.detectedCategories[0].name).toBe("Electrician");
    expect(p.detectedAreas[0].canonicalName).toBe("Akota");
  });

  it("treats an unknown name as a provider name", () => {
    const p = parseQuery("Shree Electrical");
    // "electrical" is an electrician alias; "shree" is a name term.
    expect(p.detectedNameTerms).toContain("shree");
  });

  it("detects a phone number exactly", () => {
    const p = parseQuery("9876543210");
    expect(p.intentType).toBe("PHONE_EXACT");
    expect(p.detectedPhone).toBe("+919876543210");
  });

  it("normalizes a phone with +91 and spaces", () => {
    const p = parseQuery("+91 98765 43210");
    expect(p.intentType).toBe("PHONE_EXACT");
    expect(p.detectedPhone).toBe("+919876543210");
  });

  it("branches on multiple categories", () => {
    const p = parseQuery("plumber and electrician in Manjalpur");
    expect(p.intentType).toBe("MULTIPLE_CATEGORIES");
    expect(p.requiresBranchSelection).toBe(true);
    const branches = expandBranches(p);
    expect(branches).toHaveLength(2);
    expect(branches.map((b) => b.label)).toContain("Plumber in Manjalpur");
    expect(branches.map((b) => b.label)).toContain("Electrician in Manjalpur");
  });

  it("branches on multiple areas", () => {
    const p = parseQuery("tiffin Alkapuri or Gotri");
    expect(p.intentType).toBe("MULTIPLE_AREAS");
    const branches = expandBranches(p);
    expect(branches.map((b) => b.label)).toContain("Tiffin in Alkapuri");
    expect(branches.map((b) => b.label)).toContain("Tiffin in Gotri");
  });

  it("tolerates a misspelling", () => {
    const p = parseQuery("electrican in gotri");
    expect(p.detectedCategories[0]?.name).toBe("Electrician");
  });

  it("resolves an area alias spelling variant", () => {
    const p = parseQuery("tailor in kareli baug");
    expect(p.detectedCategories[0].name).toBe("Tailor");
    expect(p.detectedAreas[0].canonicalName).toBe("Karelibaug");
  });

  it("handles Hinglish alias 'ghar ka khana'", () => {
    const p = parseQuery("ghar ka khana in alkapuri");
    expect(p.detectedCategories.some((c) => ["Tiffin", "Home food"].includes(c.name))).toBe(true);
  });
});
