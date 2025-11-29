import fs from "fs";
import path from "path";
import { DocItem, folderToLabel } from "./config";

// Get navigation items by scanning the documents directory
// This function uses Node.js fs module and can only run on the server
export function getDocNavItems(): DocItem[] {
    const documentsDir = path.join(process.cwd(), "app/documents");
    const items: DocItem[] = [];

    // Add the main documents page (Getting Started)
    items.push({
        label: "Getting Started",
        href: "/documents",
        order: 0,
    });

    try {
        const entries = fs.readdirSync(documentsDir, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const subDir = path.join(documentsDir, entry.name);

                // Check if directory has a page file (page.tsx, page.mdx, page.md)
                const hasPage = fs.readdirSync(subDir).some(file =>
                    /^page\.(tsx|ts|jsx|js|mdx|md)$/.test(file)
                );

                if (hasPage) {
                    items.push({
                        label: folderToLabel(entry.name),
                        href: `/documents/${entry.name}`,
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error scanning documents directory:", error);
    }

    // Sort by order if specified, then alphabetically
    return items.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return a.label.localeCompare(b.label);
    });
}
