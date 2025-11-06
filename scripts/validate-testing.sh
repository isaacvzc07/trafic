#!/bin/bash

# Test Infrastructure Validation Script
# This script validates that the testing infrastructure is properly set up

set -e

echo "🧪 Validating Testing Infrastructure..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Check if package.json has test scripts
echo "📦 Checking package.json test scripts..."
if grep -q '"test":' package.json && grep -q '"test:coverage":' package.json && grep -q '"test:e2e":' package.json; then
    print_status 0 "Test scripts found in package.json"
else
    print_status 1 "Missing test scripts in package.json"
fi

# Check if Jest configuration exists
echo "⚙️  Checking Jest configuration..."
if [ -f "jest.config.js" ]; then
    print_status 0 "Jest configuration found"
else
    print_status 1 "Jest configuration missing"
fi

# Check if Playwright configuration exists
echo "🎭 Checking Playwright configuration..."
if [ -f "playwright.config.ts" ]; then
    print_status 0 "Playwright configuration found"
else
    print_status 1 "Playwright configuration missing"
fi

# Check if test directories exist
echo "📁 Checking test directory structure..."
if [ -d "__tests__" ]; then
    print_status 0 "__tests__ directory exists"
    
    # Check for test subdirectories
    if [ -d "__tests__/components" ] && [ -d "__tests__/hooks" ] && [ -d "__tests__/lib" ] && [ -d "__tests__/utils" ]; then
        print_status 0 "Test subdirectories properly structured"
    else
        print_warning "Some test subdirectories missing"
    fi
else
    print_status 1 "__tests__ directory missing"
fi

if [ -d "e2e" ]; then
    print_status 0 "E2E test directory exists"
else
    print_status 1 "E2E test directory missing"
fi

# Check if Jest setup file exists
echo "🔧 Checking Jest setup..."
if [ -f "jest.setup.js" ]; then
    print_status 0 "Jest setup file exists"
else
    print_status 1 "Jest setup file missing"
fi

# Check if GitHub Actions workflow exists
echo "🔄 Checking CI/CD workflow..."
if [ -f ".github/workflows/tests.yml" ]; then
    print_status 0 "GitHub Actions test workflow exists"
else
    print_warning "GitHub Actions test workflow missing"
fi

# Check if testing documentation exists
echo "📚 Checking testing documentation..."
if [ -f "TESTING.md" ]; then
    print_status 0 "Testing documentation exists"
else
    print_warning "Testing documentation missing"
fi

# Install dependencies if needed
echo "📥 Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    print_status 0 "Dependencies installed"
else
    print_info "Dependencies already installed"
fi

# Validate Jest configuration syntax
echo "⚙️  Validating Jest configuration..."
if node -e "require('./jest.config.js')" 2>/dev/null; then
    print_status 0 "Jest configuration is valid"
else
    print_status 1 "Jest configuration has syntax errors"
fi

# Validate Playwright configuration syntax
echo "🎭 Validating Playwright configuration..."
if npx playwright validate-config 2>/dev/null; then
    print_status 0 "Playwright configuration is valid"
else
    print_warning "Playwright configuration validation failed (may need to install browsers first)"
fi

# Try to run unit tests (dry run)
echo "🧪 Running unit tests (dry run)..."
if npm run test -- --passWithNoTests --dryRun 2>/dev/null; then
    print_status 0 "Unit tests can run successfully"
else
    print_warning "Unit tests encountered issues (may need to install dependencies first)"
fi

# Check if Playwright browsers are installed
echo "🌐 Checking Playwright browsers..."
if npx playwright install-deps 2>/dev/null; then
    print_status 0 "Playwright system dependencies are available"
else
    print_warning "Playwright system dependencies may need to be installed"
fi

# Check test file coverage
echo "📊 Analyzing test coverage..."
TEST_FILES=$(find __tests__ -name "*.test.*" -type f | wc -l)
if [ $TEST_FILES -gt 0 ]; then
    print_status 0 "Found $TEST_FILES test files"
    
    # Count different types of tests
    COMPONENT_TESTS=$(find __tests__/components -name "*.test.*" -type f 2>/dev/null | wc -l)
    HOOK_TESTS=$(find __tests__/hooks -name "*.test.*" -type f 2>/dev/null | wc -l)
    API_TESTS=$(find __tests__/api -name "*.test.*" -type f 2>/dev/null | wc -l)
    E2E_TESTS=$(find e2e -name "*.spec.*" -type f 2>/dev/null | wc -l)
    
    print_info "Component tests: $COMPONENT_TESTS"
    print_info "Hook tests: $HOOK_TESTS"
    print_info "API tests: $API_TESTS"
    print_info "E2E tests: $E2E_TESTS"
else
    print_warning "No test files found"
fi

# Final summary
echo ""
echo "🎉 Testing Infrastructure Validation Complete!"
echo "=============================================="

# Provide next steps
echo ""
echo "📋 Next Steps:"
echo "1. Run unit tests: npm test"
echo "2. Run tests with coverage: npm run test:coverage"
echo "3. Install Playwright browsers: npx playwright install"
echo "4. Run E2E tests: npm run test:e2e"
echo "5. Check testing documentation: cat TESTING.md"

echo ""
echo "🚀 Your testing infrastructure is ready to use!"
