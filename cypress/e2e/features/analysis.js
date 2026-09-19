import { When } from "@badeball/cypress-cucumber-preprocessor";
import { state } from "../../support/state";

When("I open the survey's analyses tab from its link", () => {
  cy.visit(`/surveys/${state.survey.id}?tab=analyses`);
});

const openAnalysesTab = () => {
  cy.contains('[role="tab"]', "Analyses").click();
};

const chooseType = (type) => {
  cy.get(`[role="radio"][value="${type}"]`).click();
};

const submitAnalysis = () => {
  cy.intercept("POST", "**/api/v1/analyses").as("createAnalysis");
  cy.contains("button", "Run analysis").click();
  cy.wait("@createAnalysis");
};

When("I run a {string} analysis", (type) => {
  openAnalysesTab();
  chooseType(type);
  submitAnalysis();
});

When("I run a correlation analysis between the first and second question", () => {
  openAnalysesTab();
  chooseType("correlation");
  cy.field("Question A").select(1);
  cy.field("Question B").select(2);
  submitAnalysis();
});
