import type { Logger } from '@nestjs/common'
import PizZip from 'pizzip'

// Symbol fonts whose code points are NOT mapped to standard text glyphs. Rewriting these
// to a text font produces visual garbage (e.g. bullet characters become clapperboards).
const SYMBOL_FONTS = new Set([
  'wingdings',
  'wingdings 2',
  'wingdings 3',
  'symbol',
  'webdings',
  'ms outlook',
  'mt extra',
  'monotype sorts',
  'zapf dingbats',
  'bookshelf symbol 7',
  'marlett',
])

// Files we never touch — they describe how special glyphs should be rendered, and the
// font name there is load-bearing.
const SKIP_PATHS = new Set([
  'word/numbering.xml',
  'word/footnotes.xml',
  'word/endnotes.xml',
])

const isSymbolFont = (name: string | undefined | null): boolean => {
  if (!name) return false
  return SYMBOL_FONTS.has(name.trim().toLowerCase())
}

/**
 * Rewrite every TEXT font reference in a DOCX to `font`, leaving symbol/dingbat fonts
 * (Wingdings/Symbol/Webdings/etc.) and `<w:sym>` elements untouched.
 */
export function forceDocxFontImpl(
  docx: Buffer,
  font: string,
  logger?: Logger,
): Buffer {
  try {
    const zip = new PizZip(docx)
    for (const path of Object.keys(zip.files)) {
      if (!path.startsWith('word/') || !path.endsWith('.xml')) continue
      if (SKIP_PATHS.has(path)) continue

      const file = zip.file(path)
      if (!file) continue
      let xml = file.asText()

      // `<w:rFonts w:ascii="..." w:hAnsi="..." w:cs="..." w:eastAsia="..." />`
      // Replace each font attribute individually, preserving symbol-font references.
      xml = xml.replace(
        /(w:(?:ascii|hAnsi|cs|eastAsia|asciiTheme|hAnsiTheme|cstheme|eastAsiaTheme))\s*=\s*"([^"]*)"/g,
        (_m, attr: string, value: string) =>
          isSymbolFont(value) ? `${attr}="${value}"` : `${attr}="${font}"`,
      )

      // OOXML theme typefaces — only swap the `latin` major/minor; leave symbol slots alone.
      xml = xml.replace(
        /<a:(latin|ea|cs|font)([^/>]*?)\stypeface\s*=\s*"([^"]*)"/g,
        (_m, tag: string, head: string, value: string) =>
          isSymbolFont(value)
            ? `<a:${tag}${head} typeface="${value}"`
            : `<a:${tag}${head} typeface="${font}"`,
      )

      // <w:font w:name="X"> declarations in fontTable.xml. Rename only text fonts so
      // Wingdings/Symbol/etc. stay registered with their original names — `<w:sym>` and
      // numbering bullets reference them by name.
      xml = xml.replace(
        /<w:font\s+w:name\s*=\s*"([^"]*)"/g,
        (m: string, value: string) =>
          isSymbolFont(value) ? m : `<w:font w:name="${font}"`,
      )

      zip.file(path, xml)
    }
    return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' })
  } catch (err) {
    logger?.warn(
      `forceDocxFont failed (${err instanceof Error ? err.message : 'unknown'}); using original DOCX`,
    )
    return docx
  }
}
