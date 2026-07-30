import { describe, expect, it } from "vitest";
import { stripLocale, withLocale, getLocaleFromPath } from "./locale-path";

describe("stripLocale", () => {
  it("removes locale prefix", () => {
    expect(stripLocale("/en/about")).toBe("/about");
    expect(stripLocale("/om")).toBe("/");
    expect(stripLocale("/am/news/slug")).toBe("/news/slug");
  });

  it("leaves unprefixed paths alone", () => {
    expect(stripLocale("/about")).toBe("/about");
    expect(stripLocale("/")).toBe("/");
  });
});

describe("withLocale", () => {
  it("prefixes public paths", () => {
    expect(withLocale("en", "/services")).toBe("/en/services");
    expect(withLocale("om", "/")).toBe("/om");
  });

  it("skips app and auth paths", () => {
    expect(withLocale("en", "/app/dashboard")).toBe("/app/dashboard");
    expect(withLocale("en", "/login")).toBe("/login");
  });
});

describe("getLocaleFromPath", () => {
  it("detects locale", () => {
    expect(getLocaleFromPath("/en/contact")).toBe("en");
    expect(getLocaleFromPath("/contact")).toBeNull();
  });
});
