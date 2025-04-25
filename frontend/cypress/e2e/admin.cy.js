/* global describe, before, it, cy, beforeEach */
describe('Admin Happy Path', () => {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  const admin = 'admin';
  const gameName = 'Test Game';
  const newGameName = 'Updated Game Name';

  before('Registers successfully', () => {
    cy.visit('http://localhost:3000/register');
    cy.get('[aria-label="Email address"]').type(adminEmail);
    cy.get('[aria-label="Username"]').type(admin);
    cy.get('[aria-label="Password"]').type(adminPassword);
    cy.get('[aria-label="Confirm password"]').type(adminPassword);
    cy.get('[aria-label="Register now"]').click();
    cy.wait(1000);
  });

  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
    cy.get('[aria-label="Email Address"]').type(adminEmail);
    cy.get('[aria-label="Password"]').type(adminPassword);
    cy.get('[aria-label="Login the dashboard"]').click();
    cy.wait(1000);
  });


  it('Creates a new game successfully', () => {
    cy.get('[aria-label="Create a new game"]').click();
    cy.get('[aria-label="Game Name"]').type(gameName);
    cy.get('[aria-label="Upload JSON file"]').selectFile('src/2.5.json');
    cy.get('[aria-label="Create new game"]').click();
    cy.wait(1000);
  });

  it('Updates the thumbnail and name of the game successfully', () => {
    cy.get(`[aria-label="Edit game ${gameName}"]`).click();
    cy.get(`[aria-label="Edit questions for this game"]`).click();
    cy.get(`[aria-label="Add a new question"]`).click();
    cy.get(`[aria-label="Question text"]`).type('What is the capital of France?');
    cy.get(`[aria-label="Time limit in seconds"]`).clear().type('15');
    cy.get(`[aria-label="Answer 1"]`).type('Paris');
    cy.get(`[aria-label="Answer 2"]`).type('London');
    cy.get(`[aria-label="Add a new answer option"]`).click();
    cy.get(`[aria-label="Answer 3"]`).type('Berlin');
    cy.get(`[aria-label="Mark answer 1 as correct"]`).click();
    cy.wait(1000);
    cy.get(`[aria-label="Save question"]`).click();
    cy.get('[aria-label="Return to game editor"]').click();
    cy.get(`[aria-label="Game name"]`).clear().clear().type(newGameName)
    cy.get('[aria-label="Upload game thumbnail"]').selectFile('src/16pic.jpg');
    cy.wait(1000);
    cy.get('[aria-label="Save game changes"]').click();
    cy.wait(1000);
  });

  it('Starts a game successfully', () => {
    cy.wait(1000);
    cy.get(`[aria-label="Start game ${gameName}"]`).click();
    cy.contains('Session ID');
    cy.wait(1000);
    cy.get(`[aria-label="Show current game session"]`).click();
  });

  it('Ends a game successfully', () => {
    cy.get(`[aria-label="Show game ${gameName}"]`).click();
    cy.wait(2000);
    cy.get('[aria-label="Advance to the next question"]').click();
    cy.wait(1000);
    cy.get('[aria-label="Advance to the next question"]').click();
    cy.wait(1000);
    cy.get('[aria-label="Advance to the next question"]').click();
    cy.wait(1000);
    cy.get('[aria-label="Advance to the next question"]').click();
    cy.wait(1000);
    cy.get('[aria-label="Advance to the next question"]').click();
    cy.wait(1000);
    cy.get('[aria-label="Show game results"]').click();
    cy.wait(2000);
  });

  it('Loads the results page successfully', () => {
    cy.get(`[aria-label="Review sessions for game ${gameName}"]`).click();
    cy.wait(1000);
    cy.contains('Result').click();
    cy.wait(1000);
  });

  it('Logs out successfully', () => {
    cy.get('[aria-label="Logout"]').click();
    cy.wait(2000);
  });
});