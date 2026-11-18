import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://lenka-stores-diwali-ka-dhamaka.vercel.app";
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/diwali-ka-dhamaka`, lastModified: new Date() },
    { url: `${base}/fashion-wear`, lastModified: new Date() },
    { url: `${base}/electronics`, lastModified: new Date() },
    { url: `${base}/new-launch`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/contact`, lastModified: new Date() },
  ];
}
