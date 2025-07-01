# CSV Import Testing Plan

## Overview
This document outlines a comprehensive testing strategy for the CSV import functionality, including acceptance tests, integration tests, and dynamic test CSV generation to ensure robust data processing, mapping, and deduplication.

## Testing Strategy

### 1. Unit Tests
- **CSV Processing Logic**: Test individual functions in isolation
- **Validation Logic**: Test data validation rules
- **Name Parsing**: Test owner name parsing for various formats
- **Address Normalization**: Test address matching algorithms

### 2. Integration Tests
- **End-to-End CSV Processing**: Test complete CSV upload workflow
- **Database Operations**: Test owner/property creation and updates
- **Deduplication Logic**: Test owner and property matching
- **Contact Processing**: Test phone/email contact creation

### 3. Acceptance Tests
- **User Scenarios**: Test real-world CSV import scenarios
- **Error Handling**: Test various error conditions
- **Performance**: Test with large CSV files
- **Edge Cases**: Test boundary conditions

## Test Implementation Plan

### Phase 1: Test Infrastructure Setup

#### 1.1 Test Database Setup
```typescript
// tests/setup/test-database.ts
- Create isolated test database
- Setup/teardown functions
- Seed test data utilities
```

#### 1.2 Test CSV Generator
```typescript
// tests/utils/csv-generator.ts
- Generate test CSV files with various scenarios
- Support for different column mappings
- Create duplicate data for deduplication testing
- Generate invalid data for error testing
```

#### 1.3 Test Utilities
```typescript
// tests/utils/test-helpers.ts
- Mock file uploads
- Assertion helpers for database state
- Performance measurement utilities
```

### Phase 2: Unit Tests

#### 2.1 CSV Processor Tests
```typescript
// tests/unit/csv-processor.test.ts
- processCSVRow() with various data formats
- validateCSVRow() with valid/invalid data
- Name parsing for individuals, LLCs, partnerships
- Contact processing logic
```

#### 2.2 Deduplication Tests
```typescript
// tests/unit/owner-deduplication.test.ts
- Name similarity calculations
- Phone number normalization
- Email conflict detection
- Merge logic validation
```

#### 2.3 Property Reconciliation Tests
```typescript
// tests/unit/property-reconciliation.test.ts
- Address normalization
- Fuzzy matching algorithms
- Property merge logic
- Parcel ID handling
```

### Phase 3: Integration Tests

#### 3.1 CSV Upload Integration Tests
```typescript
// tests/integration/csv-upload.test.ts
- Complete upload workflow
- Database state verification
- Error handling and rollback
- Performance with large files
```

#### 3.2 Deduplication Integration Tests
```typescript
// tests/integration/deduplication.test.ts
- End-to-end deduplication workflow
- Database consistency checks
- Contact merging scenarios
- Conflict resolution
```

### Phase 4: Acceptance Tests

#### 4.1 User Scenario Tests
```typescript
// tests/acceptance/user-scenarios.test.ts
- Real estate agent uploads property list
- Duplicate owner detection and merging
- Property address matching
- Contact information updates
```

#### 4.2 Error Scenario Tests
```typescript
// tests/acceptance/error-scenarios.test.ts
- Invalid CSV formats
- Missing required fields
- Malformed data
- Database constraint violations
```

## Dynamic Test CSV Generation

### Test CSV Scenarios

#### 1. Basic Valid CSV
```csv
OwnerName,Address,City,State,Zip,Email 1,Wireless 1
John Smith,123 Main St,Seattle,WA,98101,john@email.com,206-555-0101
Jane Doe,456 Oak Ave,Portland,OR,97201,jane@email.com,503-555-0202
```

#### 2. Duplicate Owner Scenarios
```csv
OwnerName,Address,City,State,Zip,Email 1,Wireless 1
John Smith,123 Main St,Seattle,WA,98101,john@email.com,206-555-0101
John Smith,789 Pine Rd,Seattle,WA,98102,john@email.com,206-555-0101
J. Smith,123 Main St,Seattle,WA,98101,john.smith@email.com,206-555-0101
```

#### 3. LLC and Partnership Scenarios
```csv
OwnerName,Address,City,State,Zip,Email 1,Wireless 1
Smith Properties LLC,123 Main St,Seattle,WA,98101,info@smithprop.com,206-555-0101
John & Jane Smith,456 Oak Ave,Portland,OR,97201,john@email.com,503-555-0202
A Ashenbrenner & M Suzanna,789 Pine Rd,Seattle,WA,98102,contact@email.com,206-555-0303
```

#### 4. Property Duplicate Scenarios
```csv
OwnerName,Address,City,State,Zip,Email 1,Wireless 1
John Smith,123 Main Street,Seattle,WA,98101,john@email.com,206-555-0101
Jane Doe,123 Main St,Seattle,WA,98101,jane@email.com,503-555-0202
Bob Wilson,123 Main St.,Seattle,WA,98101,bob@email.com,206-555-0404
```

#### 5. Invalid Data Scenarios
```csv
OwnerName,Address,City,State,Zip,Email 1,Wireless 1
,123 Main St,Seattle,WA,98101,john@email.com,206-555-0101
John Smith,,Seattle,WA,98101,john@email.com,206-555-0101
John Smith,123 Main St,Seattle,WA,invalid,john@email.com,206-555-0101
John Smith,123 Main St,Seattle,WA,98101,invalid-email,206-555-0101
John Smith,123 Main St,Seattle,WA,98101,john@email.com,invalid-phone
```

## Test Implementation Steps

### Step 1: Setup Test Infrastructure
1. Create test database configuration
2. Setup Jest test environment
3. Create test utilities and helpers
4. Implement CSV generator

### Step 2: Implement Unit Tests
1. Test CSV processing functions
2. Test validation logic
3. Test name parsing algorithms
4. Test address normalization

### Step 3: Implement Integration Tests
1. Test complete upload workflow
2. Test database operations
3. Test deduplication logic
4. Test error handling

### Step 4: Implement Acceptance Tests
1. Test user scenarios
2. Test error scenarios
3. Test performance
4. Test edge cases

### Step 5: Create Test Data Generator
1. Implement CSV generator utility
2. Create various test scenarios
3. Generate duplicate data sets
4. Create invalid data sets

## Test Execution

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --testPathPattern=csv-processor
npm test -- --testPathPattern=deduplication
npm test -- --testPathPattern=integration

# Run with coverage
npm test -- --coverage
```

### Test Data Management
```bash
# Generate test CSV files
npm run test:generate-csv

# Clean test database
npm run test:clean-db

# Setup test environment
npm run test:setup
```

## Success Criteria

### Functional Requirements
- [ ] All CSV formats are processed correctly
- [ ] Owner deduplication works accurately
- [ ] Property reconciliation functions properly
- [ ] Contact information is merged correctly
- [ ] Error handling is robust

### Performance Requirements
- [ ] Large CSV files (>1000 rows) process within 30 seconds
- [ ] Memory usage remains stable during processing
- [ ] Database operations are optimized

### Quality Requirements
- [ ] 90%+ test coverage
- [ ] All edge cases covered
- [ ] Error scenarios handled gracefully
- [ ] Data integrity maintained

## Next Steps

1. **Immediate**: Set up test infrastructure and basic unit tests
2. **Week 1**: Implement CSV generator and integration tests
3. **Week 2**: Create acceptance tests and performance tests
4. **Week 3**: Refine and optimize based on test results
5. **Week 4**: Document test scenarios and create test data sets

This testing plan ensures comprehensive coverage of the CSV import functionality and provides confidence in the system's reliability and performance.