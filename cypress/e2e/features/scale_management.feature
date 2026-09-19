Feature: Scale Management
  As a researcher
  I want to build, publish and distribute an assessment scale
  So that participants can respond to it

  Background:
    Given a registered user exists
    And I am logged in through the UI

  Scenario: Create a new scale
    When I open the new scale page
    And I create a scale titled "Depression Screening"
    Then I should be on a scale page
    And I should see "Depression Screening"

  Scenario: Add a question to a scale
    Given I have a draft scale titled "Anxiety Screening"
    When I open my scale page
    And I add a question "I felt nervous" with range 0 to 4
    Then I should see "I felt nervous"

  Scenario: Delete a question from a scale
    Given I have a draft scale titled "Sleep Screening" with 1 question
    When I open my scale page
    And I delete question 1
    Then I should not see "Question 1"

  Scenario: Set scoring bands on a draft scale
    Given I have a draft scale titled "Stress Screening" with 2 questions
    When I open my scale page
    And I click "Suggest 4 bands"
    And I click "Save scoring bands"
    Then I should see "Scoring bands saved."

  Scenario: Publish a scale and create a survey from it
    Given I have a draft scale titled "Mood Screening" with 2 questions
    When I open my scale page
    And I click "Publish scale"
    And I confirm with "Publish"
    Then I should see "Published"
    And I should see "questions are locked"
    And I should not see a "Add question" button
    When I create a survey titled "Spring Cohort"
    Then I should be on a survey page
    And I should see "Spring Cohort"
    And the public link should point to the take page

  Scenario: The publish button is disabled while a scale has no questions
    Given I have a draft scale titled "Empty Scale"
    When I open my scale page
    Then the "Publish scale" button should be disabled
    And I should see "Add a question to publish."

  Scenario: The API refuses new questions on a published scale
    Given I have a published scale titled "Locked Scale" with 2 questions
    When I add a question to my scale through the API
    Then the API responds with status 422
