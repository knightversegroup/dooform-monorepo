import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

export interface AliasSuggestion {
  placeholder: string
  label_th: string
  label_en: string
  confidence: number
}

export interface AliasSuggestionResult {
  suggestions: AliasSuggestion[]
  model: string
  provider: string
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

  async suggestAliasesFromPlaceholders(
    placeholders: string[],
    documentName?: string,
  ): Promise<AliasSuggestionResult> {
    if (!this.typhoonApiKey) {
      throw new Error('TYPHOON_API_KEY not configured')
    }

    return this.callTyphoonForAliases(placeholders, documentName)
  }

  async suggestAliasesFromHTML(htmlContent: string): Promise<AliasSuggestionResult> {
    const placeholders = this.extractPlaceholdersFromHTML(htmlContent)
    return this.suggestAliasesFromPlaceholders(placeholders)
  }

  private async callTyphoonForAliases(
    placeholders: string[],
    documentName?: string,
  ): Promise<AliasSuggestionResult> {
    const url = `${this.typhoonApiUrl}/chat/completions`

    // Reference vocabulary for common field types
    const vocab = `name=ชื่อ,last_name=นามสกุล,full_name=ชื่อ-นามสกุล,prefix=คำนำหน้า,age=อายุ,dob=วันเกิด,date=วันที่,address=ที่อยู่,province=จังหวัด,district=อำเภอ,subdistrict=ตำบล,road=ถนน,village=หมู่,house_num=บ้านเลขที่,postal_code=รหัสไปรษณีย์,phone=โทรศัพท์,id_number=เลขบัตรประชาชน,position=ตำแหน่ง,organization=หน่วยงาน,signature=ลายเซ็น,witness=พยาน,officer=เจ้าหน้าที่,applicant=ผู้ยื่นคำขอ,registrar=นายทะเบียน,nationality=สัญชาติ,religion=ศาสนา,occupation=อาชีพ,sex=เพศ,relationship=ความสัมพันธ์,father=บิดา,mother=มารดา,child=บุตร,spouse=คู่สมรส`

    const docContext = documentName ? `Document: "${documentName}"` : ''

    const prompt = `Parse form placeholders and generate descriptive labels.

${docContext}
Placeholders: ${placeholders.join(', ')}

Vocabulary: ${vocab}

Instructions:
1. Parse each placeholder to understand its meaning (e.g., officer1_name = first officer's name)
2. Handle numbered suffixes: officer1, witness2 = คนที่ 1, คนที่ 2
3. Handle role prefixes: child_, mother_, father_, applicant_, witness_, officer_
4. Generate clear descriptive labels in both Thai and English
5. Use document context to understand field purpose

Examples:
- officer1_name → {"label_th": "ชื่อเจ้าหน้าที่คนที่ 1", "label_en": "First Officer Name"}
- witness2_address → {"label_th": "ที่อยู่พยานคนที่ 2", "label_en": "Second Witness Address"}
- child_dob → {"label_th": "วันเกิดบุตร", "label_en": "Child's Date of Birth"}
- applicant_phone → {"label_th": "เบอร์โทรผู้ยื่นคำขอ", "label_en": "Applicant Phone Number"}

Output JSON array only:
[{"placeholder":"x","label_th":"ไทย","label_en":"English","confidence":90}]`

    const payload = {
      model: 'typhoon-v2.5-30b-a3b-instruct',
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

    let response
    try {
      response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.typhoonApiKey}`,
        },
        timeout: 90000,
      })
    } catch (err: any) {
      this.logger.error(`Typhoon API error: ${err.message}`)
      if (err.response) {
        this.logger.error(`Typhoon response status: ${err.response.status}`)
        this.logger.error(`Typhoon response data: ${JSON.stringify(err.response.data)}`)
      }
      throw err
    }

    const result: AliasSuggestionResult = {
      model: 'typhoon-v2.5-30b-a3b-instruct',
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

  private extractPlaceholdersFromHTML(html: string): string[] {
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
}
