// Custom commands for Cypress

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/home');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

Cypress.Commands.add('navigateTo', (path: string) => {
  cy.visit(path);
  cy.waitForPageLoad();
});

Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-testid="loading-spinner"]', { timeout: 10000 }).should('not.exist');
  cy.get('body').should('not.contain', 'Carregando...');
});

// Note: visit override removed due to TypeScript compatibility issues
// Use cy.login() before visiting protected routes instead
