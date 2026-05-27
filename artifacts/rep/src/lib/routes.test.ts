import { describe, expect, it } from "vitest";
import { federalRepPath, stateRepPath, federalBillPath, stateBillPath, billFromParam } from "./routes";

describe("route path builders", () => {
  describe("federalRepPath", () => {
    it("builds path with bioguide ID", () => {
      expect(federalRepPath("A000360")).toBe("/rep/federal/A000360");
    });
  });

  describe("stateRepPath", () => {
    it("builds path with URL-encoded member ID", () => {
      const result = stateRepPath("ocd-person/abc-123");
      expect(result).toBe("/rep/state/ocd-person%2Fabc-123");
    });
  });

  describe("federalBillPath", () => {
    it("builds path with congress, type, and number", () => {
      expect(federalBillPath(119, "hr", "1234")).toBe("/bills/federal/119/hr/1234");
    });

    it("lowercases the bill type", () => {
      expect(federalBillPath(119, "HR", "1234")).toBe("/bills/federal/119/hr/1234");
    });
  });

  describe("stateBillPath", () => {
    it("builds path with URL-encoded bill ID", () => {
      const result = stateBillPath("ocd-bill/abc-123");
      expect(result).toBe("/bills/state/ocd-bill%2Fabc-123");
    });
  });

  describe("billFromParam", () => {
    it("builds from query string with encoded values", () => {
      const result = billFromParam("/bills/federal?chamber=both", "Federal Bills");
      expect(result).toContain("from=");
      expect(result).toContain("name=");
      expect(result).toContain("Federal%20Bills");
    });
  });
});
