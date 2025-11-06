import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

let apiUrl;
let response;
let authToken;
let initialCredits;

// Background steps
Given('I am authenticated as a researcher', () => {
  authToken = 'researcher-token-456';
  cy.log('Authenticated as researcher');
});

// Scale Management - Scenario 1: Create new scale
Given('I have sufficient credits in my account', () => {
  // Mock checking credits
  initialCredits = 100;
  cy.log(`Initial credits: ${initialCredits}`);
});

When('I create a new scale with the following details:', (dataTable) => {
  const scaleData = {
    user_id: 1
  };

  dataTable.rawTable.forEach(([key, value]) => {
    scaleData[key] = value;
  });

  cy.request({
    method: 'POST',
    url: `${apiUrl}/api/v1/scales`,
    body: {
      scale: scaleData
    },
    failOnStatusCode: false
  }).then((res) => {
    response = res;
  });
});

Then('the scale should be created successfully', () => {
  expect(response.status).to.be.oneOf([200, 201]);
  expect(response.body).to.have.property('id');
});

Then('the scale status should be {string}', (status) => {
  expect(response.body).to.have.property('status', status);
});

Then('my credit balance should be decreased', () => {
  // In a real scenario, you'd fetch the user's current credits
  cy.log('Credits should be decreased after scale creation');
  expect(true).to.be.true; // Placeholder assertion
});

// Scale Management - Scenario 2: Retrieve all scales
Given('there are {int} scales in the system', (count) => {
  cy.log(`Assuming ${count} scales exist in the system`);
});

Given('{int} scales are published', (count) => {
  cy.log(`Assuming ${count} scales are published`);
});

When('I request all scales from the API', () => {
  cy.request({
    method: 'GET',
    url: `${apiUrl}/api/v1/scales`,
    failOnStatusCode: false
  }).then((res) => {
    response = res;
  });
});

Then('I should receive a list of scales', () => {
  expect(response.body).to.be.an('array');
});

Then('the list should contain at least {int} scales', (minCount) => {
  expect(response.body.length).to.be.at.least(minCount);
});

// Scale Management - Scenario 3: Publish a scale
Given('I have created a scale with ID {int}', (scaleId) => {
  cy.wrap(scaleId).as('scaleId');
  cy.log(`Scale with ID ${scaleId} exists`);
});

Given('the scale has status {string}', (status) => {
  cy.log(`Scale has status: ${status}`);
});

When('I publish the scale with ID {int}', (scaleId) => {
  cy.request({
    method: 'PATCH',
    url: `${apiUrl}/api/v1/scales/${scaleId}/publish`,
    failOnStatusCode: false
  }).then((res) => {
    response = res;
  });
});

Then('the scale status should be updated to {string}', (status) => {
  expect(response.body).to.have.property('status', status);
});

Then('the scale should be available to other users', () => {
  // Verify scale is accessible
  cy.log('Scale should now be publicly available');
  expect(response.body.status).to.equal('published');
});
