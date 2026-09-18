import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";

export default function NotFound() {
  return (
    <PageHero
      title="Cette salle n’existe pas."
      intro="La page que vous cherchez a peut-être été déplacée, ou n’a jamais été accrochée."
    >
      <Button href="/" className="mt-10">
        Retour à l’accueil
      </Button>
    </PageHero>
  );
}
