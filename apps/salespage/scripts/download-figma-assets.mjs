/* One-shot helper: downloads the Figma-exported images for the new homepage
 * into public/images/home. Figma MCP asset URLs expire ~7 days after export,
 * so re-run `get_design_context` for fresh URLs if these 404. */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '../public/images/home');

const ASSETS = {
  'hero-illustration.png': 'c90b2c3d-e57c-4e19-9d80-79dfd738ec7b',
  'persona-business.png': 'ca293c03-b89a-4c15-8c5b-a6798ace9576',
  'persona-translator.png': '06073b08-4225-46cd-8c36-57f087c2ec1e',
  'business-screenshot.png': '7e452b63-4f12-4ebf-97e5-6b99ad9e20a2',
  'translator-logos.png': 'be084ada-e371-4e6f-a17a-8bbf7dfff372',
  'how-it-works.png': '4d37aa35-405a-427c-91a5-33de95edbc18',
};

await mkdir(outDir, { recursive: true });
for (const [name, id] of Object.entries(ASSETS)) {
  const res = await fetch(`https://www.figma.com/api/mcp/asset/${id}`);
  if (!res.ok) {
    console.error(`FAILED ${name}: ${res.status}`);
    continue;
  }
  await writeFile(join(outDir, name), Buffer.from(await res.arrayBuffer()));
  console.log(`ok ${name}`);
}
