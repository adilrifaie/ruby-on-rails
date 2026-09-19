Feature: Authentication
  As a visitor
  I want to register and log in
  So that I can manage my own scales and surveys

  Scenario: Register a new account through the UI
    Given I am on the register page
    When I register with a new email and password "Password123!"
    Then I should be on the dashboard
    And I should see "Credit balance:"
    And I should see "20"

  Scenario: Log in with valid credentials
    Given a registered user exists
    When I log in through the UI with those credentials
    Then I should be on the dashboard

  Scenario: Reject a wrong password
    Given a registered user exists
    When I log in through the UI with the password "WrongPassword1!"
    Then I should see "Invalid email or password"
    And I should be on the login page

  Scenario: Protected pages redirect anonymous visitors to login
    When I visit the dashboard without logging in
    Then I should be on the login page

  Scenario: Log out
    Given a registered user exists
    And I am logged in through the UI
    When I log out from the account menu
    Then I should be on the login page
    And I should see "You're logged out."
