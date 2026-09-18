import parse, { domToReact, Element, type DOMNode, type HTMLReactParserOptions } from "html-react-parser";

// The API sends HTML strings: only a small set of text tags is rendered, anything else is unwrapped
const options: HTMLReactParserOptions = {
  replace(node) {
    if (!(node instanceof Element)) return;
    const children = domToReact(node.children as DOMNode[], options);

    switch (node.name) {
      case "p":
        return <p>{children}</p>;
      case "strong":
      case "b":
        return <strong className="font-semibold text-ink">{children}</strong>;
      case "em":
      case "i":
        return <em>{children}</em>;
      case "br":
        return <br />;
      default:
        return <>{children}</>;
    }
  },
};

export function PaintingDescription({ html }: { html: string }) {
  return (
    <div className="space-y-6 text-lead text-ink/80 [&>p:first-child]:type-statement [&>p:first-child]:text-h3 [&>p:first-child]:text-ink">
      {parse(html, options)}
    </div>
  );
}
