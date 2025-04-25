# Component Testing Description

## Overview
This document describes the component testing performed for various buttons in a React application, including the Login, Logout, Create Game, Delete Game, Register, and Back to Dashboard buttons. The tests are implemented using Vitest and React Testing Library, following a consistent format to ensure high coverage, clarity, and alignment with accessibility standards. Each test suite verifies rendering, interaction, error handling, styling, accessibility, and edge cases.

## 1. Login Component (Login.test.jsx)
### Description
The `Login.test.jsx` suite tests the "Login" button within the `Login` component, which handles user authentication by submitting email and password inputs. The button triggers an API call to authenticate the user and updates localStorage upon success.

### Tests Performed
- **Test 1: Renders button correctly**
  - Verifies the button renders with the text "Login" and is not disabled when not loading.
  - Uses `getByRole('button', { name: /login the dashboard/i })` to match the button's `aria-label`.
- **Test 2: Triggers login with valid inputs**
  - Simulates entering valid email and password, clicking the button, and verifies the button text changes to "Logging in..." (using `getByText(/logging in/i)`) and becomes disabled.
  - Confirms the `axios.post` call to `http://localhost:5005/admin/auth/login` with correct inputs, the `successJob` callback is invoked with the token and email, and `localStorage` stores the email.
  - Ensures no error is triggered via `showError`.
- **Test 3: Triggers error without inputs**
  - Clicks the button without entering email or password and verifies the `showError` callback is called with "Please enter both email and password."
  - Confirms the button remains with "Login" text and is not disabled.
- **Test 4: Correct width in mobile view**
  - Simulates mobile view (`useMediaQuery` returns `true`) and checks if the button has `width: 30vw`.
- **Test 5: Correct width in desktop view**
  - Simulates desktop view (`useMediaQuery` returns `false`) and checks if the button has `width: 22.5vw`.
- **Test 6: Does not trigger login when disabled**
  - Simulates a pending login request (mocked `axios.post` hangs), clicks the button with valid inputs, and verifies the button text changes to "Logging in..." and becomes disabled.
  - Attempts to click the button again while disabled and confirms no additional `axios.post` calls or errors are triggered.

## 2. Logout Button (LogoutButton.test.jsx)
### Description
The `LogoutButton.test.jsx` suite tests the "Logout" button in the Pages component, which logs out the user by clearing the token and navigating to the login page.

### Tests Performed
- **Test 1: Renders button with "Logout" text**
  - Verifies the button renders with "Logout" text when a token exists and is not disabled.
- **Test 2: Displays "Logging out..." when loading**
  - Simulates a pending logout request, clicks the button, and checks if it shows "Logging out..." and is disabled.
- **Test 3: Triggers logout with valid token**
  - Clicks the button with a valid token, verifies the `axios.post` logout request, token/email removal, and navigation to `/login`.
- **Test 4: Renders Register/Login links when no token**
  - Verifies that when no token exists, the "Logout" button is not rendered, and "Register" and "Login" links are displayed.
- **Test 5: Correct padding in mobile view**
  - Simulates mobile view and checks if the button has `padding: 1.5vh 4vw`.
- **Test 6: Correct padding in desktop view**
  - Simulates desktop view and checks if the button has `padding: 1vh 2vw`.
- **Test 7: Does not trigger logout when disabled**
  - Simulates a pending logout request, clicks the button while disabled, and verifies no additional `axios` calls.

## 3. Create Game Button (CreateGameButton.test.jsx)
### Description
The `CreateGameButton.test.jsx` suite tests the "Create Game" button in the Dashboard component, which opens a modal for creating a new game.

### Tests Performed
- **Test 1: Renders button with "Create Game" text**
  - Verifies the button renders with "Create Game" text and is not disabled.
- **Test 2: Opens create game modal when clicked**
  - Clicks the button and checks if the "Create New Game" modal appears.
- **Test 3: Disabled during loading state**
  - Simulates a pending game fetch, verifies the button is disabled and styled with `background-color: #a3bffa`.
- **Test 4: Correct width in mobile view**
  - Simulates mobile view and checks if the button has `width: 24vw`.
- **Test 5: Correct width in desktop view**
  - Simulates desktop view and checks if the button has `width: 9vw`.
- **Test 6: Correct aria-label for accessibility**
  - Verifies the button has `aria-label="Create a new game"`.
- **Test 7: Does not trigger modal when disabled**
  - Simulates a pending game fetch, clicks the button while disabled, and verifies the modal does not appear.

## 4. Delete Game Button (DeleteGameButton.test.jsx)
### Description
The `DeleteGameButton.test.jsx` suite tests the "Delete Game" button in the Dashboard component, which opens a confirmation modal to delete a game.

### Tests Performed
- **Test 1: Renders button with "Delete Game" text**
  - Verifies the button renders with "Delete Game" text and is not disabled when the game is inactive.
- **Test 2: Opens delete confirmation modal**
  - Clicks the button and checks if the "Are you sure you want to delete this game?" modal appears.
- **Test 3: Disabled when game is active**
  - Simulates an active game, verifies the button is disabled and styled with `background-color: #a3bffa`.
- **Test 4: Correct width in mobile view**
  - Simulates mobile view and checks if the button has `width: 24vw`.
- **Test 5: Correct width in desktop view**
  - Simulates desktop view and checks if the button has `width: 9vw`.
- **Test 6: Correct aria-label for accessibility**
  - Verifies the button has `aria-label="Delete game ${gameName}"`.
- **Test 7: Does not trigger modal when disabled**
  - Simulates an active game, clicks the button while disabled, and verifies the modal does not appear.

## 5. Register Button (RegisterButton.test.jsx)
### Description
The `RegisterButton.test.jsx` suite tests the "Register" button in the Register component, which handles user registration by submitting email, username, password, and confirm password inputs.

### Tests Performed
- **Test 1: Renders button with "Register" text**
  - Verifies the button renders with "Register" text and is not disabled.
- **Test 2: Displays "Registering..." when loading**
  - Simulates a pending registration request, clicks the button, and checks if it shows "Registering..." and is disabled.
- **Test 3: Triggers registration with valid inputs**
  - Simulates valid inputs, clicks the button, and verifies the `successJob` callback and `localStorage` updates.
- **Test 4: Triggers error with missing inputs**
  - Clicks the button without inputs and verifies the `showError` callback with "Please fill in all fields."
- **Test 5: Triggers error with mismatched passwords**
  - Simulates mismatched passwords, clicks the button, and verifies the `showError` callback with "Passwords do not match."
- **Test 6: Correct width in desktop view**
  - Simulates desktop view and checks if the button has `width: 24vw`.
- **Test 7: Does not trigger registration when disabled**
  - Simulates a pending registration request, clicks the button while disabled, and verifies no additional errors.

## 6. Back to Dashboard Button (BackToDashboardButton.test.jsx)
### Description
The `BackToDashboardButton.test.jsx` suite tests the "Back to Dashboard" button in the GameEditor component, which navigates the user back to the dashboard.

### Tests Performed
- **Test 1: Renders button with "Back to Dashboard" text**
  - Verifies the button renders with "Back to Dashboard" text and is not disabled when a game is loaded.
- **Test 2: Navigates to dashboard when clicked**
  - Clicks the button and verifies navigation to `/dashboard`.
- **Test 3: Displays "Game not found" when game is not found**
  - Simulates no matching game, verifies the "Game not found" text is displayed, and confirms the button is not rendered.
- **Test 4: Correct padding in mobile view**
  - Simulates mobile view and checks if the button has `padding: 1.5vh 3vw`.
- **Test 5: Correct padding in desktop view**
  - Simulates desktop view and checks if the button has `padding: 1vh 2vw`.
- **Test 6: Correct aria-label for accessibility**
  - Verifies the button has `aria-label="Return to dashboard"`.
- **Test 7: Navigates to login when no token exists**
  - Simulates no token, verifies the "No token found. Please log in again." text, and confirms navigation to `/login`.





# UI Testing Description
1. Admin Happy Path (admin.cy.js)

Description
The admin.cy.js suite tests the happy path of an Admin user in the application using Cypress for end-to-end (E2E) testing. It covers the full workflow of an Admin, from registration to logout and re-login, ensuring all critical actions succeed.

Test 1: Registers successfully
Visits the registration page (/register), enters email, username, password, and confirm password, clicks the "Register now" button, and waits for the action to complete.

Test 2: Creates a new game successfully
Logs in, clicks "Create a new game", enters a game name, uploads a JSON file (src/2.5.json), and clicks "Create new game" to confirm creation.

Test 3: Updates the thumbnail and name of the game successfully
Clicks "Edit game", navigates to question editing, adds a new question with text, time limit, and answers, marks the correct answer, saves the question, updates the game name, uploads a new thumbnail (src/16pic.jpg), and saves the changes.

Test 4: Starts a game successfully
Clicks "Start game", verifies the session ID is displayed, and navigates to the current game session.

Test 5: Ends a game successfully
Navigates to the game session, advances through questions multiple times, and clicks "Show game results" to end the game.

Test 6: Loads the results page successfully
Clicks "Review sessions for game", navigates to the results page, and verifies the "Result" text is displayed.

Test 7: Logs out of the application successfully
Clicks the "Logout" button and waits for the logout action to complete.

Test 8: Logs back into the application successfully
Visits the login page (/login), enters email and password, clicks "Login the dashboard", and waits for the login action to complete.

2. Player Happy Path (user.cy.js)

Description
The user.cy.js suite tests the happy path of a Player user in the application using Cypress for end-to-end (E2E) testing. It covers the player’s journey of joining a game, answering a question, and viewing results.

Test 1: Registers successfully
Visits the registration page (/register), enters email, username, password, and confirm password, clicks the "Register now" button, and waits for the action to complete.

Test 2: Player attends game
Logs in as an Admin, starts a game, copies the game session link, visits the link, enters a player name, and clicks "Join the game" to join the session.

Test 3: Player chooses answer
Advances the game (as Admin via API), selects an answer option (#answer-3), clicks "Submit your answer", and closes the submission modal.

Test 4: Shows results
Assumes the game ends (via Admin actions in a separate test), and verifies that the player can view the results (though not explicitly tested here due to dependency on Admin actions).