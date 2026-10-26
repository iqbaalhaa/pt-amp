import { test } from "node:test";
import assert from "node:assert/strict";
import { formatPostDate } from "./format-date";

test("formats ISO post date like /blog", () => {
  assert.equal(formatPostDate("2026-10-26T12:00:00.000Z"), "26 Oktober 2026");
  assert.equal(formatPostDate("2026-10-26T12:00:00.000Z", "en"), "26 October 2026");
});
