describe('Clients CRUD', () => {
  beforeEach(() => {
    cy.login('admin@empresa.com', 'admin123');
    cy.navigateTo('/clients');
  });

  it('should display clients list', () => {
    cy.get('[data-testid="clients-list"]').should('be.visible');
    cy.get('[data-testid="client-row"]').should('have.length.greaterThan', 0);
  });

  it('should create a new client', () => {
    cy.get('[data-testid="add-client-button"]').click();

    // Fill form
    cy.get('[data-testid="nome-input"]').type('João Silva Teste');
    cy.get('[data-testid="cpf-input"]').type('12345678901');
    cy.get('[data-testid="email-input"]').type('joao.teste@email.com');
    cy.get('[data-testid="telefone-input"]').type('11999999999');
    cy.get('[data-testid="cep-input"]').type('12345678');
    cy.get('[data-testid="endereco-input"]').type('Rua Teste, 123');
    cy.get('[data-testid="cidade-input"]').type('São Paulo');
    cy.get('[data-testid="estado-select"]').click();
    cy.get('[data-value="SP"]').click();
    cy.get('[data-testid="bairro-input"]').type('Centro');
    cy.get('[data-testid="numero-input"]').type('123');

    // Submit form
    cy.get('[data-testid="save-client-button"]').click();

    // Verify success
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain', 'Cliente criado com sucesso');

    // Verify client appears in list
    cy.get('[data-testid="clients-list"]').should('contain', 'João Silva Teste');
  });

  it('should edit an existing client', () => {
    cy.get('[data-testid="client-row"]')
      .first()
      .within(() => {
        cy.get('[data-testid="edit-client-button"]').click();
      });

    // Update name
    cy.get('[data-testid="nome-input"]').clear().type('Nome Atualizado');

    // Submit form
    cy.get('[data-testid="save-client-button"]').click();

    // Verify success
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain', 'Cliente atualizado com sucesso');

    // Verify change in list
    cy.get('[data-testid="clients-list"]').should('contain', 'Nome Atualizado');
  });

  it('should delete a client', () => {
    const clientName = 'Cliente para Deletar';

    // First create a client to delete
    cy.get('[data-testid="add-client-button"]').click();
    cy.get('[data-testid="nome-input"]').type(clientName);
    cy.get('[data-testid="cpf-input"]').type('98765432100');
    cy.get('[data-testid="email-input"]').type('deletar@email.com');
    cy.get('[data-testid="telefone-input"]').type('11888888888');
    cy.get('[data-testid="cep-input"]').type('87654321');
    cy.get('[data-testid="endereco-input"]').type('Rua Deletar, 456');
    cy.get('[data-testid="cidade-input"]').type('Rio de Janeiro');
    cy.get('[data-testid="estado-select"]').click();
    cy.get('[data-value="RJ"]').click();
    cy.get('[data-testid="bairro-input"]').type('Copacabana');
    cy.get('[data-testid="numero-input"]').type('456');
    cy.get('[data-testid="save-client-button"]').click();

    // Now delete the client
    cy.get('[data-testid="clients-list"]')
      .contains(clientName)
      .parent()
      .within(() => {
        cy.get('[data-testid="delete-client-button"]').click();
      });

    // Confirm deletion
    cy.get('[data-testid="confirm-delete-button"]').click();

    // Verify success
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain', 'Cliente excluído com sucesso');

    // Verify client is removed from list
    cy.get('[data-testid="clients-list"]').should('not.contain', clientName);
  });

  it('should filter clients', () => {
    // Search by name
    cy.get('[data-testid="search-input"]').type('João');
    cy.get('[data-testid="apply-filters-button"]').click();

    // Verify filtered results
    cy.get('[data-testid="client-row"]').each(($row) => {
      cy.wrap($row).should('contain', 'João');
    });

    // Clear filters
    cy.get('[data-testid="clear-filters-button"]').click();
    cy.get('[data-testid="search-input"]').should('have.value', '');
  });

  it('should validate form fields', () => {
    cy.get('[data-testid="add-client-button"]').click();

    // Try to submit empty form
    cy.get('[data-testid="save-client-button"]').click();

    // Verify validation errors
    cy.get('[data-testid="nome-error"]').should('contain', 'Nome é obrigatório');
    cy.get('[data-testid="cpf-error"]').should('contain', 'CPF é obrigatório');
    cy.get('[data-testid="email-error"]').should('contain', 'Email é obrigatório');
    cy.get('[data-testid="telefone-error"]').should('contain', 'Telefone é obrigatório');
  });

  it('should handle form validation for invalid data', () => {
    cy.get('[data-testid="add-client-button"]').click();

    // Fill with invalid data
    cy.get('[data-testid="nome-input"]').type('A'); // Too short
    cy.get('[data-testid="cpf-input"]').type('123'); // Invalid CPF
    cy.get('[data-testid="email-input"]').type('invalid-email'); // Invalid email
    cy.get('[data-testid="telefone-input"]').type('123'); // Invalid phone

    // Verify validation errors
    cy.get('[data-testid="nome-error"]').should('contain', 'Nome deve ter pelo menos 2 caracteres');
    cy.get('[data-testid="cpf-error"]').should('contain', 'CPF deve estar no formato');
    cy.get('[data-testid="email-error"]').should('contain', 'Email inválido');
    cy.get('[data-testid="telefone-error"]').should('contain', 'Telefone deve estar no formato');
  });
});
