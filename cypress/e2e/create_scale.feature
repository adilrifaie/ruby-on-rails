Feature: Scale Management
  As a user,
  I want to create a new scale
  So that I can use it in my surveys.

  Scenario: Create a new scale with valid data
    Given I am on the new scale page
    When I fill in "name" with "Depression"
    And I fill in "instructions" with "Please rate your feelings of depression."
    And I fill in "options" with "Not at all, Sometimes, Often, Always"
    And I click "Create Scale"
    Then I should see "Scale was successfully created."
    And I should be on the "Depression" scale page
