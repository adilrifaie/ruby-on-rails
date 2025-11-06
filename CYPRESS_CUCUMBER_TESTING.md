# Cypress + Cucumber BDD Testing Guide

## Overview
This project includes automated API testing using **Cypress** and **Cucumber** (BDD - Behavior Driven Development) for the Healthcare Scale Platform.

## Test Scenarios

### 1. User Management (`user_management.feature`)
- **Scenario 1**: Create a new researcher user account
- **Scenario 2**: Retrieve all users from the system
- **Scenario 3**: Retrieve a specific user by ID

### 2. Healthcare Scale Management (`scale_management.feature`)
- **Scenario 1**: Create a new healthcare assessment scale
- **Scenario 2**: Retrieve all published healthcare scales
- **Scenario 3**: Publish a draft scale

### 3. Survey Response Collection (`survey_responses.feature`)
- **Scenario 1**: Submit a patient survey response
- **Scenario 2**: Export survey responses for analysis
- **Scenario 3**: Create statistical analysis for survey

## Installation

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- `cypress` - E2E testing framework
- `@badeball/cypress-cucumber-preprocessor` - Cucumber integration
- `@bahmutov/cypress-esbuild-preprocessor` - Fast bundler for Cypress

### Step 2: Verify Installation

Check that Cypress is installed:

```bash
npx cypress verify
```

## Running Tests

### Method 1: Interactive Mode (Cypress UI)

Open the Cypress Test Runner:

```bash
npm run cy:open
```

Then:
1. Click on "E2E Testing"
2. Select your browser (Chrome, Edge, Firefox, etc.)
3. Click on any `.feature` file to run tests

### Method 2: Headless Mode (Command Line)

Run all tests in headless mode:

```bash
npm run cy:run
```

Run only Cucumber tests:

```bash
npm run cy:run:cucumber
```

Run with a specific browser:

```bash
npm run cy:run:chrome
```

### Method 3: Run Specific Feature

Run a single feature file:

```bash
npx cypress run --spec "cypress/e2e/features/user_management.feature"
```

Run specific features:

```bash
# User Management tests
npx cypress run --spec "cypress/e2e/features/user_management.feature"

# Scale Management tests
npx cypress run --spec "cypress/e2e/features/scale_management.feature"

# Survey Response tests
npx cypress run --spec "cypress/e2e/features/survey_responses.feature"
```

## Prerequisites

### Make Sure Your Rails API is Running

Before running tests, start your Rails server:

```bash
# In a separate terminal
rails server
# or
rails s
```

The API should be running on `http://localhost:3000`

### Seed Your Database (Optional)

To ensure test data exists:

```bash
rails db:seed
```

## Project Structure

```
healthcare_scale_platform/
├── cypress/
│   ├── e2e/
│   │   └── features/
│   │       ├── user_management.feature      # User scenarios
│   │       ├── user_management.js           # User step definitions
│   │       ├── scale_management.feature     # Scale scenarios
│   │       ├── scale_management.js          # Scale step definitions
│   │       ├── survey_responses.feature     # Survey scenarios
│   │       └── survey_responses.js          # Survey step definitions
│   ├── support/
│   │   ├── commands.js                      # Custom Cypress commands
│   │   └── e2e.js                          # Global configuration
│   └── reports/                            # Test reports (auto-generated)
├── cypress.config.js                        # Cypress configuration
├── .cypress-cucumber-preprocessorrc.json   # Cucumber settings
└── package.json                            # Dependencies & scripts
```

## Understanding the Tests

### Feature Files (`.feature`)

Written in **Gherkin syntax**, these are human-readable test scenarios:

```gherkin
Feature: User Management
  Scenario: Create a new researcher user account
    Given I am an administrator
    When I create a new user with the following details:
      | email    | test@example.com |
      | password | SecurePass123!   |
    Then the user should be created successfully
```

### Step Definitions (`.js`)

These implement the actual test logic:

```javascript
Given('I am an administrator', () => {
  authToken = 'admin-token-123';
});

When('I create a new user with the following details:', (dataTable) => {
  cy.request({
    method: 'POST',
    url: '/api/v1/users',
    body: { user: userData }
  });
});
```

## Custom Commands

We've created custom commands for common operations:

```javascript
// Create a user
cy.createUser({ email: 'test@example.com', password: 'pass123', role: 'researcher' });

// Create a scale
cy.createScale({ title: 'Test Scale', user_id: 1 });

// Create a survey
cy.createSurvey({ title: 'Test Survey', scale_id: 1, user_id: 1 });

// Submit a response
cy.submitResponse({ survey_id: 1, participant_name: 'John', answers: '{}' });

// Authenticate
cy.authenticateAs('researcher');

// Wait for API
cy.waitForApi();
```

## Test Reports

After running tests, you'll find:

### Console Output
- Real-time test results in the terminal
- Pass/fail status for each scenario
- Execution time

### Videos (Headless mode)
- Located in: `cypress/videos/`
- Records entire test execution

### Screenshots (On failure)
- Located in: `cypress/screenshots/`
- Captures state when tests fail

### Cucumber Reports
- JSON report: `cypress/reports/cucumber-json/cucumber-report.json`

## Debugging Tests

### 1. Use Cypress Interactive Mode

```bash
npm run cy:open
```

This allows you to:
- See each step execute
- Inspect network requests
- View DOM snapshots
- Use browser DevTools

### 2. Add Debug Statements

```javascript
cy.request('/api/v1/users').then((response) => {
  console.log('Response:', response);
  cy.log('Users count:', response.body.length);
});
```

### 3. Take Screenshots

```javascript
cy.screenshot('user-creation-step');
```

### 4. Pause Execution

```javascript
cy.pause(); // Test will pause here
```

## Configuration

### Change API URL

Edit `cypress.config.js`:

```javascript
env: {
  apiUrl: "http://localhost:3000"  // Change this
}
```

### Change Timeouts

```javascript
defaultCommandTimeout: 10000,  // 10 seconds
requestTimeout: 10000,
responseTimeout: 10000
```

## Troubleshooting

### Issue: "Cannot find module '@badeball/cypress-cucumber-preprocessor'"

**Solution**: Run `npm install`

### Issue: "Error: connect ECONNREFUSED 127.0.0.1:3000"

**Solution**: Start your Rails server with `rails server`

### Issue: Tests fail with 404 errors

**Solution**:
1. Make sure the API endpoints exist
2. Check that your Rails routes match the test URLs
3. Verify database has seeded data

### Issue: "Timed out retrying: expected 200 to equal 201"

**Solution**: Check what status code your API actually returns. You may need to adjust the test assertions.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Cypress Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: 3.2
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: |
          bundle install
          npm install
      - name: Start Rails server
        run: rails server &
      - name: Run Cypress tests
        run: npm run cy:run
```

## Best Practices

1. **Keep scenarios independent**: Each scenario should set up its own data
2. **Use Background steps**: For common setup across scenarios
3. **Write descriptive scenarios**: Make them readable for non-technical stakeholders
4. **Use data tables**: For complex input data
5. **Clean up after tests**: Reset database state if needed
6. **Mock external services**: Don't test third-party APIs
7. **Test happy paths first**: Then add edge cases
8. **Use custom commands**: For repeated operations

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cucumber Preprocessor](https://github.com/badeball/cypress-cucumber-preprocessor)
- [Gherkin Syntax](https://cucumber.io/docs/gherkin/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)

## Contributing

When adding new tests:

1. Write the feature file first (`.feature`)
2. Run the test to see it fail
3. Implement step definitions (`.js`)
4. Run the test to see it pass
5. Refactor if needed

## Questions?

Check the existing tests for examples or refer to the documentation links above.

Happy Testing! 🚀
