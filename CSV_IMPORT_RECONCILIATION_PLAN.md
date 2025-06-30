# CSV Import & Reconciliation Feature - Implementation Plan

## Current State Analysis

### ✅ Already Implemented
- Basic CSV file upload and parsing
- Column mapping UI with suggestions
- Data preview with conflict detection
- Basic owner name parsing (handles LLCs, multiple names)
- Property creation with geocoding
- Contact creation from CSV data
- Duplicate address detection
- Error reporting and validation

### 🔧 Issues to Fix
1. **Column Mapping Integration**: The current API doesn't use the column mapping from the UI
2. **Missing Reconciliation Logic**: No intelligent property/owner matching
3. **Phone Number Conflicts**: Basic deduplication without phone conflict resolution
4. **Import Progress**: No progress tracking for large files
5. **Template System**: No saved mapping templates

## Phase 1: Core Reconciliation Engine (Priority 1)

### 1.1 Enhanced Column Mapping Integration
**Files to modify:**
- `app/api/csv-upload/route.ts` - Accept column mapping from frontend
- `lib/services/csv-upload-processor.ts` - Use dynamic column mapping
- `lib/services/csv-processor.ts` - Update to handle mapped columns

**Implementation:**
```typescript
// New interface for column mapping
interface ColumnMapping {
  [csvColumn: string]: string | null; // Maps CSV column to DB field
}

// Update API to accept mapping
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const mappingJson = formData.get('columnMapping') as string;
  const columnMapping: ColumnMapping = JSON.parse(mappingJson);
  
  const result = await processCSVUpload(file, columnMapping);
}
```

### 1.2 Property Matching & Reconciliation Service
**New file: `lib/services/property-reconciliation.ts`**

```typescript
export class PropertyReconciliationService {
  // Match properties by address with fuzzy matching
  async findMatchingProperty(address: string, city: string, zip: string): Promise<Property | null>
  
  // Merge property data (additive updates)
  async mergePropertyData(existing: Property, newData: PropertyData): Promise<Property>
  
  // Handle address variations and typos
  normalizeAddress(address: string): string
}
```

### 1.3 Enhanced Owner Deduplication
**New file: `lib/services/owner-deduplication.ts`**

```typescript
export class OwnerDeduplicationService {
  // Find potential duplicates by name and phone
  async findPotentialDuplicates(owner: OwnerData): Promise<Owner[]>
  
  // Resolve phone number conflicts
  async resolvePhoneConflicts(owner: OwnerData, existingOwners: Owner[]): Promise<ConflictResolution>
  
  // Merge owner data intelligently
  async mergeOwnerData(existing: Owner, newData: OwnerData): Promise<Owner>
}
```

## Phase 2: Conflict Resolution UI (Priority 2)

### 2.1 Conflict Preview Modal
**New component: `components/ConflictPreviewModal.tsx`**

```typescript
interface ConflictPreviewModalProps {
  conflicts: PropertyConflict[];
  onResolve: (resolution: ConflictResolution) => void;
  onSkip: () => void;
}

// Show potential duplicates before processing
// Allow user to choose merge strategy
// Preview what will be created/updated
```

### 2.2 Import Progress Tracking
**New component: `components/ImportProgressModal.tsx`**

```typescript
interface ImportProgress {
  stage: 'validating' | 'matching' | 'processing' | 'geocoding' | 'complete';
  current: number;
  total: number;
  message: string;
}
```

### 2.3 Enhanced Results Display
**Update: `app/csv-upload/page.tsx`**

- Show detailed reconciliation results
- List of merged properties/owners
- Conflicts that were auto-resolved
- Manual review queue for complex conflicts

## Phase 3: Advanced Features (Priority 3)

### 3.1 Template System
**New files:**
- `lib/services/mapping-templates.ts`
- `components/MappingTemplateManager.tsx`

```typescript
interface MappingTemplate {
  id: string;
  name: string;
  description: string;
  columnMapping: ColumnMapping;
  requiredFields: string[];
  createdAt: Date;
}
```

### 3.2 Batch Processing
**Enhancement to existing services:**
- Process large files in chunks
- Resume failed imports
- Background processing with webhooks

### 3.3 Import History & Reporting
**New files:**
- `lib/services/import-history.ts`
- `app/imports/page.tsx` - Import history page

```typescript
interface ImportRecord {
  id: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  summary: ImportSummary;
  createdAt: Date;
  completedAt?: Date;
}
```

## Phase 4: Database Schema Updates

### 4.1 Import Tracking Tables
```sql
-- Track import history
CREATE TABLE import_records (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  status TEXT NOT NULL,
  column_mapping JSON,
  summary JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- Track conflict resolutions
CREATE TABLE conflict_resolutions (
  id TEXT PRIMARY KEY,
  import_id TEXT,
  entity_type TEXT, -- 'property' or 'owner'
  entity_id TEXT,
  resolution_type TEXT, -- 'merge', 'skip', 'create_new'
  resolution_data JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Store mapping templates
CREATE TABLE mapping_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  column_mapping JSON NOT NULL,
  required_fields JSON,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Order

### Week 1: Core Reconciliation
1. ✅ Fix column mapping integration
2. Implement PropertyReconciliationService
3. Implement OwnerDeduplicationService
4. Update CSV processor to use reconciliation services

### Week 2: Conflict Resolution UI
1. Create ConflictPreviewModal
2. Create ImportProgressModal
3. Update CSV upload page with new UI flow
4. Add detailed results display

### Week 3: Advanced Features
1. Implement template system
2. Add import history tracking
3. Create import history page
4. Add batch processing capabilities

### Week 4: Testing & Polish
1. Comprehensive testing with various CSV formats
2. Performance optimization for large files
3. Error handling improvements
4. Documentation and user guides

## Technical Considerations

### Performance
- Use database transactions for data consistency
- Implement batch processing for large files
- Add database indexes for matching queries
- Cache geocoding results

### Error Handling
- Graceful handling of malformed CSV data
- Rollback on partial failures
- Detailed error logging
- User-friendly error messages

### Security
- Validate all CSV data before processing
- Sanitize column mapping input
- Rate limiting for upload endpoints
- File size and type validation

## Success Metrics
- 95%+ successful property matching rate
- <5% manual conflict resolution required
- <30 second processing time for 1000-row files
- Zero data loss during reconciliation
- User satisfaction with conflict resolution UI 