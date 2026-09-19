Feature: Survey Responses
  As a participant
  I want to answer a survey through its public link
  So that the researcher can see my score

  Background:
    Given a researcher has a published survey with 2 questions

  Scenario: Participant submits a response without logging in
    When I open the public survey link
    And I enter my name "Jane Participant"
    And I answer the questions with "3,2"
    And I click "Submit"
    Then I should see "Thanks for completing the survey"
    And I should see "Your score:"
    And I should see "5"

  Scenario: A participant has to answer before moving on
    When I open the public survey link
    And I enter my name "Jane Participant"
    And I continue without choosing an answer
    Then I should see "Choose an answer to continue."
    And I should see "Question 1 of 2"

  Scenario: A participant changes an answer on the review screen
    When I open the public survey link
    And I enter my name "Jane Participant"
    And I answer the questions with "3,2"
    Then I should see "Check your answers"
    When I change my answer to question 1
    And I answer the current question with "1"
    Then I should see "Check your answers"
    When I click "Submit"
    Then I should see "Your score:"
    And I should see "3"

  Scenario: Progress survives a page reload
    When I open the public survey link
    And I enter my name "Jane Participant"
    And I answer the current question with "4"
    And I reload the page
    Then I should see "Question 2 of 2"

  Scenario: Researcher reviews a submitted response
    Given a participant has submitted a response with answers "4,4"
    When I log in as the researcher through the UI
    And I open the survey page
    Then I should see "Jane Participant"
    When I click "Jane Participant"
    Then I should see "Score:"
    And I should see "8"
    And I should see "out of 8"
    And I should see "Question 2"

  Scenario: Another user can't open the researcher's survey page
    Given another registered user exists
    When the other user opens the survey page
    Then I should see "belongs to another account"

  Scenario: An out-of-range answer is rejected by the API
    When a participant submits an out-of-range answer
    Then the API responds with status 422
