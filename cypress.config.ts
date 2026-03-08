import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    setupNodeEvents(_on, _config) {},
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
  },
})
