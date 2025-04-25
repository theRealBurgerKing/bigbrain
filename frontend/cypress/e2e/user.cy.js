/* global describe, before, it, cy, beforeEach */
describe('User Happy Path', () => {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  const admin = 'admin';
  const gameName = 'Test Game';
  const UserName = 'MyName';
  
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
  
  it('Play a new game successfully', () => {
    cy.get(`[aria-label="Start game ${gameName}"]`).click();
    cy.get(`[aria-label="Game ID of ${gameName}"]`).invoke('text').then((text) => {
      const gameId = text.replace('GameID:', '').trim();
      cy.wrap(gameId).as('gameId');
    });
    cy.get('[aria-label="Copy game session link"]').click();
    cy.wait(1000);
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      cy.wrap(token).as('token');
    });
    cy.window()
      .then((win) => win.navigator.clipboard.readText())
      .then((clipboardText) => {
        cy.visit(clipboardText);
      });


        
    cy.get('[aria-label="Player name"]').type(UserName);
    cy.get('[aria-label="Join the game"]').click();
      
    cy.get('@gameId').then((gameId) => {
      cy.get('@token').then((token) => {
        cy.request({
          method: 'POST',
          url: `http://localhost:5005/admin/game/${gameId}/mutate`,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: {
            mutationType: 'ADVANCE',
          },
        }).then(() => {
          cy.wait(2000).then(() => {
            cy.get('#answer-3');
            cy.get('[aria-label="Submit your answer"]').click();
            cy.wait(1000);
            cy.get('[aria-label="Close modal"]').click();
          }
          );
        });
              
      });
    });



  });
      
});