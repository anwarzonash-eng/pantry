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

describe("redirects", () => {
  const redirectTo = (location: string, then = "<html>ok</html>") => {
    let calls = 0;
    return (async () => (calls++ === 0 ? new Response(null, { status: 302, headers: { location } }) : new Response(then))) as typeof fetch;
  };

  it("follows public redirects, including relative ones", async () => {
    expect(await fetchPage("https://example.com/a", redirectTo("https://www.example.com/b"))).toBe("<html>ok</html>");
    expect(await fetchPage("https://example.com/a", redirectTo("/b"))).toBe("<html>ok</html>");
  });

  it("refuses a redirect to a private address", async () => {
    await expect(fetchPage("https://example.com/a", redirectTo("http://169.254.169.254/latest"))).rejects.toThrow(/private/);
    await expect(fetchPage("https://example.com/a", redirectTo("http://localhost:3000/api/backup"))).rejects.toThrow(/private/);
  });

  it("gives up after a few hops", async () => {
    const loop = (async () => new Response(null, { status: 301, headers: { location: "https://example.com/again" } })) as typeof fetch;
    await expect(fetchPage("https://example.com", loop)).rejects.toThrow(/Too many redirects/);
  });
});
