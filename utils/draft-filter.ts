// Default query of the repository pull request list when the URL has no `q` param.
const REPO_PULLS_DEFAULT_QUERY = "is:pr is:open";

const DRAFT_QUALIFIER = /(^|\s)-?draft:/i;

export function hasDraftQualifier(query: string): boolean {
  return DRAFT_QUALIFIER.test(query);
}

function isRepoPullsPath(pathname: string): boolean {
  return /^\/[^/]+\/[^/]+\/pulls\/?$/.test(pathname);
}

function isGlobalPullsPath(pathname: string): boolean {
  return /^\/pulls(\/[^/]+)?\/?$/.test(pathname);
}

function isPullRequestSearch(url: URL): boolean {
  return (
    url.pathname === "/search" && url.searchParams.get("type")?.toLowerCase() === "pullrequests"
  );
}

/**
 * Returns the URL with `draft:false` added to the query, or null if the URL must not change.
 * The URL does not change if it is not a pull request list or if the query has a `draft:` qualifier.
 */
export function withDraftFilter(input: URL): URL | null {
  let query = input.searchParams.get("q");

  if (query === null) {
    // Only the repository list has a known default query. The global /pulls tabs each
    // have a different default, so do not change them without a `q` param.
    if (!isRepoPullsPath(input.pathname)) return null;
    query = REPO_PULLS_DEFAULT_QUERY;
  } else if (
    !isRepoPullsPath(input.pathname) &&
    !isGlobalPullsPath(input.pathname) &&
    !isPullRequestSearch(input)
  ) {
    return null;
  }

  if (hasDraftQualifier(query)) return null;

  const url = new URL(input);
  url.searchParams.set("q", `${query.trim()} draft:false`);
  return url;
}
