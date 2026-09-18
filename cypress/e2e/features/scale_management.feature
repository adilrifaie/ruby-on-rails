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
    And I click "Delete"
    Then I should not see "Question 1"

  Scenario: Publish a scale and create a survey from it
    Given I have a draft scale titled "Mood Screening" with 2 questions
    When I open my scale page
    And I click "Publish scale"
    Then I should see "published"
    When I create a survey titled "Spring Cohort"
    Then I should be on a survey page
    And I should see "Spring Cohort"
    And the public link should point to the take page

  Scenario: The publish button is disabled while a scale has no questions
    Given I have a draft scale titled "Empty Scale"
    When I open my scale page
    Then the "Publish scale" button should be disabled
