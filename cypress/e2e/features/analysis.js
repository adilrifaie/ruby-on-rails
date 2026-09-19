import { When } from "@badeball/cypress-cucumber-preprocessor";

const submitAnalysis = () => {
  cy.intercept("POST", "**/api/v1/analyses").as("createAnalysis");
  cy.contains("button", "Run analysis").click();
  cy.wait("@createAnalysis");
};

When("I run a {string} analysis", (type) => {
  cy.field("Type").select(type);
  submitAnalysis();
});

When("I run a correlation analysis between the first and second question", () => {
  cy.field("Type").select("correlation");
  cy.field("Question A").select(1);
  cy.field("Question B").select(2);
  submitAnalysis();
});
