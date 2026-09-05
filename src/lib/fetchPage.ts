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

const MAX_REDIRECTS = 5;

/**
 * Download a page as text, with a timeout and a size limit. Redirects are
 * followed by hand so every hop is checked: with redirect: "follow" a public
 * page could send the server on to a private address.
 */
export async function fetchPage(text: string, fetchImpl: typeof fetch = fetch): Promise<string> {
  let url = checkUrl(text);
  let res: Response | undefined;
  for (let hop = 0; ; hop++) {
    try {
      res = await fetchImpl(url, {
        headers: { "user-agent": "pantry-recipe-import", accept: "text/html" },
        signal: AbortSignal.timeout(10_000),
        redirect: "manual",
      });
    } catch {
      throw new FetchError("Could not load that page.");
    }
    const location = res.headers.get("location");
    if (res.status < 300 || res.status >= 400 || !location) break;
    if (hop >= MAX_REDIRECTS) throw new FetchError("Too many redirects.");
    url = checkUrl(new URL(location, url).toString());
  }
  if (!res.ok) throw new FetchError(`The site answered with HTTP ${res.status}.`);
  const body = await res.text();
  if (body.length > MAX_BYTES) throw new FetchError("That page is too large.");
  return body;
}
