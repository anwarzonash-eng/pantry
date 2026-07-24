import path from "node:path";
import { describe, expect, it } from "vitest";
import { dataDir } from "./db";

describe("dataDir", () => {
  it("defaults to ./data and honours DATA_DIR", () => {
    expect(dataDir({})).toBe(path.join(process.cwd(), "data"));
    expect(dataDir({ DATA_DIR: "/srv/pantry" })).toBe(path.resolve("/srv/pantry"));
  });
});
