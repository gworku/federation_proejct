import { describe, expect, it } from "vitest";
import { canAccess } from "./roles";

describe("canAccess", () => {
  it("allows administrators everywhere", () => {
    expect(canAccess("administrator", "users")).toBe(true);
    expect(canAccess("administrator", "backups")).toBe(true);
  });

  it("restricts users module to administrators", () => {
    expect(canAccess("management", "users")).toBe(false);
    expect(canAccess("content_editor", "cms")).toBe(true);
  });

  it("allows auditors on audit module", () => {
    expect(canAccess("auditor", "audit")).toBe(true);
    expect(canAccess("utility_user", "audit")).toBe(false);
  });

  it("allows utility users to submit contributions through finance", () => {
    expect(canAccess("utility_user", "finance")).toBe(true);
    expect(canAccess("utility_user", "membership")).toBe(false);
  });
});
