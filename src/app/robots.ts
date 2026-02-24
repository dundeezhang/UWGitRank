import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://uwgitrank.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/debug-auth/", "/verify/success/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
