import Image from "next/image";
import type { ReactNode } from "react";
import { DrawnStrokes } from "@/components/animation/DrawnStrokes";
import { ImageReveal } from "@/components/animation/ImageReveal";
import { authArtwork } from "@/data/featured-artworks";

// Shared by sign in and sign up, so switching between them keeps the painting in place and only swaps the form
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <section className="grid md:grid-cols-12">
      <div className="relative isolate flex flex-col justify-center overflow-hidden px-gutter pt-12 pb-section md:col-span-7 md:px-12 md:py-20 lg:col-span-6 lg:px-20">
        <DrawnStrokes placements={["top-right"]} />
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Decorative on small screens, where it would push the form below the fold */}
      <figure className="relative hidden overflow-hidden bg-paper-deep md:col-span-5 md:block md:min-h-[calc(100svh-var(--spacing-header))] lg:col-span-6">
        <ImageReveal trigger="load" parallax={6} className="absolute inset-0" innerClassName="relative size-full">
          <Image
            src={authArtwork.src}
            alt={`${authArtwork.title}, ${authArtwork.artist}, ${authArtwork.date}`}
            fill
            sizes="(min-width: 1024px) 50vw, 42vw"
            loading="eager"
            className="scale-110 object-cover"
          />
        </ImageReveal>
        <figcaption className="absolute bottom-4 left-4 bg-ink/70 px-3 py-1.5 text-small text-paper">
          {authArtwork.artist}, <em>{authArtwork.title}</em>, {authArtwork.date}
        </figcaption>
      </figure>
    </section>
  );
}
