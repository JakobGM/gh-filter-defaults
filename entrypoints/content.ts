import { withDraftFilter } from "@/utils/draft-filter";

export default defineContentScript({
  matches: ["https://github.com/*"],
  runAt: "document_start",
  main(ctx) {
    const apply = (url: URL) => {
      const next = withDraftFilter(url);
      if (next) location.replace(next);
    };

    apply(new URL(location.href));
    // GitHub navigates without a full page load, so also check the URL after each navigation.
    ctx.addEventListener(window, "wxt:locationchange", ({ newUrl }) => apply(newUrl));
  },
});
