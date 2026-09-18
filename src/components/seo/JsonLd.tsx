// Structured data must reach crawlers as raw JSON in the HTML, which React only allows through this escape hatch.
// The content comes from our own data, never from user input.
export function JsonLd({ schema }: { schema: object }) {
  return (
    <script
      type="application/ld+json"
      // Closing tags inside a string would end the script element early
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
    />
  );
}
