import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { state } from "../../support/state";

Given("I am on the register page", () => {
  cy.visit("/register");
});

When("I register with a new email and password {string}", (password) => {
  cy.uniqueEmail("register").then((email) => {
    cy.field("Email").type(email);
    cy.field("Password").type(password);
    cy.contains("button", "Create account").click();
  });
});

When("I log in through the UI with those credentials", () => {
  cy.uiLogin(state.user.email, state.user.password);
});

When("I log in through the UI with the password {string}", (password) => {
  cy.visit("/login");
  cy.field("Email").type(state.user.email);
  cy.field("Password").type(password);
  cy.contains("button", "Log in").click();
});

When("I log out from the account menu", () => {
  cy.get('button[aria-label^="Account menu"]').click();
  cy.contains('[role="menuitem"]', "Log out").click();
});

When("I visit the landing page", () => {
  cy.visit("/");
});

Then("I should be on the register page", () => {
  cy.url().should("match", /\/register$/);
});

When("I visit the dashboard without logging in", () => {
  cy.visit("/dashboard");
});
