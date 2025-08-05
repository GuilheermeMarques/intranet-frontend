// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Import Testing Library commands
import '@testing-library/cypress/add-commands';

// Declare global Cypress commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with credentials
       * @example cy.login('admin@empresa.com', 'admin123')
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>;

      /**
       * Custom command to navigate to a page
       * @example cy.navigateTo('/clients')
       */
      navigateTo(path: string): Chainable<void>;

      /**
       * Custom command to wait for page load
       * @example cy.waitForPageLoad()
       */
      waitForPageLoad(): Chainable<void>;
    }
  }
}
