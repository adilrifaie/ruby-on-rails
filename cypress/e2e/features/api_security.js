import { When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { state } from "../../support/state";

When("I request the scales list without a token", () => {
  cy.request({
    method: "GET",
    url: `${Cypress.env("apiUrl")}/api/v1/scales`,
    headers: { Accept: "application/json" },
    failOnStatusCode: false
  }).then((res) => {
    state.apiResponse = res;
  });
});

When("I register through the API asking for role {string} and {int} credits", (role, credits) => {
  cy.uniqueEmail("escalate").then((email) => {
    cy.request({
      method: "POST",
      url: `${Cypress.env("apiUrl")}/api/v1/users`,
      headers: { Accept: "application/json" },
      body: { user: { email, password: "Password123!", role, credits } },
      failOnStatusCode: false
    }).then((res) => {
      state.apiResponse = res;
    });
  });
});

When("I request the users list with a valid token", () => {
  cy.apiAuthed(state.user.token, "GET", "/users").then((res) => {
    state.apiResponse = res;
  });
});

When("the other user tries to publish my scale", () => {
  cy.apiAuthed(state.otherUser.token, "PATCH", `/scales/${state.scale.id}/publish`).then((res) => {
    state.apiResponse = res;
  });
});

Then("the new user has role {string} and {int} credits", (role, credits) => {
  const created = state.apiResponse.body.user || state.apiResponse.body;
  expect(created.role).to.eq(role);
  expect(created.credits).to.eq(credits);
});

Then("the response body should not contain {string}", (text) => {
  expect(JSON.stringify(state.apiResponse.body)).not.to.include(text);
});
