Feature: API Security
  As the platform owner
  I want the API to enforce authentication and ownership
  So that user data and credits cannot be tampered with

  Scenario: Requests without a token are rejected
    When I request the scales list without a token
    Then the API responds with status 401

  Scenario: Registration cannot grant a role or credits
    When I register through the API asking for role "admin" and 9999 credits
    Then the API responds with status 201
    And the new user has role "student" and 20 credits

  Scenario: Password digest is never exposed
    Given a registered user exists
    When I request the users list with a valid token
    Then the response body should not contain "password_digest"

  Scenario: Only the owner can publish a scale
    Given a registered user exists
    And I have a draft scale titled "Owner Scale" with 1 question
    And another registered user exists
    When the other user tries to publish my scale
    Then the API responds with status 403
