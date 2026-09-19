Feature: Statistical Analysis
  As a researcher
  I want to run analyses on collected responses
  So that I can interpret my survey results

  Background:
    Given a researcher has a published survey with 2 questions
    And a participant has submitted a response with answers "4,2"
    And a participant has submitted a response with answers "1,3"
    And I log in as the researcher through the UI
    And I open the survey page

  Scenario: Run a descriptive analysis and view its report
    When I run a "descriptive" analysis
    Then I should see "5 credits"
    When I click "descriptive"
    Then I should see "2 responses"
    And I should see "mean"

  Scenario: Run a correlation analysis between two questions
    When I run a correlation analysis between the first and second question
    Then I should see "10 credits"
    When I click "correlation"
    Then I should see "Strong negative"
    And I should see "Question 2"

  Scenario: A factor summary report lists every question
    When I run a "factor" analysis
    And I click "factor"
    Then I should see "not a statistical factor analysis"
    And I should see "Question 1"
    And I should see "Show raw data"

  Scenario: The analyses tab can be opened from a link
    When I open the survey's analyses tab from its link
    Then I should see "Run an analysis"

  Scenario: Running out of credits is rejected
    When I run a "factor" analysis
    And I run a "factor" analysis
    Then I should see "insufficient"
