describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/auth/login')
  })

  it('should login successfully with valid credentials', () => {
    cy.login()
    cy.url().should('include', '/dashboard')
    cy.window().its('localStorage')
      .invoke('getItem', 'auth_token')
      .should('exist')
  })

  it('should show error with invalid credentials', () => {
    cy.login('wrong@email.com', 'wrongpass')
    cy.get('.p-toast-message-error .p-toast-message-text')
    .should('contain', 'Invalid credentials')
    .and('be.visible')
  })
})