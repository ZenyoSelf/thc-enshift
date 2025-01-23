const { defineConfig } = require("cypress");

module.exports = defineConfig({
    component: {
        devServer: {
            framework: "angular",
            bundler: "webpack",
        },
        specPattern: "**/*.cy.ts",
    },

    e2e: {
        baseUrl: 'http://localhost:4200',
        setupNodeEvents(on, config) {
            on('task', {
                getLastEmail() {
                    // Add Ethereal email fetching logic here
                    return null
                },
            })
        },
    },
});
