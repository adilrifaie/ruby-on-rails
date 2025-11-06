Feature: Healthcare Scale Management
  As a researcher
  I want to create and manage healthcare assessment scales
  So that I can conduct clinical research studies

  Background:
    Given the API server is running at "http://localhost:3000"
    And I am authenticated as a researcher

  Scenario: Create a new healthcare assessment scale
    Given I have sufficient credits in my account
    When I create a new scale with the following details:
      | title       | Patient Depression Screening Scale |
      | description | A comprehensive depression assessment tool for primary care |
      | version     | 1.0                                 |
      | status      | draft                               |
    Then the scale should be created successfully
    And the response status code should be 201
    And the scale status should be "draft"
    And my credit balance should be decreased

  Scenario: Retrieve all published healthcare scales
    Given there are 5 scales in the system
    And 3 scales are published
    When I request all scales from the API
    Then the response status code should be 200
    And I should receive a list of scales
    And the list should contain at least 3 scales

  Scenario: Publish a draft scale
    Given I have created a scale with ID 1
    And the scale has status "draft"
    When I publish the scale with ID 1
    Then the response status code should be 200
    And the scale status should be updated to "published"
    And the scale should be available to other users
