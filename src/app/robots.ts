import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

// Pages behind a session, or reachable only after an order: nothing to index, and crawling them wastes budget
const PRIVATE_PATHS = ["/compte", "/connexion", "/inscription", "/billetterie/confirmation", "/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
