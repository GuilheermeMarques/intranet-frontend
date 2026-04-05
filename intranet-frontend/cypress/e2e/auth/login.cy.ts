describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('[data-testid="login-form"]').should('be.visible');
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="login-button"]').should('be.visible');
  });

  it('should login with valid credentials', () => {
    cy.login('admin@empresa.com', 'admin123');
    cy.url().should('include', '/home');
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });

  it('should show error with invalid credentials', () => {
    cy.get('[data-testid="email-input"]').type('invalid@email.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();

    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Credenciais inválidas');
  });

  it('should validate required fields', () => {
    cy.get('[data-testid="login-button"]').click();

    cy.get('[data-testid="email-error"]')
      .should('be.visible')
      .and('contain', 'Email é obrigatório');

    cy.get('[data-testid="password-error"]')
      .should('be.visible')
      .and('contain', 'Senha é obrigatória');
  });

  it('should validate email format', () => {
    cy.get('[data-testid="email-input"]').type('invalid-email');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();

    cy.get('[data-testid="email-error"]').should('be.visible').and('contain', 'Email inválido');
  });

  it('should redirect to login when accessing protected route', () => {
    cy.visit('/clients');
    cy.url().should('include', '/login');
  });

  it('should logout successfully', () => {
    cy.login('admin@empresa.com', 'admin123');
    cy.get('[data-testid="logout-button"]').click();
    cy.url().should('include', '/login');
  });
});
