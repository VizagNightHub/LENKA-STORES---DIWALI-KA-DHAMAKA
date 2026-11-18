import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/lenka-ops-d27", "/checkout"],
    },
    sitemap: "https://lenka-stores-diwali-ka-dhamaka.vercel.app/sitemap.xml",
  };
}
