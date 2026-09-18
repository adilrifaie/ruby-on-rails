import { When } from "@badeball/cypress-cucumber-preprocessor";

const submitAnalysis = () => {
  cy.intercept("POST", "**/api/v1/analyses").as("createAnalysis");
  cy.contains("button", "Run analysis").click();
  cy.wait("@createAnalysis");
};

When("I run a {string} analysis", (type) => {
  cy.contains("label", "Type").find("select").select(type);
  submitAnalysis();
});

When("I run a correlation analysis between the first and second question", () => {
  cy.contains("label", "Type").find("select").select("correlation");
  cy.contains("label", "Question A").find("select").select(1);
  cy.contains("label", "Question B").find("select").select(2);
  submitAnalysis();
});
