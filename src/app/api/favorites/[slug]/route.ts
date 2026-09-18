import { isFavorite } from "@/lib/favorites";
import { getSession } from "@/lib/session";

// Read from the browser so the painting pages stay static: asking on the server would render them per request
export async function GET(_request: Request, { params }: RouteContext<"/api/favorites/[slug]">) {
  const session = await getSession();
  if (!session) return Response.json({ isFavorite: false }, { status: 401 });

  const { slug } = await params;
  return Response.json({ isFavorite: await isFavorite(session.user.id, slug) });
}
