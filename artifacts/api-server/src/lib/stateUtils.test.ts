import { describe, expect, it } from "vitest";
import { getStateName, stateNameToCode } from "./stateUtils";

describe("stateUtils", () => {
  describe("getStateName", () => {
    it("returns full name for valid uppercase code", () => {
      expect(getStateName("MD")).toBe("Maryland");
    });

    it("returns full name for valid lowercase code", () => {
      expect(getStateName("md")).toBe("Maryland");
    });

    it("returns full name for mixed case code", () => {
      expect(getStateName("Ca")).toBe("California");
    });

    it("returns undefined for invalid code", () => {
      expect(getStateName("ZZ")).toBeUndefined();
    });

    it("returns District of Columbia for DC", () => {
      expect(getStateName("DC")).toBe("District of Columbia");
    });

    it("returns all 50 states plus DC", () => {
      const codes = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];
      for (const code of codes) {
        expect(getStateName(code)).toBeTruthy();
      }
    });
  });

  describe("stateNameToCode", () => {
    it("converts full name to uppercase code", () => {
      expect(stateNameToCode("Maryland")).toBe("MD");
    });

    it("is case-insensitive", () => {
      expect(stateNameToCode("maryland")).toBe("MD");
      expect(stateNameToCode("MARYLAND")).toBe("MD");
    });

    it("returns null for unknown name", () => {
      expect(stateNameToCode("Atlantis")).toBeNull();
    });

    it("round-trips for all states", () => {
      const codes = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];
      for (const code of codes) {
        const name = getStateName(code);
        expect(stateNameToCode(name!)).toBe(code);
      }
    });
  });
});
