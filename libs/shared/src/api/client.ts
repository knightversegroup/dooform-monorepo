// API Client for Placeholder-Model Backend
import { logger } from '../utils/logger';
import {
  API_BASE_URL,
  UploadResponse,
  TemplatesResponse,
  PlaceholdersResponse,
  ProcessResponse,
  ActivityLogsResponse,
  LogStatsResponse,
  ProcessLogsResponse,
  HistoryResponse,
  Template,
  TemplateUpdateData,
  FieldDefinition,
  FieldDefinitionsResponse,
  FieldRule,
  FieldRulesResponse,
  FieldRuleCreateRequest,
  DataTypeOption,
  InputTypeOption,
  EntityRule,
  EntityRulesResponse,
  EntityRuleCreateRequest,
  ConfigurableDataType,
  DataTypesResponse,
  DataTypeCreateRequest,
  ConfigurableInputType,
  InputTypesResponse,
  InputTypeCreateRequest,
  StatisticsResponse,
  StatsSummaryResponse,
  StatsTemplatesResponse,
  StatsTrendsResponse,
  StatsTimeSeriesResponse,
  TemplateStatistics,
  DocumentType,
  DocumentTypesResponse,
  DocumentTypeCreateRequest,
  DocumentTypeUpdateRequest,
  TemplateAssignment,
  GroupedTemplatesResponse,
  SuggestedGroup,
  SuggestionsResponse,
  FilterCategory,
  FilterOption,
  FilterCategoryCreateRequest,
  FilterCategoryUpdateRequest,
  FilterOptionCreateRequest,
  FilterOptionUpdateRequest,
  AliasSuggestionResponse,
  FieldTypeSuggestionResponse,
  WatermarkPreset,
  WatermarkPresetDTO,
  WatermarkPresetInput,
  WatermarkPresetResponse,
  WatermarkPresetsResponse,
  AnnotationResponse,
  FinalizeResponse,
  WatermarkConfig,
  type DictionaryCategory,
  type DictionaryWord,
  type DictionaryCategoryCreateRequest,
  type DictionaryCategoryUpdateRequest,
  type DictionaryWordCreateRequest,
  type DictionaryWordUpdateRequest,
  type DictionaryWordsResponse,
} from './types';
import type {
  SalespageDict,
  SalespageLocale,
  SalespageSectionKey,
} from './salespage';

export class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshTokenCallback: (() => Promise<void>) | null = null;
  private logoutCallback: (() => void) | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  // Register callbacks for token refresh and logout
  setAuthCallbacks(
    refreshCallback: () => Promise<void>,
    logoutCallback: () => void
  ) {
    this.refreshTokenCallback = refreshCallback;
    this.logoutCallback = logoutCallback;
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    return headers;
  }

  // Handle token refresh with deduplication (prevents multiple refresh calls)
  private async handleTokenRefresh(): Promise<boolean> {
    if (!this.refreshTokenCallback) {
      return false;
    }

    // If already refreshing, wait for the existing refresh to complete
    if (this.isRefreshing && this.refreshPromise) {
      try {
        await this.refreshPromise;
        return true;
      } catch {
        return false;
      }
    }

    this.isRefreshing = true;
    this.refreshPromise = this.refreshTokenCallback();

    try {
      await this.refreshPromise;
      return true;
    } catch (error) {
      logger.error('ApiClient', 'Token refresh failed:', error);
      return false;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Handle response with automatic 401 retry
  private async handleResponseWithRetry<T>(
    response: Response,
    retryFn: () => Promise<Response>
  ): Promise<T> {
    if (response.status === 401) {
      // Try to refresh the token
      const refreshed = await this.handleTokenRefresh();

      if (refreshed) {
        // Retry the original request with the new token
        const retryResponse = await retryFn();

        if (retryResponse.status === 401) {
          // Still getting 401 after refresh, logout
          if (this.logoutCallback) {
            this.logoutCallback();
          }
          throw new Error('Session expired. Please login again.');
        }

        return this.handleResponse<T>(retryResponse);
      } else {
        // Refresh failed, logout
        if (this.logoutCallback) {
          this.logoutCallback();
        }
        throw new Error('Session expired. Please login again.');
      }
    }

    return this.handleResponse<T>(response);
  }

  // Helper method to wrap fetch calls with automatic 401 retry
  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit,
    useRetry = true
  ): Promise<T> {
    const makeRequest = () => fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...this.getAuthHeaders(),
      },
    });

    const response = await makeRequest();

    if (useRetry) {
      return this.handleResponseWithRetry<T>(response, makeRequest);
    }
    return this.handleResponse<T>(response);
  }

  // Generic HTTP methods
  async get<T = unknown>(url: string, config?: { params?: Record<string, unknown> }): Promise<{ data: T }> {
    let fullUrl = `${this.baseUrl.replace('/api/v1', '')}${url}`;

    if (config?.params) {
      const params = new URLSearchParams();
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }

    const makeRequest = () => fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    });

    const response = await makeRequest();
    const data = await this.handleResponseWithRetry<T>(response, makeRequest);
    return { data };
  }

  async post<T = unknown>(url: string, body?: unknown, config?: { headers?: HeadersInit }): Promise<{ data: T }> {
    const isFormData = body instanceof FormData;

    const makeRequest = () => fetch(`${this.baseUrl.replace('/api/v1', '')}${url}`, {
      method: 'POST',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...this.getAuthHeaders(),
        ...config?.headers,
      },
      body: isFormData ? body : JSON.stringify(body),
    });

    const response = await makeRequest();
    const data = await this.handleResponseWithRetry<T>(response, makeRequest);
    return { data };
  }

  async put<T = unknown>(url: string, body?: unknown): Promise<{ data: T }> {
    const makeRequest = () => fetch(`${this.baseUrl.replace('/api/v1', '')}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(body),
    });

    const response = await makeRequest();
    const data = await this.handleResponseWithRetry<T>(response, makeRequest);
    return { data };
  }

  async delete<T = unknown>(url: string): Promise<{ data: T }> {
    const makeRequest = () => fetch(`${this.baseUrl.replace('/api/v1', '')}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    });

    const response = await makeRequest();
    const data = await this.handleResponseWithRetry<T>(response, makeRequest);
    return { data };
  }

  // Template Endpoints

  async uploadTemplate(
    file: File,
    fileName: string,
    description: string,
    author: string,
    aliases?: Record<string, string>,
    htmlFile?: File
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('template', file);
    formData.append('fileName', fileName);
    formData.append('description', description);
    formData.append('author', author);

    if (aliases && Object.keys(aliases).length > 0) {
      formData.append('aliases', JSON.stringify(aliases));
    }

    if (htmlFile) {
      formData.append('htmlPreview', htmlFile);
    }

    const makeRequest = () => fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<UploadResponse>(response, makeRequest);
  }

  async getHTMLPreview(templateId: string): Promise<string> {
    try {
      const makeRequest = () => fetch(`${this.baseUrl}/templates/${templateId}/preview`, {
        headers: this.getAuthHeaders(),
        cache: 'no-store',
      });

      const response = await makeRequest();

      // Handle 401 with retry
      if (response.status === 401) {
        const refreshed = await this.handleTokenRefresh();
        if (refreshed) {
          const retryResponse = await makeRequest();
          if (!retryResponse.ok) {
            logger.warn('ApiClient', `HTML preview not available: ${retryResponse.status}`);
            return '';
          }
          return retryResponse.text();
        }
      }

      if (!response.ok) {
        logger.warn('ApiClient', `HTML preview not available: ${response.status}`);
        return '';
      }
      return response.text();
    } catch (error) {
      logger.warn('ApiClient', 'Failed to fetch HTML preview:', error);
      return '';
    }
  }

  // Get PDF preview URL for a template (returns the API endpoint URL)
  getPDFPreviewUrl(templateId: string): string {
    return `${this.baseUrl}/templates/${templateId}/preview/pdf`;
  }

  // Get thumbnail URL for template gallery
  // quality: 'normal' (default, faster) or 'hd' (pixel-perfect, larger)
  // width: pixel width (default 300 for normal, 800 for HD)
  getThumbnailUrl(templateId: string, options?: { quality?: 'normal' | 'hd'; width?: number }): string {
    const params = new URLSearchParams();
    if (options?.quality) {
      params.set('quality', options.quality);
    }
    if (options?.width) {
      params.set('width', options.width.toString());
    }
    const queryString = params.toString();
    return `${this.baseUrl}/templates/${templateId}/thumbnail${queryString ? `?${queryString}` : ''}`;
  }

  // Get HD thumbnail URL for detail page (pixel-perfect rendering)
  getHDThumbnailUrl(templateId: string, width: number = 800): string {
    return this.getThumbnailUrl(templateId, { quality: 'hd', width });
  }

  // Fetch PDF preview as blob for displaying in iframe or viewer
  async getPDFPreviewBlob(templateId: string): Promise<Blob | null> {
    try {
      const makeRequest = () => fetch(`${this.baseUrl}/templates/${templateId}/preview/pdf`, {
        headers: this.getAuthHeaders(),
      });

      const response = await makeRequest();

      // Handle 401 with retry
      if (response.status === 401) {
        const refreshed = await this.handleTokenRefresh();
        if (refreshed) {
          const retryResponse = await makeRequest();
          if (!retryResponse.ok) {
            logger.warn('ApiClient', `PDF preview not available: ${retryResponse.status}`);
            return null;
          }
          return retryResponse.blob();
        }
      }

      if (!response.ok) {
        logger.warn('ApiClient', `PDF preview not available: ${response.status}`);
        return null;
      }
      return response.blob();
    } catch (error) {
      logger.warn('ApiClient', 'Failed to fetch PDF preview:', error);
      return null;
    }
  }

  async getAllTemplates(): Promise<TemplatesResponse> {
    const makeRequest = () => fetch(`${this.baseUrl}/templates`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<TemplatesResponse>(response, makeRequest);
  }

  async getTemplate(templateId: string): Promise<Template> {
    const makeRequest = () => fetch(`${this.baseUrl}/templates/${templateId}`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<Template>(response, makeRequest);
  }

  async getPlaceholders(templateId: string): Promise<PlaceholdersResponse> {
    const makeRequest = () => fetch(`${this.baseUrl}/templates/${templateId}/placeholders`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<PlaceholdersResponse>(response, makeRequest);
  }

  // Field Definitions (auto-detected from placeholders)

  async getFieldDefinitions(templateId: string): Promise<Record<string, FieldDefinition>> {
    const makeRequest = () => fetch(`${this.baseUrl}/templates/${templateId}/field-definitions`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<FieldDefinitionsResponse>(response, makeRequest);
    return result.field_definitions;
  }

  async updateFieldDefinitions(
    templateId: string,
    fieldDefinitions: Record<string, FieldDefinition>
  ): Promise<{ message: string; template: Template }> {
    const makeRequest = () => fetch(`${this.baseUrl}/templates/${templateId}/field-definitions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ field_definitions: fieldDefinitions }),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string; template: Template }>(response, makeRequest);
  }

  async regenerateFieldDefinitions(templateId: string): Promise<Record<string, FieldDefinition>> {
    const makeRequest = () => fetch(`${this.baseUrl}/templates/${templateId}/field-definitions/regenerate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{ message: string; field_definitions: Record<string, FieldDefinition> }>(response, makeRequest);
    return result.field_definitions;
  }

  // AI Alias Suggestion

  async suggestAliases(templateId: string, htmlContent?: string): Promise<AliasSuggestionResponse> {
    const makeRequest = () => fetch(`${this.baseUrl}/templates/${templateId}/suggest-aliases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({
        html_content: htmlContent || '',
        use_context: !!htmlContent,
      }),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<AliasSuggestionResponse>(response, makeRequest);
  }

  async suggestFieldTypes(templateId: string, options?: { htmlContent?: string; placeholders?: string[] }): Promise<FieldTypeSuggestionResponse> {
    const body: { html_content?: string; placeholders?: string[] } = {};

    if (options?.htmlContent) {
      body.html_content = options.htmlContent;
    } else if (options?.placeholders && options.placeholders.length > 0) {
      body.placeholders = options.placeholders;
    }

    const makeRequest = () => fetch(`${this.baseUrl}/templates/${templateId}/suggest-field-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(body),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<FieldTypeSuggestionResponse>(response, makeRequest);
  }

  // Document Processing

  async processDocument(templateId: string, data: Record<string, string>, organizationId?: string): Promise<ProcessResponse> {
    const body: Record<string, unknown> = { data };
    if (organizationId) {
      body.organization_id = organizationId;
    }

    const makeRequest = () => fetch(`${this.baseUrl}/templates/${templateId}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(body),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<ProcessResponse>(response, makeRequest);
  }

  getDownloadUrl(
    documentId: string,
    format: 'docx' | 'pdf' = 'docx',
    watermarkPresetId?: string | null
  ): string {
    const params = new URLSearchParams();
    if (format === 'pdf') params.set('format', 'pdf');
    if (watermarkPresetId && format === 'pdf') {
      params.set('watermark_preset_id', watermarkPresetId);
    }
    const qs = params.toString();
    const url = `${this.baseUrl}/documents/${documentId}/download`;
    return qs ? `${url}?${qs}` : url;
  }

  async downloadDocument(
    documentId: string,
    format: 'docx' | 'pdf' = 'docx',
    watermarkPresetId?: string | null
  ): Promise<Blob> {
    const makeRequest = () => fetch(this.getDownloadUrl(documentId, format, watermarkPresetId), {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();

    // Handle 401 with retry for blob responses
    if (response.status === 401) {
      const refreshed = await this.handleTokenRefresh();
      if (refreshed) {
        const retryResponse = await makeRequest();
        if (!retryResponse.ok) {
          throw new Error(`Download failed: ${retryResponse.statusText}`);
        }
        return retryResponse.blob();
      } else {
        if (this.logoutCallback) {
          this.logoutCallback();
        }
        throw new Error('Session expired. Please login again.');
      }
    }

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }
    return response.blob();
  }

  // Regenerate document from history
  async regenerateDocument(documentId: string): Promise<ProcessResponse> {
    const makeRequest = () => fetch(`${this.baseUrl}/regenerate/${documentId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<ProcessResponse>(response, makeRequest);
  }

  // Watermark presets
  // ---------------------------------------------------------------------------

  private parsePresetDTO(dto: WatermarkPresetDTO): WatermarkPreset {
    let cfg;
    try {
      cfg = JSON.parse(dto.config);
    } catch {
      cfg = {
        lines: [],
        fontColor: '#0b4db7',
        opacity: 0.35,
        rotation: 0,
        position: 'bottomRight',
        shape: 'rounded',
        scope: 'allPages',
      };
    }
    return { ...dto, config: cfg };
  }

  async listWatermarkPresets(): Promise<WatermarkPreset[]> {
    const makeRequest = () => fetch(`${this.baseUrl}/watermark-presets`, {
      headers: this.getAuthHeaders(),
    });
    const response = await makeRequest();
    const data = await this.handleResponseWithRetry<WatermarkPresetsResponse>(response, makeRequest);
    return (data.presets || []).map((p) => this.parsePresetDTO(p));
  }

  async getWatermarkPreset(id: string): Promise<WatermarkPreset> {
    const makeRequest = () => fetch(`${this.baseUrl}/watermark-presets/${id}`, {
      headers: this.getAuthHeaders(),
    });
    const response = await makeRequest();
    const data = await this.handleResponseWithRetry<WatermarkPresetResponse>(response, makeRequest);
    return this.parsePresetDTO(data.preset);
  }

  async createWatermarkPreset(input: WatermarkPresetInput): Promise<WatermarkPreset> {
    const body = { name: input.name, config: JSON.stringify(input.config) };
    const makeRequest = () => fetch(`${this.baseUrl}/watermark-presets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(body),
    });
    const response = await makeRequest();
    const data = await this.handleResponseWithRetry<WatermarkPresetResponse>(response, makeRequest);
    return this.parsePresetDTO(data.preset);
  }

  async updateWatermarkPreset(id: string, input: WatermarkPresetInput): Promise<WatermarkPreset> {
    const body = { name: input.name, config: JSON.stringify(input.config) };
    const makeRequest = () => fetch(`${this.baseUrl}/watermark-presets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(body),
    });
    const response = await makeRequest();
    const data = await this.handleResponseWithRetry<WatermarkPresetResponse>(response, makeRequest);
    return this.parsePresetDTO(data.preset);
  }

  async deleteWatermarkPreset(id: string): Promise<void> {
    const makeRequest = () => fetch(`${this.baseUrl}/watermark-presets/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    const response = await makeRequest();
    await this.handleResponseWithRetry<{ message: string }>(response, makeRequest);
  }

  async fetchWatermarkLogoBlob(id: string): Promise<Blob | null> {
    const makeRequest = () => fetch(`${this.baseUrl}/watermark-presets/${id}/logo`, {
      headers: this.getAuthHeaders(),
    });
    const response = await makeRequest();
    if (response.status === 404) return null;
    if (response.status === 401) {
      const refreshed = await this.handleTokenRefresh();
      if (refreshed) {
        const retryResponse = await makeRequest();
        if (!retryResponse.ok) return null;
        return retryResponse.blob();
      }
      if (this.logoutCallback) this.logoutCallback();
      return null;
    }
    if (!response.ok) return null;
    return response.blob();
  }

  async uploadWatermarkLogo(id: string, file: File): Promise<WatermarkPreset> {
    const form = new FormData();
    form.append('logo', file);
    const makeRequest = () => fetch(`${this.baseUrl}/watermark-presets/${id}/logo`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: form,
    });
    const response = await makeRequest();
    const data = await this.handleResponseWithRetry<WatermarkPresetResponse>(response, makeRequest);
    return this.parsePresetDTO(data.preset);
  }

  // Activity Logs

  async getActivityLogs(
    limit = 50,
    page = 1,
    method?: string,
    path?: string
  ): Promise<ActivityLogsResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
    });
    if (method) params.append('method', method);
    if (path) params.append('path', path);

    const makeRequest = () => fetch(`${this.baseUrl}/logs?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<ActivityLogsResponse>(response, makeRequest);
  }

  async getLogStats(): Promise<LogStatsResponse> {
    const makeRequest = () => fetch(`${this.baseUrl}/logs/stats`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<LogStatsResponse>(response, makeRequest);
  }

  async getProcessLogs(limit = 50, page = 1): Promise<ProcessLogsResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
    });

    const makeRequest = () => fetch(`${this.baseUrl}/logs/process?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<ProcessLogsResponse>(response, makeRequest);
  }

  async getHistory(): Promise<HistoryResponse> {
    const makeRequest = () => fetch(`${this.baseUrl}/history`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<HistoryResponse>(response, makeRequest);
  }

  async updateTemplate(
    templateId: string,
    data: TemplateUpdateData,
    htmlFile?: File
  ): Promise<{ message: string; template: Template }> {
    if (htmlFile) {
      const formData = new FormData();
      formData.append('displayName', data.displayName);
      formData.append('description', data.description);
      formData.append('author', data.author);

      if (data.name) formData.append('name', data.name);
      if (data.category) formData.append('category', data.category);
      if (data.originalSource) formData.append('original_source', data.originalSource);
      if (data.remarks) formData.append('remarks', data.remarks);
      if (data.isVerified !== undefined) formData.append('is_verified', String(data.isVerified));
      if (data.isAIAvailable !== undefined) formData.append('is_ai_available', String(data.isAIAvailable));
      if (data.type) formData.append('type', data.type);
      if (data.tier) formData.append('tier', data.tier);
      if (data.group) formData.append('group', data.group);

      if (data.aliases && Object.keys(data.aliases).length > 0) {
        formData.append('aliases', JSON.stringify(data.aliases));
      }

      formData.append('htmlPreview', htmlFile);

      const makeRequest = () => fetch(`${this.baseUrl}/templates/${templateId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: formData,
      });

      const response = await makeRequest();
      return this.handleResponseWithRetry<{ message: string; template: Template }>(response, makeRequest);
    } else {
      const makeRequest = () => fetch(`${this.baseUrl}/templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({
          display_name: data.displayName,
          name: data.name || '',
          description: data.description,
          author: data.author,
          category: data.category || '',
          original_source: data.originalSource || '',
          remarks: data.remarks || '',
          is_verified: data.isVerified,
          is_ai_available: data.isAIAvailable,
          type: data.type || '',
          tier: data.tier || '',
          group: data.group || '',
          aliases: data.aliases || {},
        }),
      });

      const response = await makeRequest();
      return this.handleResponseWithRetry<{ message: string; template: Template }>(response, makeRequest);
    }
  }

  async deleteTemplate(templateId: string): Promise<{ message: string }> {
    const makeRequest = () => fetch(`${this.baseUrl}/templates/${templateId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string }>(response, makeRequest);
  }

  // Replace template files (DOCX and/or HTML)
  async replaceTemplateFiles(
    templateId: string,
    options: {
      docxFile?: File;
      htmlFile?: File;
      thumbnailFile?: File;
      regenerateFields?: boolean;
    }
  ): Promise<{ message: string; template_id: string; filename: string; placeholders: string[]; template: Template }> {
    const formData = new FormData();

    if (options.docxFile) {
      formData.append('docx', options.docxFile);
    }

    if (options.htmlFile) {
      formData.append('html', options.htmlFile);
    }

    if (options.thumbnailFile) {
      formData.append('thumbnail', options.thumbnailFile);
    }

    if (options.regenerateFields) {
      formData.append('regenerate_fields', 'true');
    }

    const makeRequest = () => fetch(`${this.baseUrl}/templates/${templateId}/files`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string; template_id: string; filename: string; placeholders: string[]; template: Template }>(response, makeRequest);
  }

  // Health Check

  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    const response = await fetch(`${this.baseUrl.replace('/api/v1', '')}/health`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ status: string; timestamp: string; version: string }>(response);
  }

  // Field Rules

  async getFieldRules(includeInactive = false): Promise<FieldRule[]> {
    const params = includeInactive ? '?include_inactive=true' : '';
    const response = await fetch(`${this.baseUrl}/field-rules${params}`, {
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<FieldRulesResponse>(response);
    return result.rules;
  }

  async getFieldRule(ruleId: string): Promise<FieldRule> {
    const response = await fetch(`${this.baseUrl}/field-rules/${ruleId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<FieldRule>(response);
  }

  async createFieldRule(rule: FieldRuleCreateRequest): Promise<{ message: string; rule: FieldRule }> {
    const response = await fetch(`${this.baseUrl}/field-rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(rule),
    });
    return this.handleResponse<{ message: string; rule: FieldRule }>(response);
  }

  async updateFieldRule(ruleId: string, rule: Partial<FieldRuleCreateRequest> & { is_active?: boolean }): Promise<{ message: string; rule: FieldRule }> {
    const response = await fetch(`${this.baseUrl}/field-rules/${ruleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(rule),
    });
    return this.handleResponse<{ message: string; rule: FieldRule }>(response);
  }

  async deleteFieldRule(ruleId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/field-rules/${ruleId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async testFieldRule(pattern: string, placeholders: string[]): Promise<{ pattern: string; results: Record<string, boolean> }> {
    const response = await fetch(`${this.baseUrl}/field-rules/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ pattern, placeholders }),
    });
    return this.handleResponse<{ pattern: string; results: Record<string, boolean> }>(response);
  }

  async initializeDefaultFieldRules(): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/field-rules/initialize`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async getDataTypes(): Promise<DataTypeOption[]> {
    const response = await fetch(`${this.baseUrl}/field-rules/data-types`, {
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<{ data_types: DataTypeOption[] }>(response);
    return result.data_types;
  }

  async getInputTypes(): Promise<InputTypeOption[]> {
    const response = await fetch(`${this.baseUrl}/field-rules/input-types`, {
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<{ input_types: InputTypeOption[] }>(response);
    return result.input_types;
  }

  // Entity Rules

  async getEntityRules(includeInactive = false): Promise<EntityRule[]> {
    const params = includeInactive ? '?include_inactive=true' : '';
    const response = await fetch(`${this.baseUrl}/entity-rules${params}`, {
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<EntityRulesResponse>(response);
    return result.rules;
  }

  async getEntityRule(ruleId: string): Promise<EntityRule> {
    const response = await fetch(`${this.baseUrl}/entity-rules/${ruleId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<EntityRule>(response);
  }

  async createEntityRule(rule: EntityRuleCreateRequest): Promise<{ message: string; rule: EntityRule }> {
    const response = await fetch(`${this.baseUrl}/entity-rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(rule),
    });
    return this.handleResponse<{ message: string; rule: EntityRule }>(response);
  }

  async updateEntityRule(ruleId: string, rule: Partial<EntityRuleCreateRequest> & { is_active?: boolean }): Promise<{ message: string; rule: EntityRule }> {
    const response = await fetch(`${this.baseUrl}/entity-rules/${ruleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(rule),
    });
    return this.handleResponse<{ message: string; rule: EntityRule }>(response);
  }

  async deleteEntityRule(ruleId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/entity-rules/${ruleId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async initializeDefaultEntityRules(): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/entity-rules/initialize`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async getEntityLabels(): Promise<Record<string, string>> {
    const response = await fetch(`${this.baseUrl}/entity-rules/labels`, {
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<{ labels: Record<string, string> }>(response);
    return result.labels;
  }

  async getEntityColors(): Promise<Record<string, string>> {
    const response = await fetch(`${this.baseUrl}/entity-rules/colors`, {
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<{ colors: Record<string, string> }>(response);
    return result.colors;
  }

  // =====================
  // Configurable Data Types
  // =====================

  async getConfigurableDataTypes(activeOnly = false): Promise<ConfigurableDataType[]> {
    const params = activeOnly ? '?active=true' : '';
    const makeRequest = () => fetch(`${this.baseUrl}/data-types${params}`, {
      headers: this.getAuthHeaders(),
    });
    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<DataTypesResponse>(response, makeRequest);
    return result.data_types || [];
  }

  async getConfigurableDataType(id: string): Promise<ConfigurableDataType> {
    const response = await fetch(`${this.baseUrl}/data-types/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ConfigurableDataType>(response);
  }

  async createConfigurableDataType(data: DataTypeCreateRequest): Promise<ConfigurableDataType> {
    const response = await fetch(`${this.baseUrl}/data-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<ConfigurableDataType>(response);
  }

  async updateConfigurableDataType(id: string, data: Partial<DataTypeCreateRequest>): Promise<ConfigurableDataType> {
    const response = await fetch(`${this.baseUrl}/data-types/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<ConfigurableDataType>(response);
  }

  async deleteConfigurableDataType(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/data-types/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async initializeDefaultDataTypes(): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/data-types/initialize`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // =====================
  // Configurable Input Types
  // =====================

  async getConfigurableInputTypes(activeOnly = false): Promise<ConfigurableInputType[]> {
    const params = activeOnly ? '?active=true' : '';
    const response = await fetch(`${this.baseUrl}/input-types${params}`, {
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<InputTypesResponse>(response);
    return result.input_types || [];
  }

  async getConfigurableInputType(id: string): Promise<ConfigurableInputType> {
    const response = await fetch(`${this.baseUrl}/input-types/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ConfigurableInputType>(response);
  }

  async createConfigurableInputType(data: InputTypeCreateRequest): Promise<ConfigurableInputType> {
    const response = await fetch(`${this.baseUrl}/input-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<ConfigurableInputType>(response);
  }

  async updateConfigurableInputType(id: string, data: Partial<InputTypeCreateRequest>): Promise<ConfigurableInputType> {
    const response = await fetch(`${this.baseUrl}/input-types/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<ConfigurableInputType>(response);
  }

  async deleteConfigurableInputType(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/input-types/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async initializeDefaultInputTypes(): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/input-types/initialize`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // =====================
  // Statistics
  // =====================

  async getStatistics(): Promise<StatisticsResponse> {
    const makeRequest = () => fetch(`${this.baseUrl}/stats`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<StatisticsResponse>(response, makeRequest);
  }

  async getStatsSummary(): Promise<StatsSummaryResponse> {
    const makeRequest = () => fetch(`${this.baseUrl}/stats/summary`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<StatsSummaryResponse>(response, makeRequest);
  }

  async getStatsTemplates(): Promise<StatsTemplatesResponse> {
    const makeRequest = () => fetch(`${this.baseUrl}/stats/templates`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<StatsTemplatesResponse>(response, makeRequest);
  }

  async getStatsByTemplate(templateId: string): Promise<TemplateStatistics> {
    const makeRequest = () => fetch(`${this.baseUrl}/stats/templates/${templateId}`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<TemplateStatistics>(response, makeRequest);
  }

  async getStatsTrends(days = 30, templateId?: string): Promise<StatsTrendsResponse> {
    const params = new URLSearchParams({ days: days.toString() });
    if (templateId) params.append('template_id', templateId);

    const makeRequest = () => fetch(`${this.baseUrl}/stats/trends?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<StatsTrendsResponse>(response, makeRequest);
  }

  async getStatsTimeSeries(eventType: 'form_submit' | 'export' | 'download', days = 30, templateId?: string): Promise<StatsTimeSeriesResponse> {
    const params = new URLSearchParams({ days: days.toString() });
    if (templateId) params.append('template_id', templateId);

    const makeRequest = () => fetch(`${this.baseUrl}/stats/trends/${eventType}?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<StatsTimeSeriesResponse>(response, makeRequest);
  }

  // =====================
  // Document Types (Template Grouping)
  // =====================

  async getDocumentTypes(options?: { category?: string; activeOnly?: boolean; includeTemplates?: boolean }): Promise<DocumentType[]> {
    const params = new URLSearchParams();
    if (options?.category) params.append('category', options.category);
    if (options?.activeOnly !== undefined) params.append('active_only', String(options.activeOnly));
    if (options?.includeTemplates) params.append('include_templates', 'true');

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/document-types?${queryString}` : `${this.baseUrl}/document-types`;

    const makeRequest = () => fetch(url, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<DocumentTypesResponse>(response, makeRequest);
    return result.document_types || [];
  }

  async getDocumentType(id: string, includeTemplates = false): Promise<DocumentType> {
    const params = includeTemplates ? '?include_templates=true' : '';
    const makeRequest = () => fetch(`${this.baseUrl}/document-types/${id}${params}`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{ document_type: DocumentType }>(response, makeRequest);
    return result.document_type;
  }

  async getDocumentTypeByCode(code: string): Promise<DocumentType> {
    const makeRequest = () => fetch(`${this.baseUrl}/document-types/code/${code}`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{ document_type: DocumentType }>(response, makeRequest);
    return result.document_type;
  }

  async createDocumentType(data: DocumentTypeCreateRequest): Promise<DocumentType> {
    const makeRequest = () => fetch(`${this.baseUrl}/document-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{ message: string; document_type: DocumentType }>(response, makeRequest);
    return result.document_type;
  }

  async updateDocumentType(id: string, data: DocumentTypeUpdateRequest): Promise<DocumentType> {
    const makeRequest = () => fetch(`${this.baseUrl}/document-types/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{ message: string; document_type: DocumentType }>(response, makeRequest);
    return result.document_type;
  }

  async deleteDocumentType(id: string): Promise<{ message: string }> {
    const makeRequest = () => fetch(`${this.baseUrl}/document-types/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string }>(response, makeRequest);
  }

  async getDocumentTypeCategories(): Promise<string[]> {
    const makeRequest = () => fetch(`${this.baseUrl}/document-types/categories`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{ categories: string[] }>(response, makeRequest);
    return result.categories;
  }

  async getDocumentTypeTemplates(documentTypeId: string): Promise<Template[]> {
    const makeRequest = () => fetch(`${this.baseUrl}/document-types/${documentTypeId}/templates`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{ templates: Template[] }>(response, makeRequest);
    return result.templates || [];
  }

  async assignTemplateToDocumentType(
    documentTypeId: string,
    templateId: string,
    variantName: string,
    variantOrder: number
  ): Promise<{ message: string }> {
    const makeRequest = () => fetch(`${this.baseUrl}/document-types/${documentTypeId}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({
        template_id: templateId,
        variant_name: variantName,
        variant_order: variantOrder,
      }),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string }>(response, makeRequest);
  }

  async bulkAssignTemplatesToDocumentType(
    documentTypeId: string,
    assignments: TemplateAssignment[]
  ): Promise<{ message: string }> {
    const makeRequest = () => fetch(`${this.baseUrl}/document-types/${documentTypeId}/templates/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ assignments }),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string }>(response, makeRequest);
  }

  async unassignTemplateFromDocumentType(documentTypeId: string, templateId: string): Promise<{ message: string }> {
    const makeRequest = () => fetch(`${this.baseUrl}/document-types/${documentTypeId}/templates/${templateId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string }>(response, makeRequest);
  }

  async getTemplatesGrouped(): Promise<GroupedTemplatesResponse> {
    const makeRequest = () => fetch(`${this.baseUrl}/templates?grouped=true`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<GroupedTemplatesResponse>(response, makeRequest);
  }

  async getTemplatesFiltered(options?: {
    documentTypeId?: string;
    type?: string;
    tier?: string;
    category?: string;
    search?: string;
    isVerified?: boolean;
    includeDocumentType?: boolean;
    sort?: 'popular' | 'recent' | 'name';  // Sort order
    limit?: number;  // Limit number of results
  }): Promise<Template[]> {
    const params = new URLSearchParams();
    if (options?.documentTypeId) params.append('document_type_id', options.documentTypeId);
    if (options?.type) params.append('type', options.type);
    if (options?.tier) params.append('tier', options.tier);
    if (options?.category) params.append('category', options.category);
    if (options?.search) params.append('search', options.search);
    if (options?.isVerified !== undefined) params.append('is_verified', String(options.isVerified));
    if (options?.includeDocumentType) params.append('include_document_type', 'true');
    if (options?.sort) params.append('sort', options.sort);
    if (options?.limit) params.append('limit', String(options.limit));

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/templates?${queryString}` : `${this.baseUrl}/templates`;

    const makeRequest = () => fetch(url, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{ templates: Template[] }>(response, makeRequest);
    return result.templates || [];
  }

  // Auto-suggestion Methods (for automatic template grouping)

  async getAutoSuggestions(): Promise<SuggestedGroup[]> {
    const makeRequest = () => fetch(`${this.baseUrl}/document-types/suggestions`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<SuggestionsResponse>(response, makeRequest);
    return result.suggestions || [];
  }

  async getSuggestionForTemplate(templateId: string): Promise<SuggestedGroup | null> {
    const makeRequest = () => fetch(`${this.baseUrl}/document-types/suggestions/${templateId}`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{ suggestion: SuggestedGroup }>(response, makeRequest);
    return result.suggestion || null;
  }

  async applySuggestion(suggestion: SuggestedGroup): Promise<DocumentType> {
    const makeRequest = () => fetch(`${this.baseUrl}/document-types/suggestions/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({
        suggested_name: suggestion.suggested_name,
        suggested_code: suggestion.suggested_code,
        suggested_category: suggestion.suggested_category,
        existing_type_id: suggestion.existing_type_id,
        templates: suggestion.templates.map(t => ({
          id: t.id,
          suggested_variant: t.suggested_variant,
          variant_order: t.variant_order,
        })),
      }),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{ message: string; document_type: DocumentType }>(response, makeRequest);
    return result.document_type;
  }

  async autoGroupAllTemplates(): Promise<{ message: string; created_document_types: DocumentType[] }> {
    const makeRequest = () => fetch(`${this.baseUrl}/document-types/auto-group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string; created_document_types: DocumentType[] }>(response, makeRequest);
  }

  // =====================
  // Filter Management
  // =====================

  async getFilters(): Promise<FilterCategory[]> {
    const makeRequest = () => fetch(`${this.baseUrl}/filters`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{ filters: FilterCategory[] }>(response, makeRequest);
    return result.filters || [];
  }

  async getFilterCategories(activeOnly = false): Promise<FilterCategory[]> {
    const params = activeOnly ? '?active_only=true' : '';
    const makeRequest = () => fetch(`${this.baseUrl}/filters/categories${params}`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{ categories: FilterCategory[] }>(response, makeRequest);
    return result.categories || [];
  }

  async getFilterCategory(id: string): Promise<FilterCategory> {
    const makeRequest = () => fetch(`${this.baseUrl}/filters/categories/${id}`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<FilterCategory>(response, makeRequest);
  }

  async createFilterCategory(data: FilterCategoryCreateRequest): Promise<FilterCategory> {
    const makeRequest = () => fetch(`${this.baseUrl}/filters/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<FilterCategory>(response, makeRequest);
  }

  async updateFilterCategory(id: string, data: FilterCategoryUpdateRequest): Promise<FilterCategory> {
    const makeRequest = () => fetch(`${this.baseUrl}/filters/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<FilterCategory>(response, makeRequest);
  }

  async deleteFilterCategory(id: string): Promise<{ message: string }> {
    const makeRequest = () => fetch(`${this.baseUrl}/filters/categories/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string }>(response, makeRequest);
  }

  async getFilterOptions(categoryId: string, activeOnly = false): Promise<FilterOption[]> {
    const params = activeOnly ? '?active_only=true' : '';
    const makeRequest = () => fetch(`${this.baseUrl}/filters/categories/${categoryId}/options${params}`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{ options: FilterOption[] }>(response, makeRequest);
    return result.options || [];
  }

  async createFilterOption(data: FilterOptionCreateRequest): Promise<FilterOption> {
    const makeRequest = () => fetch(`${this.baseUrl}/filters/options`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<FilterOption>(response, makeRequest);
  }

  async updateFilterOption(id: string, data: FilterOptionUpdateRequest): Promise<FilterOption> {
    const makeRequest = () => fetch(`${this.baseUrl}/filters/options/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<FilterOption>(response, makeRequest);
  }

  async deleteFilterOption(id: string): Promise<{ message: string }> {
    const makeRequest = () => fetch(`${this.baseUrl}/filters/options/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string }>(response, makeRequest);
  }

  async initializeDefaultFilters(): Promise<{ message: string }> {
    const makeRequest = () => fetch(`${this.baseUrl}/filters/initialize`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string }>(response, makeRequest);
  }

  // =====================
  // Admin User Management
  // =====================

  async getUsers(page = 1, limit = 20, search?: string): Promise<{
    users: import('../auth/types').UserListItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);

    const makeRequest = () => fetch(`${this.baseUrl}/auth/admin/users?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<import('../auth/types').UsersListResponse>(response, makeRequest);
    return result.data;
  }

  async getUser(userId: number): Promise<import('../auth/types').UserListItem> {
    const makeRequest = () => fetch(`${this.baseUrl}/auth/admin/users/${userId}`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{ success: boolean; data: { user: import('../auth/types').UserListItem } }>(response, makeRequest);
    return result.data.user;
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    const makeRequest = () => fetch(`${this.baseUrl}/auth/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string }>(response, makeRequest);
  }

  async assignRole(userId: number, roleName: string): Promise<{ message: string }> {
    const makeRequest = () => fetch(`${this.baseUrl}/auth/admin/users/${userId}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ role_name: roleName }),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string }>(response, makeRequest);
  }

  async removeRole(userId: number, roleId: number): Promise<{ message: string }> {
    const makeRequest = () => fetch(`${this.baseUrl}/auth/admin/users/${userId}/roles/${roleId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string }>(response, makeRequest);
  }

  async getRoles(): Promise<import('../auth/types').Role[]> {
    const makeRequest = () => fetch(`${this.baseUrl}/auth/admin/roles`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<import('../auth/types').RolesListResponse>(response, makeRequest);
    return result.data.roles;
  }

  // =====================
  // Admin Quota Management
  // =====================

  async setUserQuota(userId: number, amount: number, reason?: string): Promise<{ message: string }> {
    const makeRequest = () => fetch(`${this.baseUrl}/auth/admin/users/${userId}/quota`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ amount, reason }),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string }>(response, makeRequest);
  }

  async addQuota(userId: number, amount: number, reason?: string): Promise<{ message: string }> {
    const makeRequest = () => fetch(`${this.baseUrl}/auth/admin/users/${userId}/quota/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ amount, reason }),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string }>(response, makeRequest);
  }

  async resetQuotaUsage(userId: number): Promise<{ message: string }> {
    const makeRequest = () => fetch(`${this.baseUrl}/auth/admin/users/${userId}/quota/reset`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string }>(response, makeRequest);
  }

  async getUserQuotaHistory(userId: number): Promise<import('../auth/types').QuotaTransaction[]> {
    const makeRequest = () => fetch(`${this.baseUrl}/auth/admin/users/${userId}/quota/history`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<import('../auth/types').QuotaHistoryResponse>(response, makeRequest);
    return result.data.transactions;
  }

  // =====================
  // Admin Branding Watermark
  // =====================

  async getBrandingWatermark(): Promise<{ config: WatermarkConfig; is_default: boolean; updated_by?: string; updated_at?: string }> {
    const makeRequest = () => fetch(`${this.baseUrl}/admin/branding-watermark`, {
      headers: this.getAuthHeaders(),
    });
    const response = await makeRequest();
    return this.handleResponseWithRetry<{ config: WatermarkConfig; is_default: boolean; updated_by?: string; updated_at?: string }>(response, makeRequest);
  }

  async updateBrandingWatermark(config: WatermarkConfig): Promise<{ message: string; config: WatermarkConfig }> {
    const makeRequest = () => fetch(`${this.baseUrl}/admin/branding-watermark`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string; config: WatermarkConfig }>(response, makeRequest);
  }

  async resetBrandingWatermark(): Promise<{ message: string }> {
    const makeRequest = () => fetch(`${this.baseUrl}/admin/branding-watermark`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string }>(response, makeRequest);
  }

  // =====================
  // Admin Tier Management
  // =====================

  async adminSetUserTier(userId: number, tier: string, reason?: string): Promise<unknown> {
    const makeRequest = () => fetch(`${this.baseUrl}/auth/admin/users/${userId}/tier`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tier, reason }),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<unknown>(response, makeRequest);
  }

  async adminGetUserTierHistory(userId: number): Promise<{ history: Array<{ id: number; from_tier: string; to_tier: string; changed_by?: number; reason?: string; created_at: string }> }> {
    const makeRequest = () => fetch(`${this.baseUrl}/auth/admin/users/${userId}/tier/history`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{ data: { history: Array<{ id: number; from_tier: string; to_tier: string; changed_by?: number; reason?: string; created_at: string }> } }>(response, makeRequest);
    return result.data;
  }

  async adminSetWatermarkDisabled(userId: number, disabled: boolean): Promise<unknown> {
    const makeRequest = () => fetch(`${this.baseUrl}/auth/admin/users/${userId}/tier/watermark`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ disabled }),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<unknown>(response, makeRequest);
  }

  // =====================
  // User Quota (Self)
  // =====================

  async getMyQuota(): Promise<import('../auth/types').QuotaInfo> {
    const makeRequest = () => fetch(`${this.baseUrl}/auth/quota`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<import('../auth/types').QuotaResponse>(response, makeRequest);
    return result.data;
  }

  async getMyQuotaHistory(): Promise<import('../auth/types').QuotaTransaction[]> {
    const makeRequest = () => fetch(`${this.baseUrl}/auth/quota/history`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<import('../auth/types').QuotaHistoryResponse>(response, makeRequest);
    return result.data.transactions;
  }

  async useQuota(documentId?: string): Promise<{ message: string; remaining: number }> {
    const makeRequest = () => fetch(`${this.baseUrl}/auth/quota/use`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ document_id: documentId }),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ message: string; remaining: number }>(response, makeRequest);
  }

  async checkQuota(): Promise<{ can_generate: boolean; remaining: number }> {
    const makeRequest = () => fetch(`${this.baseUrl}/auth/quota/check`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<{ can_generate: boolean; remaining: number }>(response, makeRequest);
  }

  // OCR Methods

  async extractTextFromImage(imageFile: File, templateId?: string): Promise<OCRResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (templateId) {
      formData.append('template_id', templateId);
    }

    const response = await fetch(`${this.baseUrl}/ocr/extract`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });
    return this.handleResponse<OCRResponse>(response);
  }

  async extractTextForTemplate(templateId: string, imageFile: File): Promise<OCRResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${this.baseUrl}/templates/${templateId}/ocr`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });
    return this.handleResponse<OCRResponse>(response);
  }

  // =====================
  // Tier Management
  // =====================

  async getMyTier(): Promise<import('./types').TierInfo> {
    const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8080';
    const makeRequest = () => fetch(`${AUTH_BASE_URL}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{ success: boolean; data: { tier?: import('./types').TierInfo } }>(response, makeRequest);

    // Return tier info from the /auth/me response, or a default free tier
    return result.data?.tier ?? {
      tier_name: 'free' as const,
      capabilities: {
        allowed_formats: ['pdf'] as ('pdf' | 'docx')[],
        allowed_template_tiers: ['free'],
        monthly_document_limit: -1,
        has_pdf_editor: false,
        forced_watermark: true,
      },
    };
  }

  async changeTier(tier: import('./types').UserTierName): Promise<{ tier: import('./types').TierInfo; access_token: string; refresh_token: string }> {
    const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8080';
    const makeRequest = () => fetch(`${AUTH_BASE_URL}/auth/tier`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ tier }),
    });

    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{
      success: boolean;
      data: { tier: import('./types').TierInfo; access_token: string; refresh_token: string };
    }>(response, makeRequest);

    return result.data;
  }

  async getTierCapabilities(): Promise<Record<string, import('./types').TierCapabilities>> {
    const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8080';
    const makeRequest = () => fetch(`${AUTH_BASE_URL}/auth/tiers/capabilities`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await makeRequest();
    const result = await this.handleResponse<{
      success: boolean;
      data: Record<string, import('./types').TierCapabilities>;
    }>(response);

    return result.data;
  }

  // ---------------------------------------------------------------------------
  // PDF Annotations
  // ---------------------------------------------------------------------------

  async getAnnotations(documentId: string): Promise<AnnotationResponse> {
    const makeRequest = () => fetch(`${this.baseUrl}/documents/${documentId}/annotations`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<AnnotationResponse>(response, makeRequest);
  }

  async saveAnnotations(documentId: string, data: string, version: number): Promise<AnnotationResponse> {
    const makeRequest = () => fetch(`${this.baseUrl}/documents/${documentId}/annotations`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data, version }),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<AnnotationResponse>(response, makeRequest);
  }

  async finalizeDocument(documentId: string): Promise<FinalizeResponse> {
    const makeRequest = () => fetch(`${this.baseUrl}/documents/${documentId}/finalize`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponseWithRetry<FinalizeResponse>(response, makeRequest);
  }

  async getPDFPreview(documentId: string): Promise<Blob> {
    const makeRequest = () => fetch(`${this.baseUrl}/documents/${documentId}/pdf-preview`, {
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();

    if (response.status === 401) {
      const refreshed = await this.handleTokenRefresh();
      if (refreshed) {
        const retryResponse = await makeRequest();
        if (!retryResponse.ok) {
          throw new Error(`PDF preview failed: ${retryResponse.statusText}`);
        }
        return retryResponse.blob();
      } else {
        if (this.logoutCallback) {
          this.logoutCallback();
        }
        throw new Error('Session expired. Please login again.');
      }
    }

    if (!response.ok) {
      throw new Error(`PDF preview failed: ${response.statusText}`);
    }
    return response.blob();
  }

  // ========== Dictionary ==========

  async getDictionaryCategories(): Promise<DictionaryCategory[]> {
    const makeRequest = () => fetch(`${this.baseUrl}/dictionary/categories`, {
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
    });
    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{ categories: DictionaryCategory[] }>(response, makeRequest);
    return result.categories || [];
  }

  async getDictionaryCategory(id: string): Promise<DictionaryCategory> {
    const makeRequest = () => fetch(`${this.baseUrl}/dictionary/categories/${id}`, {
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
    });
    const response = await makeRequest();
    return this.handleResponseWithRetry<DictionaryCategory>(response, makeRequest);
  }

  async createDictionaryCategory(req: DictionaryCategoryCreateRequest): Promise<DictionaryCategory> {
    const makeRequest = () => fetch(`${this.baseUrl}/dictionary/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(req),
    });
    const response = await makeRequest();
    return this.handleResponseWithRetry<DictionaryCategory>(response, makeRequest);
  }

  async updateDictionaryCategory(id: string, req: DictionaryCategoryUpdateRequest): Promise<DictionaryCategory> {
    const makeRequest = () => fetch(`${this.baseUrl}/dictionary/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(req),
    });
    const response = await makeRequest();
    return this.handleResponseWithRetry<DictionaryCategory>(response, makeRequest);
  }

  async deleteDictionaryCategory(id: string): Promise<void> {
    const makeRequest = () => fetch(`${this.baseUrl}/dictionary/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
    });
    const response = await makeRequest();
    await this.handleResponseWithRetry<{ message: string }>(response, makeRequest);
  }

  async searchDictionaryWords(options?: {
    search?: string;
    category_id?: string;
    page?: number;
    limit?: number;
  }): Promise<DictionaryWordsResponse> {
    const params = new URLSearchParams();
    if (options?.search) params.append('search', options.search);
    if (options?.category_id) params.append('category_id', options.category_id);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    const query = params.toString();
    const makeRequest = () => fetch(`${this.baseUrl}/dictionary/words${query ? `?${query}` : ''}`, {
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
    });
    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<DictionaryWordsResponse>(response, makeRequest);
    return { words: result.words || [], total: result.total || 0, page: result.page || 1, limit: result.limit || 50 };
  }

  async getDictionaryWord(id: string): Promise<DictionaryWord> {
    const makeRequest = () => fetch(`${this.baseUrl}/dictionary/words/${id}`, {
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
    });
    const response = await makeRequest();
    return this.handleResponseWithRetry<DictionaryWord>(response, makeRequest);
  }

  async getDictionaryWordsByCategory(categoryId: string): Promise<DictionaryWord[]> {
    const makeRequest = () => fetch(`${this.baseUrl}/dictionary/categories/${categoryId}/words`, {
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
    });
    const response = await makeRequest();
    const result = await this.handleResponseWithRetry<{ words: DictionaryWord[] }>(response, makeRequest);
    return result.words || [];
  }

  async createDictionaryWord(req: DictionaryWordCreateRequest): Promise<DictionaryWord> {
    const makeRequest = () => fetch(`${this.baseUrl}/dictionary/words`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(req),
    });
    const response = await makeRequest();
    return this.handleResponseWithRetry<DictionaryWord>(response, makeRequest);
  }

  async updateDictionaryWord(id: string, req: DictionaryWordUpdateRequest): Promise<DictionaryWord> {
    const makeRequest = () => fetch(`${this.baseUrl}/dictionary/words/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(req),
    });
    const response = await makeRequest();
    return this.handleResponseWithRetry<DictionaryWord>(response, makeRequest);
  }

  async deleteDictionaryWord(id: string): Promise<void> {
    const makeRequest = () => fetch(`${this.baseUrl}/dictionary/words/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
    });
    const response = await makeRequest();
    await this.handleResponseWithRetry<{ message: string }>(response, makeRequest);
  }

  // =====================
  // Salespage Content (i18n blob per locale)
  // =====================

  async getSalespageContent(locale: SalespageLocale): Promise<SalespageDict> {
    const makeRequest = () => fetch(`${this.baseUrl}/salespage-content/${locale}`, {
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
    });
    const response = await makeRequest();
    return this.handleResponseWithRetry<SalespageDict>(response, makeRequest);
  }

  async putSalespageContent(locale: SalespageLocale, data: SalespageDict): Promise<void> {
    const makeRequest = () => fetch(`${this.baseUrl}/salespage-content/${locale}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(data),
    });
    const response = await makeRequest();
    await this.handleResponseWithRetry<unknown>(response, makeRequest);
  }

  async patchSalespageSection<K extends SalespageSectionKey>(
    locale: SalespageLocale,
    path: K,
    data: SalespageDict[K]
  ): Promise<void> {
    const makeRequest = () => fetch(`${this.baseUrl}/salespage-content/${locale}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify({ path, data }),
    });
    const response = await makeRequest();
    await this.handleResponseWithRetry<unknown>(response, makeRequest);
  }

  async triggerSalespageRevalidate(locale: SalespageLocale): Promise<void> {
    const makeRequest = () => fetch(`${this.baseUrl}/salespage-content/${locale}/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
    });
    const response = await makeRequest();
    await this.handleResponseWithRetry<unknown>(response, makeRequest);
  }
}

// OCR Response type
export interface OCRResponse {
  raw_text: string;
  extracted_data: Record<string, string>;
  mapped_fields?: Record<string, string>;
  detection_score: number;
  message: string;
}

// Export singleton instance
export const apiClient = new ApiClient();

