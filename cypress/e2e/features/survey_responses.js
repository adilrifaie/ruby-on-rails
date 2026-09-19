import { Given, When } from "@badeball/cypress-cucumber-preprocessor";
import { state } from "../../support/state";

Given("a researcher has a published survey with {int} questions", (count) => {
  const questions = Array.from({ length: count }, (_, i) => ({ text: `Question ${i + 1}`, min_value: 0, max_value: 4 }));
  cy.apiCreateUser().then((researcher) => {
    state.user = researcher;
    cy.apiCreateScale(researcher.token, "Cypress Scale", questions).then((scale) => {
      state.scale = scale;
      cy.apiPublishScale(researcher.token, scale.id);
      cy.apiCreateSurvey(researcher.token, scale.id, "Cypress Survey").then((survey) => {
        state.survey = survey;
        cy.apiAuthed(researcher.token, "GET", `/scales/${scale.id}`).then((res) => {
          state.questions = res.body.questions;
        });
      });
    });
  });
});

Given("a participant has submitted a response with answers {string}", (answers) => {
  const payload = answers.split(",").map((value, i) => ({ question_id: state.questions[i].id, value: Number(value) }));
  cy.apiSubmitResponse(state.survey.id, "Jane Participant", payload).its("status").should("eq", 201);
});

When("I open the public survey link", () => {
  cy.visit(`/take/${state.survey.id}`);
});

When("I enter my name {string}", (name) => {
  cy.field("Your name").type(name);
});

When("I answer the questions with {string}", (values) => {
  values.split(",").forEach((value, i) => {
    cy.get(".question-block input").eq(i).type(value);
  });
});

When("I log in as the researcher through the UI", () => {
  cy.uiLogin(state.user.email, state.user.password);
});

When("I open the survey page", () => {
  cy.visit(`/surveys/${state.survey.id}`);
});

When("the other user opens the survey page", () => {
  cy.uiLogin(state.otherUser.email, state.otherUser.password);
  cy.visit(`/surveys/${state.survey.id}`);
});

When("a participant submits an out-of-range answer", () => {
  cy.apiSubmitResponse(state.survey.id, "Out Of Range", [{ question_id: state.questions[0].id, value: 99 }]).then((res) => {
    state.apiResponse = res;
  });
});
