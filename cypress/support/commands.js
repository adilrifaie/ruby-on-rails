// ***********************************************
// Custom commands for the Healthcare Platform
// ***********************************************

/**
 * Custom command to create a user via API
 * @example cy.createUser({ email: 'test@example.com', password: 'pass123', role: 'researcher' })
 */
Cypress.Commands.add('createUser', (userData) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/v1/users`,
    body: {
      user: userData
    },
    failOnStatusCode: false
  });
});

/**
 * Custom command to create a scale via API
 * @example cy.createScale({ title: 'Test Scale', description: 'Description', user_id: 1 })
 */
Cypress.Commands.add('createScale', (scaleData) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/v1/scales`,
    body: {
      scale: scaleData
    },
    failOnStatusCode: false
  });
});

/**
 * Custom command to create a survey via API
 * @example cy.createSurvey({ title: 'Test Survey', scale_id: 1, user_id: 1 })
 */
Cypress.Commands.add('createSurvey', (surveyData) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/v1/surveys`,
    body: {
      survey: surveyData
    },
    failOnStatusCode: false
  });
});

/**
 * Custom command to submit a response via API
 * @example cy.submitResponse({ survey_id: 1, participant_name: 'John', answers: '{}' })
 */
Cypress.Commands.add('submitResponse', (responseData) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/v1/responses`,
    body: {
      response: {
        ...responseData,
        submitted_at: new Date().toISOString()
      }
    },
    failOnStatusCode: false
  });
});

/**
 * Custom command to authenticate as a user
 * @example cy.authenticateAs('researcher')
 */
Cypress.Commands.add('authenticateAs', (role) => {
  // This is a mock implementation
  // In a real scenario, you'd authenticate and store the token
  const token = `${role}-token-${Date.now()}`;
  cy.wrap(token).as('authToken');
  cy.log(`Authenticated as: ${role}`);
  return cy.wrap(token);
});

/**
 * Custom command to check API health
 * @example cy.checkApiHealth()
 */
Cypress.Commands.add('checkApiHealth', () => {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/api/v1/health`,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 404) {
      cy.log('Health endpoint not found, assuming API is accessible');
      return true;
    }
    return response.status === 200;
  });
});

/**
 * Custom command to wait for API to be ready
 * @example cy.waitForApi()
 */
Cypress.Commands.add('waitForApi', (maxRetries = 5) => {
  const checkApi = (retries = 0) => {
    if (retries >= maxRetries) {
      cy.log('⚠️ API may not be running. Tests will attempt to proceed.');
      return;
    }

    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/api/v1/users`,
      failOnStatusCode: false,
      timeout: 5000
    }).then((response) => {
      if (response.status >= 200 && response.status < 500) {
        cy.log('✓ API is ready');
      } else {
        cy.wait(1000);
        checkApi(retries + 1);
      }
    });
  };

  checkApi();
});
