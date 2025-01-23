describe('Forgot Password Flow', () => {
    beforeEach(() => {
        cy.visit('/auth/forgot-password')
    })

    it('should send reset password email', () => {
        const email = 'test@example.com'
        cy.title().should('eq', 'Take-Home-Challenge - Arnaud Soltermann')
        cy.get('[data-cy="email-input"]').type(email)
        cy.get('[data-cy="send-button"]').click()
        cy.get('.p-toast-message-success .p-toast-message-text')
            .should('contain', 'Your reset link have been sent. It might appear in your spam folder.').and('be.visible')
        // For Ethereal email testing
        // Could not implement it -> Need a 3rd party saas for a good impl.
       /*  cy.task('getLastEmail').then((email) => {
            expect(email.subject).to.contain('Password Reset')
            expect(email.to).to.contain('test@example.com')

            // Extract and visit reset link from email
            const resetLink = email.text.match(/http:\/\/[\w\d\-./]+/)[0]
            cy.visit(resetLink)

            // Complete password reset
            cy.get('[data-cy="new-password-input"]').type('newpassword123')
            cy.get('[data-cy="confirm-password-input"]').type('newpassword123')
            cy.get('[data-cy="reset-button"]').click()

            cy.url().should('include', '/auth/login')
        }) */
    })
})