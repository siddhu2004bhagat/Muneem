import {
  isIsoDate, round2, validateEntry,
  handleReturn, isHeuristicMode, GSTReportError
} from "../services/gst.service";

describe("GST Hardening", () => {
  test("ISO date validation", () => {
    expect(isIsoDate("2025-10-21")).toBe(true);
    expect(isIsoDate("21/10/2025")).toBe(false);
    expect(isIsoDate("2025-13-01")).toBe(false);
  });

  test("round2 precision", () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(2.004)).toBe(2);
  });

  test("validateEntry basics", () => {
    expect(validateEntry({ amount: 100, type: "sale", date: "2025-10-21" })).toBe(true);
    expect(validateEntry({ amount: "x", type: "sale", date: "2025-10-21" })).toBe(false);
  });

  test("handleReturn safeguards", () => {
    const r = handleReturn({ amount: -1180, gstRate: 18, type: "return" });
    expect(r?.gstAmount).toBeGreaterThan(0);
    expect(r?.taxable).toBeGreaterThan(0);
    expect(handleReturn({ amount: -1000, gstRate: 0, type: "return" })).toBeNull();
  });

  test("heuristic detection", () => {
    expect(isHeuristicMode([{ amount: 100 }, { amount: 200, gstRate: 18 }])).toBe(true);
    expect(isHeuristicMode([{ amount: 100, gstRate: 18 }, { amount: 200, gstAmount: 36 }])).toBe(false);
  });

  test("structured errors", () => {
    const err = new GSTReportError("x", "E_CALC");
    expect(err.recoverable).toBe(true);
    expect(err.retryable).toBe(false);
  });
});
