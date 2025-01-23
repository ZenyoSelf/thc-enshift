Cypress.Commands.add('login', (email = 'test@cypress.io', password = 'SuperSecretTestingPassword1') => {
  cy.visit('/auth/login')
  cy.title().should('eq', 'Take-Home-Challenge - Arnaud Soltermann')
  cy.get('[data-cy="email-input"]').type(email)
  cy.get('[data-cy="password-input"]').type(password)
  cy.get('[data-cy="login-button"]').click()
})