import { Fragment } from "react";
import { highlightMatches } from "@/lib/paintings";

// Marks the parts of a text matched by the search, so each result shows why it is listed
export function Highlight({ text, query }: { text: string; query?: string }) {
  if (!query) return text;

  return highlightMatches(text, query).map((part, index) =>
    part.isMatch ? (
      <mark key={index} className="rounded-xs bg-highlight text-inherit box-decoration-clone">
        {part.text}
      </mark>
    ) : (
      <Fragment key={index}>{part.text}</Fragment>
    ),
  );
}
