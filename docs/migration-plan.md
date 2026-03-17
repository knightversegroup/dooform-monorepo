# Dooform Backend Migration Plan

## Go Microservices → NestJS Monolith (dooform-api)

**Source:** `dooform-backend-services` (8 Go microservices + 1 Python service)
**Target:** `dooform-monorepo/apps/dooform-api` (NestJS 11 / TypeORM / PostgreSQL)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Current State Assessment](#2-current-state-assessment)
3. [Migration Strategy](#3-migration-strategy)
4. [Phase 1 — Foundation & Auth](#phase-1--foundation--auth-module)
5. [Phase 2 — Config & Geolocations](#phase-2--config--geolocations-modules)
6. [Phase 3 — Template Service](#phase-3--template-module-enhancement)
7. [Phase 4 — Document Service](#phase-4--document-module)
8. [Phase 5 — AI & OCR Service](#phase-5--ai--ocr-module)
9. [Phase 6 — Analytics Service](#phase-6--analytics-module)
10. [Phase 7 — API Gateway Concerns](#phase-7--api-gateway-cross-cutting-concerns)
11. [Phase 8 — LibreOffice Integration](#phase-8--libreoffice-integration)
12. [Database Migration](#database-migration)
13. [Environment Variables](#environment-variables)
14. [Testing Strategy](#testing-strategy)
15. [Deployment Strategy](#deployment-strategy)
16. [Risk Assessment](#risk-assessment)

---

## 1. Architecture Overview

### Source Architecture (Go Microservices)

```
                   ┌──────────────────────┐
                   │   API Gateway :8080   │
                   │  (Auth, RBAC, Rate    │
                   │   Limit, Circuit      │
                   │   Breaker, Quota)     │
                   └──────────┬───────────┘
          ┌───────┬───────┬───┴───┬───────┬───────┬───────┐
          ▼       ▼       ▼       ▼       ▼       ▼       ▼
       Auth    Template  Doc     AI    Config  Analytics  Geo
       :8082   :8083    :8084   :8085  :8086   :8087     :7242
          │       │       │       │       │       │        │
          └───────┴───────┴───────┴───────┴───────┴────────┘
                              │
                         PostgreSQL
                              │
                    ┌─────────┴─────────┐
                    │  LibreOffice Svc   │
                    │     :3000          │
                    └───────────────────┘
```

### Target Architecture (NestJS Monolith)

```
                   ┌──────────────────────────────┐
                   │       dooform-api (NestJS)    │
                   │                               │
                   │  ┌─────────────────────────┐  │
                   │  │   Global Middleware      │  │
                   │  │  (Auth, RBAC, Rate       │  │
                   │  │   Limit, Logging)        │  │
                   │  └─────────────────────────┘  │
                   │                               │
                   │  ┌─────┬──────┬─────┬──────┐  │
                   │  │Auth │Templ │Doc  │Config│  │
                   │  │Mod  │Mod   │Mod  │Mod   │  │
                   │  ├─────┼──────┼─────┼──────┤  │
                   │  │AI   │Analy │Geo  │Stor- │  │
                   │  │Mod  │tics  │Mod  │age   │  │
                   │  └─────┴──────┴─────┴──────┘  │
                   └──────────────┬────────────────┘
                                 │
                            PostgreSQL
                                 │
                       ┌─────────┴─────────┐
                       │  LibreOffice Svc   │
                       │  (External/Docker) │
                       └───────────────────┘
```

**Key Decision:** The Go API Gateway's cross-cutting concerns (auth, RBAC, rate limiting, security headers) become NestJS Guards, Interceptors, and Middleware — applied globally or per-route via decorators.

---

## 2. Current State Assessment

### Go Services Inventory

| Service | Port | Key Entities | Endpoints | Complexity |
|---------|------|-------------|-----------|------------|
| API Gateway | 8080 | — | Reverse proxy | High (middleware stack) |
| Auth | 8082 | User, Role, Quota, RefreshToken | 20+ | High |
| Template | 8083 | Template, DocumentType | 15+ | High |
| Document | 8084 | Document | 6 | Medium |
| AI/OCR | 8085 | — (stateless) | 7 | Medium |
| Config | 8086 | DataType, InputType, FieldRule, EntityRule, Filter | 15+ | Medium |
| Analytics | 8087 | ActivityLog, Statistics | 12 | Low-Medium |
| Geolocations | 7242 | AdministrativeBoundary | 3 | Low |
| LibreOffice | 3000 | — | 2 | External (keep as-is) |

### dooform-api Current State

- **Framework:** NestJS 11 + TypeORM 0.3.28
- **Architecture:** DDD / Clean Architecture (via `@dooform-api-core`)
- **Existing Module:** Template (basic CRUD — 3 endpoints)
- **Auth:** Not implemented
- **Database:** PostgreSQL with auto-sync
- **Deployment:** Vercel serverless
- **Shared Types:** `@dooform/shared` already defines all API types matching the Go services

---

## 3. Migration Strategy

### Approach: Incremental Module-by-Module Migration

Each Go microservice becomes a NestJS module following the existing DDD pattern:

```
src/modules/{service-name}/
├── domain/
│   ├── entities/          # Domain entities
│   ├── enums/             # Domain enums
│   └── repositories/      # Repository interfaces
├── application/
│   ├── dtos/              # Input/Output DTOs
│   ├── use-cases/         # Business logic
│   └── services/          # Application services
├── infrastructure/
│   └── persistence/
│       └── typeorm/
│           ├── models/    # TypeORM entity models
│           └── repositories/  # TypeORM repository implementations
└── interface/
    └── rest/
        └── controllers/   # HTTP controllers
```

### Migration Order (by dependency)

```
Phase 1: Auth (foundation — everything depends on it)
    ↓
Phase 2: Config + Geolocations (reference data — templates depend on config)
    ↓
Phase 3: Template (enhance existing module to match Go feature parity)
    ↓
Phase 4: Document (depends on Template + Auth quota)
    ↓
Phase 5: AI/OCR (depends on Template for field mapping)
    ↓
Phase 6: Analytics (depends on all services for activity logging)
    ↓
Phase 7: Gateway concerns (middleware, guards — applied globally)
    ↓
Phase 8: LibreOffice integration (HTTP client to external service)
```

---

## Phase 1 — Auth Module

**Source:** `dooform-auth-service` (Go, port 8082)
**Priority:** Critical — all other modules depend on authentication

### 1.1 Database Entities

Create TypeORM entities matching Go models:

| Entity | Table | Key Fields |
|--------|-------|------------|
| `UserModel` | `users` | id, email, password_hash, line_user_id, google_user_id, firebase_uid, first_name, last_name, display_name, picture_url, auth_provider, is_active, profile_completed |
| `RefreshTokenModel` | `refresh_tokens` | id, user_id, token, expires_at, is_revoked |
| `RoleModel` | `roles` | id, name, description |
| `UserRoleModel` | `user_roles` | id, user_id, role_id, assigned_by |
| `UserQuotaModel` | `user_quotas` | id, user_id, total_quota, used_quota, quota_reset_at, last_usage_at |
| `QuotaTransactionModel` | `quota_transactions` | id, user_id, transaction_type, amount, balance_after, reason, performed_by, document_id |

### 1.2 Domain Logic

- Password hashing: bcrypt (cost 12)
- JWT: Access token (24h) + Refresh token (7 days, DB-persisted)
- First user → admin role
- Single active session (login revokes old tokens)
- Hourly expired token cleanup (NestJS `@Cron()`)

### 1.3 Use Cases

| Use Case | Go Handler | NestJS Equivalent |
|----------|-----------|-------------------|
| Register | `POST /auth/register` | `RegisterUseCase` |
| Login | `POST /auth/login` | `LoginUseCase` |
| Refresh Token | `POST /auth/refresh` | `RefreshTokenUseCase` |
| Logout | `POST /auth/logout` | `LogoutUseCase` |
| Get Profile | `GET /auth/profile` | `GetProfileUseCase` |
| Update Profile | `PUT /auth/profile` | `UpdateProfileUseCase` |
| LINE OAuth | `GET /auth/line/url`, `POST /auth/line/callback` | `LineAuthUseCase` |
| Google Auth | `POST /auth/google/login` | `GoogleAuthUseCase` |
| Quota Check | `GET /auth/quota/check` | `CheckQuotaUseCase` |
| Quota Use | `POST /auth/quota/use` | `UseQuotaUseCase` |
| Quota Refund | `POST /auth/quota/refund` | `RefundQuotaUseCase` |
| Admin: List Users | `GET /auth/admin/users` | `AdminListUsersUseCase` |
| Admin: Set Quota | `PUT /auth/admin/users/:id/quota` | `AdminSetQuotaUseCase` |
| Admin: Manage Roles | `POST /auth/admin/users/:id/roles` | `AdminManageRolesUseCase` |

### 1.4 NestJS Guards & Decorators

```typescript
// Guards (replaces Go gateway middleware)
@Injectable() JwtAuthGuard         // Validates JWT, sets req.user
@Injectable() RolesGuard           // Checks @Roles('admin') decorator
@Injectable() QuotaGuard           // Checks quota before document generation

// Decorators
@Public()                          // Marks route as public (skip auth)
@Roles('admin')                    // Requires admin role
@CurrentUser()                     // Param decorator — extracts user from JWT
```

### 1.5 Storage Sub-Module

Abstract storage for user files (profile images, uploads):

```typescript
interface StorageService {
  uploadFile(path: string, buffer: Buffer, contentType: string): Promise<string>;
  deleteFile(path: string): Promise<void>;
  readFile(path: string): Promise<Buffer>;
  getSignedUrl(path: string, expiryMinutes?: number): Promise<string>;
}

// Implementations:
AzureBlobStorageService    // Azure Blob Storage
LocalStorageService        // Local filesystem (dev)
```

### 1.6 Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/profile
PUT    /api/auth/profile
GET    /api/auth/line/url
POST   /api/auth/line/callback
POST   /api/auth/google/login
GET    /api/auth/quota
GET    /api/auth/quota/check
POST   /api/auth/quota/use
POST   /api/auth/quota/refund
GET    /api/auth/quota/history
GET    /api/auth/admin/users
GET    /api/auth/admin/users/:id
PUT    /api/auth/admin/users/:id/roles
PUT    /api/auth/admin/users/:id/quota
POST   /api/auth/admin/users/:id/quota/add
POST   /api/auth/admin/users/:id/quota/reset
DELETE /api/auth/admin/users/:id
```

### 1.7 Dependencies

```
bcryptjs           # Password hashing
@nestjs/jwt        # JWT generation/verification
@nestjs/passport   # Auth strategies (optional, can use custom guards)
passport-jwt       # JWT strategy
@azure/storage-blob # Azure Blob Storage SDK
```

---

## Phase 2 — Config & Geolocations Modules

### 2.1 Config Module

**Source:** `dooform-config-service` (Go, port 8086)

#### Entities

| Entity | Table | Purpose |
|--------|-------|---------|
| `DataTypeModel` | `data_types` | Field data type definitions (26 defaults) |
| `InputTypeModel` | `input_types` | Form control types (17 defaults) |
| `FieldRuleModel` | `field_rules` | Field name matching patterns (25+ with regex) |
| `EntityRuleModel` | `entity_rules` | Entity detection rules (child, mother, etc.) |
| `FilterCategoryModel` | `filter_categories` | Filter hierarchy parents |
| `FilterOptionModel` | `filter_options` | Filter hierarchy children |

#### Use Cases

| Use Case | Endpoint |
|----------|----------|
| `GetDataTypesUseCase` | `GET /api/config/data-types` |
| `CreateDataTypeUseCase` | `POST /api/config/data-types` |
| `InitializeDataTypesUseCase` | `POST /api/config/data-types/initialize` |
| `GetInputTypesUseCase` | `GET /api/config/input-types` |
| `CreateInputTypeUseCase` | `POST /api/config/input-types` |
| `InitializeInputTypesUseCase` | `POST /api/config/input-types/initialize` |
| `GetFieldRulesUseCase` | `GET /api/config/field-rules` |
| `CreateFieldRuleUseCase` | `POST /api/config/field-rules` |
| `TestFieldRuleUseCase` | `POST /api/config/field-rules/test` |
| `GenerateFieldDefinitionsUseCase` | `POST /api/config/field-rules/generate` |
| `InitializeFieldRulesUseCase` | `POST /api/config/field-rules/initialize` |
| `GetEntityRulesUseCase` | `GET /api/config/entity-rules` |
| `DetectEntityUseCase` | `POST /api/config/entity-rules/detect` |
| `GetFiltersUseCase` | `GET /api/config/filters` |
| `InitializeFiltersUseCase` | `POST /api/config/filters/initialize` |

#### Seed Data

Port all 26 default data types, 17 input types, 25+ field rules, and entity rules from Go constants. Create a NestJS seed service or use TypeORM migrations with seed data.

### 2.2 Geolocations Module

**Source:** `dooform-geolocations` (Go, port 7242)

#### Entity

| Entity | Table | Key Fields |
|--------|-------|------------|
| `AdministrativeBoundaryModel` | `administrative_boundaries` | objectid, admin_id1-3, name1-3 (Thai), name_eng1-3, type, population, etc. |

#### Use Cases

| Use Case | Endpoint |
|----------|----------|
| `ListBoundariesUseCase` | `GET /api/geolocations/list` |
| `QueryBoundariesUseCase` | `GET /api/geolocations/query?name1=&name2=&name3=` |
| `SearchBoundariesUseCase` | `GET /api/geolocations/search?q=` |

#### Notes

- Full-text search with Thai character support
- Data loaded from CSV/SQL seed (existing in Go service)
- Read-only module — no write endpoints needed

---

## Phase 3 — Template Module Enhancement

**Source:** `dooform-template-service` (Go, port 8083)
**Target:** Enhance existing `src/modules/template/` to match Go feature parity

### 3.1 Entity Enhancements

The existing `TemplateModel` needs additional fields:

```typescript
// Fields to add (matching Go model):
filename: string;
displayName: string;
author: string;
filePathDocx: string;
filePathHtml: string;
filePathPdf: string;
filePathThumbnail: string;
fileSize: number;
mimeType: string;
placeholders: Record<string, any>;    // JSON
aliases: Record<string, any>;         // JSON
fieldDefinitions: Record<string, any>; // JSON
type: TemplateType;       // official, private, community
tier: TemplateTier;       // free, basic, premium, enterprise
group: string;
documentTypeId: string;   // FK to document_types
variantName: string;
variantOrder: number;
pageOrientation: string;  // portrait, landscape
```

### 3.2 New Entity: DocumentType

| Entity | Table | Key Fields |
|--------|-------|------------|
| `DocumentTypeModel` | `document_types` | id, code, name, icon, color, description |

### 3.3 New Use Cases

| Use Case | Endpoint | Notes |
|----------|----------|-------|
| `UploadTemplateUseCase` | `POST /api/templates/upload` | DOCX upload + processing pipeline |
| `UpdateTemplateUseCase` | `PUT /api/templates/:id` | Update metadata |
| `DeleteTemplateUseCase` | `DELETE /api/templates/:id` | Soft delete |
| `GetPlaceholdersUseCase` | `GET /api/templates/:id/placeholders` | Extract from DOCX |
| `GetPreviewUseCase` | `GET /api/templates/:id/preview` | HTML preview |
| `GetPdfPreviewUseCase` | `GET /api/templates/:id/preview/pdf` | PDF preview |
| `GetThumbnailUseCase` | `GET /api/templates/:id/thumbnail` | PNG thumbnail |
| `GetFieldDefinitionsUseCase` | `GET /api/templates/:id/field-definitions` | Field schema |
| `UpdateFieldDefinitionsUseCase` | `PUT /api/templates/:id/field-definitions` | Update fields |
| `RegenerateFieldDefsUseCase` | `POST /api/templates/:id/field-definitions/regenerate` | Re-detect types |
| `GetGroupedTemplatesUseCase` | `GET /api/templates?grouped=true` | Group by document type |
| `DocumentTypeCrudUseCases` | `GET/POST/PUT/DELETE /api/document-types` | Full CRUD |

### 3.4 DOCX Processing

Port the Go DOCX processing logic to TypeScript:

1. **Placeholder Extraction:** Regex `{{placeholder}}` from DOCX XML
2. **Field Type Auto-Detection:** Map field names → data types (id → id_number, date → date, etc.)
3. **Preview Generation:** Call LibreOffice service for HTML/PDF conversion
4. **Thumbnail Generation:** Convert PDF → PNG via LibreOffice

```typescript
// Key service
@Injectable()
class DocxProcessorService {
  extractPlaceholders(docxBuffer: Buffer): string[];
  autoDetectFieldTypes(placeholders: string[]): FieldDefinition[];
}
```

**Dependencies:**
```
adm-zip / jszip    # ZIP (DOCX) handling
xml2js             # XML parsing for DOCX
```

---

## Phase 4 — Document Module

**Source:** `dooform-document-service` (Go, port 8084)

### 4.1 Entity

| Entity | Table | Key Fields |
|--------|-------|------------|
| `DocumentModel` | `documents` | id, template_id, user_id, filename, file_path_docx, file_path_pdf, file_size, mime_type, data (JSON), status |

### 4.2 Use Cases

| Use Case | Endpoint | Notes |
|----------|----------|-------|
| `ProcessTemplateUseCase` | `POST /api/templates/:id/process` | Generate doc from template + data |
| `GetDocumentUseCase` | `GET /api/documents/:id` | Document metadata |
| `DownloadDocumentUseCase` | `GET /api/documents/:id/download?format=docx\|pdf` | File download |
| `DeleteDocumentUseCase` | `DELETE /api/documents/:id` | Soft delete |
| `RegenerateDocumentUseCase` | `POST /api/documents/:id/regenerate` | Re-generate with stored data |
| `GetDocumentHistoryUseCase` | `GET /api/documents/history` | User's document list (paginated) |

### 4.3 DOCX Generation Pipeline

Port Go's document processing to TypeScript:

```
1. Fetch template metadata from DB
2. Download template DOCX from storage
3. Extract DOCX (ZIP) to temp directory
4. Replace {{placeholders}} in word/document.xml, header*.xml, footer*.xml
5. Handle XML-split placeholders (across <w:t> elements)
6. XML-escape special characters
7. Re-zip into new DOCX
8. Upload to storage
9. (Optional) Convert to PDF via LibreOffice service
10. Save document metadata to DB
```

### 4.4 Guards

- `@UseGuards(JwtAuthGuard)` — All endpoints
- `@UseGuards(QuotaGuard)` — `POST /api/templates/:id/process` (consume quota)

---

## Phase 5 — AI / OCR Module

**Source:** `dooform-ai-service` (Go, port 8085)

### 5.1 Structure

Stateless module — no database entities. Makes HTTP calls to external AI APIs.

### 5.2 Use Cases

| Use Case | Endpoint | Notes |
|----------|----------|-------|
| `ExtractTextUseCase` | `POST /api/ocr/extract` | Basic OCR |
| `TyphoonOcrUseCase` | `POST /api/ocr/typhoon` | Typhoon API OCR |
| `SmartOcrUseCase` | `POST /api/ocr/smart` | OCR + field detection |
| `MapFieldsUseCase` | `POST /api/ocr/map-fields` | Map OCR → template fields |
| `TemplateOcrUseCase` | `POST /api/templates/:id/ocr` | Template-specific OCR |
| `SuggestAliasesUseCase` | `POST /api/suggest-aliases` | AI field alias generation |
| `SuggestFieldTypesUseCase` | `POST /api/suggest-field-types` | AI field type suggestion |

### 5.3 External Services

```typescript
@Injectable()
class TyphoonService {
  constructor(private readonly httpService: HttpService) {}

  async extractText(imageBuffer: Buffer): Promise<OcrResult> {
    // Call Typhoon API (https://api.opentyphoon.ai/v1)
  }
}
```

**Dependencies:**
```
@nestjs/axios      # HTTP client for external API calls
```

---

## Phase 6 — Analytics Module

**Source:** `dooform-analytics-service` (Go, port 8087)

### 6.1 Entities

| Entity | Table | Key Fields |
|--------|-------|------------|
| `ActivityLogModel` | `activity_logs` | id, user_id, http_method, path, status, response_time, user_agent |
| `StatisticsModel` | `statistics` | id, template_id, event_type, count, date |

### 6.2 Implementation

Use a NestJS **Interceptor** for automatic activity logging:

```typescript
@Injectable()
class ActivityLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        this.analyticsService.logActivity({
          userId: request.user?.id,
          method: request.method,
          path: request.path,
          status: response.statusCode,
          responseTime: Date.now() - start,
          userAgent: request.headers['user-agent'],
        });
      }),
    );
  }
}
```

### 6.3 Use Cases

| Use Case | Endpoint |
|----------|----------|
| `GetLogsUseCase` | `GET /api/analytics/logs` |
| `GetLogStatsUseCase` | `GET /api/analytics/logs/stats` |
| `GetStatsUseCase` | `GET /api/analytics/stats` |
| `GetStatsSummaryUseCase` | `GET /api/analytics/stats/summary` |
| `GetTemplateStatsUseCase` | `GET /api/analytics/stats/templates` |
| `GetTrendsUseCase` | `GET /api/analytics/stats/trends` |
| `RecordEventUseCase` | `POST /api/analytics/stats/record` |

---

## Phase 7 — API Gateway Cross-Cutting Concerns

The Go API Gateway's middleware stack becomes NestJS global middleware, guards, and interceptors.

### 7.1 Mapping Table

| Go Middleware | NestJS Equivalent | Scope |
|--------------|-------------------|-------|
| Recovery | Built-in exception filter | Global |
| Structured Logging | `LoggingInterceptor` (already exists) | Global |
| Metrics | `MetricsInterceptor` (Prometheus) | Global |
| CORS | `app.enableCors()` in `main.ts` | Global |
| Security Headers | `helmet` middleware | Global |
| Rate Limiting | `@nestjs/throttler` | Global / Per-route |
| Request Validation | `ValidationPipe` (already via class-validator) | Global |
| JWT Authentication | `JwtAuthGuard` | Per-route (`@UseGuards`) |
| RBAC | `RolesGuard` + `@Roles()` decorator | Per-route |
| Quota Enforcement | `QuotaGuard` | Per-route |
| Circuit Breaker | `@nestjs/axios` retry + circuit breaker | Per external call |

### 7.2 Global Setup (`main.ts`)

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173', /\.dooform\.com$/],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global pipes
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Global filters
  app.useGlobalFilters(new HttpResultExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(), new ActivityLoggingInterceptor());

  // Global guards
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  await app.listen(3000);
}
```

### 7.3 Dependencies

```
helmet                  # Security headers
@nestjs/throttler       # Rate limiting
```

### 7.4 Health Check

```typescript
@Controller()
export class HealthController {
  @Get('health')
  @Public()
  health() { return { status: 'ok' }; }

  @Get('ready')
  @Public()
  ready() { return { status: 'ready' }; }
}
```

---

## Phase 8 — LibreOffice Integration

**Source:** `dooform-libreoffice-service` (Python/Flask, port 3000)
**Decision:** Keep as external Docker service — do NOT port to NestJS

### 8.1 Rationale

- LibreOffice requires a full Linux installation with fonts
- Python/Flask wrapper is minimal and stable
- Not suitable for Vercel serverless
- Better to run as a sidecar container

### 8.2 NestJS Client

```typescript
@Injectable()
class LibreOfficeService {
  constructor(
    private readonly httpService: HttpService,
    @Inject('LIBREOFFICE_URL') private readonly baseUrl: string,
  ) {}

  async convertToPdf(docxBuffer: Buffer, filename: string): Promise<Buffer> {
    // POST multipart/form-data to LIBREOFFICE_URL/forms/libreoffice/convert
  }

  async convertToHtml(docxBuffer: Buffer, filename: string): Promise<Buffer> {
    // POST multipart/form-data to LIBREOFFICE_URL/convert
  }
}
```

### 8.3 Deployment

- Docker Compose for local dev (same as current Go setup)
- Cloud Run / Container Instance for production
- Health check: `GET /health`

---

## Database Migration

### Strategy: Shared PostgreSQL, New Migrations

Since the Go services use raw SQL / GORM auto-migrate, create proper TypeORM migrations.

### 9.1 Migration Files

```
src/database/migrations/
├── 001-create-users.ts
├── 002-create-refresh-tokens.ts
├── 003-create-roles.ts
├── 004-create-user-roles.ts
├── 005-create-user-quotas.ts
├── 006-create-quota-transactions.ts
├── 007-enhance-templates.ts          # Add missing columns
├── 008-create-document-types.ts
├── 009-create-documents.ts
├── 010-create-data-types.ts
├── 011-create-input-types.ts
├── 012-create-field-rules.ts
├── 013-create-entity-rules.ts
├── 014-create-filter-categories.ts
├── 015-create-filter-options.ts
├── 016-create-administrative-boundaries.ts
├── 017-create-activity-logs.ts
├── 018-create-statistics.ts
├── 019-seed-default-data-types.ts
├── 020-seed-default-input-types.ts
├── 021-seed-default-field-rules.ts
├── 022-seed-default-entity-rules.ts
├── 023-seed-geolocations-data.ts
```

### 9.2 Data Migration

For existing production data:

1. **Schema Compatibility:** TypeORM entities match existing Go table structures (same column names, types)
2. **Data Seed:** Port Go default seed data (data types, input types, field rules, entity rules, filters) to TypeORM seed migrations
3. **Geo Data:** Export from Go DB → import via TypeORM migration
4. **User Data:** Compatible — same schema, same bcrypt hashes

### 9.3 TypeORM Config Update

```typescript
// database.module.ts
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    url: config.get('DATABASE_URL'),
    ssl: config.get('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : false,
    entities: [__dirname + '/../**/*.model{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,  // Use migrations in production
    migrationsRun: true,
    logging: config.get('NODE_ENV') !== 'production' ? ['error', 'warn', 'migration'] : ['error'],
  }),
  inject: [ConfigService],
}),
```

---

## Environment Variables

### Complete Variable Mapping

| Go Variable | NestJS Variable | Notes |
|------------|----------------|-------|
| `DB_HOST`, `DB_PORT`, etc. | `DATABASE_URL` | Single connection string |
| `DB_SSLMODE` | `DATABASE_SSL` | Boolean |
| `JWT_SECRET` | `JWT_SECRET` | Same |
| `JWT_REFRESH_SECRET` | `JWT_REFRESH_SECRET` | Same |
| `JWT_ACCESS_TOKEN_EXPIRY` | `JWT_ACCESS_EXPIRY` | Default: 24h |
| `JWT_REFRESH_TOKEN_EXPIRY` | `JWT_REFRESH_EXPIRY` | Default: 7d |
| `API_KEY` | `API_KEY` | Service-to-service auth |
| `STORAGE_TYPE` | `STORAGE_TYPE` | local / azure |
| `AZURE_STORAGE_ACCOUNT` | `AZURE_STORAGE_ACCOUNT` | Same |
| `AZURE_STORAGE_KEY` | `AZURE_STORAGE_KEY` | Same |
| `AZURE_CONTAINER_NAME` | `AZURE_CONTAINER_NAME` | Same |
| `LOCAL_STORAGE_BASE` | `LOCAL_STORAGE_BASE` | Same |
| `TYPHOON_API_KEY` | `TYPHOON_API_KEY` | Same |
| `TYPHOON_API_URL` | `TYPHOON_API_URL` | Same |
| `GOOGLE_CLIENT_ID` | `GOOGLE_CLIENT_ID` | Same |
| `FIREBASE_PROJECT_ID` | `FIREBASE_PROJECT_ID` | Same |
| `LINE_CHANNEL_ID` | `LINE_CHANNEL_ID` | Same |
| `LINE_CHANNEL_SECRET` | `LINE_CHANNEL_SECRET` | Same |
| `LINE_CALLBACK_URL` | `LINE_CALLBACK_URL` | Same |
| `LIBREOFFICE_SERVICE_URL` | `LIBREOFFICE_URL` | External service URL |
| `ALLOWED_ORIGINS` | `CORS_ORIGINS` | Comma-separated |

---

## Testing Strategy

### 12.1 Unit Tests

Each use case gets unit tests with mocked repositories:

```
src/modules/{module}/application/use-cases/__tests__/
├── create-template.use-case.spec.ts
├── get-template-by-id.use-case.spec.ts
└── ...
```

### 12.2 Integration Tests

Test TypeORM repositories against a real PostgreSQL (Docker):

```
src/modules/{module}/infrastructure/persistence/typeorm/__tests__/
├── template.repository.integration.spec.ts
└── ...
```

### 12.3 E2E Tests

Use existing `apps/dooform-api-e2e/` (Playwright):

```
apps/dooform-api-e2e/src/
├── auth.spec.ts
├── templates.spec.ts
├── documents.spec.ts
├── config.spec.ts
└── ...
```

### 12.4 Migration Validation Tests

Write tests that verify API response parity with Go services:

```typescript
describe('API Parity: Template Endpoints', () => {
  it('GET /api/templates should return same shape as Go service', async () => {
    // Compare response structure against Go API contract
  });
});
```

---

## Deployment Strategy

### 13.1 Vercel (Current Target)

**Limitations:**
- No persistent file system (use Azure Blob for all storage)
- No WebSocket support (no real-time features)
- 10s default / 60s max function timeout (may be tight for DOCX processing)
- No cron jobs natively (use Vercel Cron or external scheduler)

**Considerations:**
- LibreOffice service must be hosted separately (Cloud Run, Azure Container Instances)
- For DOCX processing (ZIP manipulation), consider Vercel's 50MB body limit
- Token cleanup cron → Vercel Cron (`vercel.json` cron config)

### 13.2 Alternative: Container Deployment

If Vercel limitations become blocking:

```dockerfile
# Dockerfile for dooform-api
FROM node:20-alpine
WORKDIR /app
COPY dist/apps/dooform-api/ .
RUN npm install --production
EXPOSE 3000
CMD ["node", "main.js"]
```

Deploy to: Azure Container Apps, Google Cloud Run, or Railway.

### 13.3 Docker Compose (Local Dev)

```yaml
services:
  dooform-api:
    build: ./apps/dooform-api
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://postgres:password@db:5432/dooform
    depends_on: [db, libreoffice]

  db:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: dooform

  libreoffice:
    build: ../dooform-backend-services/dooform-libreoffice-service
    ports: ["3001:3000"]
```

---

## Risk Assessment

### High Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| DOCX processing bugs | Documents generated incorrectly | Port Go tests, compare outputs side-by-side |
| JWT compatibility | Existing tokens break | Use same JWT_SECRET, same claims structure |
| Vercel timeout for large docs | Document generation fails | Set maxDuration, or move to container |
| Data loss during migration | Production data corrupted | Run migrations on copy first, keep Go services running |

### Medium Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing Go business logic | Feature regression | Code review each Go handler vs NestJS use case |
| Performance regression | Slower API responses | Load test critical endpoints |
| File path incompatibility | Storage files inaccessible | Use same Azure Blob paths/container |
| Thai text handling | OCR/search broken | Test with Thai content explicitly |

### Low Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| TypeORM vs GORM differences | Query behavior changes | Integration tests |
| Rate limiting differences | Different throttle behavior | Configure @nestjs/throttler to match Go config |
| CORS misconfig | Frontend blocked | Test all frontend origins |

---

## Module File Structure (Complete)

```
apps/dooform-api/src/
├── main.ts
├── app/
│   ├── app.module.ts
│   └── app.controller.ts
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── quota.guard.ts
│   ├── decorators/
│   │   ├── public.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── current-user.decorator.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── activity-logging.interceptor.ts
│   ├── middleware/
│   │   └── security-headers.middleware.ts
│   └── services/
│       └── storage/
│           ├── storage.interface.ts
│           ├── azure-blob-storage.service.ts
│           └── local-storage.service.ts
├── database/
│   ├── database.module.ts
│   └── migrations/
│       └── ... (23 migration files)
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── interface/
│   ├── template/                    # (enhance existing)
│   │   ├── template.module.ts
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── interface/
│   ├── document/
│   │   ├── document.module.ts
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── interface/
│   ├── config/
│   │   ├── config-data.module.ts
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── interface/
│   ├── geolocations/
│   │   ├── geolocations.module.ts
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── interface/
│   ├── ai/
│   │   ├── ai.module.ts
│   │   ├── application/
│   │   └── interface/
│   └── analytics/
│       ├── analytics.module.ts
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       └── interface/
```

---

## Summary: Effort Estimation by Phase

| Phase | Module | Scope | Relative Size |
|-------|--------|-------|---------------|
| 1 | Auth | 6 entities, 20+ endpoints, OAuth, JWT, Quota | XL |
| 2 | Config + Geo | 6 entities, 18+ endpoints, seed data | L |
| 3 | Template Enhancement | 2 entities, 15+ endpoints, DOCX processing | L |
| 4 | Document | 1 entity, 6 endpoints, DOCX generation pipeline | M |
| 5 | AI/OCR | 0 entities, 7 endpoints, external API calls | S |
| 6 | Analytics | 2 entities, 12 endpoints, interceptor | M |
| 7 | Gateway Concerns | Guards, middleware, interceptors | M |
| 8 | LibreOffice | HTTP client wrapper | S |

**Recommended approach:** Build Phase 1 (Auth) first since it unblocks all other phases. Phases 2-6 can then be parallelized across developers.
