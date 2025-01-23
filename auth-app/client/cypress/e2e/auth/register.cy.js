describe('Registration Flow', () => {
    beforeEach(() => {
        cy.visit('/auth/register')
    })
    const email = `test${Date.now()}@example.com`
    it('should register new user successfully', () => {
        cy.title().should('eq', 'Take-Home-Challenge - Arnaud Soltermann')
        cy.get('[data-cy="firstname-input"]').type('Test')
        cy.get('[data-cy="lastname-input"]').type('User')
        cy.get('[data-cy="email-input"]').type(email)
        cy.get('[data-cy="password-input"]').type('password123')
        cy.get('[data-cy="confirmpassword-input"]').type('password123')
        cy.get('[data-cy="register-button"]').click()

        // Verify redirect to dashboard
        cy.url().should('include', '/dashboard')
    })

    it('should show error for existing email', () => {
        cy.title().should('eq', 'Take-Home-Challenge - Arnaud Soltermann')
        cy.get('[data-cy="firstname-input"]').type('Test')
        cy.get('[data-cy="lastname-input"]').type('User')
        cy.get('[data-cy="email-input"]').type(email)
        cy.get('[data-cy="password-input"]').type('password123')
        cy.get('[data-cy="confirmpassword-input"]').type('password123')
        cy.get('[data-cy="register-button"]').click()
        cy.get('.p-toast-message-error .p-toast-message-text')
            .should('contain', 'User already exists').and('be.visible')
    })
})