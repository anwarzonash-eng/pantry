const MAX_BYTES = 3_000_000;

export class FetchError extends Error {}

/** Only plain public http(s) URLs; no file:, no localhost or private networks. */
export function checkUrl(text: string): URL {
  let url: URL;
  try {
    url = new URL(text.trim());
  } catch {
    throw new FetchError("That is not a valid link.");
  }
  if (!["http:", "https:"].includes(url.protocol)) throw new FetchError("Only http and https links can be imported.");
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host.startsWith("[")
  ) {
    throw new FetchError("Links to local or private addresses are not allowed.");
  }
  return url;
}

/** Download a page as text, with a timeout and a size limit. */
export async function fetchPage(text: string, fetchImpl: typeof fetch = fetch): Promise<string> {
  const url = checkUrl(text);
  let res: Response;
  try {
    res = await fetchImpl(url, {
      headers: { "user-agent": "pantry-recipe-import", accept: "text/html" },
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
    });
  } catch {
    throw new FetchError("Could not load that page.");
  }
  if (!res.ok) throw new FetchError(`The site answered with HTTP ${res.status}.`);
  const body = await res.text();
  if (body.length > MAX_BYTES) throw new FetchError("That page is too large.");
  return body;
}
