import { MetadataRoute } from "next";

import { API_BASE_URL } from "@/lib/api/types";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dooform.com";

// Template type for sitemap (minimal fields needed)
interface SitemapTemplate {
  id: string;
  updated_at?: string;
  created_at?: string;
}

interface DocumentType {
  id: string;
  templates?: SitemapTemplate[];
}

interface GroupedResponse {
  document_types?: DocumentType[];
  orphan_templates?: SitemapTemplate[];
}

// Fetch all templates from API for sitemap
async function getTemplatesForSitemap(): Promise<{ templates: SitemapTemplate[], documentTypes: DocumentType[] }> {
  try {
    const res = await fetch(`${API_BASE_URL}/templates?grouped=true`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) {
      console.error("Sitemap: Failed to fetch templates, status:", res.status);
      return { templates: [], documentTypes: [] };
    }
    const data: GroupedResponse = await res.json();

    // Extract templates from document_types and orphan_templates
    const templatesFromDocTypes = (data.document_types || []).flatMap(
      (dt) => dt.templates || []
    );
    const orphanTemplates = data.orphan_templates || [];

    return {
      templates: [...templatesFromDocTypes, ...orphanTemplates],
      documentTypes: data.document_types || [],
    };
  } catch (error) {
    console.error("Failed to fetch templates for sitemap:", error);
    return { templates: [], documentTypes: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  // Static public pages with high priority
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/documents`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/forms`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // Public auth pages (indexable)
    {
      url: `${baseUrl}/register`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Dynamic form/template pages from API
  const { templates, documentTypes } = await getTemplatesForSitemap();

  // Document type (template group) pages
  const templateGroupsSitemap: MetadataRoute.Sitemap = documentTypes.map((docType) => ({
    url: `${baseUrl}/templates/${docType.id}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // Individual form pages
  const formsSitemap: MetadataRoute.Sitemap = templates.map((template) => ({
    url: `${baseUrl}/forms/${template.id}`,
    lastModified: template.updated_at || template.created_at || currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...templateGroupsSitemap, ...formsSitemap];
}
