Feature: User Management
  As a healthcare platform administrator
  I want to manage user accounts
  So that researchers and students can access the system

  Background:
    Given the API server is running at "http://localhost:3000"

  Scenario: Create a new researcher user account
    Given I am an administrator
    When I create a new user with the following details:
      | email            | test.researcher@hospital.com |
      | password         | SecurePass123!               |
      | role             | researcher                   |
      | credits          | 100                          |
    Then the user should be created successfully
    And the response status code should be 201
    And the user should have "researcher" role
    And the user should have 100 credits

  Scenario: Retrieve all users from the system
    Given there are 3 users in the system
    When I request all users from the API
    Then the response status code should be 200
    And I should receive a list of users
    And the list should contain at least 3 users

  Scenario: Retrieve a specific user by ID
    Given a user exists with ID 1
    When I request user details for ID 1
    Then the response status code should be 200
    And the response should contain user details
    And the user email should not be empty
