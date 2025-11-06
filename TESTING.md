# 🧪 Testing Infrastructure Guide

This document provides a comprehensive guide to the testing infrastructure implemented for the Traffic Dashboard application.

## 📋 Overview

The testing infrastructure includes:
- **Unit Tests**: Testing individual functions and components in isolation
- **Integration Tests**: Testing API routes and data flow
- **E2E Tests**: Testing complete user workflows
- **CI/CD Pipeline**: Automated testing on GitHub Actions

## 🛠️ Technology Stack

### Testing Frameworks
- **Jest**: JavaScript testing framework for unit and integration tests
- **React Testing Library**: Testing React components with user-centric approach
- **Playwright**: E2E testing framework for cross-browser testing
- **MSW**: Mock Service Worker for API mocking

### Coverage & Quality
- **Coverage Threshold**: 80% for branches, functions, lines, and statements
- **TypeScript**: Full type checking in CI pipeline
- **ESLint**: Code quality and consistency checks
- **Security Audit**: Dependency vulnerability scanning

## 📁 Test Structure

```
__tests__/
├── utils/
│   ├── mockData.ts          # Mock data factories
│   └── test-utils.tsx       # Custom render utilities
├── lib/
│   └── api.test.ts          # API client tests
├── hooks/
│   └── useTrafficData.test.ts # Custom hooks tests
├── components/
│   ├── LiveCounter.test.tsx
│   ├── AlertsBanner.test.tsx
│   ├── TrafficChart.test.tsx
│   └── CameraComparison.test.tsx
├── app/
│   └── dashboard.test.tsx   # Main dashboard tests
└── api/
    ├── history/
    │   └── hourly.test.ts
    └── cron/
        └── fetch-live.test.ts

e2e/
└── dashboard.spec.ts        # E2E tests
```

## 🚀 Running Tests

### Unit & Integration Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Install Playwright browsers
npx playwright install
```

### Individual Test Files
```bash
# Run specific test file
npm test -- __tests__/components/LiveCounter.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should display"
```

## 📊 Test Coverage

### Current Coverage Areas
- ✅ **API Client** (`lib/api.ts`)
  - All endpoint functions
  - Error handling
  - Parameter validation

- ✅ **Custom Hooks** (`hooks/useTrafficData.ts`)
  - SWR integration
  - Data transformation
  - Loading and error states

- ✅ **React Components**
  - `LiveCounter`: Traffic display and congestion levels
  - `AlertsBanner`: Alert generation and display
  - `TrafficChart`: Data visualization
  - `CameraComparison`: Comparative analysis
  - `Dashboard`: Main orchestration

- ✅ **API Routes**
  - `/api/history/hourly`: Historical data retrieval
  - `/api/cron/fetch-live`: Live data processing

- ✅ **E2E Workflows**
  - Dashboard loading and display
  - Real-time data updates
  - Alert system functionality
  - Responsive design testing
  - Error handling scenarios

### Coverage Targets
```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

## 🎯 Testing Best Practices

### Unit Testing
1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Mock external dependencies**
4. **Test edge cases and error conditions**
5. **Keep tests isolated and independent**

Example:
```typescript
describe('LiveCounter Component', () => {
  it('should display high congestion level for heavy traffic', () => {
    const highTrafficData = createMockLiveCount({
      total_in: 28,
      total_out: 20,
    })
    
    render(<LiveCounter data={highTrafficData} />)
    
    const container = screen.getByText('Test Camera').closest('div')
    expect(container).toHaveClass('bg-red-50', 'border-red-200')
  })
})
```

### Integration Testing
1. **Test API endpoints with real database interactions**
2. **Validate data transformation logic**
3. **Test error handling in API routes**
4. **Mock external services (Supabase, external APIs)**

Example:
```typescript
describe('/api/history/hourly', () => {
  it('should return grouped hourly data', async () => {
    const request = new NextRequest('http://localhost:3000/api/history/hourly')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.period).toBe('all available data')
  })
})
```

### E2E Testing
1. **Test critical user journeys**
2. **Verify responsive design**
3. **Test real-time functionality**
4. **Mock external APIs for consistency**
5. **Test across multiple browsers**

Example:
```typescript
test('should display live traffic counters', async ({ page }) => {
  await page.goto('/dashboard')
  
  await expect(page.getByText('Contadores en Tiempo Real')).toBeVisible()
  await expect(page.getByText('Av. Homero Oeste-Este')).toBeVisible()
  await expect(page.getByText('19')).toBeVisible()
})
```

## 🔧 Configuration Files

### Jest Configuration (`jest.config.js`)
- Next.js integration
- Path mapping for `@/` imports
- Coverage collection settings
- Test environment configuration

### Playwright Configuration (`playwright.config.ts`)
- Multi-browser testing (Chrome, Firefox, Safari)
- Mobile viewport testing
- CI/CD optimization
- Trace collection for debugging

### Mock Data (`__tests__/utils/mockData.ts`)
- Realistic test data factories
- Helper functions for creating test scenarios
- Consistent data across all test types

## 🚦 CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/tests.yml`)

**Jobs:**
1. **Unit Tests**: Runs on Node.js 18.x and 20.x
2. **E2E Tests**: Cross-browser testing
3. **Build Test**: Validates production build
4. **Security Audit**: Dependency vulnerability scanning

**Triggers:**
- Push to `main` and `develop` branches
- Pull requests to `main` branch

**Artifacts:**
- Test coverage reports (Codecov)
- E2E test results (Playwright HTML report)
- Build artifacts for deployment

## 📈 Test Metrics

### Coverage Reports
Run `npm run test:coverage` to generate detailed coverage reports:
- HTML report: `coverage/lcov-report/index.html`
- LCOV format: `coverage/lcov.info`
- Console summary with percentage breakdown

### Performance Metrics
- Unit tests: < 5 seconds
- Integration tests: < 10 seconds
- E2E tests: < 60 seconds
- Full CI pipeline: < 5 minutes

## 🐛 Debugging Tests

### Unit Tests
```bash
# Run tests with debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Run specific test in debug mode
npm test -- --testNamePattern="specific test" --verbose
```

### E2E Tests
```bash
# Run with trace generation
npm run test:e2e -- --trace on

# Run in headed mode for debugging
npm run test:e2e -- --headed

# Generate HTML report
npm run test:e2e -- --reporter=html
```

## 🔄 Mock Strategy

### API Mocking
- **Unit Tests**: Jest mocks for external APIs
- **E2E Tests**: Playwright route handlers for consistent responses
- **Integration Tests**: Supabase client mocking

### Data Mocking
- **Factory Functions**: Create realistic test data
- **Edge Cases**: Empty responses, errors, high traffic scenarios
- **Consistency**: Same mock data across test types

## 📝 Writing New Tests

### Adding Unit Tests
1. Create test file in `__tests__/` directory
2. Import necessary utilities from `__tests__/utils/test-utils.tsx`
3. Use mock data factories from `__tests__/utils/mockData.ts`
4. Follow naming convention: `[Component].test.tsx`

### Adding E2E Tests
1. Create test file in `e2e/` directory
2. Mock external APIs for consistent testing
3. Test user workflows, not implementation details
4. Follow naming convention: `[feature].spec.ts`

### Test Checklist
- [ ] Test covers happy path scenarios
- [ ] Test covers error conditions
- [ ] Test uses descriptive names
- [ ] Test is isolated and independent
- [ ] Test has proper assertions
- [ ] Test follows project conventions

## 🎯 Future Enhancements

### Planned Improvements
- **Visual Regression Testing**: Percy or Chromatic integration
- **Performance Testing**: Lighthouse CI integration
- **Accessibility Testing**: axe-core integration
- **Component Storybook**: Visual testing environment
- **Contract Testing**: API contract validation with Pact

### Monitoring
- **Test Performance**: Track test execution times
- **Flaky Test Detection**: Automated identification of unstable tests
- **Coverage Trends**: Monitor coverage changes over time
- **Test Metrics Dashboard**: GitHub Pages or similar

## 📞 Support

For questions about testing:
1. Check this documentation
2. Review existing test files for examples
3. Consult Jest and Playwright documentation
4. Reach out to the development team

---

**Remember**: Good tests are maintainable, reliable, and provide confidence in code changes. Focus on testing user behavior and critical business logic.
