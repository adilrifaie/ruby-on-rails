Feature: Survey Response Collection and Analysis
  As a researcher
  I want to collect and analyze survey responses
  So that I can gather meaningful healthcare data

  Background:
    Given the API server is running at "http://localhost:3000"
    And a published survey exists with ID 1

  Scenario: Submit a patient survey response
    Given I am a survey participant
    When I submit a response with the following data:
      | participant_name | John Smith                          |
      | survey_id        | 1                                   |
      | answers          | {"q1": "4", "q2": "3", "q3": "5"}   |
    Then the response should be submitted successfully
    And the response status code should be 201
    And the response should have a unique ID
    And the submitted_at timestamp should be recorded

  Scenario: Export survey responses for analysis
    Given survey with ID 1 has 10 responses
    When I request to export responses for survey ID 1
    Then the response status code should be 200
    And I should receive response data in exportable format
    And the data should include participant names
    And the data should include answer details

  Scenario: Create statistical analysis for survey
    Given survey with ID 1 has responses
    And I am a researcher with analysis permissions
    When I create a new analysis with the following details:
      | survey_id     | 1            |
      | analysis_type | descriptive  |
    Then the analysis should be created successfully
    And the response status code should be 201
    And the analysis should have status "pending" or "completed"
    And I should be able to retrieve the analysis report
