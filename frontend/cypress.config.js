const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://cppeurope.net",
    setupNodeEvents(on, config) {
      // Task pour logger en console (visible en headless)
      on('task', {
        log(message) {
          console.log(message)
          return null
        }
      })
    },
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    // ✅ IMPORTANT : Préserver localStorage entre les navigations
    // Sans cela, le token JWT se perd après cy.visit()
    experimentalRunAllSpecs: false
  },
  video: false,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 10000,
  // ✅ Configurer la préservation de localStorage
  chromeWebSecurity: false
})

