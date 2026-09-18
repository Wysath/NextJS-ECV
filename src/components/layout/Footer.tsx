import { TransitionLink } from "@/components/animation/TransitionLink";
import { DrawnStrokes } from "@/components/animation/DrawnStrokes";
import { TextReveal } from "@/components/animation/TextReveal";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-ink text-paper">
      <DrawnStrokes placements={["top-left", "bottom-right"]} tone="dark" size="lg" trigger="scroll" />
      <div className="wrapper grid gap-12 py-section md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="type-statement max-w-md text-h3">
            Les chefs-d’œuvre de la peinture à explorer en ligne, cinq mille ans d’art à voir sur la Cinquième Avenue.
          </p>
          <Button href="/billetterie" variant="light" className="mt-8">
            Réserver un billet
          </Button>
        </div>

        <div className="md:col-span-2 md:col-start-6">
          <h2 className="eyebrow text-paper/60">Explorer</h2>
          <ul className="mt-5 space-y-2">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <TransitionLink href={item.href} className="link-underline">
                  {item.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h2 className="eyebrow text-paper/60">Visiter</h2>
          <address className="mt-5 not-italic">
            {siteConfig.address.street}
            <br />
            {siteConfig.address.city}
          </address>
          <ul className="mt-5 space-y-1 text-small text-paper/70">
            {siteConfig.hours.map((slot) => (
              <li key={slot.days}>
                {slot.days} : {slot.time}
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h2 className="eyebrow text-paper/60">Suivre</h2>
          <ul className="mt-5 space-y-2">
            {siteConfig.socials.map((social) => (
              <li key={social.href}>
                <a href={social.href} target="_blank" rel="noopener noreferrer" className="link-underline">
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <TextReveal className="wrapper overflow-hidden">
        <p
          aria-hidden
          className="wordmark text-wordmark select-none"
        >
          {siteConfig.name}
        </p>
      </TextReveal>

      <div className="wrapper">
        <div className="flex flex-col gap-2 border-t border-paper/15 py-6 text-small text-paper/60 md:flex-row md:justify-between">
          <p>
            © {new Date().getFullYear()} Projet étudiant non officiel, sans lien avec {siteConfig.fullName}.
          </p>
          <p>Œuvres issues de l’API Museum, images Wikimedia, Met Open Access et MoMA.</p>
        </div>
      </div>
    </footer>
  );
}
