import { describe, expect, it } from "vitest";
import { withDraftFilter } from "./draft-filter";

const query = (href: string) => withDraftFilter(new URL(href))?.searchParams.get("q") ?? null;

describe("withDraftFilter", () => {
  it("adds the default repository query when q is missing", () => {
    expect(query("https://github.com/owner/repo/pulls")).toBe("is:pr is:open draft:false");
  });

  it("adds draft:false to a repository query", () => {
    expect(query("https://github.com/owner/repo/pulls?q=is%3Apr+is%3Aclosed")).toBe(
      "is:pr is:closed draft:false",
    );
  });

  it.each(["draft:true", "draft:false", "-draft:true", "DRAFT:true"])(
    "does not change a query with %s",
    (qualifier) => {
      const q = encodeURIComponent(`is:pr ${qualifier}`);
      expect(query(`https://github.com/owner/repo/pulls?q=${q}`)).toBeNull();
    },
  );

  it("does not match draft: inside another word", () => {
    expect(query("https://github.com/owner/repo/pulls?q=label%3Anodraft%3Ax")).toBe(
      "label:nodraft:x draft:false",
    );
  });

  it("changes global pulls only when q is present", () => {
    expect(query("https://github.com/pulls")).toBeNull();
    expect(query("https://github.com/pulls/review-requested?q=is%3Aopen")).toBe(
      "is:open draft:false",
    );
  });

  it("changes search only for pull requests", () => {
    expect(query("https://github.com/search?q=foo&type=pullrequests")).toBe("foo draft:false");
    expect(query("https://github.com/search?q=foo&type=issues")).toBeNull();
  });

  it("does not change other pages", () => {
    expect(query("https://github.com/owner/repo/issues?q=is%3Aopen")).toBeNull();
    expect(query("https://github.com/owner/repo/pull/1")).toBeNull();
  });
});
