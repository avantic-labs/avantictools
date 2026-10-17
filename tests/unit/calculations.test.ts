import { describe, expect, it } from "vitest";
import {
  calculatePercentage,
  calendarDifference,
  daysBetween,
  parseDate,
} from "../../lib/utilities/calculations";

describe("percentage jobs", () => {
  it("calculates all five jobs, including discount savings", () => {
    expect(calculatePercentage("of", 15, 200).result).toBe(30);
    expect(calculatePercentage("ratio", 30, 200).result).toBe(15);
    expect(calculatePercentage("increase", 15, 200).result).toBe(230);
    expect(calculatePercentage("decrease", 15, 200).result).toBe(170);
    expect(calculatePercentage("discount", 15, 200)).toEqual({
      result: 170,
      saved: 30,
    });
    expect(calculatePercentage("of", 0, 0).result).toBe(0);
  });
  it("rejects zero divisors, invalid discounts, non-finite and extreme inputs", () => {
    expect(() => calculatePercentage("ratio", 1, 0)).toThrow();
    expect(() => calculatePercentage("discount", 101, 100)).toThrow();
    expect(() => calculatePercentage("of", NaN, 100)).toThrow();
    expect(() => calculatePercentage("of", 1e13, 100)).toThrow();
  });
});

describe("calendar arithmetic", () => {
  it("counts days across leap years, year boundaries and DST transitions", () => {
    expect(daysBetween("2024-02-28", "2024-03-01")).toBe(2);
    expect(daysBetween("2023-12-31", "2024-01-01")).toBe(1);
    expect(daysBetween("2024-03-09", "2024-03-11")).toBe(2);
    expect(daysBetween("2024-01-02", "2024-01-01")).toBe(-1);
  });
  it("uses clamped month anniversaries and handles same-day ages", () => {
    expect(calendarDifference("2020-02-29", "2021-02-28")).toEqual({
      years: 1,
      months: 0,
      days: 0,
      totalDays: 365,
    });
    expect(calendarDifference("2024-01-31", "2024-02-29")).toEqual({
      years: 0,
      months: 1,
      days: 0,
      totalDays: 29,
    });
    expect(calendarDifference("2024-01-31", "2024-03-30")).toEqual({
      years: 0,
      months: 1,
      days: 30,
      totalDays: 59,
    });
    expect(calendarDifference("2024-03-01", "2024-03-01")).toEqual({
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
    });
  });
  it("rejects invalid dates, ambiguous formats and reversed age ranges", () => {
    for (const value of [
      "2023-02-29",
      "2024-13-01",
      "01/02/2024",
      "",
      "0001-01-01",
    ])
      expect(() => parseDate(value)).toThrow();
    expect(() => calendarDifference("2025-01-01", "2024-01-01")).toThrow();
  });
});
