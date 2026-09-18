import type { Metadata } from "next";
import { AccountSection } from "@/components/account/AccountSection";
import { AccountTabs } from "@/components/account/AccountTabs";
import { DeleteAccountForm } from "@/components/account/DeleteAccountForm";
import { PasswordForm } from "@/components/account/PasswordForm";
import { ProfileForm } from "@/components/account/ProfileForm";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { FavoriteGallery } from "@/components/favorites/FavoriteGallery";
import { PageHero } from "@/components/ui/PageHero";
import { getFavoritePaintings } from "@/lib/favorite-paintings";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Mon compte",
  robots: { index: false },
};

const memberSince = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" });

export default async function AccountPage() {
  // Validated against the database on every request: a cookie alone can be forged or outlive its session
  const { user } = await requireSession("/compte");
  const favorites = await getFavoritePaintings(user.id);

  return (
    <>
      {/* The name stays out of the animated title: TextReveal splits its text once, and a later rename would change
          nodes React no longer owns */}
      <PageHero
        title="Mon compte"
        intro={`Bonjour ${user.name}, membre depuis le ${memberSince.format(user.createdAt)}.`}
      >
        <div className="mt-8">
          <SignOutButton />
        </div>
      </PageHero>

      <div className="wrapper pb-section">
        <AccountTabs
          tabs={[
            {
              id: "profil",
              label: "Profil",
              panel: (
                <>
                  <AccountSection title="Informations" description="Le nom et l’adresse e-mail de votre compte.">
                    <ProfileForm user={{ name: user.name, email: user.email }} />
                  </AccountSection>
                  <AccountSection
                    title="Mot de passe"
                    description="Saisissez d’abord votre mot de passe actuel."
                  >
                    <PasswordForm />
                  </AccountSection>
                  <AccountSection
                    title="Supprimer le compte"
                    description="Votre compte et vos favoris seront effacés. Cette action est irréversible."
                  >
                    <DeleteAccountForm />
                  </AccountSection>
                </>
              ),
            },
            {
              id: "galerie",
              label: `Galerie (${favorites.length})`,
              panel: <FavoriteGallery paintings={favorites} />,
            },
          ]}
        />
      </div>
    </>
  );
}
