import { InlineLoadingIndicator } from "@/components/common/InlineLoadingIndicator";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8">
      <div className="flex gap-8">
        <aside
          className="w-[280px] shrink-0 hidden md:block"
          aria-hidden="true"
        />
        <section className="flex-1 min-w-0" aria-label="Loading search results">
          <InlineLoadingIndicator label="Searching inventory..." />
        </section>
      </div>
    </div>
  );
}
