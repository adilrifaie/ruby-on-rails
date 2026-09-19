// Custom commands for the Healthcare Scale Platform (Rails API + React frontend)

const api = (path) => `${Cypress.env('apiUrl')}/api/v1${path}`;
const authHeaders = (token) => ({ Authorization: `Bearer ${token}`, Accept: 'application/json' });

// Finds the form control for a visible label. Works for both label layouts in the app:
// shadcn fields (<label for="id"> next to the control) and legacy pages (control inside the label).
Cypress.Commands.add('field', (labelText) => {
  return cy.contains('label', labelText).then(($label) => {
    const id = $label.attr('for');
    return id ? cy.get(`[id="${id}"]`) : cy.wrap($label).find('input, select, textarea');
  });
});

Cypress.Commands.add('uniqueEmail', (prefix = 'user') => {
  return cy.wrap(`${prefix}.${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`, { log: false });
});

Cypress.Commands.add('apiRegister', (email, password) => {
  return cy.request({
    method: 'POST',
    url: api('/users'),
    headers: { Accept: 'application/json' },
    body: { user: { email, password } },
    failOnStatusCode: false
  });
});

Cypress.Commands.add('apiLogin', (email, password) => {
  return cy.request({
    method: 'POST',
    url: api('/session'),
    headers: { Accept: 'application/json' },
    body: { email, password },
    failOnStatusCode: false
  });
});

// Registers a fresh user and logs in; yields { email, password, token, user }
Cypress.Commands.add('apiCreateUser', () => {
  const password = 'Password123!';
  return cy.uniqueEmail().then((email) => {
    cy.apiRegister(email, password).its('status').should('eq', 201);
    return cy.apiLogin(email, password).then((res) => ({
      email,
      password,
      token: res.body.token,
      user: res.body.user
    }));
  });
});

Cypress.Commands.add('apiAuthed', (token, method, path, body) => {
  return cy.request({
    method,
    url: api(path),
    headers: authHeaders(token),
    body,
    failOnStatusCode: false
  });
});

// Creates a scale owned by the token's user with the given [{text, min_value, max_value}] questions
Cypress.Commands.add('apiCreateScale', (token, title, questions = []) => {
  return cy.apiAuthed(token, 'POST', '/scales', { scale: { title, description: 'Created by Cypress', version: '1.0' } })
    .then((res) => {
      expect(res.status).to.eq(201);
      const scale = res.body;
      questions.forEach((q, i) => {
        cy.apiAuthed(token, 'POST', `/scales/${scale.id}/questions`, {
          question: { text: q.text, position: i + 1, min_value: q.min_value, max_value: q.max_value }
        }).its('status').should('eq', 201);
      });
      return cy.wrap(scale, { log: false });
    });
});

Cypress.Commands.add('apiPublishScale', (token, scaleId) => {
  return cy.apiAuthed(token, 'PATCH', `/scales/${scaleId}/publish`).its('status').should('eq', 200);
});

Cypress.Commands.add('apiCreateSurvey', (token, scaleId, title) => {
  return cy.apiAuthed(token, 'POST', '/surveys', { survey: { scale_id: scaleId, title, status: 'active' } })
    .then((res) => {
      expect(res.status).to.eq(201);
      return res.body.survey;
    });
});

// Public endpoint: no bearer token
Cypress.Commands.add('apiSubmitResponse', (surveyId, participantName, answers) => {
  return cy.request({
    method: 'POST',
    url: api('/responses'),
    headers: { Accept: 'application/json' },
    body: {
      response: {
        survey_id: surveyId,
        participant_name: participantName,
        submitted_at: new Date().toISOString(),
        answers_attributes: answers
      }
    },
    failOnStatusCode: false
  });
});

// Logs in through the React login form
Cypress.Commands.add('uiLogin', (email, password) => {
  cy.visit('/login');
  cy.field('Email').type(email);
  cy.field('Password').type(password);
  cy.contains('button', 'Log in').click();
  cy.url().should('include', '/dashboard');
});
