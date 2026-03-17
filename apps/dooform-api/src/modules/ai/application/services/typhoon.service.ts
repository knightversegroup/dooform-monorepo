import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

export interface OcrResult {
  raw_text: string
  extracted_data: TyphoonExtractedData | null
  mapped_fields: Record<string, string> | null
  detection_score: number
  provider: string
}

export interface TyphoonExtractedData {
  document_type: string
  fields: Record<string, string>
  confidence: number
}

export interface FormFieldMapping {
  placeholder_name: string
  extracted_value: string
  confidence: number
  source_field: string
}

export interface AliasSuggestion {
  placeholder: string
  thai_alias: string
  thai_label: string
  aliases: string[]
  confidence: number
}

export interface AliasSuggestionResult {
  suggestions: AliasSuggestion[]
  model: string
  provider: string
}

export interface FieldTypeSuggestion {
  placeholder: string
  data_type: string
  input_type: string
  entity: string
  suggested_alias: string
  aliases: string[]
  confidence: number
  reasoning: string
}

export interface FieldTypeSuggestionResult {
  suggestions: FieldTypeSuggestion[]
  model: string
  provider: string
}

export interface DataTypeInfo {
  code: string
  name: string
  description: string
  pattern: string
}

export interface PlaceholderContext {
  placeholder: string
  context: string
}

@Injectable()
export class TyphoonService {
  private readonly logger = new Logger(TyphoonService.name)
  private readonly typhoonApiKey: string
  private readonly typhoonApiUrl: string

  constructor(private readonly configService: ConfigService) {
    this.typhoonApiKey = this.configService.get<string>('TYPHOON_API_KEY', '')
    this.typhoonApiUrl = this.configService.get<string>(
      'TYPHOON_API_URL',
      'https://api.opentyphoon.ai/v1',
    )
  }

  async extractTextFromImage(imageBase64: string): Promise<OcrResult> {
    if (!this.typhoonApiKey) {
      throw new Error('TYPHOON_API_KEY not configured')
    }

    return this.callTyphoonVisionWithPlaceholders(imageBase64, [])
  }

  async extractAndMapToForm(
    imageBase64: string,
    placeholders: string[],
  ): Promise<{ result: OcrResult; fieldMappings: Record<string, FormFieldMapping> }> {
    if (!this.typhoonApiKey) {
      throw new Error('TYPHOON_API_KEY not configured')
    }

    const result = await this.callTyphoonVisionWithPlaceholders(imageBase64, placeholders)

    const mappings: Record<string, FormFieldMapping> = {}
    if (result.mapped_fields) {
      for (const [placeholder, value] of Object.entries(result.mapped_fields)) {
        mappings[placeholder] = {
          placeholder_name: placeholder,
          extracted_value: value,
          confidence: 85,
          source_field: placeholder,
        }
      }
    }

    // Fallback to rule-based mapping
    if (Object.keys(mappings).length === 0 && result.extracted_data) {
      const fallbackMappings = this.mapToFormFields(result.extracted_data, placeholders)
      result.mapped_fields = {}
      for (const [k, v] of Object.entries(fallbackMappings)) {
        result.mapped_fields[k] = v.extracted_value
      }
      Object.assign(mappings, fallbackMappings)
    }

    return { result, fieldMappings: mappings }
  }

  async suggestAliasesFromPlaceholders(placeholders: string[]): Promise<AliasSuggestionResult> {
    if (!this.typhoonApiKey) {
      throw new Error('TYPHOON_API_KEY not configured')
    }

    return this.callTyphoonForAliases(placeholders)
  }

  async suggestAliasesFromHTML(htmlContent: string): Promise<AliasSuggestionResult> {
    const placeholders = this.extractPlaceholdersFromHTML(htmlContent)
    return this.suggestAliasesFromPlaceholders(placeholders)
  }

  async suggestFieldTypesFromPlaceholders(
    placeholders: string[],
  ): Promise<FieldTypeSuggestionResult> {
    if (!this.typhoonApiKey) {
      throw new Error('TYPHOON_API_KEY not configured')
    }

    return this.callTyphoonForFieldTypes(placeholders, null, null)
  }

  async suggestFieldTypes(
    placeholders: string[],
    contexts: PlaceholderContext[] | null,
  ): Promise<FieldTypeSuggestionResult> {
    return this.callTyphoonForFieldTypes(placeholders, contexts, null)
  }

  async suggestFieldTypesWithDataTypes(
    placeholders: string[],
    contexts: PlaceholderContext[] | null,
    dataTypes: DataTypeInfo[],
  ): Promise<FieldTypeSuggestionResult> {
    return this.callTyphoonForFieldTypes(placeholders, contexts, dataTypes)
  }

  // --- Private methods ---

  private async callTyphoonVisionWithPlaceholders(
    imageBase64: string,
    placeholders: string[],
  ): Promise<OcrResult> {
    const rawText = await this.extractTextWithTyphoonOCR(imageBase64)

    const result: OcrResult = {
      raw_text: rawText,
      extracted_data: null,
      mapped_fields: null,
      detection_score: 85,
      provider: 'typhoon',
    }

    if (placeholders.length > 0 && rawText) {
      try {
        const mappedFields = await this.mapTextToPlaceholders(rawText, placeholders)
        if (mappedFields && Object.keys(mappedFields).length > 0) {
          result.mapped_fields = mappedFields
          result.extracted_data = {
            document_type: 'document',
            fields: mappedFields,
            confidence: 85,
          }
        }
      } catch (err) {
        this.logger.warn(`Mapping failed: ${err}`)
      }
    }

    return result
  }

  private async extractTextWithTyphoonOCR(imageBase64: string): Promise<string> {
    const url = `${this.typhoonApiUrl}/chat/completions`

    const prompt = `Extract all text from the image.

Instructions:
- Only return the clean text content.
- Do not include any explanation or extra text.
- You must include all information on the page.
- Preserve the original layout and structure as much as possible.
- For tables, format them clearly with proper alignment.
- For checkboxes, use ☐ for unchecked and ☑ for checked boxes.`

    const payload = {
      model: 'typhoon-ocr',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
      max_tokens: 4096,
    }

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.typhoonApiKey}`,
      },
      timeout: 90000,
    })

    const content = response.data?.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('No content in OCR response')
    }

    return content
  }

  private async mapTextToPlaceholders(
    rawText: string,
    placeholders: string[],
  ): Promise<Record<string, string>> {
    const url = `${this.typhoonApiUrl}/chat/completions`

    const cleanPlaceholders = placeholders.map((p) =>
      p.replace(/\{\{/g, '').replace(/\}\}/g, ''),
    )

    const prompt = `You are an expert at extracting data from Thai documents.

I scanned a Thai document and got this OCR text:
---
${rawText}
---

I need to fill a form with these field names:
${cleanPlaceholders.join(', ')}

Your task:
1. Extract ALL relevant information from the OCR text
2. TRANSLATE ALL Thai text to English (romanization/transliteration)
3. Convert Thai name prefixes: นาย→Mr., นาง→Mrs., นางสาว→Miss, เด็กชาย→Master, เด็กหญิง→Miss
4. Convert Buddhist Era years to Gregorian: subtract 543 (e.g., 2567→2024)
5. Format dates as YYYY-MM-DD
6. Match extracted data to the most appropriate field names

Return ONLY a JSON object. Map field names to their values.
Example: {"first_name": "Somchai", "last_name": "Jaidee", "id_number": "1234567890123"}

Important:
- Use the EXACT field names from my list
- TRANSLATE everything to English
- Return valid JSON only, no explanation`

    const payload = {
      model: 'typhoon-v2.1-12b-instruct',
      messages: [
        {
          role: 'system',
          content:
            'You are a Thai document processing expert. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.1,
    }

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.typhoonApiKey}`,
      },
      timeout: 60000,
    })

    const content = response.data?.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('No content in mapping response')
    }

    const jsonContent = this.extractJSONFromContent(content)
    return JSON.parse(jsonContent)
  }

  private async callTyphoonForAliases(
    placeholders: string[],
  ): Promise<AliasSuggestionResult> {
    const url = `${this.typhoonApiUrl}/chat/completions`

    const prompt = `Given these form field placeholders, suggest Thai aliases and labels:
Placeholders: ${placeholders.join(', ')}

Return JSON array with objects containing:
- placeholder: original placeholder name
- thai_alias: short Thai name for data extraction
- thai_label: display label in Thai for form
- aliases: array of alternative names
- confidence: 0-100

Example:
[{"placeholder": "first_name", "thai_alias": "ชื่อ", "thai_label": "ชื่อจริง", "aliases": ["ชื่อ", "first name", "given name"], "confidence": 95}]`

    const payload = {
      model: 'typhoon-v2.1-12b-instruct',
      messages: [
        {
          role: 'system',
          content:
            'You are a Thai document processing expert. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.1,
    }

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.typhoonApiKey}`,
      },
      timeout: 90000,
    })

    const result: AliasSuggestionResult = {
      model: 'typhoon-v2.1-12b-instruct',
      provider: 'typhoon',
      suggestions: [],
    }

    const content = response.data?.choices?.[0]?.message?.content
    if (content) {
      try {
        const jsonContent = this.extractJSONFromContent(content)
        result.suggestions = JSON.parse(jsonContent)
      } catch {
        this.logger.warn('Failed to parse alias suggestions')
      }
    }

    return result
  }

  private async callTyphoonForFieldTypes(
    placeholders: string[],
    contexts: PlaceholderContext[] | null,
    dataTypes: DataTypeInfo[] | null,
  ): Promise<FieldTypeSuggestionResult> {
    const url = `${this.typhoonApiUrl}/chat/completions`

    let dataTypesStr = 'text, name, email, phone, address, date, number, select, checkbox'
    if (dataTypes && dataTypes.length > 0) {
      dataTypesStr = dataTypes.map((dt) => dt.code).join(', ')
    }

    const prompt = `Analyze these form placeholders and suggest appropriate field types:
Placeholders: ${placeholders.join(', ')}
Available data types: ${dataTypesStr}

Return JSON array:
[{
  "placeholder": "original name",
  "data_type": "one of available types",
  "input_type": "text/email/date/select/etc",
  "entity": "person/contact/address/financial/document/general",
  "suggested_alias": "Thai name for OCR matching",
  "aliases": ["alternative names for matching"],
  "confidence": 0-100,
  "reasoning": "brief explanation why this type was chosen"
}]`

    const payload = {
      model: 'typhoon-v2.1-12b-instruct',
      messages: [
        {
          role: 'system',
          content:
            'You are a form field classification expert. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 3000,
      temperature: 0.1,
    }

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.typhoonApiKey}`,
      },
      timeout: 90000,
    })

    const result: FieldTypeSuggestionResult = {
      model: 'typhoon-v2.1-12b-instruct',
      provider: 'typhoon',
      suggestions: [],
    }

    const content = response.data?.choices?.[0]?.message?.content
    if (content) {
      try {
        const jsonContent = this.extractJSONFromContent(content)
        result.suggestions = JSON.parse(jsonContent)
      } catch {
        this.logger.warn('Failed to parse field type suggestions')
      }
    }

    return result
  }

  // --- Utility methods ---

  extractPlaceholdersFromHTML(html: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g
    const seen = new Set<string>()
    const placeholders: string[] = []
    let match: RegExpExecArray | null

    while ((match = regex.exec(html)) !== null) {
      if (match[1] && !seen.has(match[1])) {
        placeholders.push(match[1])
        seen.add(match[1])
      }
    }

    return placeholders
  }

  extractPlaceholdersWithContext(html: string, contextLen: number): PlaceholderContext[] {
    const regex = /\{\{([^}]+)\}\}/g
    const results: PlaceholderContext[] = []
    let match: RegExpExecArray | null

    while ((match = regex.exec(html)) !== null) {
      const placeholder = match[1]
      const start = Math.max(0, match.index - contextLen)
      const end = Math.min(html.length, match.index + match[0].length + contextLen)
      const context = html.substring(start, end)

      results.push({ placeholder, context })
    }

    return results
  }

  stripDataUrlPrefix(image: string): string {
    if (image.startsWith('data:image')) {
      const parts = image.split(',')
      if (parts.length === 2) {
        return parts[1]
      }
    }
    return image
  }

  private extractJSONFromContent(content: string): string {
    // Pattern 1: ```json ... ```
    const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)```/)
    if (jsonBlockMatch) {
      return jsonBlockMatch[1].trim()
    }

    // Pattern 2: ``` ... ``` with JSON content
    const codeBlockMatch = content.match(/```\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      const extracted = codeBlockMatch[1].trim()
      if (extracted.startsWith('[') || extracted.startsWith('{')) {
        return extracted
      }
    }

    // Pattern 3: Find raw JSON array
    const arrayStart = content.indexOf('[')
    if (arrayStart !== -1) {
      let depth = 0
      for (let i = arrayStart; i < content.length; i++) {
        if (content[i] === '[') depth++
        else if (content[i] === ']') {
          depth--
          if (depth === 0) {
            return content.substring(arrayStart, i + 1)
          }
        }
      }
    }

    // Pattern 4: Find raw JSON object
    const objectStart = content.indexOf('{')
    if (objectStart !== -1) {
      let depth = 0
      for (let i = objectStart; i < content.length; i++) {
        if (content[i] === '{') depth++
        else if (content[i] === '}') {
          depth--
          if (depth === 0) {
            return content.substring(objectStart, i + 1)
          }
        }
      }
    }

    return content
  }

  private mapToFormFields(
    data: TyphoonExtractedData,
    placeholders: string[],
  ): Record<string, FormFieldMapping> {
    const result: Record<string, FormFieldMapping> = {}

    if (!data?.fields) return result

    for (const placeholder of placeholders) {
      const lowerPlaceholder = placeholder.toLowerCase()
      for (const [key, value] of Object.entries(data.fields)) {
        if (
          key.toLowerCase().includes(lowerPlaceholder) ||
          lowerPlaceholder.includes(key.toLowerCase())
        ) {
          result[placeholder] = {
            placeholder_name: placeholder,
            extracted_value: value,
            confidence: 80,
            source_field: key,
          }
          break
        }
      }
    }

    return result
  }
}
