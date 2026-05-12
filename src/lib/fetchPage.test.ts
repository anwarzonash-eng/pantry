import { describe, expect, it } from "vitest";
import { checkUrl, FetchError, fetchPage } from "./fetchPage";

describe("checkUrl", () => {
  it("accepts public http(s) links", () => {
    expect(checkUrl(" https://example.com/r/1 ").hostname).toBe("example.com");
  });
  it("rejects other schemes and private hosts", () => {
    for (const bad of ["file:///etc/passwd", "ftp://example.com", "http://localhost:3000", "http://192.168.1.10/", "http://10.0.0.1", "http://172.20.0.5", "http://[::1]/", "nonsense"]) {
      expect(() => checkUrl(bad), bad).toThrow(FetchError);
    }
  });
});

describe("fetchPage", () => {
  it("returns the body and reports HTTP errors", async () => {
    const ok = (async () => new Response("<html>hi</html>")) as typeof fetch;
    expect(await fetchPage("https://example.com", ok)).toBe("<html>hi</html>");
    const missing = (async () => new Response("", { status: 404 })) as typeof fetch;
    await expect(fetchPage("https://example.com", missing)).rejects.toThrow(/HTTP 404/);
  });
});
