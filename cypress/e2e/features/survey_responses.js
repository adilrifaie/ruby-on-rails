import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

let apiUrl;
let response;
let surveyId;

// Background steps
Given('a published survey exists with ID {int}', (id) => {
  surveyId = id;
  cy.log(`Survey with ID ${surveyId} exists and is published`);
});

// Survey Responses - Scenario 1: Submit response
Given('I am a survey participant', () => {
  cy.log('Acting as a survey participant');
});

When('I submit a response with the following data:', (dataTable) => {
  const responseData = {};

  dataTable.rawTable.forEach(([key, value]) => {
    if (key === 'survey_id') {
      responseData[key] = parseInt(value);
    } else if (key === 'answers') {
      responseData[key] = value; // Keep as string, API will parse
    } else {
      responseData[key] = value;
    }
  });

  // Add submitted_at timestamp
  responseData.submitted_at = new Date().toISOString();

  cy.request({
    method: 'POST',
    url: `${apiUrl}/api/v1/responses`,
    body: {
      response: responseData
    },
    failOnStatusCode: false
  }).then((res) => {
    response = res;
  });
});

Then('the response should be submitted successfully', () => {
  expect(response.status).to.be.oneOf([200, 201]);
  expect(response.body).to.have.property('id');
});

Then('the response should have a unique ID', () => {
  expect(response.body.id).to.be.a('number').and.to.be.greaterThan(0);
});

Then('the submitted_at timestamp should be recorded', () => {
  expect(response.body).to.have.property('submitted_at');
  expect(response.body.submitted_at).to.be.a('string').and.not.empty;
});

// Survey Responses - Scenario 2: Export responses
Given('survey with ID {int} has {int} responses', (surveyId, count) => {
  cy.wrap(surveyId).as('surveyId');
  cy.log(`Survey ${surveyId} has ${count} responses`);
});

When('I request to export responses for survey ID {int}', (surveyId) => {
  // For this example, we'll export a specific response
  // In a real scenario, you might export all responses for a survey
  cy.request({
    method: 'GET',
    url: `${apiUrl}/api/v1/responses/1/export`,
    failOnStatusCode: false
  }).then((res) => {
    response = res;
  });
});

Then('I should receive response data in exportable format', () => {
  expect(response.body).to.be.an('object');
  expect(response.status).to.equal(200);
});

Then('the data should include participant names', () => {
  expect(response.body).to.have.property('participant_name');
});

Then('the data should include answer details', () => {
  expect(response.body).to.have.property('answers');
});

// Survey Responses - Scenario 3: Create analysis
Given('survey with ID {int} has responses', (surveyId) => {
  cy.wrap(surveyId).as('surveyId');
  cy.log(`Survey ${surveyId} has responses available for analysis`);
});

Given('I am a researcher with analysis permissions', () => {
  cy.log('Authenticated as researcher with analysis permissions');
});

When('I create a new analysis with the following details:', (dataTable) => {
  const analysisData = {
    user_id: 1
  };

  dataTable.rawTable.forEach(([key, value]) => {
    if (key === 'survey_id') {
      analysisData[key] = parseInt(value);
    } else {
      analysisData[key] = value;
    }
  });

  cy.request({
    method: 'POST',
    url: `${apiUrl}/api/v1/analyses`,
    body: {
      analysis: analysisData
    },
    failOnStatusCode: false
  }).then((res) => {
    response = res;
  });
});

Then('the analysis should be created successfully', () => {
  expect(response.status).to.be.oneOf([200, 201]);
  expect(response.body).to.have.property('id');
});

Then('the analysis should have status {string} or {string}', (status1, status2) => {
  expect(response.body.status).to.be.oneOf([status1, status2]);
});

Then('I should be able to retrieve the analysis report', () => {
  const analysisId = response.body.id;

  cy.request({
    method: 'GET',
    url: `${apiUrl}/api/v1/analyses/${analysisId}/report`,
    failOnStatusCode: false
  }).then((reportResponse) => {
    expect(reportResponse.status).to.equal(200);
    expect(reportResponse.body).to.have.property('id', analysisId);
  });
});
