import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

let apiUrl;
let response;
let authToken;

// Background steps
Given('the API server is running at {string}', (url) => {
  apiUrl = url;
  cy.log(`API URL set to: ${apiUrl}`);
});

// User Management - Scenario 1: Create a new researcher user account
Given('I am an administrator', () => {
  // In a real scenario, you would authenticate as admin
  authToken = 'admin-token-123';
  cy.log('Authenticated as administrator');
});

When('I create a new user with the following details:', (dataTable) => {
  const userData = {};
  dataTable.rawTable.forEach(([key, value]) => {
    userData[key] = key === 'credits' ? parseInt(value) : value;
  });

  cy.request({
    method: 'POST',
    url: `${apiUrl}/api/v1/users`,
    body: {
      user: userData
    },
    failOnStatusCode: false
  }).then((res) => {
    response = res;
  });
});

Then('the user should be created successfully', () => {
  expect(response.status).to.be.oneOf([200, 201]);
  expect(response.body).to.have.property('id');
});

Then('the response status code should be {int}', (statusCode) => {
  expect(response.status).to.equal(statusCode);
});

Then('the user should have {string} role', (role) => {
  expect(response.body).to.have.property('role', role);
});

Then('the user should have {int} credits', (credits) => {
  expect(response.body).to.have.property('credits', credits);
});

// User Management - Scenario 2: Retrieve all users
Given('there are {int} users in the system', (count) => {
  // Assuming users are seeded in the database
  cy.log(`Assuming ${count} users exist in the system`);
});

When('I request all users from the API', () => {
  cy.request({
    method: 'GET',
    url: `${apiUrl}/api/v1/users`,
    failOnStatusCode: false
  }).then((res) => {
    response = res;
  });
});

Then('I should receive a list of users', () => {
  expect(response.body).to.be.an('array');
});

Then('the list should contain at least {int} users', (minCount) => {
  expect(response.body.length).to.be.at.least(minCount);
});

// User Management - Scenario 3: Retrieve specific user
Given('a user exists with ID {int}', (userId) => {
  cy.wrap(userId).as('userId');
  cy.log(`User with ID ${userId} should exist`);
});

When('I request user details for ID {int}', (userId) => {
  cy.request({
    method: 'GET',
    url: `${apiUrl}/api/v1/users/${userId}`,
    failOnStatusCode: false
  }).then((res) => {
    response = res;
  });
});

Then('the response should contain user details', () => {
  expect(response.body).to.have.property('id');
  expect(response.body).to.have.property('email');
});

Then('the user email should not be empty', () => {
  expect(response.body.email).to.be.a('string').and.not.empty;
});
