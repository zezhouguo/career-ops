import test from "node:test";
import assert from "node:assert/strict";
import { parseReportNumber } from "./src/lib/report-number.mjs";

test("extracts the report id from the markdown target", () => {
  assert.equal(
    parseReportNumber("[182](../reports/180-voya-energy-2026-07-16.md)"),
    "180",
  );
});

test("supports legacy report-cell formats", () => {
  assert.equal(parseReportNumber("reports/007-acme.md"), "7");
  assert.equal(parseReportNumber("[009]"), "9");
  assert.equal(parseReportNumber("#010"), "10");
});

test("returns null when no report id is present", () => {
  assert.equal(parseReportNumber(""), null);
  assert.equal(parseReportNumber("❌"), null);
});
