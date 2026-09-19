import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { state } from "../../support/state";

const questionsFor = (count) =>
  Array.from({ length: count }, (_, i) => ({ text: `Question ${i + 1}`, min_value: 0, max_value: 4 }));

Given("I have a draft scale titled {string}", (title) => {
  cy.apiCreateScale(state.user.token, title).then((scale) => {
    state.scale = scale;
  });
});

Given("I have a draft scale titled {string} with {int} question(s)", (title, count) => {
  cy.apiCreateScale(state.user.token, title, questionsFor(count)).then((scale) => {
    state.scale = scale;
  });
});

Given("I have a published scale titled {string} with {int} question(s)", (title, count) => {
  cy.apiCreateScale(state.user.token, title, questionsFor(count)).then((scale) => {
    state.scale = scale;
    cy.apiPublishScale(state.user.token, scale.id);
  });
});

When("I delete question {int}", (number) => {
  cy.get(`button[aria-label="Delete question ${number}"]`).click();
  cy.get('[role="alertdialog"]').contains("button", "Delete question").click();
});

When("I confirm with {string}", (label) => {
  cy.get('[role="alertdialog"]').contains("button", label).click();
});

When("I add a question to my scale through the API", () => {
  cy.apiAuthed(state.user.token, "POST", `/scales/${state.scale.id}/questions`, {
    question: { text: "Late addition", position: 99, min_value: 0, max_value: 4 },
  }).then((res) => {
    state.apiResponse = res;
  });
});

Then("I should not see a {string} button", (label) => {
  cy.contains("button", label).should("not.exist");
});

When("I open the new scale page", () => {
  cy.visit("/scales/new");
});

When("I create a scale titled {string}", (title) => {
  cy.field("Title").type(title);
  cy.contains("button", "Create scale").click();
});

When("I open my scale page", () => {
  cy.visit(`/scales/${state.scale.id}`);
});

When("I add a question {string} with range {int} to {int}", (text, min, max) => {
  cy.field("Text").type(text);
  cy.field("Min value").clear().type(String(min));
  cy.field("Max value").clear().type(String(max));
  cy.contains("button", "Add question").click();
});

When("I create a survey titled {string}", (title) => {
  cy.field("New survey title").type(title);
  cy.contains("button", "Create survey").click();
});

Then("I should be on a scale page", () => {
  cy.url().should("match", /\/scales\/\d+$/);
});

Then("I should be on a survey page", () => {
  cy.url().should("match", /\/surveys\/\d+$/);
});

Then("the public link should point to the take page", () => {
  cy.get("input[readonly]").invoke("val").should("match", /\/take\/\d+$/);
});
