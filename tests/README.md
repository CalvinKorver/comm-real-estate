# Integration Testing Setup

This directory contains the integration testing infrastructure for the real estate application, following Prisma's recommended testing patterns.

## Overview

The integration testing setup uses:
- **Vitest** for test execution and assertions
- **Docker PostgreSQL** for isolated test database
- **Supertest** for HTTP endpoint testing
- **Prisma** for database operations

## Architecture

### Test Database Isolation
- Each test run uses a separate PostgreSQL database running in Docker
- Database is reset between each test to ensure clean state
- No interference with development or production databases

### Test Structure
```
tests/
├── integration/        # Integration tests
├── setup/             # Test setup utilities
│   ├── global-setup.ts      # Docker database setup
│   ├── integration-setup.ts # Per-test database reset
│   └── test-database.ts     # Database utilities
└── README.md
```

## Configuration Files

### `vitest.config.integration.ts`
- Vitest configuration specifically for integration tests
- Disables parallel execution to prevent database conflicts
- Sets up test environment and aliases

### `docker-compose.test.yml`
- PostgreSQL test database container
- Runs on port 5433 to avoid conflicts with development database
- Includes health checks and logging

### `.env.test`
- Test environment variables
- Test database connection strings
- Disables external services during testing

## Running Tests

### Prerequisites
- Docker and Docker Compose installed
- PostgreSQL test database will be created automatically

### Commands

```bash
# Run all integration tests
npm run test:integration

# Run integration tests in watch mode
npm run test:integration:watch

# Run integration tests with UI
npm run test:integration:ui

# Manually setup test database
npm run test:db:setup

# Manually teardown test database
npm run test:db:teardown
```

## Writing Integration Tests

### Basic Test Structure
```typescript
import { describe, it, expect } from 'vitest'
import { prisma } from '../../lib/shared/prisma'
import { seedTestData } from '../setup/test-database'

describe('My Integration Test', () => {
  it('should test database operations', async () => {
    // Test database operations
    const result = await prisma.property.create({
      data: {
        street_address: '123 Test St',
        city: 'Test City',
        zip_code: 12345,
        // ... other required fields
      }
    })
    
    expect(result.id).toBeDefined()
  })
})
```

### API Endpoint Testing
```typescript
import request from 'supertest'
import { app } from '../../app' // Your Next.js app

describe('API Integration Tests', () => {
  it('should handle POST requests', async () => {
    const response = await request(app)
      .post('/api/properties')
      .send({
        street_address: '123 Test St',
        city: 'Test City',
        zip_code: 12345,
      })
      .expect(201)
    
    expect(response.body.id).toBeDefined()
  })
})
```

## Test Utilities

### `resetDatabase()`
Clears all tables while respecting foreign key constraints. Called automatically before each test.

### `seedTestData()`
Creates common test data (test user, property, owner, contact). Use when tests need base data.

## Best Practices

1. **Database Isolation**: Each test gets a clean database state
2. **Async/Await**: All database operations use proper async handling
3. **Cleanup**: Database is automatically reset between tests
4. **Realistic Data**: Use realistic test data that matches your schema
5. **Transaction Testing**: Test database constraints and relationships

## Troubleshooting

### Docker Issues
- Ensure Docker is running
- Check if port 5433 is available
- Run `docker-compose -f docker-compose.test.yml logs` for container logs

### Database Issues
- Verify `.env.test` configuration
- Check Prisma schema matches test database
- Run `npx prisma generate` after schema changes

### Test Failures
- Check test database connection
- Verify test data setup
- Review test isolation (database reset between tests)

## Testing Results

✅ **All integration tests passing**
- Database connection and isolation working
- Database reset between tests functioning
- Test data seeding operational
- Docker container management automated

## Next Steps

Phase 1 (✅ Complete):
- [x] Install Vitest and dependencies
- [x] Create Vitest configuration
- [x] Set up Docker test database
- [x] Create test utilities and setup
- [x] Fix database connection issues
- [x] Implement proper test isolation

Phase 2 (Ready to implement):
- [ ] Create comprehensive test data factories
- [ ] Migrate existing Jest tests to Vitest
- [ ] Add API endpoint integration tests
- [ ] Implement performance benchmarking