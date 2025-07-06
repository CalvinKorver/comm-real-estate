# Pull Request Status Checks

This repository includes comprehensive automated checks that run on every pull request to ensure code quality, functionality, and maintainability.

## Required Status Checks

The following checks must pass before a pull request can be merged:

### 1. Integration Tests
- **Workflow**: `.github/workflows/integration-tests.yml`
- **Purpose**: Tests database operations, API endpoints, and system integration
- **Database**: Isolated PostgreSQL database in GitHub Actions
- **Runtime**: ~2-3 minutes
- **Coverage**: End-to-end database operations, data consistency, real workflow scenarios

### 2. Lint and Type Check
- **Workflow**: `.github/workflows/ci.yml` (job: `lint-and-typecheck`)
- **Purpose**: Code quality and TypeScript type safety
- **Checks**:
  - ESLint rules compliance
  - TypeScript type checking
  - Prettier code formatting
- **Runtime**: ~1-2 minutes

### 3. Unit Tests
- **Workflow**: `.github/workflows/ci.yml` (job: `unit-tests`)
- **Purpose**: Individual function and component testing
- **Coverage**: Minimum 60% code coverage required
- **Framework**: Jest
- **Runtime**: ~1-2 minutes


## Setting Up GitHub Branch Protection

To enable these as required status checks in GitHub:

1. Go to your repository **Settings** → **Branches**
2. Add a branch protection rule for `main` (and optionally `develop`)
3. Enable **"Require status checks to pass before merging"**
4. Add these required status checks:
   ```
   Run Integration Tests
   Lint and Type Check
   Unit Tests
   ```
5. Enable **"Require branches to be up to date before merging"**
6. Optionally enable **"Require pull request reviews before merging"**

## Status Check Details

### Integration Tests
- **Database**: PostgreSQL 15 service container
- **Environment**: Complete test environment with all required environment variables
- **Migrations**: Automatic database schema setup
- **Isolation**: Fresh database for each test run
- **Framework**: Vitest with custom integration setup

### Code Quality Checks
- **ESLint**: Next.js and TypeScript rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking with `noEmit`

### Test Coverage
- **Target**: 60% minimum coverage for unit tests
- **Reports**: Uploaded to Codecov (if configured)
- **Artifacts**: Test results and coverage reports saved for 7 days

## Local Development

Developers can run all checks locally before pushing:

```bash
# Run all checks locally
npm run lint
npm run typecheck
npm run format:check
npm test
npm run test:integration
```

## Troubleshooting Status Checks

### Integration Tests Failing
- Check database connectivity
- Verify environment variables are set correctly
- Ensure migrations are up to date
- Review test database isolation

### Lint/Type Errors
- Run `npm run lint:fix` to auto-fix ESLint issues
- Run `npm run format:write` to fix Prettier formatting
- Check TypeScript errors with `npm run typecheck`


### Coverage Failures
- Add tests for uncovered code
- Check coverage thresholds in `jest.config.js`
- Review coverage reports in the CI artifacts

## Workflow Files

- **Integration Tests**: `.github/workflows/integration-tests.yml`
- **CI Pipeline**: `.github/workflows/ci.yml`
- **Test Configuration**: `vitest.config.integration.ci.ts`
- **Test Setup**: `tests/setup/integration-setup-ci.ts`

These workflows ensure that every pull request maintains the high quality standards of the codebase and prevents regressions in functionality.