import { Before, Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { state, resetState } from "../../support/state";

Before(() => {
  resetState();
});

Given("a registered user exists", () => {
  cy.apiCreateUser().then((user) => {
    state.user = user;
  });
});

Given("another registered user exists", () => {
  cy.apiCreateUser().then((user) => {
    state.otherUser = user;
  });
});

Given("I am logged in through the UI", () => {
  cy.uiLogin(state.user.email, state.user.password);
});

When("I click {string}", (text) => {
  cy.contains("button, a", text).click();
});

Then("I should see {string}", (text) => {
  cy.contains(text).should("be.visible");
});

Then("I should not see {string}", (text) => {
  cy.contains(text).should("not.exist");
});

Then("I should be on the dashboard", () => {
  cy.url().should("include", "/dashboard");
});

Then("I should be on the login page", () => {
  cy.url().should("include", "/login");
});

Then("the {string} button should be disabled", (text) => {
  cy.contains("button", text).should("be.disabled");
});

Then("the API responds with status {int}", (status) => {
  expect(state.apiResponse.status).to.eq(status);
});
